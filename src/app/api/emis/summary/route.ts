import { sql } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

// GET: Summary of EMIs by financial year and loan type
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const financial_year = searchParams.get('financial_year');

    // Get summary by financial year
    const yearSummary = await sql`
      SELECT 
        financial_year,
        COUNT(*) as total_emis,
        SUM(amount) as total_amount,
        COUNT(DISTINCT loan_ref_id) as unique_loans
      FROM loan_emis
      ${financial_year ? sql`WHERE financial_year = ${financial_year}` : sql``}
      GROUP BY financial_year
      ORDER BY financial_year DESC
    `;

    // Get summary by loan type
    const typeSummary = await sql`
      SELECT 
        loan_type,
        COUNT(*) as total_emis,
        SUM(amount) as total_amount,
        COUNT(DISTINCT loan_ref_id) as unique_loans
      FROM loan_emis
      ${financial_year ? sql`WHERE financial_year = ${financial_year}` : sql``}
      GROUP BY loan_type
      ORDER BY total_amount DESC
    `;

    // Get summary by loan reference
    const loanSummary = await sql`
      SELECT 
        loan_ref_id,
        loan_type,
        COUNT(*) as total_emis,
        SUM(amount) as total_amount,
        MIN(emi_date) as first_emi,
        MAX(emi_date) as last_emi
      FROM loan_emis
      ${financial_year ? sql`WHERE financial_year = ${financial_year}` : sql``}
      GROUP BY loan_ref_id, loan_type
      ORDER BY total_amount DESC
    `;

    // Get grand totals
    const grandTotal = await sql`
      SELECT 
        COUNT(*) as total_emis,
        COALESCE(SUM(amount), 0) as total_amount,
        COUNT(DISTINCT loan_ref_id) as unique_loans,
        COUNT(DISTINCT financial_year) as years_covered
      FROM loan_emis
      ${financial_year ? sql`WHERE financial_year = ${financial_year}` : sql``}
    `;

    return NextResponse.json({ 
      success: true,
      summary: {
        grandTotal: grandTotal[0],
        byFinancialYear: yearSummary,
        byLoanType: typeSummary,
        byLoan: loanSummary
      }
    });
  } catch (err) {
    console.error('Summary API error:', err);
    return NextResponse.json({ error: 'Summary fetch failed' }, { status: 500 });
  }
}

