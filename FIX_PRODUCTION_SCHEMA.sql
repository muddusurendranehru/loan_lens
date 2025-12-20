-- ============================================
-- FIX PRODUCTION DATABASE SCHEMA
-- ============================================
-- Run this in Neon Console SQL Editor
-- This will make phone column optional (nullable)
-- ============================================

-- Step 1: Check current schema
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'users'
ORDER BY ordinal_position;

-- Step 2: Make phone column nullable (if it's NOT NULL)
ALTER TABLE users 
ALTER COLUMN phone DROP NOT NULL;

-- Step 3: Verify the change
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'users'
ORDER BY ordinal_position;

-- ============================================
-- ALTERNATIVE: If you want to remove phone entirely
-- ============================================
-- WARNING: This will delete the phone column and all its data
-- ALTER TABLE users DROP COLUMN IF EXISTS phone;

-- ============================================
-- RECOMMENDED: Keep phone as optional (nullable)
-- This matches your schema.sql definition
-- ============================================

