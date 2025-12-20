import { sql } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    // Get all transactions grouped by month
    const monthsData = await sql`
      SELECT 
        DATE_TRUNC('month', txn_date) as month_start,
        TO_CHAR(txn_date, 'Month YYYY') as month_name,
        EXTRACT(MONTH FROM txn_date) as month_num,
        EXTRACT(YEAR FROM txn_date) as year,
        financial_year,
        SUM(CASE WHEN flow_type = 'inflow' THEN amount ELSE 0 END) as total_inflow,
        SUM(CASE WHEN flow_type = 'outflow' THEN amount ELSE 0 END) as total_outflow,
        COUNT(CASE WHEN flow_type = 'inflow' THEN 1 END) as inflow_count,
        COUNT(CASE WHEN flow_type = 'outflow' THEN 1 END) as outflow_count
      FROM transactions
      GROUP BY 
        DATE_TRUNC('month', txn_date),
        TO_CHAR(txn_date, 'Month YYYY'),
        EXTRACT(MONTH FROM txn_date),
        EXTRACT(YEAR FROM txn_date),
        financial_year
      ORDER BY month_start DESC
    `;

    // Get detailed transactions for each month
    const allTransactions = await sql`
      SELECT 
        id,
        txn_date,
        amount,
        flow_type,
        category,
        description,
        financial_year,
        source_sheet
      FROM transactions
      ORDER BY txn_date DESC
    `;

    // Group transactions by month
    const txnsByMonth: Record<string, any[]> = {};
    allTransactions.forEach((txn: any) => {
      const date = new Date(txn.txn_date);
      const monthKey = date.toLocaleString('en-IN', { month: 'long', year: 'numeric' });
      if (!txnsByMonth[monthKey]) txnsByMonth[monthKey] = [];
      txnsByMonth[monthKey].push({
        id: txn.id,
        txn_date: txn.txn_date,
        amount: Number(txn.amount),
        type: txn.flow_type,
        category: txn.category,
        description: txn.description,
        financial_year: txn.financial_year,
        source_sheet: txn.source_sheet
      });
    });

    // Format summary
    const summary = monthsData.map((row: any) => ({
      month: row.month_name.trim(),
      year: Number(row.year),
      month_num: Number(row.month_num),
      financial_year: row.financial_year,
      total_inflow: Number(row.total_inflow),
      total_outflow: Number(row.total_outflow),
      net_balance: Number(row.total_inflow) - Number(row.total_outflow),
      inflow_count: Number(row.inflow_count),
      outflow_count: Number(row.outflow_count)
    }));

    // Calculate totals
    const totals = allTransactions.reduce((acc: any, txn: any) => {
      if (txn.flow_type === 'inflow') {
        acc.total_inflow += Number(txn.amount);
        acc.inflow_count += 1;
      } else {
        acc.total_outflow += Number(txn.amount);
        acc.outflow_count += 1;
      }
      return acc;
    }, { total_inflow: 0, total_outflow: 0, inflow_count: 0, outflow_count: 0 });

    totals.net_balance = totals.total_inflow - totals.total_outflow;
    totals.total_transactions = totals.inflow_count + totals.outflow_count;

    return NextResponse.json({
      success: true,
      summary,
      txnsByMonth,
      totals
    });
  } catch (err: any) {
    console.error('Months API error:', err);
    return NextResponse.json({ error: 'Failed to fetch monthly data', details: String(err) }, { status: 500 });
  }
}
