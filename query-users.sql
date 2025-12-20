-- =====================================================
-- QUERY USERS TABLE - Based on Actual Structure
-- =====================================================

-- Current Table Structure:
-- 1. id: uuid (NOT NULL, default: gen_random_uuid())
-- 2. email: character varying (NOT NULL)
-- 3. password: character varying (NOT NULL)
-- 4. phone: character varying (nullable)
-- 5. created_at: timestamp without time zone (nullable, default: now())
-- 6. updated_at: timestamp without time zone (nullable, default: now())

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- 1. View all users (safe - no passwords shown)
SELECT 
    id,
    email,
    phone,
    created_at,
    updated_at
FROM users
ORDER BY created_at DESC;

-- 2. Count total users
SELECT COUNT(*) as total_users FROM users;

-- 3. Check if specific email exists
SELECT 
    id,
    email,
    phone,
    created_at
FROM users
WHERE email = 'dr.nehru@homaclinic.com';

-- 4. Search users by phone number
SELECT 
    id,
    email,
    phone,
    created_at
FROM users
WHERE phone = '9963721999';

-- 5. View users created in last 7 days
SELECT 
    id,
    email,
    phone,
    created_at
FROM users
WHERE created_at >= NOW() - INTERVAL '7 days'
ORDER BY created_at DESC;

-- =====================================================
-- USEFUL QUERIES FOR SIGNUP/LOGIN TESTING
-- =====================================================

-- 6. Verify user exists for login (email only - password check done in code)
SELECT 
    id,
    email,
    password,
    phone
FROM users
WHERE email = 'test@loanlens.com';

-- 7. List all user emails (for testing)
SELECT email FROM users ORDER BY email;

-- 8. Check for duplicate emails (should return 0 rows if UNIQUE constraint works)
SELECT email, COUNT(*) as count
FROM users
GROUP BY email
HAVING COUNT(*) > 1;

-- =====================================================
-- MAINTENANCE QUERIES (Use with caution!)
-- =====================================================

-- 9. Update user phone number
-- UPDATE users 
-- SET phone = '+919963721999', updated_at = NOW()
-- WHERE email = 'dr.nehru@homaclinic.com';

-- 10. Delete specific user by email
-- DELETE FROM users WHERE email = 'test@loanlens.com';

-- 11. Delete all users (DANGER - clears all user data!)
-- DELETE FROM users;

-- =====================================================
-- TEST DATA QUERIES
-- =====================================================

-- 12. Verify table constraints
SELECT 
    constraint_name,
    constraint_type
FROM information_schema.table_constraints
WHERE table_schema = 'public' 
  AND table_name = 'users';

-- 13. Check indexes
SELECT 
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public' 
  AND tablename = 'users';

