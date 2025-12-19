const { neon } = require('@neondatabase/serverless');

const sql = neon('postgresql://neondb_owner:npg_zUbO5HZ9kDur@ep-icy-dream-ah5xlk96-pooler.us-east-1.aws.neon.tech/loan_lens?sslmode=require');

async function checkDB() {
  try {
    console.log('Connecting to Neon...');
    
    // Get all tables
    const tables = await sql`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`;
    console.log('\n=== TABLES ===');
    console.log(tables);
    
    // Get loan_emis schema
    const loanEmisSchema = await sql`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'loan_emis' 
      ORDER BY ordinal_position
    `;
    console.log('\n=== loan_emis SCHEMA ===');
    console.log(loanEmisSchema);
    
    // Get loan_emis data
    const loanEmisData = await sql`SELECT * FROM loan_emis LIMIT 10`;
    console.log('\n=== loan_emis DATA ===');
    console.log(loanEmisData);
    
    // Get users schema
    const usersSchema = await sql`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      ORDER BY ordinal_position
    `;
    console.log('\n=== users SCHEMA ===');
    console.log(usersSchema);
    
    // Get users data
    const usersData = await sql`SELECT id, email, phone, created_at FROM users LIMIT 10`;
    console.log('\n=== users DATA ===');
    console.log(usersData);
    
  } catch (e) {
    console.error('Error:', e.message);
  }
}

checkDB();

