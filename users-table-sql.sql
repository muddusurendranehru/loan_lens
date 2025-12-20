-- =====================================================
-- USERS TABLE SQL COMMANDS
-- Run these in Neon Console SQL Editor
-- =====================================================

-- 1. CREATE USERS TABLE (if it doesn't exist)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. CREATE INDEX on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- 3. VERIFY TABLE STRUCTURE
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'users'
ORDER BY ordinal_position;

-- 4. CHECK CURRENT USERS COUNT
SELECT COUNT(*) as total_users FROM users;

-- 5. VIEW ALL USERS (without passwords)
SELECT 
    id,
    email,
    phone,
    created_at,
    updated_at
FROM users
ORDER BY created_at DESC
LIMIT 10;

-- 6. CHECK IF SPECIFIC USER EXISTS
-- Replace 'user@example.com' with actual email
SELECT 
    id,
    email,
    phone,
    created_at
FROM users
WHERE email = 'user@example.com';

-- 7. DELETE ALL USERS (USE WITH CAUTION!)
-- DELETE FROM users;

-- 8. DELETE SPECIFIC USER BY EMAIL
-- DELETE FROM users WHERE email = 'user@example.com';

-- 9. UPDATE USER PHONE
-- UPDATE users SET phone = '+919999999999' WHERE email = 'user@example.com';

-- 10. CHECK TABLE CONSTRAINTS
SELECT 
    constraint_name,
    constraint_type
FROM information_schema.table_constraints
WHERE table_schema = 'public' 
  AND table_name = 'users';

