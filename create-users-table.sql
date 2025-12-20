-- Create users table for LoanLens Pro
-- Run this SQL in your Neon Console SQL Editor

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Example insert (password is hashed with bcrypt):
-- INSERT INTO users (email, password, phone)
-- VALUES ('user@example.com', '$2a$10$hashedpasswordhere', '9963721999');

