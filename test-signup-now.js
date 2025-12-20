// Quick test script to try signup
const BASE_URL = process.env.BASE_URL || 'http://localhost:3001';

async function testSignup() {
  console.log('🧪 Testing Signup API\n');
  console.log('='.repeat(70));

  const testEmail = `test_${Date.now()}@loanlens.com`;
  const testPassword = 'password123';

  console.log(`Test Email: ${testEmail}`);
  console.log(`Test Password: ${testPassword}`);
  console.log('');

  try {
    console.log('1️⃣  Sending signup request...');
    const res = await fetch(`${BASE_URL}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword
      }),
    });

    console.log(`   Status: ${res.status} ${res.statusText}`);

    const data = await res.json();
    console.log('   Response:', JSON.stringify(data, null, 2));

    if (res.ok && data.success) {
      console.log('\n✅ SUCCESS! Signup worked!');
      console.log(`   User created: ${testEmail}`);
    } else {
      console.log('\n❌ FAILED!');
      console.log(`   Error: ${data.error || 'Unknown error'}`);
    }

    console.log('\n' + '='.repeat(70));
    console.log('✅ Test complete!\n');

  } catch (error) {
    console.error('\n❌ Test Error:', error.message);
    console.error('\nMake sure server is running:');
    console.error('  npm run dev\n');
    process.exit(1);
  }
}

testSignup();

