// Dry run: Insert one month of data, fetch report, display card
const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

// Read .env.local
const envPath = path.join(__dirname, '.env.local');
let databaseUrl = null;

if (fs.existsSync(envPath)) {
  let envContent = fs.readFileSync(envPath, 'utf8');
  if (envContent.charCodeAt(0) === 0xFEFF) {
    envContent = envContent.slice(1);
  }
  const match = envContent.match(/DATABASE_URL\s*=\s*"([^"]+)"/);
  if (match) {
    databaseUrl = match[1].trim();
  }
}

if (!databaseUrl) {
  databaseUrl = process.env.DATABASE_URL;
}

if (!databaseUrl) {
  console.error('❌ DATABASE_URL not found');
  process.exit(1);
}

const sql = neon(databaseUrl);

async function dryRunMonthlyReport() {
  try {
    console.log('🧪 DRY RUN: Monthly Report (Insert → Fetch → Display Card)\n');
    console.log('='.repeat(70));
    
    // 1. Verify connection
    console.log('\n1️⃣  Verifying database connection...');
    const dbResult = await sql`SELECT current_database() as db_name`;
    console.log(`   ✅ Connected to: ${dbResult[0].db_name}`);
    
    // 2. INSERT: October 2024 transactions
    console.log('\n2️⃣  INSERTING October 2024 transactions...');
    const octoberTransactions = [
      // Inflows
      { date: '2024-10-05', amount: 2437286, flow: 'inflow', cat: 'income', desc: 'RTGS from HDFC' },
      { date: '2024-10-10', amount: 19800, flow: 'inflow', cat: 'clinic_income', desc: 'Anjani Foods' },
      { date: '2024-10-15', amount: 19500, flow: 'inflow', cat: 'income', desc: 'House rent' },
      
      // Outflows
      { date: '2024-10-02', amount: 150000, flow: 'outflow', cat: 'emi', desc: 'HDFC loan EMI' },
      { date: '2024-10-05', amount: 150000, flow: 'outflow', cat: 'emi', desc: 'TATA Capital EMI' },
      { date: '2024-10-08', amount: 167348.70, flow: 'outflow', cat: 'emi', desc: 'Bajaj Finance EMI' },
      { date: '2024-10-12', amount: 437512.70, flow: 'outflow', cat: 'vendor_payment', desc: 'Medical supplies' },
      { date: '2024-10-20', amount: 43950, flow: 'outflow', cat: 'tax', desc: 'Income tax payment' }
    ];
    
    const insertedIds = [];
    for (const txn of octoberTransactions) {
      try {
        const result = await sql`
          INSERT INTO cashflow_entries (
            txn_date,
            amount,
            flow_type,
            category,
            description,
            source_sheet,
            financial_year
          ) VALUES (
            ${txn.date}::date,
            ${txn.amount}::numeric(12,2),
            ${txn.flow},
            ${txn.cat},
            ${txn.desc},
            'dry_run_october_2024.xlsx',
            '2024-25'
          )
          ON CONFLICT (txn_date, amount, description) DO NOTHING
          RETURNING id
        `;
        
        if (result && result.length > 0) {
          insertedIds.push(result[0].id);
          const symbol = txn.flow === 'inflow' ? '💰' : '💸';
          console.log(`   ${symbol} ${txn.desc}: ₹${txn.amount.toLocaleString('en-IN')}`);
        }
      } catch (err) {
        console.log(`   ⚠️  ${txn.desc}: ${err.message}`);
      }
    }
    
    console.log(`\n   ✅ Inserted ${insertedIds.length} transactions`);
    
    // 3. FETCH: Get October 2024 report
    console.log('\n3️⃣  FETCHING October 2024 report...');
    
    // Summary
    const summaryRes = await sql`
      SELECT
        COALESCE(SUM(CASE WHEN flow_type = 'inflow' THEN amount ELSE 0 END), 0) AS total_inflow,
        COALESCE(SUM(CASE WHEN flow_type = 'outflow' THEN amount ELSE 0 END), 0) AS total_outflow,
        COUNT(CASE WHEN flow_type = 'inflow' THEN 1 END) AS inflow_count,
        COUNT(CASE WHEN flow_type = 'outflow' THEN 1 END) AS outflow_count
      FROM cashflow_entries
      WHERE financial_year = '2024-25'
        AND EXTRACT(MONTH FROM txn_date) = 10
        AND EXTRACT(YEAR FROM txn_date) = 2024
        AND source_sheet = 'dry_run_october_2024.xlsx'
    `;
    
    const summary = summaryRes[0];
    
    // Category breakdown
    const categoryRes = await sql`
      SELECT 
        category,
        flow_type,
        COUNT(*) AS count,
        SUM(amount) AS total_amount
      FROM cashflow_entries
      WHERE financial_year = '2024-25'
        AND EXTRACT(MONTH FROM txn_date) = 10
        AND EXTRACT(YEAR FROM txn_date) = 2024
        AND source_sheet = 'dry_run_october_2024.xlsx'
      GROUP BY category, flow_type
      ORDER BY flow_type DESC, total_amount DESC
    `;
    
    // Get transactions for descriptions
    const transactionsRes = await sql`
      SELECT 
        category,
        flow_type,
        description
      FROM cashflow_entries
      WHERE financial_year = '2024-25'
        AND EXTRACT(MONTH FROM txn_date) = 10
        AND EXTRACT(YEAR FROM txn_date) = 2024
        AND source_sheet = 'dry_run_october_2024.xlsx'
      ORDER BY amount DESC
    `;
    
    // Get descriptions
    const categoryDescriptions = {};
    for (const txn of transactionsRes) {
      const key = `${txn.category}_${txn.flow_type}`;
      if (!categoryDescriptions[key] && txn.description) {
        categoryDescriptions[key] = txn.description;
      }
    }
    
    // Group inflows
    const inflows = categoryRes
      .filter((row) => row.flow_type === 'inflow')
      .map((row) => ({
        category: row.category,
        label: getCategoryLabel(row.category, 'inflow'),
        amount: Number(row.total_amount || 0),
        count: Number(row.count || 0),
        description: categoryDescriptions[`${row.category}_inflow`] || ''
      }));
    
    // Group outflows
    const outflows = categoryRes
      .filter((row) => row.flow_type === 'outflow')
      .map((row) => ({
        category: row.category,
        label: getCategoryLabel(row.category, 'outflow'),
        amount: Number(row.total_amount || 0),
        count: Number(row.count || 0)
      }));
    
    const netBalance = Number(summary.total_inflow) - Number(summary.total_outflow);
    
    // 4. DISPLAY CARD
    console.log('\n4️⃣  DISPLAY CARD:');
    console.log('\n' + '='.repeat(70));
    console.log('\n📅 October 2024\n');
    
    // INCOME
    if (inflows.length > 0) {
      console.log('💰 INCOME');
      inflows.forEach(item => {
        const desc = item.description ? ` (${item.description})` : '';
        const amount = `₹${item.amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        console.log(`• ${item.label.padEnd(20)} → ${amount.padStart(15)}${desc}`);
      });
      console.log('');
    }
    
    // EXPENSES
    if (outflows.length > 0) {
      console.log('💸 EXPENSES');
      outflows.forEach(item => {
        const amount = `₹${item.amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        console.log(`• ${item.label.padEnd(20)} → ${amount.padStart(15)}`);
      });
      console.log('');
    }
    
    // NET CASHFLOW
    const netSign = netBalance >= 0 ? '+' : '';
    const netColor = netBalance >= 0 ? '💰' : '💸';
    const netAmount = `₹${Math.abs(netBalance).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    console.log('📊 NET CASHFLOW: ' + netSign + netAmount);
    console.log('\n' + '='.repeat(70));
    
    // 5. Summary
    console.log('\n✅ DRY RUN COMPLETE');
    console.log('\n📋 Operations:');
    console.log('   1. ✅ INSERT: October 2024 transactions');
    console.log('   2. ✅ FETCH: Monthly report data');
    console.log('   3. ✅ DISPLAY: Formatted card output');
    console.log('\n✅ All operations successful!');
    
    // 6. Cleanup
    console.log('\n🧹 Cleaning up test data...');
    await sql`DELETE FROM cashflow_entries WHERE source_sheet = 'dry_run_october_2024.xlsx'`;
    console.log('   ✅ Test data deleted');
    
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

// Helper function to get category labels
function getCategoryLabel(category, flow) {
  const inflowMap = {
    'business_loan': 'Business Loan',
    'clinic_income': 'Clinic Income',
    'income': 'Other Income'
  };
  
  const outflowMap = {
    'emi': 'EMIs',
    'vendor_payment': 'Vendor Payments',
    'rent': 'Rent',
    'tax': 'Tax',
    'transfer': 'Transfers'
  };

  return (flow === 'inflow' ? inflowMap[category] : outflowMap[category]) || category;
}

dryRunMonthlyReport();

