-- Verify users table structure
-- Run this in Neon SQL Editor to check table structure

-- 1. Check table exists and show structure
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'users'
ORDER BY ordinal_position;

-- 2. Check current users count
SELECT COUNT(*) as total_users FROM users;

-- 3. View all users (without passwords)
SELECT 
    id,
    email,
    phone,
    created_at,
    updated_at
FROM users
ORDER BY created_at DESC;

-- 4. Check for required columns
SELECT 
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'email'
    ) THEN '✅ email column exists' ELSE '❌ email column missing' END as email_check,
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'password'
    ) THEN '✅ password column exists' ELSE '❌ password column missing' END as password_check,
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'phone'
    ) THEN '✅ phone column exists' ELSE '❌ phone column missing' END as phone_check;

