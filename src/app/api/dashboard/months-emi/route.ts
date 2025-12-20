import { sql } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all EMIs grouped by month
    const emisByMonth = await sql`
      SELECT 
        DATE_TRUNC('month', emi_date) as month_start,
        TO_CHAR(emi_date, 'Month YYYY') as month_name,
        EXTRACT(MONTH FROM emi_date) as month_num,
        EXTRACT(YEAR FROM emi_date) as year,
        financial_year,
        COUNT(*) as emi_count,
        SUM(amount) as total_amount,
        COUNT(DISTINCT loan_ref_id) as loan_count
      FROM loan_emis
      WHERE user_id = ${session.user.id}::uuid
      GROUP BY 
        DATE_TRUNC('month', emi_date),
        TO_CHAR(emi_date, 'Month YYYY'),
        EXTRACT(MONTH FROM emi_date),
        EXTRACT(YEAR FROM emi_date),
        financial_year
      ORDER BY month_start DESC
    `;

    // Get detailed EMIs for each month
    const allEMIs = await sql`
      SELECT 
        id,
        emi_date,
        amount,
        loan_ref_id,
        loan_type,
        source_description,
        financial_year,
        towards,
        DATE_TRUNC('month', emi_date) as month_start
      FROM loan_emis
      WHERE user_id = ${session.user.id}::uuid
      ORDER BY emi_date DESC
    `;

    // Group EMIs by month
    const emisByMonthKey: Record<string, any[]> = {};
    allEMIs.forEach((emi: any) => {
      const date = new Date(emi.emi_date);
      const monthKey = date.toLocaleString('en-IN', { month: 'long', year: 'numeric' });
      if (!emisByMonthKey[monthKey]) emisByMonthKey[monthKey] = [];
      emisByMonthKey[monthKey].push({
        id: emi.id,
        emi_date: emi.emi_date,
        amount: Number(emi.amount),
        loan_ref_id: emi.loan_ref_id,
        loan_type: emi.loan_type,
        source_description: emi.source_description,
        financial_year: emi.financial_year,
        towards: emi.towards || 'EMI'
      });
    });

    // Format summary
    const summary = emisByMonth.map((row: any) => ({
      month: row.month_name.trim(),
      year: Number(row.year),
      month_num: Number(row.month_num),
      financial_year: row.financial_year,
      emi_count: Number(row.emi_count),
      total_amount: Number(row.total_amount),
      loan_count: Number(row.loan_count)
    }));

    // Calculate totals
    const totals = allEMIs.reduce((acc: any, emi: any) => {
      acc.total_emis += 1;
      acc.total_amount += Number(emi.amount);
      return acc;
    }, { total_emis: 0, total_amount: 0 });

    return NextResponse.json({
      success: true,
      summary,
      emisByMonth: emisByMonthKey,
      totals
    });
  } catch (err: any) {
    console.error('Months EMI API error:', err);
    return NextResponse.json({ error: 'Failed to fetch EMI data', details: String(err) }, { status: 500 });
  }
}

