# Next Steps - Commands for Local Testing

## 🚀 Start Server

```powershell
cd C:\Users\pc\Desktop\loan_lens\loan_lens
npm run dev
```

**Or use script:**
```powershell
.\START_SERVER.bat
# or
.\START_SERVER.ps1
```

---

## ✅ Check Server Status

```powershell
# Check if server is running on port 3000
Test-NetConnection -ComputerName localhost -Port 3000

# Check Node.js processes
Get-Process -Name node

# Stop server if needed
Stop-Process -Name node -Force
```

---

## 📤 Test Upload API

```powershell
# Test with Excel file (replace with your file path)
$file = "C:\Users\pc\Desktop\loan_lens\loan_lens\24septicici.xlsx"
curl -X POST http://localhost:3000/api/parse/upload `
  -F "file=@$file" `
  -F "sheetName=24septicici.xlsx"
```

**Expected Response:**
```json
{
  "success": true,
  "saved": 7,
  "month": "September 2024"
}
```

---

## 📊 Test Report API

```powershell
# Test report API
curl http://localhost:3000/api/report/cashflow?financial_year=2024-25

# Or in browser:
# http://localhost:3000/api/report/cashflow?financial_year=2024-25
```

**Expected Response:**
```json
{
  "success": true,
  "summary": {
    "total_inflow": 250000,
    "total_outflow": 391000
  }
}
```

---

## 🗄️ Check Database

```powershell
# Test database connection
cd C:\Users\pc\Desktop\loan_lens\loan_lens
node test-db-connection.js
```

---

## 🌐 Test Frontend Pages

**Open in browser:**
- Home: http://localhost:3000/
- Login: http://localhost:3000/login
- Signup: http://localhost:3000/signup
- Dashboard: http://localhost:3000/dashboard

---

## 🔍 Verify Everything Works

```powershell
# 1. Check server is running
Test-NetConnection -ComputerName localhost -Port 3000

# 2. Test upload API
curl -X POST http://localhost:3000/api/parse/upload -F "file=@24septicici.xlsx"

# 3. Test report API
curl http://localhost:3000/api/report/cashflow?financial_year=2024-25

# 4. Check database
node test-db-connection.js
```

---

## 🐛 Troubleshooting Commands

```powershell
# Kill all Node processes
Stop-Process -Name node -Force

# Check what's using port 3000
Get-NetTCPConnection -LocalPort 3000

# Reinstall dependencies
cd C:\Users\pc\Desktop\loan_lens\loan_lens
npm install

# Check environment variables
Get-Content .env.local
```

