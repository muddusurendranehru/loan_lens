// Check which database we're actually connected to
const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

// Read DATABASE_URL from .env.local
let databaseUrl = process.env.DATABASE_URL;
const envPath = path.join(__dirname, '.env.local');
console.log(`Reading DATABASE_URL from: ${envPath}`);
console.log(`process.env.DATABASE_URL: ${databaseUrl ? 'SET' : 'NOT SET'}\n`);

if (!databaseUrl) {
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const lines = envContent.split('\n');
    for (const line of lines) {
      if (line.trim().startsWith('DATABASE_URL=') || line.includes('DATABASE_URL=')) {
        // Remove DATABASE_URL= prefix (handle BOM and whitespace)
        let url = line.replace(/^[^\w]*DATABASE_URL\s*=\s*/, '').trim();
        // Remove quotes if present
        if ((url.startsWith('"') && url.endsWith('"')) || 
            (url.startsWith("'") && url.endsWith("'"))) {
          url = url.slice(1, -1);
        }
        databaseUrl = url.trim();
        console.log(`✅ Found DATABASE_URL in .env.local: ${databaseUrl.substring(0, 80)}...\n`);
        break;
      }
    }
  }
} else {
  console.log(`✅ Using DATABASE_URL from process.env: ${databaseUrl.substring(0, 80)}...\n`);
}

console.log('🔍 Checking database connection...\n');

// Extract database name from connection string
const dbMatch = databaseUrl.match(/\/\/([^@]+)@[^\/]+\/([^?&]+)/);
if (dbMatch) {
  const dbName = decodeURIComponent(dbMatch[2]);
  console.log(`Connection string database: ${dbName}`);
} else {
  console.log(`⚠️ Could not extract database name from connection string`);
  console.log(`Connection string preview: ${databaseUrl.substring(0, 100)}...`);
}

const sql = neon(databaseUrl);

async function checkDatabase() {
  try {
    // Get current database name
    const dbName = await sql`SELECT current_database() as db_name`;
    console.log(`Current database: ${dbName[0].db_name}\n`);
    
    // List all tables in current database
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `;
    
    console.log(`Tables in current database (${dbName[0].db_name}):`);
    tables.forEach(table => {
      console.log(`  - ${table.table_name}`);
    });
    
    // Check if users table exists
    const hasUsers = tables.some(t => t.table_name === 'users');
    if (hasUsers) {
      const userCount = await sql`SELECT COUNT(*) as count FROM users`;
      console.log(`\n✅ users table exists with ${userCount[0].count} row(s)`);
    } else {
      console.log(`\n⚠️  users table does NOT exist in this database`);
    }
    
    // Check if cashflow_entries exists
    const hasCashflow = tables.some(t => t.table_name === 'cashflow_entries');
    if (hasCashflow) {
      const cfCount = await sql`SELECT COUNT(*) as count FROM cashflow_entries`;
      console.log(`✅ cashflow_entries table exists with ${cfCount[0].count} row(s)`);
    } else {
      console.log(`⚠️  cashflow_entries table does NOT exist in this database`);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkDatabase();

