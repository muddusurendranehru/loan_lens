// Check what tables exist and their structure
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

async function checkTables() {
  try {
    console.log('🔍 Checking tables...\n');
    
    // Check if cashflow_entries exists
    const cfExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'cashflow_entries'
      );
    `;
    
    // Check if loan_lens exists
    const llExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'loan_lens'
      );
    `;
    
    console.log(`cashflow_entries exists: ${cfExists[0].exists}`);
    console.log(`loan_lens exists: ${llExists[0].exists}\n`);
    
    // Get columns for cashflow_entries if it exists
    if (cfExists[0].exists) {
      const cfColumns = await sql`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'cashflow_entries'
        ORDER BY ordinal_position
      `;
      console.log('cashflow_entries columns:');
      cfColumns.forEach(col => console.log(`  - ${col.column_name} (${col.data_type})`));
      const cfCount = await sql`SELECT COUNT(*) as count FROM cashflow_entries`;
      console.log(`  Rows: ${cfCount[0].count}\n`);
    }
    
    // Get columns for loan_lens if it exists
    if (llExists[0].exists) {
      const llColumns = await sql`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'loan_lens'
        ORDER BY ordinal_position
      `;
      console.log('loan_lens columns:');
      llColumns.forEach(col => console.log(`  - ${col.column_name} (${col.data_type})`));
      const llCount = await sql`SELECT COUNT(*) as count FROM loan_lens`;
      console.log(`  Rows: ${llCount[0].count}\n`);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkTables();

