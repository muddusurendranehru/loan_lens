import { NextResponse } from 'next/server';
import { initializeDatabase, testConnection } from '@/lib/init-db';

export async function GET() {
  try {
    // Test connection first
    const connectionTest = await testConnection();
    if (!connectionTest.success) {
      return NextResponse.json(
        { success: false, error: 'Database connection failed' },
        { status: 500 }
      );
    }

    // Initialize tables
    const initResult = await initializeDatabase();
    
    return NextResponse.json({
      success: true,
      message: 'Database initialized successfully',
      connection: connectionTest.data,
      tables: ['users', 'loans']
    });
  } catch (error) {
    console.error('Database init error:', error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}

