# Quick Start Guide

## 🚀 Start the Server

### Option 1: Use the Script
Double-click: `START_SERVER.bat` or `START_SERVER.ps1`

### Option 2: Manual Command
```powershell
cd C:\Users\pc\Desktop\loan_lens\loan_lens
npm run dev
```

**Correct Path**: `C:\Users\pc\Desktop\loan_lens\loan_lens`

## 🌐 Server URL

Once started, server will be available at:
**http://localhost:3000**

## 📤 Test Upload API

### Using PowerShell:
```powershell
$file = "24septicici.xlsx"
curl -X POST http://localhost:3000/api/parse/upload `
  -F "file=@$file" `
  -F "sheetName=24septicici.xlsx"
```

### Expected Response:
```json
{
  "success": true,
  "saved": 7,
  "month": "September 2024"
}
```

## 📊 Test Report API

### Browser:
Visit: `http://localhost:3000/api/report/cashflow?financial_year=2024-25`

### PowerShell:
```powershell
curl http://localhost:3000/api/report/cashflow?financial_year=2024-25
```

### Expected Response:
```json
{
  "success": true,
  "summary": {
    "total_inflow": 250000,
    "total_outflow": 391000
  }
}
```

## ✅ Verification Checklist

- [ ] Server starts without errors
- [ ] Can access http://localhost:3000
- [ ] Upload API returns success with saved count
- [ ] Report API returns summary data
- [ ] Database has entries in `cashflow_entries` table

## 🐛 Troubleshooting

**Wrong Directory Error:**
- Always use: `C:\Users\pc\Desktop\loan_lens\loan_lens`
- Use `START_SERVER.bat` to avoid path issues

**Port 3000 Already in Use:**
- Stop other Node.js processes: `Stop-Process -Name node -Force`
- Or change port in `package.json`: `"dev": "next dev -p 3001"`

**DATABASE_URL Error:**
- Check `.env.local` exists
- Verify `DATABASE_URL` is set correctly
