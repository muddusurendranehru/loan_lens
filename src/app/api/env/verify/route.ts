import { NextResponse } from 'next/server';

export async function GET() {
  const env = {
    // Required
    DATABASE_URL: {
      exists: !!process.env.DATABASE_URL,
      preview: process.env.DATABASE_URL 
        ? process.env.DATABASE_URL.substring(0, 50) + '...' 
        : 'NOT SET',
      valid: process.env.DATABASE_URL?.includes('postgresql://') || process.env.DATABASE_URL?.includes('postgres://')
    },
    JWT_SECRET: {
      exists: !!process.env.JWT_SECRET,
      preview: process.env.JWT_SECRET 
        ? process.env.JWT_SECRET.substring(0, 20) + '...' 
        : 'NOT SET',
      length: process.env.JWT_SECRET?.length || 0
    },
    NEXTAUTH_SECRET: {
      exists: !!process.env.NEXTAUTH_SECRET,
      preview: process.env.NEXTAUTH_SECRET 
        ? process.env.NEXTAUTH_SECRET.substring(0, 20) + '...' 
        : 'NOT SET',
      length: process.env.NEXTAUTH_SECRET?.length || 0
    },
    NEXTAUTH_URL: {
      exists: !!process.env.NEXTAUTH_URL,
      value: process.env.NEXTAUTH_URL || 'NOT SET',
      valid: process.env.NEXTAUTH_URL?.startsWith('http')
    },
    // Optional
    GOOGLE_SERVICE_ACCOUNT_EMAIL: {
      exists: !!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      preview: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || 'NOT SET (optional)'
    },
    GOOGLE_PRIVATE_KEY: {
      exists: !!process.env.GOOGLE_PRIVATE_KEY,
      preview: process.env.GOOGLE_PRIVATE_KEY 
        ? 'Set (hidden)' 
        : 'NOT SET (optional)'
    }
  };

  const required = ['DATABASE_URL', 'JWT_SECRET', 'NEXTAUTH_SECRET', 'NEXTAUTH_URL'];
  const missing = required.filter(key => !env[key as keyof typeof env].exists);
  const invalid = required.filter(key => {
    const e = env[key as keyof typeof env];
    return e.exists && 'valid' in e && !e.valid;
  });

  const status = missing.length === 0 && invalid.length === 0 ? 200 : 500;

  return NextResponse.json({
    success: missing.length === 0 && invalid.length === 0,
    status: missing.length === 0 && invalid.length === 0 ? '✅ All required variables set' : '❌ Issues found',
    environment: env,
    issues: {
      missing,
      invalid,
      summary: missing.length === 0 && invalid.length === 0 
        ? 'All required environment variables are correctly configured!' 
        : `Missing: ${missing.join(', ')}. Invalid: ${invalid.join(', ')}`
    },
    notes: [
      'Environment variables are loaded automatically by Next.js from .env.local',
      'Restart dev server after changing .env.local',
      'Google Sheets credentials are optional (only needed for private sheets)'
    ]
  }, { status });
}

