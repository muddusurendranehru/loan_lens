const fs = require('fs');
const FormData = require('form-data');
const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000';

async function testFullFlow() {
  console.log('🧪 Testing HOMA Clinic EBITDA Tracker - Full Flow\n');

  // Wait for server to be ready
  console.log('⏳ Waiting for server to start...');
  await new Promise(resolve => setTimeout(resolve, 5000));

  try {
    // Test 1: Upload Excel file
    console.log('📤 TEST 1: Upload Excel File');
    const formData = new FormData();
    formData.append('accountType', 'savings');
    formData.append('file', fs.createReadStream('test-homa-march-2025.xlsx'));

    const uploadRes = await fetch(`${BASE_URL}/api/parse/upload`, {
      method: 'POST',
      body: formData
    });

    const uploadData = await uploadRes.json();
    
    if (!uploadRes.ok) {
      console.error('❌ Upload failed:', uploadData);
      return;
    }

    console.log('✅ Upload successful!');
    console.log(`   Detected ${uploadData.candidates?.length || 0} transactions`);
    console.log(`   Inflows: ${uploadData.inflows?.length || 0}`);
    console.log(`   Outflows: ${uploadData.outflows?.length || 0}`);
    console.log(`   Total Inflow: ₹${(uploadData.summary?.totalInflow || 0).toLocaleString('en-IN')}`);
    console.log(`   Total Outflow: ₹${(uploadData.summary?.totalOutflow || 0).toLocaleString('en-IN')}`);
    console.log('');

    // Test 2: Save transactions
    if (uploadData.candidates && uploadData.candidates.length > 0) {
      console.log('💾 TEST 2: Save Transactions');
      
      const confirmRes = await fetch(`${BASE_URL}/api/parse/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transactions: uploadData.candidates,
          sheetName: 'Test HOMA March 2025'
        })
      });

      const confirmData = await confirmRes.json();
      
      if (!confirmRes.ok) {
        console.error('❌ Save failed:', confirmData);
        return;
      }

      console.log('✅ Save successful!');
      console.log(`   Saved: ${confirmData.saved} transactions`);
      console.log(`   Skipped: ${confirmData.skipped} duplicates`);
      console.log('');

      // Test 3: Fetch monthly summary
      console.log('📊 TEST 3: Fetch Monthly EBITDA Summary');
      const monthlyRes = await fetch(`${BASE_URL}/api/dashboard/monthly?month=03&year=2025`);
      const monthlyData = await monthlyRes.json();

      if (!monthlyRes.ok) {
        console.error('❌ Monthly fetch failed:', monthlyData);
        return;
      }

      console.log('✅ Monthly summary fetched!');
      if (monthlyData.summary) {
        const s = monthlyData.summary;
        console.log(`   Clinic Revenue: ₹${(s.revenue?.clinic_revenue || 0).toLocaleString('en-IN')}`);
        console.log(`   Salaries: ₹${(s.expenses?.salaries || 0).toLocaleString('en-IN')}`);
        console.log(`   Rent: ₹${(s.expenses?.rent || 0).toLocaleString('en-IN')}`);
        console.log(`   EBITDA: ₹${(s.metrics?.ebitda || 0).toLocaleString('en-IN')}`);
        console.log(`   Net Cashflow: ₹${(s.metrics?.net_cashflow || 0).toLocaleString('en-IN')}`);
      }
      console.log('');

      // Test 4: Fetch all months
      console.log('📅 TEST 4: Fetch All Months');
      const monthsRes = await fetch(`${BASE_URL}/api/dashboard/months`);
      const monthsData = await monthsRes.json();

      if (monthsRes.ok) {
        console.log('✅ Months fetched!');
        console.log(`   Total months: ${monthsData.summary?.length || 0}`);
        console.log(`   Financial years: ${monthsData.financialYears?.join(', ') || 'None'}`);
      }

      console.log('\n✅ All tests passed!');
    } else {
      console.log('⚠️  No transactions detected in file');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Full error:', error);
  }
}

testFullFlow();

