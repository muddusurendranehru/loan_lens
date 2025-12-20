import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import bcrypt from 'bcrypt';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate password length
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user into database
    const result = await db`
      INSERT INTO users (email, password) 
      VALUES (${email.toLowerCase()}, ${hashedPassword}) 
      RETURNING id, email, created_at
    `;

    return NextResponse.json({
      success: true,
      message: 'User created successfully',
      user: {
        id: result[0].id,
        email: result[0].email,
        created_at: result[0].created_at
      }
    }, { status: 201 });

  } catch (error: any) {
    console.error('Signup error:', error);

    // Handle duplicate email
    if (error.code === '23505' || error.message?.includes('unique constraint') || error.message?.includes('duplicate key')) {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 409 }
      );
    }

    // Handle NOT NULL constraint violations
    if (error.code === '23502') {
      console.error('Schema mismatch detected:', error.detail);
      return NextResponse.json(
        { 
          error: 'Database schema mismatch. Please contact support.',
          details: process.env.NODE_ENV === 'development' ? error.message : undefined
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
}
