// Create admin user in database
// Run: node create-admin-user.js

const { neon } = require('@neondatabase/serverless');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function createAdminUser() {
  try {
    const email = 'admin@loanlens.com';
    const password = 'securepassword123';
    const hashedPassword = bcrypt.hashSync(password, 10);

    console.log('🔐 Creating admin user...');
    console.log(`Email: ${email}`);

    // Check if user exists
    const existing = await sql`
      SELECT id FROM users WHERE email = ${email}
    `;

    if (existing.length > 0) {
      console.log('✅ Admin user already exists!');
      console.log(`User ID: ${existing[0].id}`);
      return;
    }

    // Create admin user
    const result = await sql`
      INSERT INTO users (email, password)
      VALUES (${email}, ${hashedPassword})
      RETURNING id, email, created_at
    `;

    if (result.length > 0) {
      console.log('✅ Admin user created successfully!');
      console.log(`User ID: ${result[0].id}`);
      console.log(`Email: ${result[0].email}`);
      console.log(`Created: ${result[0].created_at}`);
    }
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    process.exit(1);
  }
}

createAdminUser();

