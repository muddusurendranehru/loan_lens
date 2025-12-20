import { NextRequest } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const month = searchParams.get('month'); // e.g., '10' for October
    const year = searchParams.get('year'); // e.g., '2024'

    if (!month || !year) {
      return Response.json({ error: 'Month and year required' }, { status: 400 });
    }

    // Get daily income and expense totals
    const dailyData = await sql`
      SELECT 
        DATE(txn_date) as date,
        COALESCE(SUM(CASE WHEN flow_type = 'inflow' THEN amount ELSE 0 END), 0) as income,
        COALESCE(SUM(CASE WHEN flow_type = 'outflow' THEN amount ELSE 0 END), 0) as expense
      FROM cashflow_entries
      WHERE EXTRACT(MONTH FROM txn_date) = ${parseInt(month)}
        AND EXTRACT(YEAR FROM txn_date) = ${parseInt(year)}
      GROUP BY DATE(txn_date)
      ORDER BY DATE(txn_date) ASC
    `;

    // Format dates and ensure all days are represented
    const formattedData = dailyData.map((row: any) => ({
      date: row.date.toISOString().split('T')[0],
      income: Number(row.income || 0),
      expense: Number(row.expense || 0),
    }));

    return Response.json({
      success: true,
      dailyData: formattedData,
    });
  } catch (err: any) {
    console.error('Daily data API error:', err);
    return Response.json({ error: 'Failed to fetch daily data' }, { status: 500 });
  }
}

