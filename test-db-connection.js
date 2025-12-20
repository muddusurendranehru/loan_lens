// Test database connection
// Note: Next.js loads .env.local automatically, but for standalone script
// we'll check if DATABASE_URL is available via environment

async function testConnection() {
  try {
    console.log('🔍 Testing Database Connection...\n');
    
    // Check DATABASE_URL
    if (!process.env.DATABASE_URL) {
      console.log('❌ DATABASE_URL not found in .env.local');
      return;
    }
    console.log('✅ DATABASE_URL found');
    
    // Test Neon connection
    const { neon } = require('@neondatabase/serverless');
    const sql = neon(process.env.DATABASE_URL);
    
    // Test query
    const result = await sql`SELECT NOW() as current_time, current_database() as db_name`;
    console.log('✅ Database connection successful!');
    console.log(`   Database: ${result[0].db_name}`);
    console.log(`   Time: ${result[0].current_time}`);
    
    // Check if cashflow_entries table exists
    try {
      const tableCheck = await sql`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_name = 'cashflow_entries'
        ) as exists;
      `;
      
      if (tableCheck[0].exists) {
        console.log('✅ cashflow_entries table exists');
        
        // Count rows
        const count = await sql`SELECT COUNT(*) as count FROM cashflow_entries`;
        console.log(`   Total entries: ${count[0].count}`);
      } else {
        console.log('⚠️  cashflow_entries table does NOT exist');
        console.log('   Run schema.sql to create the table');
      }
    } catch (err) {
      console.log('⚠️  Could not check table (might not exist yet)');
    }
    
    console.log('\n✅ All checks passed!\n');
    
  } catch (error) {
    console.error('❌ Database connection failed:');
    console.error(error.message);
    process.exit(1);
  }
}

testConnection();

