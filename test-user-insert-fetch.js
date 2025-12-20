// Test user insert and fetch operations on Neon database
const { neon } = require('@neondatabase/serverless');
const bcryptjs = require('bcryptjs');
const fs = require('fs');
const path = require('path');

// Read .env.local (prioritize file over process.env)
const envPath = path.join(__dirname, '.env.local');
let databaseUrl = null;

// Always read from .env.local first
if (fs.existsSync(envPath)) {
  let envContent = fs.readFileSync(envPath, 'utf8');
  // Remove BOM if present
  if (envContent.charCodeAt(0) === 0xFEFF) {
    envContent = envContent.slice(1);
  }
  // Use regex to extract DATABASE_URL
  const match = envContent.match(/DATABASE_URL\s*=\s*"([^"]+)"/);
  if (match) {
    databaseUrl = match[1].trim();
  }
}

// Fallback to process.env only if .env.local didn't have it
if (!databaseUrl) {
  databaseUrl = process.env.DATABASE_URL;
}

if (!databaseUrl) {
  console.error('❌ DATABASE_URL not found in .env.local or environment');
  process.exit(1);
}

const sql = neon(databaseUrl);

async function testDatabase() {
  try {
    console.log('🔍 Testing Neon Database Connection...\n');
    
    // 1. Check current database
    const dbResult = await sql`SELECT current_database() as db_name`;
    console.log(`✅ Connected to database: ${dbResult[0].db_name}\n`);
    
    // 2. Check if users table exists and show structure
    console.log('📊 Checking users table structure...');
    const tableInfo = await sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'users'
      ORDER BY ordinal_position
    `;
    
    if (tableInfo.length === 0) {
      console.error('❌ users table does not exist!');
      process.exit(1);
    }
    
    console.log('✅ users table structure:');
    tableInfo.forEach(col => {
      console.log(`   - ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'nullable' : 'NOT NULL'})`);
    });
    console.log('');
    
    // 3. Check current user count
    const countResult = await sql`SELECT COUNT(*) as count FROM users`;
    const currentCount = Number(countResult[0].count);
    console.log(`📈 Current users in database: ${currentCount}\n`);
    
    // 4. Test INSERT operation
    console.log('🧪 Testing INSERT operation...');
    const testEmail = `test_${Date.now()}@example.com`;
    const testPassword = 'testpass123';
    
    // Hash password
    const hashedPassword = await new Promise((resolve, reject) => {
      bcryptjs.hash(testPassword, 10, (err, hash) => {
        if (err) reject(err);
        else resolve(hash);
      });
    });
    
    console.log(`   Creating test user: ${testEmail}`);
    // Check column requirements
    const phoneRequired = tableInfo.some(col => col.column_name === 'phone' && col.is_nullable === 'NO');
    const passwordHashRequired = tableInfo.some(col => col.column_name === 'password_hash' && col.is_nullable === 'NO');
    const roleRequired = tableInfo.some(col => col.column_name === 'role' && col.is_nullable === 'NO');
    
    const testPhone = phoneRequired ? '+919999999999' : null;
    const testRole = roleRequired ? 'user' : null;
    
    // Build INSERT query based on schema
    let insertResult;
    if (passwordHashRequired) {
      // Schema has both password and password_hash columns
      insertResult = await sql`
        INSERT INTO users (email, password, password_hash, phone${roleRequired ? sql`, role` : sql``})
        VALUES (${testEmail}, ${hashedPassword}, ${hashedPassword}, ${testPhone}${roleRequired ? sql`, ${testRole}` : sql``})
        RETURNING id, email, phone, created_at
      `;
    } else {
      // Schema has only password column
      insertResult = await sql`
        INSERT INTO users (email, password, phone${roleRequired ? sql`, role` : sql``})
        VALUES (${testEmail}, ${hashedPassword}, ${testPhone}${roleRequired ? sql`, ${testRole}` : sql``})
        RETURNING id, email, phone, created_at
      `;
    }
    
    if (insertResult.length > 0) {
      const newUser = insertResult[0];
      console.log('   ✅ INSERT successful!');
      console.log(`   - ID: ${newUser.id}`);
      console.log(`   - Email: ${newUser.email}`);
      console.log(`   - Phone: ${newUser.phone || 'null'}`);
      console.log(`   - Created: ${newUser.created_at}\n`);
      
      const testUserId = newUser.id;
      
      // 5. Test FETCH operation (by email)
      console.log('🧪 Testing FETCH operation (by email)...');
      const fetchResult = await sql`
        SELECT id, email, password, phone, created_at
        FROM users
        WHERE email = ${testEmail}
      `;
      
      if (fetchResult.length > 0) {
        const fetchedUser = fetchResult[0];
        console.log('   ✅ FETCH successful!');
        console.log(`   - ID: ${fetchedUser.id}`);
        console.log(`   - Email: ${fetchedUser.email}`);
        console.log(`   - Password hash: ${fetchedUser.password.substring(0, 20)}...`);
        console.log(`   - Phone: ${fetchedUser.phone || 'null'}`);
        console.log(`   - Created: ${fetchedUser.created_at}\n`);
        
        // 6. Test password verification
        console.log('🧪 Testing password verification...');
        const passwordMatch = await new Promise((resolve, reject) => {
          bcryptjs.compare(testPassword, fetchedUser.password, (err, result) => {
            if (err) reject(err);
            else resolve(result);
          });
        });
        
        if (passwordMatch) {
          console.log('   ✅ Password verification successful!\n');
        } else {
          console.log('   ❌ Password verification failed!\n');
        }
        
        // 7. Cleanup - delete test user
        console.log('🧹 Cleaning up test user...');
        await sql`DELETE FROM users WHERE id = ${testUserId}`;
        console.log('   ✅ Test user deleted\n');
      } else {
        console.log('   ❌ FETCH failed - user not found\n');
      }
      
      // 8. Test FETCH all users
      console.log('🧪 Testing FETCH all users...');
      const allUsers = await sql`
        SELECT id, email, phone, created_at
        FROM users
        ORDER BY created_at DESC
        LIMIT 5
      `;
      
      console.log(`   ✅ Found ${allUsers.length} user(s):`);
      allUsers.forEach((user, idx) => {
        console.log(`   ${idx + 1}. ${user.email} (${user.phone || 'no phone'}) - Created: ${user.created_at}`);
      });
      console.log('');
      
    } else {
      console.log('   ❌ INSERT failed - no user returned\n');
    }
    
    // 9. Final user count
    const finalCountResult = await sql`SELECT COUNT(*) as count FROM users`;
    const finalCount = Number(finalCountResult[0].count);
    console.log(`📊 Final user count: ${finalCount}`);
    
    console.log('\n✅ All tests completed successfully!');
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

testDatabase();

