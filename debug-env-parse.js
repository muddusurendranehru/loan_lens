// Debug environment variable parsing
const fs = require('fs');
const path = require('path');

console.log('🔍 Debugging .env.local parsing...\n');

const filePath = path.join(__dirname, '.env.local');
console.log('File path:', filePath);
console.log('File exists:', fs.existsSync(filePath));
console.log('');

// Read as buffer first
const buffer = fs.readFileSync(filePath);
console.log('File size (bytes):', buffer.length);
console.log('First 10 bytes (hex):', Array.from(buffer.slice(0, 10)).map(b => b.toString(16).padStart(2, '0')).join(' '));
console.log('');

// Check for BOM
if (buffer[0] === 0xEF && buffer[1] === 0xBB && buffer[2] === 0xBF) {
  console.log('⚠️  Found UTF-8 BOM (EF BB BF)');
}

// Read as string
const content = fs.readFileSync(filePath, 'utf8');
console.log('Content length (chars):', content.length);
console.log('First char code:', content.charCodeAt(0));
console.log('');

// Find DATABASE_URL line
const lines = content.split('\n');
let dbUrlLine = null;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('DATABASE_URL')) {
    dbUrlLine = lines[i];
    console.log(`Found DATABASE_URL on line ${i + 1}:`);
    console.log(dbUrlLine);
    console.log('');
    
    // Try different parsing methods
    console.log('🔍 Trying regex match:');
    const match1 = dbUrlLine.match(/DATABASE_URL\s*=\s*"([^"]+)"/);
    if (match1) {
      console.log('   Match found:', match1[1]);
      console.log('   Database in URL:', match1[1].match(/\/\/([^@]+)@[^\/]+\/([^?&]+)/)?.[2]);
    } else {
      console.log('   No match');
    }
    break;
  }
}

// Also check process.env
console.log('\n🔍 Checking process.env.DATABASE_URL:');
if (process.env.DATABASE_URL) {
  console.log('   Set to:', process.env.DATABASE_URL);
} else {
  console.log('   Not set');
}

