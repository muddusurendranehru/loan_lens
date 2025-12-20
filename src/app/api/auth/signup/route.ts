// src/app/api/auth/signup/route.ts
import { neon } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';
import { NextRequest } from 'next/server';

const sql = neon(process.env.DATABASE_URL!);

// Timeout helper
const withTimeout = <T>(promise: Promise<T>, ms: number): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => 
      setTimeout(() => reject(new Error(`Operation timed out after ${ms}ms`)), ms)
    )
  ]);
};

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  
  try {
    const { email, password } = await req.json();
    
    if (!email || !password) {
      return Response.json({ error: 'Email and password required' }, { status: 400 });
    }

    console.log(`[${Date.now() - startTime}ms] Starting signup for: ${email}`);

    // Hash password with timeout (max 5 seconds)
    console.log(`[${Date.now() - startTime}ms] Starting password hash...`);
    const hashedPassword = await withTimeout(
      bcrypt.hash(password, 10),
      5000
    );
    console.log(`[${Date.now() - startTime}ms] Password hashed successfully`);

    // Insert with timeout (max 10 seconds)
    console.log(`[${Date.now() - startTime}ms] Connecting to database...`);
    await withTimeout(
      sql`
        INSERT INTO users (email, password, phone)
        VALUES (${email.toLowerCase()}, ${hashedPassword}, NULL)
      `,
      10000
    );
    console.log(`[${Date.now() - startTime}ms] User inserted successfully`);

    const totalTime = Date.now() - startTime;
    console.log(`✅ Signup completed in ${totalTime}ms`);
    
    return Response.json({ success: true });
    
  } catch (err: any) {
    const totalTime = Date.now() - startTime;
    console.error(`🔥 [${totalTime}ms] FATAL ERROR:`, err.message);
    
    // Return timeout errors clearly
    if (err.message?.includes('timed out')) {
      return Response.json({ 
        error: `Operation timed out after ${totalTime}ms. Please try again.` 
      }, { status: 504 });
    }
    
    if (err.message?.includes('unique constraint') || err.message?.includes('duplicate')) {
      return Response.json({ error: 'Email already exists' }, { status: 409 });
    }
    
    // Return detailed error in development
    const errorMessage = process.env.NODE_ENV === 'development'
      ? err.message || 'Server error'
      : 'Server error';
    
    return Response.json({ error: errorMessage }, { status: 500 });
  }
}
