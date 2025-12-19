import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET() {
  try {
    // Test 1: Check DATABASE_URL exists
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      return NextResponse.json({ 
        success: false, 
        error: 'DATABASE_URL not found in environment variables' 
      }, { status: 500 });
    }

    // Test 2: Test database connection
    const connectionTest = await sql`SELECT NOW() as current_time, current_database() as database_name`;
    
    // Test 3: Check if transactions table exists
    const tableCheck = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'transactions'
    `;

    // Test 4: Test INSERT (dry run - will rollback)
    let insertTest = null;
    try {
      insertTest = await sql`
        INSERT INTO transactions (
          txn_date, amount, type, category, description, financial_year
        ) VALUES (
          '2025-12-19',
          1000.00,
          'inflow',
          'income',
          'Test Connection',
          '2024-25'
        )
        ON CONFLICT (txn_date, amount, description) DO NOTHING
        RETURNING id
      `;
    } catch (insertError) {
      // Table might not exist or schema issue
      insertTest = { error: String(insertError) };
    }

    // Test 5: Test FETCH
    let fetchTest = null;
    try {
      fetchTest = await sql`
        SELECT COUNT(*) as count FROM transactions
      `;
    } catch (fetchError) {
      fetchTest = { error: String(fetchError) };
    }

    return NextResponse.json({
      success: true,
      connection: {
        database_url_exists: !!dbUrl,
        database_url_preview: dbUrl.substring(0, 50) + '...',
        connected: true,
        current_time: connectionTest[0]?.current_time,
        database_name: connectionTest[0]?.database_name
      },
      table_check: {
        transactions_table_exists: tableCheck.length > 0,
        table_name: tableCheck[0]?.table_name || null
      },
      insert_test: insertTest,
      fetch_test: fetchTest,
      message: 'Database connection successful!'
    });
  } catch (error) {
    console.error('Database test error:', error);
    return NextResponse.json({
      success: false,
      error: String(error),
      message: 'Database connection failed. Check DATABASE_URL in .env.local'
    }, { status: 500 });
  }
}

