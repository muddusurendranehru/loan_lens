import { sql } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { getFinancialYear, parseDateToDate, formatDateISO } from '@/lib/dateUtils';

interface Transaction {
  date: string;
  amount: number;
  type: 'inflow' | 'outflow';  // Frontend uses 'type', backend maps to 'flow_type'
  category: string;
  description?: string;
  rawRow?: number;
  financial_year?: string;
  account_type?: 'savings' | 'current';
  source_sheet?: string;
}

export async function POST(req: NextRequest) {
  try {
    const { transactions, sheetName } = await req.json();

    if (!Array.isArray(transactions)) {
      return NextResponse.json({ error: 'Invalid input: transactions must be an array' }, { status: 400 });
    }

    let savedCount = 0;
    let skippedCount = 0;
    const errors: string[] = [];

    for (const tx of transactions as Transaction[]) {
      const { date, amount, type, category, description, rawRow } = tx;

      // Validate required fields
      if (!date || !amount || !type || !category) {
        errors.push(`Missing required fields: ${JSON.stringify({ date, amount, type, category })}`);
        skippedCount++;
        continue;
      }

      // Validate type
      if (type !== 'inflow' && type !== 'outflow') {
        errors.push(`Invalid type: ${type}`);
        skippedCount++;
        continue;
      }

      const txnDate = parseDateToDate(date);
      if (!txnDate) {
        errors.push(`Invalid date: ${date}`);
        skippedCount++;
        continue;
      }

      const financial_year = tx.financial_year || getFinancialYear(txnDate);
      const formattedDate = formatDateISO(txnDate);

      try {
        const result = await sql`
          INSERT INTO transactions (
            txn_date, 
            amount, 
            flow_type,
            category,
            description, 
            account_type,
            source_sheet, 
            financial_year
          ) VALUES (
            ${formattedDate},
            ${Number(amount)},
            ${type},  -- Maps 'type' to 'flow_type'
            ${category},
            ${description || ''},
            ${tx.account_type || 'savings'},  -- Default to savings if not provided
            ${tx.source_sheet || sheetName || 'Manual Entry'},
            ${financial_year}
          )
          ON CONFLICT (txn_date, amount, description) DO NOTHING
          RETURNING id
        `;

        if (result && result.length > 0) {
          savedCount++;
        } else {
          skippedCount++;
        }
      } catch (e) {
        console.warn('Skip duplicate or invalid:', tx, e);
        errors.push(`Failed to save: ${type} ₹${amount} on ${date}`);
        skippedCount++;
      }
    }

    return NextResponse.json({ 
      success: true, 
      saved: savedCount,
      skipped: skippedCount,
      total: transactions.length,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (err) {
    console.error('Confirm API error:', err);
    return NextResponse.json({ error: 'Save failed', details: String(err) }, { status: 500 });
  }
}
