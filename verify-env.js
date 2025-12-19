// Verify .env.local file format
const fs = require('fs');
const path = require('path');

console.log('🔍 Checking .env.local file format...\n');

const envPath = path.join(__dirname, '.env.local');

if (!fs.existsSync(envPath)) {
  console.log('❌ .env.local file not found!');
  process.exit(1);
}

const content = fs.readFileSync(envPath, 'utf8');
const lines = content.split('\n').filter(line => line.trim() && !line.trim().startsWith('#'));

console.log('📄 File Contents:');
console.log('─'.repeat(60));
lines.forEach((line, idx) => {
  const [key, ...valueParts] = line.split('=');
  const value = valueParts.join('=');
  if (key && value) {
    // Mask sensitive values
    if (key.includes('SECRET') || key.includes('KEY') || key.includes('PASSWORD')) {
      console.log(`${idx + 1}. ${key}=${value.substring(0, 20)}...`);
    } else if (key === 'DATABASE_URL') {
      const masked = value.replace(/:[^:@]+@/, ':****@');
      console.log(`${idx + 1}. ${key}=${masked}`);
    } else {
      console.log(`${idx + 1}. ${key}=${value}`);
    }
  } else {
    console.log(`⚠️  Line ${idx + 1}: Invalid format - ${line}`);
  }
});
console.log('─'.repeat(60));

// Check for common issues
console.log('\n🔍 Format Checks:');
const issues = [];

if (content.includes(' = ')) {
  issues.push('❌ Found spaces around = (should be KEY=value, not KEY = value)');
}

if (content.includes('\r\n')) {
  issues.push('⚠️  Windows line endings detected (should be fine, but Unix \\n preferred)');
}

const requiredKeys = ['DATABASE_URL', 'JWT_SECRET', 'NEXTAUTH_SECRET', 'NEXTAUTH_URL'];
requiredKeys.forEach(key => {
  if (content.includes(`${key}=`)) {
    console.log(`   ✅ ${key}: Found`);
  } else {
    issues.push(`   ❌ ${key}: Missing`);
  }
});

if (issues.length === 0) {
  console.log('\n✅ All checks passed! File format looks correct.');
  console.log('\n💡 Note: Environment variables are loaded by Next.js automatically.');
  console.log('   Restart dev server if you just created/updated .env.local');
} else {
  console.log('\n⚠️  Issues found:');
  issues.forEach(issue => console.log(issue));
}

