# Local Testing Commands

## 🚀 Quick Commands

### Start Server
```powershell
cd C:\Users\pc\Desktop\loan_lens\loan_lens
npm run dev
```

### Check Server Status
```powershell
Test-NetConnection -ComputerName localhost -Port 3000
```

### Test Upload API
```powershell
curl -X POST http://localhost:3000/api/parse/upload -F "file=@24septicici.xlsx" -F "sheetName=24septicici.xlsx"
```

### Test Report API
```powershell
curl http://localhost:3000/api/report/cashflow?financial_year=2024-25
```

### Run Test Script
```powershell
.\TEST_LOCAL.ps1
# or
.\TEST_LOCAL.bat
```

---

## ✅ Verification Checklist

- [ ] Server running on port 3000
- [ ] Upload API accepts Excel file
- [ ] Report API returns data
- [ ] Database connection working
- [ ] Frontend pages accessible

---

## 📝 Next Steps

1. Upload `24septicici.xlsx` → Should save 7 rows
2. Check Report API → Should show totals
3. Verify database → Check `cashflow_entries` table

