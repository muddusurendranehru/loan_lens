import { sql } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const financial_year = searchParams.get('financial_year');

    // Get monthly summary with inflows and outflows
    const monthlyData = await sql`
      SELECT 
        TO_CHAR(txn_date, 'Month') as month,
        EXTRACT(YEAR FROM txn_date) as year,
        EXTRACT(MONTH FROM txn_date) as month_num,
        financial_year,
        SUM(CASE WHEN flow_type = 'inflow' THEN amount ELSE 0 END) as total_inflow,
        SUM(CASE WHEN flow_type = 'outflow' THEN amount ELSE 0 END) as total_outflow,
        SUM(CASE WHEN flow_type = 'inflow' THEN amount ELSE -amount END) as net_balance,
        COUNT(CASE WHEN flow_type = 'inflow' THEN 1 END) as inflow_count,
        COUNT(CASE WHEN flow_type = 'outflow' THEN 1 END) as outflow_count
      FROM transactions
      ${financial_year ? sql`WHERE financial_year = ${financial_year}` : sql``}
      GROUP BY 
        TO_CHAR(txn_date, 'Month'),
        EXTRACT(YEAR FROM txn_date),
        EXTRACT(MONTH FROM txn_date),
        financial_year
      ORDER BY year DESC, month_num DESC
    `;

    // Get detailed transactions grouped by month
    const detailedData = await sql`
      SELECT 
        id,
        txn_date,
        amount,
        flow_type as type,  -- Map flow_type to type for frontend compatibility
        category,
        description,
        account_type,
        financial_year,
        TO_CHAR(txn_date, 'Month YYYY') as month_year
      FROM transactions
      ${financial_year ? sql`WHERE financial_year = ${financial_year}` : sql``}
      ORDER BY txn_date DESC
    `;

    // Group transactions by month
    const txnsByMonth: Record<string, typeof detailedData> = {};
    for (const txn of detailedData) {
      const key = txn.month_year as string;
      if (!txnsByMonth[key]) {
        txnsByMonth[key] = [];
      }
      txnsByMonth[key].push(txn);
    }

    // Get available financial years
    const years = await sql`
      SELECT DISTINCT financial_year 
      FROM transactions 
      ORDER BY financial_year DESC
    `;

    // Get grand totals
    const totals = await sql`
      SELECT 
        SUM(CASE WHEN flow_type = 'inflow' THEN amount ELSE 0 END) as total_inflow,
        SUM(CASE WHEN flow_type = 'outflow' THEN amount ELSE 0 END) as total_outflow,
        SUM(CASE WHEN flow_type = 'inflow' THEN amount ELSE -amount END) as net_balance,
        COUNT(*) as total_transactions
      FROM transactions
      ${financial_year ? sql`WHERE financial_year = ${financial_year}` : sql``}
    `;

    // Get category breakdown
    const categoryBreakdown = await sql`
      SELECT 
        flow_type as type,  -- Map flow_type to type for frontend
        category,
        COUNT(*) as count,
        SUM(amount) as total_amount
      FROM transactions
      ${financial_year ? sql`WHERE financial_year = ${financial_year}` : sql``}
      GROUP BY flow_type, category
      ORDER BY flow_type, total_amount DESC
    `;

    return NextResponse.json({
      success: true,
      summary: monthlyData,
      txnsByMonth,
      financialYears: years.map(y => y.financial_year),
      totals: totals[0] || { total_inflow: 0, total_outflow: 0, net_balance: 0, total_transactions: 0 },
      categoryBreakdown
    });
  } catch (err) {
    console.error('Dashboard months API error:', err);
    return NextResponse.json({ error: 'Failed to fetch data', details: String(err) }, { status: 500 });
  }
}
