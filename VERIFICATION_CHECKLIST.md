# Code Verification Checklist

## ✅ Verified Requirements

### 1. Dependencies
- ✅ **@neondatabase/serverless**: Used via `sql` import from `@/lib/db.ts`
- ✅ **xlsx**: Used server-side only (`import * as XLSX from 'xlsx'`)

### 2. Category Logic
- ✅ **hdfc/tata/bajaj → emi**: Line 29 in upload/route.ts
  ```typescript
  if (lower.includes('hdfc') || lower.includes('tata') || lower.includes('bajaj')) {
    return 'emi';
  }
  ```
- ✅ **loan → business_loan**: Line 23 (for inflows)
- ✅ **salary/cbm → clinic_income**: Line 24 (for inflows)
- ✅ **rent/homarent → rent**: Line 32-33
- ✅ **tax/itax → tax**: Line 35-36
- ✅ **default → vendor_payment**: Line 39

### 3. Database Constraints
- ✅ **ON CONFLICT (txn_date, amount, description) DO NOTHING**: Line 178 in upload/route.ts
- ✅ **UNIQUE constraint** on (txn_date, amount, description) in schema.sql

### 4. Filtering Thresholds
- ✅ **Inflows ≥ ₹15,000**: Line 102 in upload/route.ts
- ✅ **Outflows ≥ ₹15,000**: Line 112 in upload/route.ts

### 5. Date Handling
- ✅ **dd/mm/yyyy → YYYY-MM-DD**: Uses `parseDate()` and `formatDateISO()` from dateUtils

### 6. Financial Year
- ✅ **Apr–Mar calculation**: Uses `getFinancialYear()` from dateUtils

## 📝 Test Case

**File**: `24septicici.xlsx`
**Expected**: Should save 7 rows to `cashflow_entries` table

## 🔍 Report API Created

**Endpoint**: `GET /api/report/cashflow`

**Query Parameters**:
- `month` (optional): Month number (1-12)
- `year` (optional): Year (e.g., 2024)
- `financial_year` (optional): Financial year (e.g., "2024-25")

**Response**:
```json
{
  "success": true,
  "summary": {
    "total_inflow": number,
    "total_inflowFormatted": "₹X",
    "total_outflow": number,
    "total_outflowFormatted": "₹Y",
    "net_balance": number,
    "net_balanceFormatted": "₹Z",
    "inflow_count": number,
    "outflow_count": number,
    "total_transactions": number
  },
  "categoryBreakdown": [
    {
      "category": "emi",
      "flow_type": "outflow",
      "count": 5,
      "total_amount": 391000,
      "total_amountFormatted": "₹3,91,000"
    }
  ],
  "transactions": [...]
}
```
