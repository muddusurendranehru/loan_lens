// Test direct connection (non-pooler) to loan_lens database
const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

// Read .env.local
const envPath = path.join(__dirname, '.env.local');
let databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl && fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const match = envContent.match(/DATABASE_URL=["']?([^"'\s]+)["']?/);
  if (match) {
    databaseUrl = match[1].trim();
  }
}

console.log('🔍 Testing database connection...\n');

// Try direct endpoint (replace -pooler with direct endpoint)
// Direct endpoint format: ep-icy-dream-ah5xlk96.us-east-1.aws.neon.tech
const directUrl = databaseUrl.replace('-pooler.c-3', '').replace('pooler.', '');

console.log('Original URL (pooler):', databaseUrl);
console.log('Direct URL:', directUrl);
console.log('');

const sql = neon(directUrl);

async function testConnection() {
  try {
    const dbName = await sql`SELECT current_database() as db_name`;
    console.log(`✅ Connected to database: ${dbName[0].db_name}\n`);
    
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `;
    
    console.log(`Tables in database:`);
    tables.forEach(table => {
      console.log(`  - ${table.table_name}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

testConnection();

