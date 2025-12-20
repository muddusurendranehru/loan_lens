// Create cashflow_entries table
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

async function createTable() {
  try {
    console.log('🔍 Creating cashflow_entries table...');
    
    await sql`
      CREATE TABLE IF NOT EXISTS cashflow_entries (
        id SERIAL PRIMARY KEY,
        txn_date DATE NOT NULL,
        amount NUMERIC(12, 2) NOT NULL,
        flow_type TEXT NOT NULL CHECK (flow_type IN ('inflow', 'outflow')),
        category TEXT NOT NULL CHECK (
          category IN (
            'business_loan',
            'clinic_income',
            'income',
            'emi',
            'rent',
            'tax',
            'vendor_payment',
            'transfer'
          )
        ),
        description TEXT,
        source_sheet TEXT,
        financial_year TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(txn_date, amount, description)
      )
    `;
    
    console.log('✅ Table created successfully');
    
    // Create indexes
    await sql`CREATE INDEX IF NOT EXISTS idx_cf_date ON cashflow_entries(txn_date)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_cf_fy ON cashflow_entries(financial_year)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_cf_category ON cashflow_entries(category)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_cf_flow_type ON cashflow_entries(flow_type)`;
    
    console.log('✅ Indexes created successfully');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

createTable();

