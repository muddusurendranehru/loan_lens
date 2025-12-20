// Simple signup test - tries both ports
const fetch = require('node-fetch');

const PORTS = [3000, 3001];
const testEmail = `test_${Date.now()}@loanlens.com`;
const testPassword = 'password123';

async function testSignup(port) {
  const url = `http://localhost:${port}/api/auth/signup`;
  
  try {
    console.log(`\n🔍 Testing: ${url}`);
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword
      }),
      timeout: 10000
    });

    const data = await res.json();
    
    console.log(`   Status: ${res.status}`);
    console.log(`   Response:`, JSON.stringify(data, null, 2));

    if (res.ok && data.success) {
      console.log(`\n✅ SUCCESS! Signup worked on port ${port}!`);
      console.log(`   Created user: ${testEmail}\n`);
      return true;
    } else {
      console.log(`\n❌ Failed on port ${port}`);
      console.log(`   Error: ${data.error || 'Unknown error'}\n`);
      return false;
    }
  } catch (error) {
    console.log(`   ❌ Connection failed: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log('🧪 Testing Signup Locally');
  console.log('='.repeat(60));
  console.log(`Test Email: ${testEmail}`);
  console.log(`Test Password: ${testPassword}`);

  for (const port of PORTS) {
    const success = await testSignup(port);
    if (success) {
      process.exit(0);
    }
  }

  console.log('\n❌ Signup test failed on all ports!');
  console.log('\n⚠️  Make sure server is running:');
  console.log('   npm run dev\n');
  process.exit(1);
}

main();

