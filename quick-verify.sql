-- ============================================
-- QUICK VERIFICATION - Run this first
-- ============================================

-- 1. Check all tables exist
SELECT 'Tables Check' as check_type, COUNT(*) as count 
FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name IN ('users', 'loan_emis', 'transactions');

-- 2. Check transactions table structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'transactions' 
ORDER BY ordinal_position;

-- 3. Count records
SELECT 'users' as table_name, COUNT(*) as count FROM users
UNION ALL SELECT 'loan_emis', COUNT(*) FROM loan_emis
UNION ALL SELECT 'transactions', COUNT(*) FROM transactions;

-- 4. Sample transactions (last 5)
SELECT id, txn_date, amount, flow_type, category, account_type, description
FROM transactions 
ORDER BY created_at DESC 
LIMIT 5;

-- 5. Test INSERT
INSERT INTO transactions (txn_date, amount, flow_type, category, description, account_type, financial_year)
VALUES ('2025-12-19', 50000.00, 'inflow', 'clinic_revenue', 'VERIFY TEST', 'savings', '2024-25')
ON CONFLICT (txn_date, amount, description) DO NOTHING
RETURNING id, txn_date, amount, category;

-- 6. Test FETCH (after insert)
SELECT * FROM transactions WHERE description = 'VERIFY TEST';

-- 7. Delete test record
DELETE FROM transactions WHERE description = 'VERIFY TEST';

-- 8. Verify categories
SELECT DISTINCT category, flow_type FROM transactions ORDER BY flow_type, category;

-- 9. Verify account types
SELECT DISTINCT account_type FROM transactions;

-- 10. Check constraints
SELECT constraint_name, constraint_type 
FROM information_schema.table_constraints 
WHERE table_name = 'transactions' AND constraint_type IN ('PRIMARY KEY', 'UNIQUE', 'CHECK');

