# Debug Upload API - saved: 0

## Why `saved: 0`?

The response `{"success":true,"saved":0,"month":"September 2024"}` means:

### Possible Reasons:

1. **All transactions are duplicates**
   - Already saved in database
   - `ON CONFLICT (txn_date, amount, description) DO NOTHING` prevents duplicates
   - Check database: `SELECT * FROM cashflow_entries WHERE source_sheet = 'your_file.xlsx';`

2. **No transactions meet thresholds**
   - Current thresholds: **Inflows ≥ ₹15,000** and **Outflows ≥ ₹15,000**
   - Transactions below these amounts are skipped

3. **File parsing issue**
   - Check if columns are detected correctly
   - Verify date format is `dd/mm/yyyy`
   - Check transaction remarks/descriptions are present

---

## 🔍 How to Debug

### Check Database for Existing Records:
```sql
SELECT 
  COUNT(*) as total_rows,
  SUM(CASE WHEN flow_type = 'inflow' THEN 1 ELSE 0 END) as inflows,
  SUM(CASE WHEN flow_type = 'outflow' THEN 1 ELSE 0 END) as outflows,
  source_sheet
FROM cashflow_entries
GROUP BY source_sheet
ORDER BY created_at DESC;
```

### Check Recent Uploads:
```sql
SELECT * FROM cashflow_entries 
WHERE source_sheet LIKE '%24septicici%'
ORDER BY created_at DESC
LIMIT 20;
```

### Test with Different File:
- Try uploading a file with transactions ≥ ₹15,000
- Check console logs for parsing errors

---

## 📊 Current Thresholds

- **Inflows**: Must be ≥ ₹15,000
- **Outflows**: Must be ≥ ₹15,000

Transactions below these amounts are **automatically filtered out**.

---

## ✅ Expected Behavior

If `24septicici.xlsx` should save 7 rows but shows `saved: 0`:
- Check if those 7 rows already exist in database
- Verify all 7 rows have amounts ≥ ₹15,000
- Check if date/amount/description match existing records

