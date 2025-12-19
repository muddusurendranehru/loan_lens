import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET() {
  try {
    // Test connection
    const connectionResult = await sql`SELECT NOW() as current_time, current_database() as database_name`;
    
    // Get table info
    const tablesResult = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `;

    // Get users count
    let usersCount = 0;
    let emisCount = 0;
    
    try {
      const usersResult = await sql`SELECT COUNT(*) as count FROM users`;
      usersCount = Number(usersResult[0]?.count || 0);
    } catch {
      // Table might not exist yet
    }

    try {
      const emisResult = await sql`SELECT COUNT(*) as count FROM loan_emis`;
      emisCount = Number(emisResult[0]?.count || 0);
    } catch {
      // Table might not exist yet
    }

    return NextResponse.json({
      success: true,
      connection: connectionResult[0],
      tables: tablesResult.map((t: { table_name: string }) => t.table_name),
      counts: {
        users: usersCount,
        loan_emis: emisCount
      }
    });
  } catch (error) {
    console.error('Database test error:', error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}

