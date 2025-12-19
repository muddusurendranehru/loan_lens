import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET() {
  try {
    // Check if users table exists
    const tableCheck = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'users'
    `;

    if (tableCheck.length > 0) {
      return NextResponse.json({
        success: true,
        message: 'Users table already exists',
        exists: true
      });
    }

    // Create users table if it doesn't exist
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        phone VARCHAR(20),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // Create index
    await sql`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`;

    return NextResponse.json({
      success: true,
      message: 'Users table created successfully',
      exists: false,
      created: true
    });
  } catch (error: any) {
    console.error('Error ensuring users table:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || String(error)
      },
      { status: 500 }
    );
  }
}

