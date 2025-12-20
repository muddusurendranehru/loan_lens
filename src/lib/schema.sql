-- LOAN LENS PRO DATABASE SCHEMA
-- Database: loan_lens (Neon PostgreSQL)
-- Indian Financial Year: April to March (e.g., 2024-25)

-- TABLE 1: users (for authentication)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- TABLE 2: loan_emis (EMI payment tracking - original)
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

-- TABLE 3: transactions (Business Cashflow & EBITDA Tracking)
-- DROP if exists (for clean start)
DROP TABLE IF EXISTS transactions;

CREATE TABLE transactions (
  id SERIAL PRIMARY KEY,
  txn_date DATE NOT NULL,
  amount NUMERIC(12, 2) NOT NULL,          -- Always in ₹
  flow_type TEXT NOT NULL CHECK (flow_type IN ('inflow', 'outflow')),
  
  -- 📊 Cashflow Categories (Indian Clinic Cashflow Analyzer)
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
  account_type TEXT NOT NULL CHECK (account_type IN ('savings', 'current')),
  source_sheet TEXT,
  financial_year TEXT NOT NULL,            -- '2024-25'
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(txn_date, amount, description)    -- Prevent duplicate transactions
);

-- Indexes for fast reporting
CREATE INDEX IF NOT EXISTS idx_txn_date ON transactions(txn_date);
CREATE INDEX IF NOT EXISTS idx_txn_fy ON transactions(financial_year);
CREATE INDEX IF NOT EXISTS idx_txn_category ON transactions(category);
CREATE INDEX IF NOT EXISTS idx_txn_account ON transactions(account_type);

-- TABLE 4: cashflow_entries (Cashflow Analyzer - Direct Save)
CREATE TABLE IF NOT EXISTS cashflow_entries (
  id SERIAL PRIMARY KEY,
  txn_date DATE NOT NULL,
  amount NUMERIC(12, 2) NOT NULL,          -- Always in ₹
  flow_type TEXT NOT NULL CHECK (flow_type IN ('inflow', 'outflow')),
  category TEXT NOT NULL CHECK (
    category IN (
      'business_loan',
      'clinic_income',
      'emi',
      'rent',
      'tax',
      'vendor_payment'
    )
  ),
  description TEXT,
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
