// Check what database the connection string points to
const fs = require('fs');
const path = require('path');
const { neon } = require('@neondatabase/serverless');

const envPath = path.join(__dirname, '.env.local');
let envContent = fs.readFileSync(envPath, 'utf8');

// Remove BOM if present
if (envContent.charCodeAt(0) === 0xFEFF) {
  envContent = envContent.slice(1);
}

console.log('📄 Raw .env.local content:');
console.log(envContent);
console.log('\n---\n');

// Parse connection string - use regex to extract quoted value
let databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  const match = envContent.match(/DATABASE_URL\s*=\s*"([^"]+)"/);
  if (match) {
    databaseUrl = match[1].trim();
  } else {
    // Fallback to line-by-line parsing
    const lines = envContent.split('\n');
    for (const line of lines) {
      if (line.trim().startsWith('DATABASE_URL=')) {
        const lineMatch = line.match(/DATABASE_URL\s*=\s*"([^"]+)"/);
        if (lineMatch) {
          databaseUrl = lineMatch[1].trim();
          break;
        }
      }
    }
  }
}

console.log('🔗 Parsed connection URL:');
console.log(databaseUrl);
console.log('');

// Extract database name from URL
const dbMatch = databaseUrl.match(/\/\/([^@]+)@[^\/]+\/([^?&]+)/);
if (dbMatch) {
  const dbName = decodeURIComponent(dbMatch[2]);
  console.log('📌 Database name in connection string:', dbName);
  console.log('');
}

// Test actual connection
console.log('🔍 Testing actual connection...');
const sql = neon(databaseUrl);

sql`SELECT current_database() as db_name`
  .then(result => {
    console.log('✅ Actually connected to:', result[0].db_name);
    console.log('');
    
    if (dbMatch && decodeURIComponent(dbMatch[2]) !== result[0].db_name) {
      console.log('⚠️  WARNING: Connection string says "' + decodeURIComponent(dbMatch[2]) + '"');
      console.log('   but actually connected to "' + result[0].db_name + '"');
      console.log('');
      console.log('This is likely a Neon pooler routing issue.');
      console.log('The pooler might be routing to the default database in the project.');
    }
    
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Connection error:', error.message);
    process.exit(1);
  });

