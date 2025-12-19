-- ============================================
-- HOMA CLINIC EBITDA TRACKER - DATABASE VERIFICATION
-- Run these queries in Neon SQL Editor to verify everything
-- ============================================

-- ============================================
-- 1. CHECK ALL TABLES EXIST
-- ============================================
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- Expected: users, loan_emis, transactions

-- ============================================
-- 2. VERIFY USERS TABLE SCHEMA
-- ============================================
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;

-- Expected columns:
-- id (uuid), email (varchar), password (varchar), phone (varchar), created_at (timestamp), updated_at (timestamp)

-- ============================================
-- 3. VERIFY LOAN_EMIS TABLE SCHEMA
-- ============================================
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'loan_emis' 
ORDER BY ordinal_position;

-- Expected columns:
-- id (uuid), user_id (uuid), emi_date (date), amount (numeric), loan_ref_id (varchar), 
-- loan_type (varchar), source_description (text), source_sheet_name (varchar), 
-- source_row_number (integer), financial_year (varchar), towards (varchar), 
-- transaction_id (varchar), created_at (timestamp), updated_at (timestamp)

-- ============================================
-- 4. VERIFY TRANSACTIONS TABLE SCHEMA
-- ============================================
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'transactions' 
ORDER BY ordinal_position;

-- Expected columns:
-- id (serial), txn_date (date), amount (numeric 12,2), flow_type (text), 
-- category (text), description (text), account_type (text), source_sheet (text), 
-- financial_year (text), created_at (timestamp)

-- ============================================
-- 5. CHECK CONSTRAINTS
-- ============================================
SELECT 
    tc.table_name,
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_schema = 'public'
    AND tc.table_name IN ('users', 'loan_emis', 'transactions')
ORDER BY tc.table_name, tc.constraint_type;

-- Expected:
-- users: PRIMARY KEY (id), UNIQUE (email)
-- loan_emis: PRIMARY KEY (id), UNIQUE (emi_date, amount, loan_ref_id), FOREIGN KEY (user_id)
-- transactions: PRIMARY KEY (id), UNIQUE (txn_date, amount, description), CHECK (flow_type), CHECK (category), CHECK (account_type)

-- ============================================
-- 6. CHECK INDEXES
-- ============================================
SELECT 
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
    AND tablename IN ('users', 'loan_emis', 'transactions')
ORDER BY tablename, indexname;

-- Expected indexes:
-- users: idx_users_email
-- loan_emis: idx_loan_emis_user_id, idx_loan_emis_financial_year, etc.
-- transactions: idx_txn_date, idx_txn_fy, idx_txn_category, idx_txn_account

-- ============================================
-- 7. COUNT RECORDS IN EACH TABLE
-- ============================================
SELECT 'users' as table_name, COUNT(*) as record_count FROM users
UNION ALL
SELECT 'loan_emis', COUNT(*) FROM loan_emis
UNION ALL
SELECT 'transactions', COUNT(*) FROM transactions;

-- ============================================
-- 8. SAMPLE DATA - USERS TABLE
-- ============================================
SELECT 
    id,
    email,
    phone,
    created_at
FROM users
ORDER BY created_at DESC
LIMIT 5;

-- ============================================
-- 9. SAMPLE DATA - LOAN_EMIS TABLE
-- ============================================
SELECT 
    id,
    emi_date,
    amount,
    loan_ref_id,
    loan_type,
    financial_year,
    created_at
FROM loan_emis
ORDER BY emi_date DESC
LIMIT 10;

-- ============================================
-- 10. SAMPLE DATA - TRANSACTIONS TABLE
-- ============================================
SELECT 
    id,
    txn_date,
    amount,
    flow_type,
    category,
    account_type,
    description,
    financial_year,
    created_at
FROM transactions
ORDER BY txn_date DESC
LIMIT 10;

-- ============================================
-- 11. VERIFY TRANSACTIONS CATEGORIES
-- ============================================
SELECT 
    category,
    flow_type,
    COUNT(*) as count,
    SUM(amount) as total_amount
FROM transactions
GROUP BY category, flow_type
ORDER BY flow_type DESC, total_amount DESC;

-- Expected categories:
-- Inflow: clinic_revenue, other_income, business_loan
-- Outflow: salaries, rent, vendor_payment, emi_interest, emi_principal, bank_interest, personal

-- ============================================
-- 12. VERIFY ACCOUNT TYPES
-- ============================================
SELECT 
    account_type,
    COUNT(*) as count,
    SUM(CASE WHEN flow_type = 'inflow' THEN amount ELSE 0 END) as total_inflow,
    SUM(CASE WHEN flow_type = 'outflow' THEN amount ELSE 0 END) as total_outflow
FROM transactions
GROUP BY account_type;

-- Expected: savings, current

-- ============================================
-- 13. VERIFY FINANCIAL YEARS
-- ============================================
SELECT 
    financial_year,
    COUNT(*) as transaction_count,
    SUM(CASE WHEN flow_type = 'inflow' THEN amount ELSE 0 END) as total_inflow,
    SUM(CASE WHEN flow_type = 'outflow' THEN amount ELSE 0 END) as total_outflow
FROM transactions
GROUP BY financial_year
ORDER BY financial_year DESC;

-- Expected format: '2024-25', '2025-26', etc.

-- ============================================
-- 14. TEST INSERT (Dry Run - Will Rollback)
-- ============================================
BEGIN;

INSERT INTO transactions (
    txn_date, amount, flow_type, category, description, account_type, financial_year
) VALUES (
    '2025-12-19',
    100000.00,
    'inflow',
    'clinic_revenue',
    'TEST INSERT - HOMA Clinic Revenue',
    'savings',
    '2024-25'
)
ON CONFLICT (txn_date, amount, description) DO NOTHING
RETURNING *;

-- Check if inserted
SELECT * FROM transactions WHERE description = 'TEST INSERT - HOMA Clinic Revenue';

-- Rollback (don't save test data)
ROLLBACK;

-- ============================================
-- 15. TEST FETCH - Monthly Summary
-- ============================================
SELECT 
    TO_CHAR(txn_date, 'Month YYYY') as month_year,
    SUM(CASE WHEN flow_type = 'inflow' THEN amount ELSE 0 END) as total_inflow,
    SUM(CASE WHEN flow_type = 'outflow' THEN amount ELSE 0 END) as total_outflow,
    SUM(CASE WHEN flow_type = 'inflow' THEN amount ELSE -amount END) as net_balance,
    COUNT(*) as transaction_count
FROM transactions
WHERE EXTRACT(MONTH FROM txn_date) = EXTRACT(MONTH FROM CURRENT_DATE)
    AND EXTRACT(YEAR FROM txn_date) = EXTRACT(YEAR FROM CURRENT_DATE)
GROUP BY TO_CHAR(txn_date, 'Month YYYY');

-- ============================================
-- 16. TEST FETCH - EBITDA Calculation
-- ============================================
SELECT 
    -- Revenue
    SUM(CASE WHEN category = 'clinic_revenue' THEN amount ELSE 0 END) as clinic_revenue,
    SUM(CASE WHEN category = 'other_income' THEN amount ELSE 0 END) as other_income,
    
    -- Expenses
    SUM(CASE WHEN category = 'salaries' THEN amount ELSE 0 END) as salaries,
    SUM(CASE WHEN category = 'rent' THEN amount ELSE 0 END) as rent,
    SUM(CASE WHEN category = 'vendor_payment' THEN amount ELSE 0 END) as vendor_payment,
    
    -- Interest
    SUM(CASE WHEN category = 'emi_interest' THEN amount ELSE 0 END) as emi_interest,
    SUM(CASE WHEN category = 'bank_interest' THEN amount ELSE 0 END) as bank_interest,
    
    -- Principal
    SUM(CASE WHEN category = 'emi_principal' THEN amount ELSE 0 END) as emi_principal,
    
    -- Loans
    SUM(CASE WHEN category = 'business_loan' AND flow_type = 'inflow' THEN amount ELSE 0 END) as new_loans,
    
    -- Calculated
    SUM(CASE WHEN category IN ('clinic_revenue', 'other_income') THEN amount ELSE 0 END) as total_revenue,
    SUM(CASE WHEN category IN ('salaries', 'rent', 'vendor_payment') THEN amount ELSE 0 END) as operating_expenses,
    SUM(CASE WHEN category IN ('clinic_revenue', 'other_income') THEN amount ELSE 0 END) - 
    SUM(CASE WHEN category IN ('salaries', 'rent', 'vendor_payment') THEN amount ELSE 0 END) as ebitda
FROM transactions
WHERE financial_year = '2024-25';

-- ============================================
-- 17. CHECK FOR DATA TYPE ISSUES
-- ============================================
-- Verify amounts are numeric
SELECT 
    'transactions' as table_name,
    COUNT(*) as total_rows,
    COUNT(CASE WHEN amount IS NULL THEN 1 END) as null_amounts,
    MIN(amount) as min_amount,
    MAX(amount) as max_amount,
    AVG(amount) as avg_amount
FROM transactions;

-- ============================================
-- 18. CHECK FOR DUPLICATES (Should be prevented by UNIQUE constraint)
-- ============================================
SELECT 
    txn_date,
    amount,
    description,
    COUNT(*) as duplicate_count
FROM transactions
GROUP BY txn_date, amount, description
HAVING COUNT(*) > 1;

-- Should return 0 rows (duplicates prevented by UNIQUE constraint)

-- ============================================
-- 19. VERIFY FOREIGN KEY RELATIONSHIPS
-- ============================================
-- Check if loan_emis references valid users
SELECT 
    le.id,
    le.user_id,
    u.email
FROM loan_emis le
LEFT JOIN users u ON le.user_id = u.id
WHERE le.user_id IS NOT NULL AND u.id IS NULL;

-- Should return 0 rows (all user_ids should reference valid users)

-- ============================================
-- 20. FINAL SUMMARY
-- ============================================
SELECT 
    'Database Verification Complete' as status,
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public') as total_tables,
    (SELECT COUNT(*) FROM users) as users_count,
    (SELECT COUNT(*) FROM loan_emis) as loan_emis_count,
    (SELECT COUNT(*) FROM transactions) as transactions_count,
    (SELECT COUNT(DISTINCT financial_year) FROM transactions) as financial_years,
    (SELECT COUNT(DISTINCT account_type) FROM transactions) as account_types;

