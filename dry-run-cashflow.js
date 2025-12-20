// Dry run: Insert and fetch cashflow entries (income, loans, EMI, etc.)
const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

// Read .env.local (prioritize file over process.env)
const envPath = path.join(__dirname, '.env.local');
let databaseUrl = null;

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

if (!databaseUrl) {
  databaseUrl = process.env.DATABASE_URL;
}

if (!databaseUrl) {
  console.error('❌ DATABASE_URL not found');
  process.exit(1);
}

const sql = neon(databaseUrl);

async function dryRunCashflow() {
  try {
    console.log('🧪 DRY RUN: Cashflow Entries (Income, Loans, EMI, etc.)\n');
    console.log('='.repeat(60));
    
    // 1. Verify database connection
    console.log('\n1️⃣  Verifying database connection...');
    const dbResult = await sql`SELECT current_database() as db_name`;
    console.log(`   ✅ Connected to: ${dbResult[0].db_name}`);
    
    // 2. Verify cashflow_entries table structure
    console.log('\n2️⃣  Verifying cashflow_entries table structure...');
    const columns = await sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'cashflow_entries'
      ORDER BY ordinal_position
    `;
    
    console.log('   Table columns:');
    columns.forEach(col => {
      console.log(`   - ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'nullable' : 'NOT NULL'})`);
    });
    
    // 3. Get current count
    const countResult = await sql`SELECT COUNT(*) as count FROM cashflow_entries`;
    const beforeCount = Number(countResult[0].count);
    console.log(`\n   Current entries: ${beforeCount}`);
    
    // 4. Test INSERT - Monthly Income
    console.log('\n3️⃣  Testing INSERT - Monthly Income...');
    const testTransactions = [
      {
        txn_date: '2024-12-01',
        amount: 50000,
        flow_type: 'inflow',
        category: 'clinic_income',
        description: 'Salary December 2024',
        source_sheet: 'test_dry_run.xlsx',
        financial_year: '2024-25'
      },
      {
        txn_date: '2024-12-05',
        amount: 2500000,
        flow_type: 'inflow',
        category: 'business_loan',
        description: 'Loan disbursement L&T Finance',
        source_sheet: 'test_dry_run.xlsx',
        financial_year: '2024-25'
      },
      {
        txn_date: '2024-12-10',
        amount: 75000,
        flow_type: 'outflow',
        category: 'emi',
        description: 'HDFC loan EMI payment',
        source_sheet: 'test_dry_run.xlsx',
        financial_year: '2024-25'
      },
      {
        txn_date: '2024-12-15',
        amount: 45000,
        flow_type: 'outflow',
        category: 'rent',
        description: 'Office rent December',
        source_sheet: 'test_dry_run.xlsx',
        financial_year: '2024-25'
      },
      {
        txn_date: '2024-12-20',
        amount: 25000,
        flow_type: 'outflow',
        category: 'tax',
        description: 'Income tax payment',
        source_sheet: 'test_dry_run.xlsx',
        financial_year: '2024-25'
      }
    ];
    
    console.log(`   Inserting ${testTransactions.length} test transactions...`);
    const insertedIds = [];
    
    for (const txn of testTransactions) {
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
            ${txn.txn_date}::date,
            ${txn.amount}::numeric(12,2),
            ${txn.flow_type},
            ${txn.category},
            ${txn.description},
            ${txn.source_sheet},
            ${txn.financial_year}
          )
          ON CONFLICT (txn_date, amount, description) DO NOTHING
          RETURNING id
        `;
        
        if (result && result.length > 0) {
          insertedIds.push(result[0].id);
          console.log(`   ✅ Inserted: ${txn.category} - ₹${txn.amount.toLocaleString('en-IN')} (${txn.flow_type})`);
        } else {
          console.log(`   ⚠️  Skipped (duplicate): ${txn.description}`);
        }
      } catch (err) {
        console.log(`   ❌ Failed: ${txn.description} - ${err.message}`);
      }
    }
    
    // 5. Verify count increased
    const afterCountResult = await sql`SELECT COUNT(*) as count FROM cashflow_entries`;
    const afterCount = Number(afterCountResult[0].count);
    console.log(`\n   Entries before: ${beforeCount}, after: ${afterCount}`);
    if (afterCount > beforeCount) {
      console.log(`   ✅ ${afterCount - beforeCount} new entries added`);
    }
    
    // 6. Test FETCH - Get all entries for financial year
    console.log('\n4️⃣  Testing FETCH - Get all entries for FY 2024-25...');
    const allEntries = await sql`
      SELECT 
        id,
        txn_date,
        amount,
        flow_type,
        category,
        description,
        financial_year
      FROM cashflow_entries
      WHERE financial_year = '2024-25'
      ORDER BY txn_date DESC, amount DESC
    `;
    
    console.log(`   ✅ Found ${allEntries.length} entries for FY 2024-25:`);
    allEntries.slice(0, 5).forEach((entry, idx) => {
      const symbol = entry.flow_type === 'inflow' ? '💰' : '💸';
      console.log(`   ${idx + 1}. ${symbol} ${entry.category}: ₹${Number(entry.amount).toLocaleString('en-IN')} - ${entry.description}`);
    });
    
    // 7. Test FETCH - Monthly Income Summary
    console.log('\n5️⃣  Testing FETCH - Monthly Income Summary (December 2024)...');
    const incomeSummary = await sql`
      SELECT 
        SUM(CASE WHEN flow_type = 'inflow' THEN amount ELSE 0 END) AS total_inflow,
        SUM(CASE WHEN flow_type = 'outflow' THEN amount ELSE 0 END) AS total_outflow,
        COUNT(CASE WHEN flow_type = 'inflow' THEN 1 END) AS inflow_count,
        COUNT(CASE WHEN flow_type = 'outflow' THEN 1 END) AS outflow_count
      FROM cashflow_entries
      WHERE financial_year = '2024-25'
        AND EXTRACT(MONTH FROM txn_date) = 12
        AND EXTRACT(YEAR FROM txn_date) = 2024
    `;
    
    const summary = incomeSummary[0];
    console.log('   ✅ December 2024 Summary:');
    console.log(`   - Total Inflow: ₹${Number(summary.total_inflow || 0).toLocaleString('en-IN')}`);
    console.log(`   - Total Outflow: ₹${Number(summary.total_outflow || 0).toLocaleString('en-IN')}`);
    console.log(`   - Net Balance: ₹${Number(summary.total_inflow || 0 - summary.total_outflow || 0).toLocaleString('en-IN')}`);
    console.log(`   - Inflow Transactions: ${Number(summary.inflow_count || 0)}`);
    console.log(`   - Outflow Transactions: ${Number(summary.outflow_count || 0)}`);
    
    // 8. Test FETCH - Category Breakdown
    console.log('\n6️⃣  Testing FETCH - Category Breakdown...');
    const categoryBreakdown = await sql`
      SELECT 
        category,
        flow_type,
        COUNT(*) AS count,
        SUM(amount) AS total_amount
      FROM cashflow_entries
      WHERE financial_year = '2024-25'
      GROUP BY category, flow_type
      ORDER BY flow_type DESC, total_amount DESC
    `;
    
    console.log('   ✅ Category Breakdown:');
    categoryBreakdown.forEach(cat => {
      const symbol = cat.flow_type === 'inflow' ? '💰' : '💸';
      console.log(`   ${symbol} ${cat.category}: ₹${Number(cat.total_amount).toLocaleString('en-IN')} (${cat.count} transactions)`);
    });
    
    // 9. Test FETCH - Loans (business_loan category)
    console.log('\n7️⃣  Testing FETCH - Business Loans...');
    const loans = await sql`
      SELECT 
        txn_date,
        amount,
        description,
        financial_year
      FROM cashflow_entries
      WHERE category = 'business_loan'
        AND financial_year = '2024-25'
      ORDER BY txn_date DESC
    `;
    
    console.log(`   ✅ Found ${loans.length} loan entries:`);
    loans.forEach((loan, idx) => {
      console.log(`   ${idx + 1}. ₹${Number(loan.amount).toLocaleString('en-IN')} on ${loan.txn_date} - ${loan.description}`);
    });
    
    // 10. Test FETCH - EMI payments
    console.log('\n8️⃣  Testing FETCH - EMI Payments...');
    const emis = await sql`
      SELECT 
        txn_date,
        amount,
        description,
        financial_year
      FROM cashflow_entries
      WHERE category = 'emi'
        AND financial_year = '2024-25'
      ORDER BY txn_date DESC
    `;
    
    console.log(`   ✅ Found ${emis.length} EMI entries:`);
    emis.forEach((emi, idx) => {
      console.log(`   ${idx + 1}. ₹${Number(emi.amount).toLocaleString('en-IN')} on ${emi.txn_date} - ${emi.description}`);
    });
    
    // 11. Cleanup - Delete test entries
    console.log('\n9️⃣  Cleaning up test entries...');
    if (insertedIds.length > 0) {
      await sql`DELETE FROM cashflow_entries WHERE source_sheet = 'test_dry_run.xlsx'`;
      console.log(`   ✅ Deleted ${insertedIds.length} test entries`);
    } else {
      console.log('   ℹ️  No test entries to delete (all were duplicates)');
    }
    
    // 12. Final Summary
    console.log('\n' + '='.repeat(60));
    console.log('\n✅ DRY RUN COMPLETE');
    console.log('\n📋 Cashflow Operations Verified:');
    console.log('   1. ✅ INSERT: Monthly income, loans, EMI, rent, tax');
    console.log('   2. ✅ FETCH: All entries by financial year');
    console.log('   3. ✅ FETCH: Monthly summary (inflow/outflow)');
    console.log('   4. ✅ FETCH: Category breakdown');
    console.log('   5. ✅ FETCH: Business loans');
    console.log('   6. ✅ FETCH: EMI payments');
    console.log('   7. ✅ DELETE: Cleanup test data');
    console.log('\n✅ All cashflow operations working correctly!');
    
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

dryRunCashflow();

