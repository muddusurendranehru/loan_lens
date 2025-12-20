// Test the exact connection string
const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

// Read .env.local file
const envPath = path.join(__dirname, '.env.local');
console.log('Reading from:', envPath);
console.log('File exists:', fs.existsSync(envPath));

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  console.log('\n📄 .env.local content:');
  console.log(envContent);
  console.log('\n---\n');
  
  // Try different parsing methods
  const lines = envContent.split('\n');
  for (const line of lines) {
    if (line.trim().startsWith('DATABASE_URL=')) {
      console.log('Found DATABASE_URL line:', line);
      
      // Remove DATABASE_URL= prefix (handle BOM and whitespace)
      let url = line.replace(/^[^\w]*DATABASE_URL\s*=\s*/, '').trim();
      
      // Remove quotes if present
      if ((url.startsWith('"') && url.endsWith('"')) || 
          (url.startsWith("'") && url.endsWith("'"))) {
        url = url.slice(1, -1);
      }
      
      // Clean any remaining whitespace
      url = url.trim();
      
      console.log('Extracted URL:', url);
      console.log('');
      
      // Extract database name
      const dbMatch = url.match(/\/\/([^@]+)@[^\/]+\/([^?]+)/);
      if (dbMatch) {
        console.log('Database name in URL:', decodeURIComponent(dbMatch[2]));
      }
      
      // Test connection
      console.log('🔍 Testing connection...\n');
      const sql = neon(url);
      
      sql`SELECT current_database() as db_name`
        .then(result => {
          console.log(`✅ Connected to database: ${result[0].db_name}`);
          process.exit(0);
        })
        .catch(error => {
          console.error('❌ Connection error:', error.message);
          process.exit(1);
        });
      
      break;
    }
  }
} else {
  console.error('❌ .env.local file not found!');
  process.exit(1);
}

