import db from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

// Helper: compute Indian financial year (Apr–Mar)
// Example: April 2024 to March 2025 = "2024-25"
function getFinancialYear(date: Date): string {
  const year = date.getFullYear();
  const month = date.getMonth(); // 0 = Jan, 3 = Apr
  if (month >= 3) return `${year}-${String(year + 1).slice(-2)}`;
  return `${year - 1}-${String(year).slice(-2)}`;
}

export async function POST(req: NextRequest) {
  try {
    const { transactions, sheetName } = await req.json();

    if (!Array.isArray(transactions)) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    let savedCount = 0;
    const errors: string[] = [];

    for (const tx of transactions) {
      const { date, amount, loan_ref_id, loan_type, description, rawRow } = tx;

      // Validate required fields
      if (!date || !amount || !loan_ref_id || !loan_type) {
        errors.push(`Missing required fields for transaction: ${JSON.stringify(tx)}`);
        continue;
      }

      const emiDate = new Date(date);
      if (isNaN(emiDate.getTime())) {
        errors.push(`Invalid date for transaction: ${date}`);
        continue;
      }

      const financial_year = getFinancialYear(emiDate);

      try {
        const result = await db`
          INSERT INTO loan_emis (
            emi_date, amount, loan_ref_id, loan_type,
            source_description, source_sheet_name, source_row_number, financial_year
          ) VALUES (
            ${emiDate.toISOString().split('T')[0]},
            ${Number(amount)},
            ${loan_ref_id},
            ${loan_type},
            ${description || ''},
            ${sheetName || 'Uploaded'},
            ${rawRow || null},
            ${financial_year}
          )
          ON CONFLICT (emi_date, amount, loan_ref_id) DO NOTHING
          RETURNING id
        `;

        if (result && result.length > 0) {
          savedCount++;
        }
      } catch (e) {
        console.warn('Skip duplicate or invalid:', tx, e);
        errors.push(`Failed to save: ${loan_ref_id} - ${date}`);
      }
    }

    return NextResponse.json({ 
      success: true, 
      saved: savedCount,
      total: transactions.length,
      skipped: transactions.length - savedCount,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (err) {
    console.error('Confirm API error:', err);
    return NextResponse.json({ error: 'Save failed' }, { status: 500 });
  }
}

