// Verify users table and password hashing
const { neon } = require('@neondatabase/serverless');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

// Read DATABASE_URL from .env.local
let databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  const envPath = path.join(__dirname, '.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const match = envContent.match(/DATABASE_URL=(.+)/);
    if (match) {
      databaseUrl = match[1].trim();
    }
  }
}

const sql = neon(databaseUrl);

async function verifyUsers() {
  try {
    console.log('🔍 Verifying users table and password hashing...\n');
    
    // Get all users (check both password and password_hash columns)
    const users = await sql`
      SELECT id, email, password, password_hash, phone, created_at 
      FROM users 
      ORDER BY created_at DESC
      LIMIT 10
    `;
    
    if (users.length === 0) {
      console.log('⚠️  No users found in database');
      console.log('   Try signing up first');
      process.exit(0);
    }
    
    console.log(`✅ Found ${users.length} user(s):\n`);
    
    users.forEach((user, index) => {
      console.log(`--- User ${index + 1} ---`);
      console.log(`ID: ${user.id}`);
      console.log(`Email: ${user.email}`);
      console.log(`Phone: ${user.phone || '(empty)'}`);
      console.log(`Created: ${user.created_at}`);
      // Check password column
      if (user.password) {
        console.log(`Password: ${user.password.substring(0, 30)}...`);
        if (user.password.startsWith('$2a$') || user.password.startsWith('$2b$') || user.password.startsWith('$2y$')) {
          console.log('✅ Password is properly hashed (bcrypt format)');
        } else {
          console.log('❌ Password is NOT hashed (plain text)');
        }
      } else {
        console.log('Password: NULL');
      }
      
      // Check password_hash column
      if (user.password_hash) {
        console.log(`Password Hash: ${user.password_hash.substring(0, 30)}...`);
        if (user.password_hash.startsWith('$2a$') || user.password_hash.startsWith('$2b$') || user.password_hash.startsWith('$2y$')) {
          console.log('✅ Password_hash is properly hashed (bcrypt format)');
        } else {
          console.log('❌ Password_hash is NOT hashed (plain text)');
        }
      } else {
        console.log('Password Hash: NULL');
      }
      
      if (!user.password && !user.password_hash) {
        console.log('❌ Both password columns are NULL');
      }
      
      console.log('');
    });
    
    // Check table structure
    console.log('\n📋 Table Structure:');
    const columns = await sql`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      ORDER BY ordinal_position
    `;
    
    columns.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? '(NOT NULL)' : '(nullable)'}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

verifyUsers();

