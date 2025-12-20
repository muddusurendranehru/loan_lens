-- ========================================
-- LOAN LENS PRO - COMPLETE DATABASE SCHEMA
-- ========================================
-- Database: loan_lens (Neon PostgreSQL)
-- Run this in Neon Console SQL Editor
-- ========================================

-- ========================================
-- TABLE 1: users (Authentication)
-- ========================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- ========================================
-- TABLE 2: cashflow_entries (Cashflow Analyzer)
-- ========================================
CREATE TABLE IF NOT EXISTS cashflow_entries (
  id SERIAL PRIMARY KEY,
  txn_date DATE NOT NULL,
  amount NUMERIC(12, 2) NOT NULL,          -- Always in ₹
  flow_type TEXT NOT NULL CHECK (flow_type IN ('inflow', 'outflow')),
  category TEXT NOT NULL CHECK (
    category IN (
      'business_loan',         -- New business loan received (inflow)
      'clinic_income',         -- Clinic income from salary/cbm (inflow)
      'income',                -- Other income/deposits (inflow)
      'emi',                   -- EMI payments (outflow)
      'rent',                  -- Rent payments (outflow)
      'tax',                   -- Tax payments (outflow)
      'vendor_payment',        -- Vendor/supplier payments (outflow)
      'transfer'               -- Large transfers (outflow)
    )
  ),
  description TEXT,                        -- Raw bank narration
  source_sheet TEXT,
  financial_year TEXT NOT NULL,            -- '2024-25'
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(txn_date, amount, description)    -- Prevent duplicate transactions
);

-- Indexes for cashflow_entries
CREATE INDEX IF NOT EXISTS idx_cf_date ON cashflow_entries(txn_date);
CREATE INDEX IF NOT EXISTS idx_cf_fy ON cashflow_entries(financial_year);
CREATE INDEX IF NOT EXISTS idx_cf_category ON cashflow_entries(category);
CREATE INDEX IF NOT EXISTS idx_cf_flow_type ON cashflow_entries(flow_type);

-- ========================================
-- TABLE 3: loan_emis (EMI Tracking - Optional)
-- ========================================
CREATE TABLE IF NOT EXISTS loan_emis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  emi_date DATE NOT NULL,
  amount NUMERIC(12, 2) NOT NULL,
  loan_ref_id VARCHAR(100) NOT NULL,
  loan_type VARCHAR(100) NOT NULL,
  source_description TEXT,
  source_sheet_name VARCHAR(255),
  source_row_number INTEGER,
  financial_year VARCHAR(10) NOT NULL,
  towards VARCHAR(50) DEFAULT 'EMI',
  transaction_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(emi_date, amount, loan_ref_id)
);

-- ========================================
-- VERIFICATION QUERIES
-- ========================================

-- Check all tables:
-- SELECT table_name FROM information_schema.tables 
-- WHERE table_schema = 'public' AND table_type = 'BASE TABLE';

-- Check users table structure:
-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'users' 
-- ORDER BY ordinal_position;

-- Check cashflow_entries table structure:
-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'cashflow_entries' 
-- ORDER BY ordinal_position;

-- Count records:
-- SELECT 'users' as table_name, COUNT(*) as count FROM users
-- UNION ALL
-- SELECT 'cashflow_entries', COUNT(*) FROM cashflow_entries
-- UNION ALL
-- SELECT 'loan_emis', COUNT(*) FROM loan_emis;

