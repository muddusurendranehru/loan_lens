# 🚀 Quick Start Guide

## Server Status

**Next.js Development Server** (Frontend + Backend combined)
- **URL:** http://localhost:3000
- **Status:** Starting...

## How to Start

### Option 1: Using npm (Recommended)
```bash
npm run dev
```

### Option 2: Using PowerShell Script
```powershell
.\start-servers.ps1
```

### Option 3: Using Batch File
```cmd
start-servers.bat
```

---

## 🌐 URLs

### Frontend Pages
- **Home/Login:** http://localhost:3000
- **Signup:** http://localhost:3000/signup
- **Login:** http://localhost:3000/login
- **Dashboard:** http://localhost:3000/dashboard

### Backend API Endpoints
- **Test Connection:** http://localhost:3000/api/db/test-connection
- **Test Insert/Fetch:** http://localhost:3000/api/db/test-insert-fetch
- **Upload Parse:** http://localhost:3000/api/parse/upload (POST)
- **Confirm Save:** http://localhost:3000/api/parse/confirm (POST)
- **Dashboard Months:** http://localhost:3000/api/dashboard/months (GET)
- **Monthly EBITDA:** http://localhost:3000/api/dashboard/monthly?month=03&year=2025 (GET)

---

## 🧪 Test Flow

1. **Open:** http://localhost:3000/login
2. **Login:** admin@loanlens.com / securepassword123
3. **Dashboard:** Select "Savings Account"
4. **Upload:** Choose `test-homa-march-2025.xlsx`
5. **Scan:** Click "Scan for Transactions"
6. **Review:** Check detected categories
7. **Save:** Click "SAVE ALL"
8. **View:** See EBITDA dashboard

---

## 📁 Test Files

- **Excel File:** `test-homa-march-2025.xlsx` (created)
- **Test Script:** `test-api-flow.js` (run with `node test-api-flow.js`)

---

## ✅ Verification Checklist

- [ ] Server running on http://localhost:3000
- [ ] Login page loads
- [ ] Can login with admin credentials
- [ ] Dashboard loads
- [ ] Can upload test Excel file
- [ ] Transactions detected correctly
- [ ] Can save transactions
- [ ] EBITDA card displays

---

**Server should be ready in ~10-15 seconds after starting!**

