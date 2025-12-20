// Test signup API to verify password is being saved
const fetch = require('node-fetch');

async function testSignup() {
  try {
    console.log('🧪 Testing signup API...\n');
    
    const testEmail = `test${Date.now()}@test.com`;
    const testPassword = 'testpassword123';
    
    console.log(`Email: ${testEmail}`);
    console.log(`Password: ${testPassword.substring(0, 3)}...\n`);
    
    const response = await fetch('http://localhost:3001/api/auth/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword,
      }),
    });
    
    const data = await response.json();
    
    console.log(`Status: ${response.status}`);
    console.log(`Response:`, JSON.stringify(data, null, 2));
    
    if (response.ok) {
      console.log('\n✅ Signup successful!');
      console.log('   Now run: node verify-users.js');
      console.log(`   Look for user with email: ${testEmail}`);
    } else {
      console.log('\n❌ Signup failed');
      console.log(`   Error: ${data.error}`);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('   Make sure the server is running on http://localhost:3001');
    process.exit(1);
  }
}

testSignup();

