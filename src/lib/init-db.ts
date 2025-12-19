import { sql } from './db';

// Initialize database tables
export async function initializeDatabase() {
  try {
    // Create users table
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        phone VARCHAR(20),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;
    console.log('✅ Users table created/verified');

    // Create loan_emis table (EMI payment tracking)
    await sql`
      CREATE TABLE IF NOT EXISTS loan_emis (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        emi_date DATE NOT NULL,
        amount DECIMAL(15, 2) NOT NULL,
        loan_ref_id VARCHAR(100) NOT NULL,
        loan_type VARCHAR(100) NOT NULL,
        source_description TEXT,
        source_sheet_name VARCHAR(255),
        source_row_number INTEGER,
        financial_year VARCHAR(10) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(emi_date, amount, loan_ref_id)
      )
    `;
    console.log('✅ Loan EMIs table created/verified');

    // Create indexes
    await sql`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_loan_emis_user_id ON loan_emis(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_loan_emis_loan_ref_id ON loan_emis(loan_ref_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_loan_emis_financial_year ON loan_emis(financial_year)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_loan_emis_emi_date ON loan_emis(emi_date)`;
    console.log('✅ Indexes created/verified');

    return { success: true, message: 'Database initialized successfully' };
  } catch (error) {
    console.error('❌ Database initialization error:', error);
    throw error;
  }
}

// Test database connection
export async function testConnection() {
  try {
    const result = await sql`SELECT NOW() as current_time, current_database() as database_name`;
    console.log('✅ Database connected:', result[0]);
    return { success: true, data: result[0] };
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return { success: false, error };
  }
}

