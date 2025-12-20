# Server Information

## ⚠️ Important: Next.js Runs BOTH Frontend + Backend on ONE Server

**Next.js is a full-stack framework** - when you run `npm run dev`, it starts **ONE server** that handles:

### ✅ Frontend (React Pages)
- `http://localhost:3000/` - Home page
- `http://localhost:3000/login` - Login page
- `http://localhost:3000/signup` - Signup page
- `http://localhost:3000/dashboard` - Dashboard page

### ✅ Backend (API Routes)
- `http://localhost:3000/api/parse/upload` - Upload API
- `http://localhost:3000/api/parse/confirm` - Save API
- `http://localhost:3000/api/report/cashflow` - Report API
- `http://localhost:3000/api/dashboard/months` - Dashboard API
- `http://localhost:3000/api/auth/*` - Authentication APIs

## 🚀 Start Server

**Command:**
```bash
cd C:\Users\pc\Desktop\loan_lens\loan_lens
npm run dev
```

**Or use the script:**
- Double-click: `START_SERVER.bat`
- Or run: `.\START_SERVER.ps1`

## 📊 Server Status

Once started, you'll see:
```
▲ Next.js 16.1.0
- Local: http://localhost:3000
- Network: http://192.168.x.x:3000
```

This **ONE server** serves both frontend pages and backend APIs.

## 🧪 Test Endpoints

### Backend APIs (All on same server):
1. **Upload**: `POST http://localhost:3000/api/parse/upload`
2. **Report**: `GET http://localhost:3000/api/report/cashflow?financial_year=2024-25`

### Frontend Pages (All on same server):
1. **Home**: `http://localhost:3000/`
2. **Dashboard**: `http://localhost:3000/dashboard`

## ✅ No Need for 2 Separate Servers

Next.js handles everything in one process. You don't need to run separate frontend and backend servers.

