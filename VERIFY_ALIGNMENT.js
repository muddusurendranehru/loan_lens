// Step-by-Step Backend/Frontend/Database Alignment Check
const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

console.log('========================================');
console.log('STEP-BY-STEP ALIGNMENT VERIFICATION');
console.log('========================================\n');

// Step 1: Check Environment Variables
console.log('STEP 1: Checking Environment Variables');
console.log('----------------------------------------');
const envPath = path.join(__dirname, '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const hasDatabaseUrl = envContent.includes('DATABASE_URL=');
  const hasNextAuthSecret = envContent.includes('NEXTAUTH_SECRET=');
  const hasNextAuthUrl = envContent.includes('NEXTAUTH_URL=');
  
  console.log('✅ .env.local exists');
  console.log(`   DATABASE_URL: ${hasDatabaseUrl ? '✅ Found' : '❌ Missing'}`);
  console.log(`   NEXTAUTH_SECRET: ${hasNextAuthSecret ? '✅ Found' : '❌ Missing'}`);
  console.log(`   NEXTAUTH_URL: ${hasNextAuthUrl ? '✅ Found' : '❌ Missing'}`);
  
  if (!hasDatabaseUrl || !hasNextAuthSecret || !hasNextAuthUrl) {
    console.log('❌ Missing required environment variables!');
    process.exit(1);
  }
} else {
  console.log('❌ .env.local not found!');
  process.exit(1);
}
console.log('');

// Step 2: Check Database Connection
console.log('STEP 2: Checking Database Connection');
console.log('----------------------------------------');
require('dotenv').config({ path: '.env.local' });

if (!process.env.DATABASE_URL) {
  console.log('❌ DATABASE_URL not set in environment');
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);

async function checkDatabase() {
  try {
    // Test connection
    const result = await sql`SELECT NOW() as current_time, current_database() as db_name`;
    console.log('✅ Database connection successful');
    console.log(`   Database: ${result[0].db_name}`);
    console.log(`   Current time: ${result[0].current_time}`);
    
    // Check users table structure
    const usersColumns = await sql`
      SELECT 
        column_name,
        data_type,
        is_nullable,
        column_default
      FROM information_schema.columns
      WHERE table_name = 'users'
      ORDER BY ordinal_position;
    `;
    
    console.log('\n   Users table columns:');
    usersColumns.forEach(col => {
      const nullable = col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL';
      console.log(`     - ${col.column_name}: ${col.data_type} (${nullable})`);
    });
    
    // Check for phone column issue
    const phoneCol = usersColumns.find(c => c.column_name === 'phone');
    if (phoneCol && phoneCol.is_nullable === 'NO') {
      console.log('\n   ⚠️  WARNING: phone column is NOT NULL');
      console.log('      This will cause signup to fail!');
      console.log('      Fix: ALTER TABLE users ALTER COLUMN phone DROP NOT NULL;');
    }
    
    // Check tables exist
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
        AND table_name IN ('users', 'transactions', 'loan_emis')
      ORDER BY table_name;
    `;
    
    console.log('\n   Required tables:');
    const requiredTables = ['users', 'transactions', 'loan_emis'];
    requiredTables.forEach(table => {
      const exists = tables.some(t => t.table_name === table);
      console.log(`     - ${table}: ${exists ? '✅ Exists' : '❌ Missing'}`);
    });
    
    return true;
  } catch (error) {
    console.log('❌ Database connection failed:', error.message);
    return false;
  }
}

// Step 3: Check File Structure
console.log('\nSTEP 3: Checking File Structure');
console.log('----------------------------------------');

const requiredFiles = [
  'src/lib/db.ts',
  'src/lib/schema.sql',
  'src/app/api/auth/signup/route.ts',
  'src/app/api/auth/[...nextauth]/route.ts',
  'src/app/signup/page.tsx',
  'src/app/login/page.tsx',
  'src/app/dashboard/page.tsx',
  'package.json'
];

requiredFiles.forEach(file => {
  const exists = fs.existsSync(path.join(__dirname, file));
  console.log(`${exists ? '✅' : '❌'} ${file}`);
});

// Step 4: Check API Routes Alignment
console.log('\nSTEP 4: Checking API Routes');
console.log('----------------------------------------');

// Check signup route
const signupRoutePath = path.join(__dirname, 'src/app/api/auth/signup/route.ts');
if (fs.existsSync(signupRoutePath)) {
  const signupCode = fs.readFileSync(signupRoutePath, 'utf8');
  const usesBcrypt = signupCode.includes('bcrypt');
  const usesSql = signupCode.includes('sql`');
  const insertsEmailPassword = signupCode.includes('INSERT INTO users (email, password)');
  
  console.log('Signup API Route:');
  console.log(`   Uses bcrypt: ${usesBcrypt ? '✅' : '❌'}`);
  console.log(`   Uses sql: ${usesSql ? '✅' : '❌'}`);
  console.log(`   Inserts email/password: ${insertsEmailPassword ? '✅' : '❌'}`);
  
  // Check if phone is inserted (should NOT be)
  const insertsPhone = signupCode.includes('phone');
  if (insertsPhone) {
    console.log('   ⚠️  WARNING: Code inserts phone column');
  }
}

// Step 5: Check Frontend Alignment
console.log('\nSTEP 5: Checking Frontend Alignment');
console.log('----------------------------------------');

// Check signup page
const signupPagePath = path.join(__dirname, 'src/app/signup/page.tsx');
if (fs.existsSync(signupPagePath)) {
  const signupPageCode = fs.readFileSync(signupPagePath, 'utf8');
  const hasEmailField = signupPageCode.includes('type="email"');
  const hasPasswordField = signupPageCode.includes('type="password"');
  const callsSignupAPI = signupPageCode.includes('/api/auth/signup');
  
  console.log('Signup Page:');
  console.log(`   Email field: ${hasEmailField ? '✅' : '❌'}`);
  console.log(`   Password field: ${hasPasswordField ? '✅' : '❌'}`);
  console.log(`   Calls /api/auth/signup: ${callsSignupAPI ? '✅' : '❌'}`);
}

// Check login page
const loginPagePath = path.join(__dirname, 'src/app/login/page.tsx');
if (fs.existsSync(loginPagePath)) {
  const loginPageCode = fs.readFileSync(loginPagePath, 'utf8');
  const usesNextAuth = loginPageCode.includes('next-auth/react');
  const redirectsToDashboard = loginPageCode.includes('/dashboard');
  
  console.log('\nLogin Page:');
  console.log(`   Uses NextAuth: ${usesNextAuth ? '✅' : '❌'}`);
  console.log(`   Redirects to dashboard: ${redirectsToDashboard ? '✅' : '❌'}`);
}

// Step 6: Check Dependencies
console.log('\nSTEP 6: Checking Dependencies');
console.log('----------------------------------------');

const packageJsonPath = path.join(__dirname, 'package.json');
if (fs.existsSync(packageJsonPath)) {
  const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  const deps = { ...pkg.dependencies, ...pkg.devDependencies };
  
  const requiredDeps = {
    '@neondatabase/serverless': 'Database connection',
    'bcryptjs': 'Password hashing',
    'next-auth': 'Authentication',
    'next': 'Framework',
    'react': 'UI library'
  };
  
  Object.keys(requiredDeps).forEach(dep => {
    const exists = deps[dep];
    console.log(`${exists ? '✅' : '❌'} ${dep} - ${requiredDeps[dep]}`);
  });
}

// Run database check
console.log('\n');
checkDatabase().then(success => {
  if (!success) {
    console.log('\n❌ Verification failed!');
    process.exit(1);
  } else {
    console.log('\n========================================');
    console.log('✅ VERIFICATION COMPLETE');
    console.log('========================================');
    console.log('\nSummary:');
    console.log('- Environment variables: Checked');
    console.log('- Database connection: Checked');
    console.log('- File structure: Checked');
    console.log('- API routes: Checked');
    console.log('- Frontend pages: Checked');
    console.log('- Dependencies: Checked');
    console.log('\nIf all checks passed, your app should work!');
  }
}).catch(err => {
  console.log('\n❌ Verification error:', err.message);
  process.exit(1);
});

