// Test creating a new user with the fixed signup API
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

async function testNewSignup() {
  try {
    console.log('🧪 Testing new user creation with password_hash...\n');
    
    const testEmail = `newuser${Date.now()}@test.com`;
    const testPassword = 'TestPassword123!';
    
    console.log(`Creating user:`);
    console.log(`  Email: ${testEmail}`);
    console.log(`  Password: ${testPassword}\n`);
    
    // Hash password
    const hashedPassword = bcrypt.hashSync(testPassword, 10);
    console.log(`  Hashed Password: ${hashedPassword.substring(0, 30)}...\n`);
    
    // Insert user (both password and password_hash are required)
    const result = await sql`
      INSERT INTO users (email, password, password_hash, phone, role)
      VALUES (${testEmail}, ${hashedPassword}, ${hashedPassword}, '', 'user')
      RETURNING id, email, created_at
    `;
    
    if (result && result.length > 0) {
      console.log('✅ User created successfully!');
      console.log(`  ID: ${result[0].id}`);
      console.log(`  Email: ${result[0].email}`);
      console.log(`  Created: ${result[0].created_at}\n`);
      
      // Verify the user exists and password is hashed
      const verify = await sql`
        SELECT id, email, password_hash 
        FROM users 
        WHERE email = ${testEmail}
      `;
      
      if (verify.length > 0) {
        const user = verify[0];
        console.log('✅ Verification:');
        console.log(`  User found in database`);
        if (user.password_hash && user.password_hash.startsWith('$2')) {
          console.log(`  Password is properly hashed (bcrypt)`);
        } else {
          console.log(`  ⚠️  Password hash format issue`);
        }
      }
    } else {
      console.log('❌ User creation failed - no result returned');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

testNewSignup();

