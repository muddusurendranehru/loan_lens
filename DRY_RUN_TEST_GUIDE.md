# 🧪 HOMA Clinic EBITDA Tracker - Dry Run Test Guide

## ✅ Database Verified
- ✅ All 3 tables exist
- ✅ Transactions schema correct
- ✅ INSERT/FETCH working
- ✅ Constraints in place

## 📋 Test Excel File Created
**File:** `test-homa-march-2025.xlsx`

**Sample Data:**
- **Inflows:** ₹5,25,000 (Clinic Revenue) + ₹25,00,000 (Business Loan)
- **Outflows:** ₹1,80,000 (Salaries) + ₹45,000 (Rent) + ₹62,000 (Vendor) + ₹78,200 (EMI) + ₹12,500 (Interest)
- **Expected EBITDA:** ₹2,38,000

---

## 🚀 Step-by-Step Dry Run

### Step 1: Start Development Server

```bash
npm run dev
```

Server will start at: `http://localhost:3000`

---

### Step 2: Test Signup Page

1. Open: `http://localhost:3000/signup`
2. Fill form:
   - Email: `test@homaclinic.com`
   - Password: `testpassword123`
   - Confirm Password: `testpassword123`
3. Click "Create Account"
4. Should redirect to `/login`

**Expected:** Signup page loads, form works, redirects to login

---

### Step 3: Test Login Page

1. Open: `http://localhost:3000/login`
2. Use demo credentials:
   - Email: `admin@loanlens.com`
   - Password: `securepassword123`
3. Click "Sign In"
4. Should redirect to `/dashboard`

**Expected:** Login successful, redirects to dashboard

---

### Step 4: Test Dashboard - Upload & Parse

1. On dashboard, select **Account Type:** `Savings Account`
2. Click **"📁 Choose File"**
3. Select: `test-homa-march-2025.xlsx`
4. Click **"🔍 Scan for Transactions"**

**Expected Results:**
- Status: "Scanning..." → "Ready"
- Shows detected transactions:
  - **INFLOWS:** Clinic Revenue (₹2,50,000, ₹1,50,000, ₹1,25,000), Business Loan (₹25,00,000)
  - **OUTFLOWS:** Salaries (₹1,80,000), Rent (₹45,000), EMI (₹78,200), Vendor Payments (₹62,000), Bank Interest (₹12,500)

---

### Step 5: Review & Adjust Categories

1. Review each transaction's auto-detected category
2. Adjust if needed using dropdowns
3. Remove any incorrect transactions (✕ button)

**Expected:** All categories correctly detected:
- Clinic Revenue → `clinic_revenue`
- Business Loan → `business_loan`
- Salaries → `salaries`
- Rent → `rent`
- EMI → `emi_interest`
- Vendor → `vendor_payment`
- Interest → `bank_interest`

---

### Step 6: Save Transactions

1. Click **"💾 SAVE ALL"** button
2. Wait for success message

**Expected:**
- Alert: "✅ Saved X transaction(s)! (Y duplicates skipped)"
- Form resets
- Dashboard refreshes

---

### Step 7: Verify Data Saved

**Option A: Check in Neon Console**
```sql
SELECT * FROM transactions ORDER BY created_at DESC LIMIT 10;
```

**Option B: Check Dashboard**
- Dashboard should show saved months
- EBITDA card should appear with calculations

**Expected Data:**
- 10 transactions saved
- All categories correct
- Account type: `savings`
- Financial year: `2024-25`

---

### Step 8: Verify EBITDA Dashboard

**Expected EBITDA Card:**
```
📅 March 2025 — HOMA Clinic

💰 INCOME
• Clinic Revenue: ₹5,25,000
• Other Income: ₹0
→ Total Income: ₹5,25,000

💸 EXPENSES
• Salaries: ₹1,80,000
• Rent: ₹45,000
• Vendor Payments: ₹62,000
• EMI Interest: ₹78,200
• Bank Interest: ₹12,500
→ Total Expenses: ₹3,77,700

📊 EBITDA: ₹1,47,300
📊 Net Cashflow: ₹69,100 (after principal)
🔁 New Loans: ₹25,00,000 → used to fund EMI
```

---

## 🔍 API Endpoints to Test

### 1. Test Upload API
```bash
# Using curl (or test in browser console)
curl -X POST http://localhost:3000/api/parse/upload \
  -F "accountType=savings" \
  -F "file=@test-homa-march-2025.xlsx"
```

### 2. Test Confirm API
```bash
curl -X POST http://localhost:3000/api/parse/confirm \
  -H "Content-Type: application/json" \
  -d '{
    "transactions": [{
      "date": "2025-03-05",
      "amount": 250000,
      "type": "inflow",
      "category": "clinic_revenue",
      "description": "NEFT HOMA CLINIC REV",
      "account_type": "savings",
      "financial_year": "2024-25"
    }],
    "sheetName": "Test Sheet"
  }'
```

### 3. Test Dashboard Monthly API
```bash
curl http://localhost:3000/api/dashboard/monthly?month=03&year=2025
```

---

## 🐛 Troubleshooting

### Issue: "Account type required"
**Fix:** Make sure account type dropdown is selected before upload

### Issue: "Could not auto-detect columns"
**Fix:** Ensure Excel has headers: Date, Credit, Debit, Description

### Issue: "Database connection failed"
**Fix:** Check `.env.local` has correct `DATABASE_URL`

### Issue: "No transactions found"
**Fix:** Check thresholds - Inflows ≥ ₹50,000, Outflows ≥ ₹15,000

---

## ✅ Success Criteria

- [ ] Signup page works
- [ ] Login works (admin@loanlens.com / securepassword123)
- [ ] Dashboard loads
- [ ] File upload works
- [ ] Transactions detected correctly
- [ ] Categories auto-assigned correctly
- [ ] Save button works
- [ ] Data appears in database
- [ ] EBITDA card displays correctly
- [ ] Monthly summary shows saved data

---

## 📊 Expected Final State

**Database:**
- `transactions` table: 10+ records
- All with correct categories
- Account type: `savings`
- Financial year: `2024-25`

**Dashboard:**
- Shows March 2025 card
- EBITDA calculated correctly
- Inflows/Outflows displayed
- Net cashflow shown

---

**Ready to test!** Start the server and follow the steps above.

