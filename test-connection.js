// Test database connection
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

if (!databaseUrl) {
  console.error('❌ DATABASE_URL not found');
  process.exit(1);
}

const sql = neon(databaseUrl);

async function testConnection() {
  try {
    console.log('🔍 Testing database connection...');
    
    // Test basic connection
    const result = await sql`SELECT 1 as test`;
    console.log('✅ Connection successful:', result[0]);
    
    // Check if cashflow_entries table exists
    const tableCheck = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'cashflow_entries'
      );
    `;
    
    if (tableCheck[0].exists) {
      console.log('✅ cashflow_entries table exists');
      
      // Get table info
      const count = await sql`SELECT COUNT(*) as count FROM cashflow_entries`;
      console.log(`📊 Total transactions: ${count[0].count}`);
    } else {
      console.log('⚠️  cashflow_entries table does not exist');
      console.log('   Run schema.sql to create the table');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    process.exit(1);
  }
}

testConnection();

