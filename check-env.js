// Check environment variables
console.log('🔍 Environment Variables Check\n');

const required = [
  'DATABASE_URL',
  'JWT_SECRET',
  'NEXTAUTH_SECRET',
  'NEXTAUTH_URL'
];

const optional = [
  'GOOGLE_SERVICE_ACCOUNT_EMAIL',
  'GOOGLE_PRIVATE_KEY'
];

console.log('✅ REQUIRED VARIABLES:');
required.forEach(key => {
  const value = process.env[key];
  if (value) {
    // Mask sensitive values
    if (key.includes('SECRET') || key.includes('KEY')) {
      console.log(`   ${key}: ${value.substring(0, 20)}... (set)`);
    } else if (key === 'DATABASE_URL') {
      const masked = value.replace(/:[^:@]+@/, ':****@');
      console.log(`   ${key}: ${masked}`);
    } else {
      console.log(`   ${key}: ${value}`);
    }
  } else {
    console.log(`   ❌ ${key}: NOT SET`);
  }
});

console.log('\n⚠️  OPTIONAL VARIABLES:');
optional.forEach(key => {
  const value = process.env[key];
  if (value) {
    console.log(`   ${key}: Set`);
  } else {
    console.log(`   ${key}: Not set (optional - for private Google Sheets)`);
  }
});

console.log('\n📊 Summary:');
const missing = required.filter(key => !process.env[key]);
if (missing.length === 0) {
  console.log('   ✅ All required variables are set!');
} else {
  console.log(`   ❌ Missing: ${missing.join(', ')}`);
}

