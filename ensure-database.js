// Ensure database tables exist
// Run: node ensure-database.js

const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function ensureDatabase() {
  try {
    console.log('🔍 Checking database connection...');
    
    // Test connection
    const test = await sql`SELECT NOW() as current_time, current_database() as database_name`;
    console.log('✅ Connected to:', test[0].database_name);
    console.log('   Current time:', test[0].current_time);

    console.log('\n🔍 Checking for users table...');
    
    // Check if users table exists
    const tableCheck = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'users'
    `;

    if (tableCheck.length > 0) {
      console.log('✅ Users table exists');
      
      // Check users count
      const count = await sql`SELECT COUNT(*) as count FROM users`;
      console.log(`   Users in database: ${count[0].count}`);
    } else {
      console.log('⚠️  Users table does NOT exist. Creating...');
      
      // Create users table
      await sql`
        CREATE TABLE users (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          email VARCHAR(255) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          phone VARCHAR(20),
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        )
      `;
      
      await sql`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`;
      
      console.log('✅ Users table created successfully!');
    }

    console.log('\n🔍 Checking for transactions table...');
    
    const transactionsCheck = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'transactions'
    `;

    if (transactionsCheck.length > 0) {
      console.log('✅ Transactions table exists');
    } else {
      console.log('⚠️  Transactions table does NOT exist (optional for now)');
    }

    console.log('\n✅ Database setup complete!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  }
}

ensureDatabase();

