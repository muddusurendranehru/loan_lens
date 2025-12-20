# HOMA Clinic EBITDA Tracker - Implementation Summary

## ✅ Completed Features

### 1. Enhanced Category Detection (`src/app/api/parse/upload/route.ts`)

The upload route now intelligently detects transaction categories from bank statement descriptions:

**Inflows:**
- `clinic_revenue` - Detects HOMA Clinic income (keywords: homa, clinic, consultation, patient, medical, doctor, fee, treatment)
- `business_loan` - Detects new loans (keywords: loan, disbursed, credit, advance, or amount ≥ ₹5,00,000)
- `other_income` - Default for other credits

**Outflows:**
- `bank_interest` - Interest paid to bank (keywords: int, interest, amount < ₹50,000)
- `rent` - Office/clinic rent (keywords: rent, house tax, property, lease, premises)
- `salaries` - Staff salaries (keywords: salary, sal, staff, payroll, wage, employee)
- `emi_interest` - EMI interest portion (amount ₹16,000-₹1,87,000 or keywords: emi, installment, loan payment)
- `emi_principal` - EMI principal portion (keywords: principal, prin)
- `vendor_payment` - Suppliers, utilities (keywords: electricity, water, internet, phone, amazon, flipkart, vendor, supplier, utility, bill)
- `personal` - Small spends (excluded from EBITDA)

### 2. Transaction Saving (`src/app/api/parse/confirm/route.ts`)

- Saves transactions to `transactions` table with all required fields
- Handles duplicate prevention using `UNIQUE(txn_date, amount, description)`
- Maps frontend `type` to database `flow_type`
- Includes account type (savings/current) and financial year

### 3. Monthly EBITDA API (`src/app/api/dashboard/monthly/route.ts`)

Returns comprehensive EBITDA summary for a given month/year:

**Query Parameters:**
- `month` - Month number (1-12)
- `year` - Year (e.g., 2025)
- `financial_year` - Alternative: financial year string (e.g., "2024-25")

**Response Structure:**
```json
{
  "success": true,
  "summary": {
    "revenue": {
      "clinic_revenue": number,
      "other_income": number,
      "total": number
    },
    "expenses": {
      "salaries": number,
      "rent": number,
      "vendor_payment": number,
      "total_operating": number
    },
    "interest": {
      "emi_interest": number,
      "bank_interest": number,
      "total": number
    },
    "loans": {
      "new_loans": number,
      "emi_principal": number,
      "total_emi": number
    },
    "metrics": {
      "ebitda": number,
      "net_operating_profit": number,
      "net_cashflow": number,
      "net_cashflow_after_principal": number,
      "loan_dependency": number
    },
    "cashflow": {
      "total_inflow": number,
      "total_outflow": number,
      "net": number
    }
  }
}
```

**Calculations:**
- **EBITDA** = Revenue - Operating Expenses (salaries + rent + vendor_payment)
- **Net Operating Profit** = EBITDA - Interest Expenses
- **Net Cashflow** = Total Inflow - Total Outflow
- **Net Cashflow After Principal** = EBITDA - Principal Payments
- **Loan Dependency** = New Loans - Total EMI (positive = taking more loans)

### 4. Mobile-Optimized Dashboard (`src/app/dashboard/page.tsx`)

**Features:**
- ✅ Mobile-first responsive design (max-w-lg, padding optimized)
- ✅ Upload screen with account type selection (Savings/Current)
- ✅ Transaction preview with editable categories
- ✅ Monthly EBITDA card showing:
  - Clinic Revenue
  - Other Income
  - Expenses breakdown (Salaries, Rent, Vendor Payments, Interest)
  - **EBITDA** (highlighted)
  - **Net Operating Profit** (after interest)
  - **Net Cashflow** (after principal)
  - **Loan Dependency** (New Loans vs Total EMI)

**UI Components:**
- Large, readable cards with proper spacing
- Color-coded metrics (green for positive, red for negative)
- Indian Rupee formatting (`en-IN` locale)
- Touch-friendly buttons and inputs
- Clear visual hierarchy

## 📊 Database Schema

**Table: `transactions`**
- `id` - SERIAL PRIMARY KEY
- `txn_date` - DATE
- `amount` - NUMERIC(12, 2) (₹)
- `flow_type` - 'inflow' | 'outflow'
- `category` - See categories above
- `description` - TEXT (bank narration)
- `account_type` - 'savings' | 'current'
- `source_sheet` - TEXT
- `financial_year` - TEXT (e.g., '2024-25')
- `created_at` - TIMESTAMP

**Indexes:**
- `idx_txn_date` - Fast date queries
- `idx_txn_fy` - Fast financial year queries
- `idx_txn_category` - Fast category filtering
- `idx_txn_account` - Fast account type filtering

## 🚀 Usage Flow

1. **Upload Bank Statement**
   - Select account type (Savings/Current)
   - Upload Excel/CSV or provide Google Sheet URL
   - System auto-detects transactions and categories

2. **Review & Edit**
   - Preview detected transactions
   - Edit categories if needed
   - Remove unwanted transactions

3. **Save**
   - Click "SAVE ALL" to persist to database
   - Transactions saved with duplicate prevention

4. **View Dashboard**
   - Monthly EBITDA card automatically updates
   - Shows current month by default
   - All amounts in ₹ (Indian Rupees)

## 🎨 Mobile Optimization

- **Responsive Layout**: `max-w-lg mx-auto` centers content on mobile
- **Touch Targets**: Buttons and inputs sized for touch (min 44px)
- **Readable Text**: Font sizes optimized for mobile screens
- **Spacing**: Proper padding and margins for mobile viewing
- **Cards**: Rounded corners, shadows, borders for visual clarity
- **Grid Layout**: Responsive grid for stats cards

## 📱 API Endpoints

- `POST /api/parse/upload` - Upload and parse bank statement
- `POST /api/parse/confirm` - Save transactions to database
- `GET /api/dashboard/monthly?month=3&year=2025` - Get monthly EBITDA summary

## ✅ All Requirements Met

- ✅ Upload from 2 accounts (Savings + Current)
- ✅ Auto-categorize transactions
- ✅ Calculate Monthly EBITDA
- ✅ Calculate Net Operating Profit (after interest)
- ✅ Calculate Cashflow (inflow vs outflow)
- ✅ Calculate Loan dependency (new loans vs EMI paid)
- ✅ Mobile-optimized UI
- ✅ All amounts in ₹ with `en-IN` formatting
- ✅ Category detection from description + amount
- ✅ Save to `transactions` table
- ✅ Monthly dashboard card with all metrics

