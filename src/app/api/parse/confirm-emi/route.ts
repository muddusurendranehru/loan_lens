import { sql } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from 'next-auth/react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

interface EMI {
  emi_date: string;
  amount: number;
  loan_ref_id: string;
  loan_type: string;
  source_description?: string;
  source_sheet_name?: string;
  source_row_number?: number;
  financial_year: string;
  towards?: string;
  transaction_id?: string | null;
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { emis } = await req.json();

    if (!Array.isArray(emis)) {
      return NextResponse.json({ error: 'Invalid input: emis must be an array' }, { status: 400 });
    }

    let savedCount = 0;
    let skippedCount = 0;
    const errors: string[] = [];

    for (const emi of emis as EMI[]) {
      const { 
        emi_date, 
        amount, 
        loan_ref_id, 
        loan_type, 
        source_description,
        source_sheet_name,
        source_row_number,
        financial_year,
        towards = 'EMI',
        transaction_id = null
      } = emi;

      // Validate required fields
      if (!emi_date || !amount || !loan_ref_id || !loan_type || !financial_year) {
        errors.push(`Missing required fields: ${JSON.stringify({ emi_date, amount, loan_ref_id, loan_type, financial_year })}`);
        skippedCount++;
        continue;
      }

      // Validate amount range (₹16,000 - ₹1,87,000)
      if (amount < 16000 || amount > 187000) {
        errors.push(`Amount ${amount} out of EMI range (₹16,000 - ₹1,87,000)`);
        skippedCount++;
        continue;
      }

      try {
        // Insert into loan_emis table
        // Note: Using user_id from session, but schema might need adjustment
        const result = await sql`
          INSERT INTO loan_emis (
            user_id,
            emi_date, 
            amount, 
            loan_ref_id,
            loan_type,
            source_description,
            source_sheet_name,
            source_row_number,
            financial_year,
            towards,
            transaction_id
          ) VALUES (
            ${session.user.id}::uuid,
            ${emi_date}::date,
            ${Number(amount)}::numeric(12,2),
            ${loan_ref_id},
            ${loan_type},
            ${source_description || null},
            ${source_sheet_name || null},
            ${source_row_number || null},
            ${financial_year},
            ${towards},
            ${transaction_id}
          )
          ON CONFLICT (emi_date, amount, loan_ref_id) DO NOTHING
          RETURNING id
        `;

        if (result && result.length > 0) {
          savedCount++;
        } else {
          skippedCount++;
        }
      } catch (e: any) {
        console.warn('Skip duplicate or invalid:', emi, e);
        errors.push(`Failed to save: EMI ₹${amount} on ${emi_date} for ${loan_ref_id} - ${e.message}`);
        skippedCount++;
      }
    }

    return NextResponse.json({ 
      success: true, 
      saved: savedCount,
      skipped: skippedCount,
      total: emis.length,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (err: any) {
    console.error('Confirm EMI API error:', err);
    return NextResponse.json({ error: 'Save failed', details: String(err) }, { status: 500 });
  }
}

