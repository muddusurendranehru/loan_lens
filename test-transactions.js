const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_zUbO5HZ9kDur@ep-icy-dream-ah5xlk96-pooler.us-east-1.aws.neon.tech/loan_lens?sslmode=require');

async function testTransactions() {
  try {
    console.log('🔍 Testing Transactions Table...\n');

    // Test 1: INSERT - Business Loan (Inflow)
    console.log('📥 TEST 1: INSERT Business Loan (Inflow)');
    const insert1 = await sql`
      INSERT INTO transactions (
        txn_date, amount, type, category, description, source_sheet, financial_year
      ) VALUES (
        '2025-03-15',
        2500000.00,
        'inflow',
        'business_loan',
        'HDFC Business Loan Credit - ₹25,00,000',
        'Test Sheet',
        '2024-25'
      )
      ON CONFLICT (txn_date, amount, description) DO NOTHING
      RETURNING id, txn_date, amount, type, category, description, financial_year
    `;
    console.log('✅ INSERT Result:', insert1);
    console.log('');

    // Test 2: INSERT - Income (Inflow)
    console.log('📥 TEST 2: INSERT Income (Inflow)');
    const insert2 = await sql`
      INSERT INTO transactions (
        txn_date, amount, type, category, description, source_sheet, financial_year
      ) VALUES (
        '2025-03-20',
        50000.00,
        'inflow',
        'income',
        'Client Payment Received',
        'Test Sheet',
        '2024-25'
      )
      ON CONFLICT (txn_date, amount, description) DO NOTHING
      RETURNING id, txn_date, amount, type, category, description, financial_year
    `;
    console.log('✅ INSERT Result:', insert2);
    console.log('');

    // Test 3: INSERT - Home Loan EMI (Outflow)
    console.log('📥 TEST 3: INSERT Home Loan EMI (Outflow)');
    const insert3 = await sql`
      INSERT INTO transactions (
        txn_date, amount, type, category, description, source_sheet, financial_year
      ) VALUES (
        '2025-03-05',
        78200.00,
        'outflow',
        'emi',
        'HDFC Home Loan EMI',
        'Test Sheet',
        '2024-25'
      )
      ON CONFLICT (txn_date, amount, description) DO NOTHING
      RETURNING id, txn_date, amount, type, category, description, financial_year
    `;
    console.log('✅ INSERT Result:', insert3);
    console.log('');

    // Test 4: INSERT - Vendor Payment (Outflow)
    console.log('📥 TEST 4: INSERT Vendor Payment (Outflow)');
    const insert4 = await sql`
      INSERT INTO transactions (
        txn_date, amount, type, category, description, source_sheet, financial_year
      ) VALUES (
        '2025-03-10',
        218300.00,
        'outflow',
        'vendor_payment',
        'Vendor Payment - Supplier Invoice',
        'Test Sheet',
        '2024-25'
      )
      ON CONFLICT (txn_date, amount, description) DO NOTHING
      RETURNING id, txn_date, amount, type, category, description, financial_year
    `;
    console.log('✅ INSERT Result:', insert4);
    console.log('');

    // Test 5: FETCH - All Transactions
    console.log('📤 TEST 5: FETCH All Transactions');
    const fetchAll = await sql`
      SELECT 
        id, txn_date, amount, type, category, description, financial_year
      FROM transactions
      ORDER BY txn_date DESC
      LIMIT 10
    `;
    console.log('✅ FETCH Result:');
    console.log(`   Total Records: ${fetchAll.length}`);
    fetchAll.forEach((txn, idx) => {
      console.log(`   ${idx + 1}. ${txn.txn_date} | ${txn.type} | ${txn.category} | ₹${Number(txn.amount).toLocaleString('en-IN')}`);
    });
    console.log('');

    // Test 6: FETCH - Monthly Summary (March 2025)
    console.log('📤 TEST 6: FETCH Monthly Summary (March 2025)');
    const monthlySummary = await sql`
      SELECT 
        TO_CHAR(txn_date, 'Month YYYY') as month_year,
        SUM(CASE WHEN type = 'inflow' THEN amount ELSE 0 END) as total_inflow,
        SUM(CASE WHEN type = 'outflow' THEN amount ELSE 0 END) as total_outflow,
        SUM(CASE WHEN type = 'inflow' THEN amount ELSE -amount END) as net_balance,
        COUNT(*) as total_transactions
      FROM transactions
      WHERE EXTRACT(MONTH FROM txn_date) = 3 AND EXTRACT(YEAR FROM txn_date) = 2025
      GROUP BY TO_CHAR(txn_date, 'Month YYYY')
    `;
    console.log('✅ Monthly Summary:');
    monthlySummary.forEach(month => {
      console.log(`   ${month.month_year}:`);
      console.log(`     Inflows: ₹${Number(month.total_inflow).toLocaleString('en-IN')}`);
      console.log(`     Outflows: ₹${Number(month.total_outflow).toLocaleString('en-IN')}`);
      console.log(`     Net Balance: ₹${Number(month.net_balance).toLocaleString('en-IN')}`);
      console.log(`     Transactions: ${month.total_transactions}`);
    });
    console.log('');

    // Test 7: FETCH - By Type (Inflows only)
    console.log('📤 TEST 7: FETCH Inflows Only');
    const inflows = await sql`
      SELECT id, txn_date, amount, category, description
      FROM transactions
      WHERE type = 'inflow'
      ORDER BY txn_date DESC
    `;
    console.log(`✅ Found ${inflows.length} Inflows:`);
    inflows.forEach(txn => {
      console.log(`   • ${txn.txn_date} | ${txn.category} | ₹${Number(txn.amount).toLocaleString('en-IN')} | ${txn.description}`);
    });
    console.log('');

    // Test 8: FETCH - By Type (Outflows only)
    console.log('📤 TEST 8: FETCH Outflows Only');
    const outflows = await sql`
      SELECT id, txn_date, amount, category, description
      FROM transactions
      WHERE type = 'outflow'
      ORDER BY txn_date DESC
    `;
    console.log(`✅ Found ${outflows.length} Outflows:`);
    outflows.forEach(txn => {
      console.log(`   • ${txn.txn_date} | ${txn.category} | ₹${Number(txn.amount).toLocaleString('en-IN')} | ${txn.description}`);
    });
    console.log('');

    // Test 9: FETCH - Financial Year Summary
    console.log('📤 TEST 9: FETCH Financial Year 2024-25 Summary');
    const fySummary = await sql`
      SELECT 
        financial_year,
        SUM(CASE WHEN type = 'inflow' THEN amount ELSE 0 END) as total_inflow,
        SUM(CASE WHEN type = 'outflow' THEN amount ELSE 0 END) as total_outflow,
        SUM(CASE WHEN type = 'inflow' THEN amount ELSE -amount END) as net_balance,
        COUNT(*) as total_transactions
      FROM transactions
      WHERE financial_year = '2024-25'
      GROUP BY financial_year
    `;
    console.log('✅ Financial Year Summary:');
    fySummary.forEach(fy => {
      console.log(`   FY ${fy.financial_year}:`);
      console.log(`     Total Inflows: ₹${Number(fy.total_inflow).toLocaleString('en-IN')}`);
      console.log(`     Total Outflows: ₹${Number(fy.total_outflow).toLocaleString('en-IN')}`);
      console.log(`     Net Balance: ₹${Number(fy.net_balance).toLocaleString('en-IN')}`);
      console.log(`     Total Transactions: ${fy.total_transactions}`);
    });
    console.log('');

    // Test 10: Test Duplicate Prevention
    console.log('📥 TEST 10: Test Duplicate Prevention (Same date, amount, description)');
    const duplicateTest = await sql`
      INSERT INTO transactions (
        txn_date, amount, type, category, description, source_sheet, financial_year
      ) VALUES (
        '2025-03-15',
        2500000.00,
        'inflow',
        'business_loan',
        'HDFC Business Loan Credit - ₹25,00,000',
        'Test Sheet',
        '2024-25'
      )
      ON CONFLICT (txn_date, amount, description) DO NOTHING
      RETURNING id
    `;
    if (duplicateTest.length === 0) {
      console.log('✅ Duplicate prevented successfully (no rows inserted)');
    } else {
      console.log('⚠️  Duplicate was inserted (this should not happen)');
    }
    console.log('');

    console.log('✅ All tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Full error:', error);
  }
}

testTransactions();

