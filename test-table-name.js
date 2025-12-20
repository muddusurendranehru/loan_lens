// Test which table actually has the data
const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

// Read .env.local
const envPath = path.join(__dirname, '.env.local');
let databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl && fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const lines = envContent.split('\n');
  for (const line of lines) {
    if (line.includes('DATABASE_URL=')) {
      let url = line.replace(/^[^\w]*DATABASE_URL\s*=\s*/, '').trim();
      if ((url.startsWith('"') && url.endsWith('"')) || 
          (url.startsWith("'") && url.endsWith("'"))) {
        url = url.slice(1, -1);
      }
      databaseUrl = url.trim();
      break;
    }
  }
}

const sql = neon(databaseUrl);

async function testTables() {
  try {
    // Test cashflow_entries
    console.log('🔍 Testing cashflow_entries:');
    try {
      const cfResult = await sql`SELECT COUNT(*) as count FROM cashflow_entries`;
      const count = Number(cfResult[0]?.count || 0);
      console.log(`  ✅ cashflow_entries: ${count} rows`);
    } catch (e) {
      console.log(`  ❌ cashflow_entries error: ${e.message}`);
    }
    
    // Test transactions table
    console.log('\n🔍 Testing transactions:');
    try {
      const txResult = await sql`SELECT COUNT(*) as count FROM transactions`;
      const count = Number(txResult[0]?.count || 0);
      console.log(`  ✅ transactions: ${count} rows`);
      if (count > 0) {
        const sample = await sql`SELECT * FROM transactions LIMIT 1`;
        console.log(`  Sample columns:`, Object.keys(sample[0] || {}));
      }
    } catch (e) {
      console.log(`  ❌ transactions error: ${e.message}`);
    }
    
    // List all tables for reference
    console.log('\n📊 All tables in database:');
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `;
    for (const table of tables) {
      console.log(`  - ${table.table_name}`);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

testTables();
