// Check users table structure
const { neon } = require('@neondatabase/serverless');
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

async function checkUsersTable() {
  try {
    console.log('🔍 Checking users table structure...\n');
    
    // Check if users table exists
    const exists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      );
    `;
    
    if (!exists[0].exists) {
      console.log('⚠️  users table does not exist');
      console.log('   Creating users table...');
      
      await sql`
        CREATE TABLE users (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          email VARCHAR(255) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          phone VARCHAR(20),
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        )
      `;
      
      console.log('✅ users table created');
    } else {
      console.log('✅ users table exists');
      
      // Get columns
      const columns = await sql`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns 
        WHERE table_name = 'users'
        ORDER BY ordinal_position
      `;
      
      console.log('\nCurrent columns:');
      columns.forEach(col => {
        console.log(`  - ${col.column_name} (${col.data_type}) ${col.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'}`);
      });
      
      // Check if password column exists
      const hasPassword = columns.some(col => col.column_name === 'password');
      
      if (!hasPassword) {
        console.log('\n⚠️  password column is missing');
        console.log('   Adding password column...');
        
        await sql`ALTER TABLE users ADD COLUMN password VARCHAR(255) NOT NULL DEFAULT ''`;
        await sql`ALTER TABLE users ALTER COLUMN password DROP DEFAULT`;
        
        console.log('✅ password column added');
      } else {
        console.log('\n✅ password column exists');
      }
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkUsersTable();

