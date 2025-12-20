# LoanLens Pro - Business Cashflow Tracker

## ✅ Implementation Complete

### Backend APIs (Built First)

1. **`src/app/api/parse/upload/route.ts`** ✅
   - Detects inflows: ≥ ₹50,000
     - If description contains "loan", "credit", or "disbursed" → `business_loan`
     - Otherwise → `income`
   - Detects outflows: ≥ ₹15,000
     - If amount in range ₹16,000-₹1,87,000 or contains "emi" → `emi`
     - Otherwise → `vendor_payment`
   - Skips transactions below thresholds
   - Returns categorized inflows and outflows

2. **`src/app/api/parse/confirm/route.ts`** ✅
   - Saves transactions to `transactions` table
   - Maps frontend `type` to database `flow_type`
   - Prevents duplicates using `(txn_date, amount, description)`
   - All amounts in ₹ (NUMERIC(12,2))

3. **`src/app/api/dashboard/months/route.ts`** ✅
   - Returns monthly summaries grouped by month
   - Calculates total inflows, outflows, net balance
   - Groups transactions by month for display
   - Returns totals across all months

### Frontend (Mobile-First)

4. **`src/app/dashboard/page.tsx`** ✅
   - Upload zone: Google Sheet URL or Excel/CSV file
   - Account type selection (Savings/Current)
   - After upload: Shows monthly card with:
     - **INFLOWS (₹X)** - Categorized list
     - **OUTFLOWS (₹Y)** - Categorized list
     - **NET BALANCE: ₹Z** - Highlighted
     - Green "SAVE ALL" button
   - Saved months appear as scrollable cards
   - All amounts formatted in ₹ using `en-IN` locale
   - Mobile-optimized responsive design

### Detection Logic

**Inflows (Credits ≥ ₹50,000):**
- `business_loan`: Amount ≥ ₹50,000 AND (description contains "loan" OR "credit" OR "disbursed")
- `income`: Amount ≥ ₹50,000 but not a loan

**Outflows (Debits ≥ ₹15,000):**
- `emi`: Amount in range ₹16,000-₹1,87,000 OR description contains "emi"
- `vendor_payment`: Other large outflows ≥ ₹15,000

### Database Schema

**Table: `transactions`**
- `id` - SERIAL PRIMARY KEY
- `txn_date` - DATE
- `amount` - NUMERIC(12,2) (₹)
- `flow_type` - 'inflow' | 'outflow'
- `category` - 'business_loan' | 'income' | 'emi' | 'vendor_payment'
- `description` - TEXT
- `account_type` - 'savings' | 'current'
- `source_sheet` - TEXT
- `financial_year` - TEXT (e.g., '2024-25')
- `created_at` - TIMESTAMP

**Unique Constraint:** `(txn_date, amount, description)` - Prevents duplicates

### Features

✅ Upload bank statements (Google Sheets or Excel)  
✅ Auto-detect inflows (≥ ₹50k) and outflows (≥ ₹15k)  
✅ Categorize transactions automatically  
✅ User can review and adjust categories before saving  
✅ Monthly cards with categorized flows  
✅ Net balance calculation  
✅ All amounts in Indian Rupees (₹)  
✅ Mobile-first responsive UI  
✅ Indian financial year grouping (Apr-Mar)  
✅ Duplicate prevention  

### Usage Flow

1. User uploads bank statement (URL or file)
2. System detects transactions above thresholds
3. User reviews and adjusts categories
4. User clicks "SAVE ALL"
5. Transactions saved to database
6. Monthly cards display saved data

### Amount Formatting

All amounts use Indian Rupee formatting:
- Currency: ₹ (INR)
- Locale: `en-IN`
- Format: `new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' })`
- Example: ₹1,50,000 (not $150,000)

### Next Steps

1. Test backend APIs:
   - POST `/api/parse/upload` - Upload and parse
   - POST `/api/parse/confirm` - Save transactions
   - GET `/api/dashboard/months` - Get monthly summaries

2. Test frontend:
   - Upload flow
   - Category editing
   - Save functionality
   - Monthly card display

3. Verify database:
   - Check transactions are saved correctly
   - Verify duplicate prevention works
   - Confirm financial year grouping

