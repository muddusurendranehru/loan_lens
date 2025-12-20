// src/app/api/report/cashflow/route.ts
import { NextRequest } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

// Helper function to get readable category labels
function getCategoryLabel(category: string, flow: string): string {
  const inflowMap: Record<string, string> = {
    'business_loan': 'Business Loan',
    'clinic_income': 'Clinic Income',
    'income': 'Other Income'
  };
  
  const outflowMap: Record<string, string> = {
    'emi': 'EMIs',
    'vendor_payment': 'Vendor Payments',
    'rent': 'Rent',
    'tax': 'Tax',
    'transfer': 'Transfers'
  };

  return (flow === 'inflow' ? inflowMap[category] : outflowMap[category]) || category;
}

// Helper function to get month name from financial year
// This will be enhanced to get the actual month from transactions
async function getMonthFromFinancialYear(fy: string, sql: any): Promise<string> {
  try {
    // Try to get the most recent transaction date
    const monthResult = await sql`
      SELECT MAX(txn_date) as latest_date
      FROM cashflow_entries
      WHERE financial_year = ${fy}
      LIMIT 1
    `;
    
    if (monthResult && monthResult[0] && monthResult[0].latest_date) {
      const date = new Date(monthResult[0].latest_date);
      const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ];
      return `${months[date.getMonth()]} ${date.getFullYear()}`;
    }
  } catch (err) {
    // Fall through to default
  }
  
  // Default to current month
  const now = new Date();
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return `${months[now.getMonth()]} ${now.getFullYear()}`;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const financial_year = searchParams.get('financial_year') || '2024-25';
    const month = searchParams.get('month'); // e.g., '10' for October

    // Build WHERE clause
    let whereClause = sql`financial_year = ${financial_year}`;
    if (month) {
      const monthNum = parseInt(month);
      whereClause = sql`${whereClause} AND EXTRACT(MONTH FROM txn_date) = ${monthNum}`;
    }

    // ✅ Summary
    const summaryRes = await sql`
      SELECT
        COALESCE(SUM(CASE WHEN flow_type = 'inflow' THEN amount ELSE 0 END), 0) AS total_inflow,
        COALESCE(SUM(CASE WHEN flow_type = 'outflow' THEN amount ELSE 0 END), 0) AS total_outflow,
        COUNT(CASE WHEN flow_type = 'inflow' THEN 1 END) AS inflow_count,
        COUNT(CASE WHEN flow_type = 'outflow' THEN 1 END) AS outflow_count
      FROM cashflow_entries
      WHERE ${whereClause}
    `;

    const summary = summaryRes[0] || { total_inflow: 0, total_outflow: 0, inflow_count: 0, outflow_count: 0 };

    // ✅ Category breakdown
    const categoryRes = await sql`
      SELECT 
        category,
        flow_type,
        COUNT(*) AS count,
        SUM(amount) AS total_amount
      FROM cashflow_entries
      WHERE ${whereClause}
      GROUP BY category, flow_type
      ORDER BY flow_type DESC, total_amount DESC
    `;

    // ✅ All transactions
    const transactionsRes = await sql`
      SELECT 
        id,
        txn_date,
        amount,
        flow_type,
        category,
        description,
        source_sheet,
        financial_year
      FROM cashflow_entries
      WHERE ${whereClause}
      ORDER BY amount DESC
    `;

    // Get sample descriptions for each category (first transaction description)
    const categoryDescriptions: Record<string, string> = {};
    for (const row of transactionsRes) {
      const key = `${row.category}_${row.flow_type}`;
      if (!categoryDescriptions[key]) {
        categoryDescriptions[key] = row.description || '';
      }
    }

    // Group inflows
    const inflows = categoryRes
      .filter((row: any) => row.flow_type === 'inflow')
      .map((row: any) => ({
        category: row.category,
        label: getCategoryLabel(row.category, 'inflow'),
        amount: Number(row.total_amount || 0),
        count: Number(row.count || 0),
        description: categoryDescriptions[`${row.category}_inflow`] || ''
      }));

    // Group outflows
    const outflows = categoryRes
      .filter((row: any) => row.flow_type === 'outflow')
      .map((row: any) => ({
        category: row.category,
        label: getCategoryLabel(row.category, 'outflow'),
        amount: Number(row.total_amount || 0),
        count: Number(row.count || 0)
      }));

    // Determine month name from month parameter or from transactions
    let monthName: string;
    if (month) {
      const monthNum = parseInt(month);
      const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ];
      // Get year from most recent transaction or use current year
      try {
        const yearResult = await sql`
          SELECT EXTRACT(YEAR FROM MAX(txn_date)) as year
          FROM cashflow_entries
          WHERE ${whereClause}
        `;
        const year = yearResult[0]?.year || new Date().getFullYear();
        monthName = `${months[monthNum - 1]} ${year}`;
      } catch {
        monthName = `${months[monthNum - 1]} ${new Date().getFullYear()}`;
      }
    } else {
      monthName = await getMonthFromFinancialYear(financial_year, sql);
    }

    return Response.json({
      success: true,
      month: monthName,
      income: inflows,
      expenses: outflows,
      summary: {
        total_inflow: Number(summary.total_inflow),
        total_outflow: Number(summary.total_outflow),
        net_balance: Number((Number(summary.total_inflow) - Number(summary.total_outflow)).toFixed(2)),
        inflow_count: Number(summary.inflow_count),
        outflow_count: Number(summary.outflow_count)
      },
      categoryBreakdown: categoryRes.map((row: any) => ({
        category: row.category,
        flow_type: row.flow_type,
        count: Number(row.count || 0),
        total_amount: Number(row.total_amount || 0)
      })),
      transactions: transactionsRes.map((t: any) => ({
        ...t,
        amount: Number(t.amount)
      }))
    });
  } catch (err: any) {
    console.error('🔴 REPORT API ERROR:', err);
    return Response.json({ 
      error: 'Report generation failed',
      details: err.message 
    }, { status: 500 });
  }
}