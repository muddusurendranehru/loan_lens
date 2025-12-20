// src/app/api/test-db/route.ts
import { neon } from '@neondatabase/serverless';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set');
}

const sql = neon(process.env.DATABASE_URL);

export async function GET() {
  try {
    // Get current database name
    const dbResult = await sql`SELECT current_database() as db_name`;
    const dbName = dbResult[0]?.db_name || 'unknown';
    
    // Get count from cashflow_entries
    const result = await sql`SELECT COUNT(*) as count FROM cashflow_entries`;
    const count = Number(result[0]?.count || 0);

    return Response.json({
      success: true,
      database: dbName,
      message: `Connected to ${dbName}! Found ${count} transactions in cashflow_entries.`,
      rowCount: count
    });
  } catch (err: any) {
    console.error('❌ Test DB error:', err);
    return Response.json({
      success: false,
      error: err.message || 'Database connection failed',
      details: process.env.DATABASE_URL ? 'DATABASE_URL is set' : 'DATABASE_URL is missing'
    }, { status: 500 });
  }
}

