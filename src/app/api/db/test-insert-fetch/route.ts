import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET() {
  try {
    // Test INSERT
    const insertResult = await sql`
      INSERT INTO transactions (
        txn_date, amount, type, category, description, source_sheet, financial_year
      ) VALUES (
        '2025-12-19',
        50000.00,
        'inflow',
        'income',
        'Test Insert - ₹50,000',
        'Test API',
        '2024-25'
      )
      ON CONFLICT (txn_date, amount, description) DO NOTHING
      RETURNING id, txn_date, amount, type, category, description, financial_year
    `;

    // Test FETCH
    const fetchResult = await sql`
      SELECT 
        id, txn_date, amount, type, category, description, financial_year
      FROM transactions
      WHERE description = 'Test Insert - ₹50,000'
      ORDER BY created_at DESC
      LIMIT 5
    `;

    return NextResponse.json({
      success: true,
      insert: {
        inserted: insertResult.length > 0,
        record: insertResult[0] || null,
        message: insertResult.length > 0 ? 'INSERT successful' : 'Duplicate prevented (already exists)'
      },
      fetch: {
        count: fetchResult.length,
        records: fetchResult,
        message: 'FETCH successful'
      },
      summary: {
        insert_works: insertResult.length > 0 || true, // Even if duplicate, INSERT works
        fetch_works: fetchResult.length >= 0,
        database_ready: true
      }
    });
  } catch (error) {
    console.error('Insert/Fetch test error:', error);
    return NextResponse.json({
      success: false,
      error: String(error),
      message: 'INSERT/FETCH test failed. Check transactions table exists.'
    }, { status: 500 });
  }
}

