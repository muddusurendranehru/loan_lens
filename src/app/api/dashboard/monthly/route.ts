import { sql } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const financial_year = searchParams.get('financial_year');
    const month = searchParams.get('month'); // e.g., "03" for March
    const year = searchParams.get('year'); // e.g., "2025"

    // Build WHERE clause - prioritize month/year for monthly dashboard
    let whereClause = sql``;
    if (month && year) {
      whereClause = sql`WHERE EXTRACT(MONTH FROM txn_date) = ${parseInt(month)} AND EXTRACT(YEAR FROM txn_date) = ${parseInt(year)}`;
    } else if (financial_year) {
      whereClause = sql`WHERE financial_year = ${financial_year}`;
    } else {
      // Default to current month if no params
      const now = new Date();
      whereClause = sql`WHERE EXTRACT(MONTH FROM txn_date) = ${now.getMonth() + 1} AND EXTRACT(YEAR FROM txn_date) = ${now.getFullYear()}`;
    }

    // Get monthly EBITDA summary
    const ebitdaSummary = await sql`
      SELECT 
        -- Revenue
        SUM(CASE WHEN category = 'clinic_revenue' THEN amount ELSE 0 END) as clinic_revenue,
        SUM(CASE WHEN category = 'other_income' THEN amount ELSE 0 END) as other_income,
        
        -- Expenses (EBITDA components)
        SUM(CASE WHEN category = 'salaries' THEN amount ELSE 0 END) as salaries,
        SUM(CASE WHEN category = 'rent' THEN amount ELSE 0 END) as rent,
        SUM(CASE WHEN category = 'vendor_payment' THEN amount ELSE 0 END) as vendor_payment,
        
        -- Interest (affects EBITDA)
        SUM(CASE WHEN category = 'emi_interest' THEN amount ELSE 0 END) as emi_interest,
        SUM(CASE WHEN category = 'bank_interest' THEN amount ELSE 0 END) as bank_interest,
        
        -- Principal (doesn't affect EBITDA)
        SUM(CASE WHEN category = 'emi_principal' THEN amount ELSE 0 END) as emi_principal,
        
        -- Loans
        SUM(CASE WHEN category = 'business_loan' AND flow_type = 'inflow' THEN amount ELSE 0 END) as new_loans,
        
        -- Total inflows/outflows
        SUM(CASE WHEN flow_type = 'inflow' THEN amount ELSE 0 END) as total_inflow,
        SUM(CASE WHEN flow_type = 'outflow' THEN amount ELSE 0 END) as total_outflow,
        
        -- Counts
        COUNT(*) as total_transactions
      FROM transactions
      ${whereClause}
    `;

    const summary = ebitdaSummary[0] || {
      clinic_revenue: 0,
      other_income: 0,
      salaries: 0,
      rent: 0,
      vendor_payment: 0,
      emi_interest: 0,
      bank_interest: 0,
      emi_principal: 0,
      new_loans: 0,
      total_inflow: 0,
      total_outflow: 0,
      total_transactions: 0
    };

    // Calculate EBITDA
    const revenue = Number(summary.clinic_revenue) + Number(summary.other_income);
    const operatingExpenses = Number(summary.salaries) + Number(summary.rent) + Number(summary.vendor_payment);
    const interestExpenses = Number(summary.emi_interest) + Number(summary.bank_interest);
    const ebitda = revenue - operatingExpenses; // EBITDA = Revenue - Operating Expenses
    const netOperatingProfit = ebitda - interestExpenses; // After interest
    
    // Net Cashflow = Total Inflow - Total Outflow (includes principal)
    const netCashflow = Number(summary.total_inflow) - Number(summary.total_outflow);
    const totalEMI = Number(summary.emi_interest) + Number(summary.emi_principal);
    
    // Net Cashflow after principal = EBITDA - principal payments
    const netCashflowAfterPrincipal = ebitda - Number(summary.emi_principal);

    // Get detailed transactions by category
    const categoryBreakdown = await sql`
      SELECT 
        category,
        flow_type,
        COUNT(*) as count,
        SUM(amount) as total_amount
      FROM transactions
      ${whereClause}
      GROUP BY category, flow_type
      ORDER BY flow_type DESC, total_amount DESC
    `;

    // Get transactions by account type
    const accountBreakdown = await sql`
      SELECT 
        account_type,
        SUM(CASE WHEN flow_type = 'inflow' THEN amount ELSE 0 END) as inflow,
        SUM(CASE WHEN flow_type = 'outflow' THEN amount ELSE 0 END) as outflow
      FROM transactions
      ${whereClause}
      GROUP BY account_type
    `;

    return NextResponse.json({
      success: true,
      summary: {
        revenue: {
          clinic_revenue: Number(summary.clinic_revenue),
          other_income: Number(summary.other_income),
          total: revenue
        },
        expenses: {
          salaries: Number(summary.salaries),
          rent: Number(summary.rent),
          vendor_payment: Number(summary.vendor_payment),
          total_operating: operatingExpenses
        },
        interest: {
          emi_interest: Number(summary.emi_interest),
          bank_interest: Number(summary.bank_interest),
          total: interestExpenses
        },
        loans: {
          new_loans: Number(summary.new_loans),
          emi_principal: Number(summary.emi_principal),
          total_emi: totalEMI
        },
        metrics: {
          ebitda,
          net_operating_profit: netOperatingProfit,
          net_cashflow: netCashflow,
          net_cashflow_after_principal: netCashflowAfterPrincipal,
          loan_dependency: Number(summary.new_loans) - totalEMI // Positive = taking more loans
        },
        cashflow: {
          total_inflow: Number(summary.total_inflow),
          total_outflow: Number(summary.total_outflow),
          net: netCashflow
        }
      },
      categoryBreakdown,
      accountBreakdown,
      total_transactions: Number(summary.total_transactions)
    });
  } catch (err) {
    console.error('Monthly EBITDA API error:', err);
    return NextResponse.json({ error: 'Failed to fetch EBITDA data', details: String(err) }, { status: 500 });
  }
}

