// Test script for Dashboard APIs
// Using built-in fetch (Node.js 18+)

const BASE_URL = process.env.BASE_URL || 'http://localhost:3001';

async function testDashboardAPIs() {
  console.log('🧪 Testing Dashboard APIs\n');
  console.log('='.repeat(70));

  try {
    // Test 1: Recent Transactions API
    console.log('\n1️⃣  Testing Recent Transactions API...');
    const transactionsRes = await fetch(`${BASE_URL}/api/dashboard/recent-transactions?limit=5`);
    const transactionsData = await transactionsRes.json();
    
    if (transactionsData.success) {
      console.log('   ✅ Success!');
      console.log(`   📊 Found ${transactionsData.transactions?.length || 0} transactions`);
      if (transactionsData.transactions?.length > 0) {
        console.log('   Sample transaction:');
        const txn = transactionsData.transactions[0];
        console.log(`      - ${txn.description}: ₹${txn.amount.toLocaleString('en-IN')} (${txn.flow_type})`);
      }
    } else {
      console.log('   ❌ Failed:', transactionsData.error);
    }

    // Test 2: Daily Data API (current month)
    console.log('\n2️⃣  Testing Daily Data API...');
    const now = new Date();
    const currentMonth = String(now.getMonth() + 1).padStart(2, '0');
    const currentYear = now.getFullYear();
    
    const dailyRes = await fetch(`${BASE_URL}/api/dashboard/daily?month=${currentMonth}&year=${currentYear}`);
    const dailyData = await dailyRes.json();
    
    if (dailyData.success) {
      console.log('   ✅ Success!');
      console.log(`   📊 Found ${dailyData.dailyData?.length || 0} days with data`);
      if (dailyData.dailyData?.length > 0) {
        const day = dailyData.dailyData[0];
        console.log(`   Sample day: ${day.date}`);
        console.log(`      - Income: ₹${day.income.toLocaleString('en-IN')}`);
        console.log(`      - Expense: ₹${day.expense.toLocaleString('en-IN')}`);
      }
    } else {
      console.log('   ❌ Failed:', dailyData.error);
    }

    // Test 3: Cashflow Report API
    console.log('\n3️⃣  Testing Cashflow Report API...');
    const financialYear = currentMonth >= '04' 
      ? `${currentYear}-${String(currentYear + 1).slice(-2)}`
      : `${currentYear - 1}-${String(currentYear).slice(-2)}`;
    
    const reportRes = await fetch(`${BASE_URL}/api/report/cashflow?financial_year=${financialYear}&month=${currentMonth}`);
    const reportData = await reportRes.json();
    
    if (reportData.success) {
      console.log('   ✅ Success!');
      console.log(`   📅 Month: ${reportData.month || 'N/A'}`);
      console.log(`   💰 Income items: ${reportData.income?.length || 0}`);
      console.log(`   💸 Expense items: ${reportData.expenses?.length || 0}`);
      console.log(`   📊 Net Balance: ₹${reportData.summary?.net_balance?.toLocaleString('en-IN') || 0}`);
      
      if (reportData.income?.length > 0) {
        console.log('   Sample income:');
        reportData.income.slice(0, 2).forEach((item) => {
          console.log(`      - ${item.label}: ₹${item.amount.toLocaleString('en-IN')}`);
        });
      }
    } else {
      console.log('   ❌ Failed:', reportData.error);
    }

    // Test 4: Test Cashflow Card Component Data Structure
    console.log('\n4️⃣  Testing Cashflow Card Data Structure...');
    if (reportData.success && reportData.income && reportData.expenses) {
      const cardData = {
        month: reportData.month,
        income: reportData.income.map(item => ({
          label: item.label,
          amount: item.amount,
          description: item.description || undefined,
        })),
        expenses: reportData.expenses.map(item => ({
          label: item.label,
          amount: item.amount,
        })),
        netCashflow: reportData.summary?.net_balance || 0,
      };
      
      console.log('   ✅ Valid card data structure!');
      console.log(`   📅 Month: ${cardData.month}`);
      console.log(`   💰 Income categories: ${cardData.income.length}`);
      console.log(`   💸 Expense categories: ${cardData.expenses.length}`);
      console.log(`   📊 Net Cashflow: ₹${cardData.netCashflow.toLocaleString('en-IN')}`);
    } else {
      console.log('   ⚠️  No data available for card');
    }

    console.log('\n' + '='.repeat(70));
    console.log('✅ Dashboard API Tests Complete!\n');
    console.log('Next steps:');
    console.log('  1. Visit http://localhost:3001/test-cashflow-card to see the card');
    console.log('  2. Visit http://localhost:3001/dashboard to see integrated dashboard');
    console.log('  3. Test on mobile: Use Chrome DevTools device emulation\n');

  } catch (error) {
    console.error('\n❌ Test Error:', error.message);
    console.error('\nMake sure the server is running:');
    console.error('  npm run dev\n');
    process.exit(1);
  }
}

// Run tests
testDashboardAPIs();

