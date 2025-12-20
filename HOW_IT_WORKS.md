# How LoanLens Pro Works - Server Architecture

## 🎯 One Server, Two Functions

**Next.js runs BOTH frontend and backend on ONE server** (port 3000)

### Frontend (React Pages)
- Served at: `http://localhost:3000/*`
- Pages: `/`, `/login`, `/signup`, `/dashboard`
- Built with: React, TypeScript, Tailwind CSS

### Backend (API Routes)
- Served at: `http://localhost:3000/api/*`
- APIs: `/api/parse/upload`, `/api/report/cashflow`, etc.
- Built with: Next.js API Routes, Neon PostgreSQL

## 🚀 Starting the Server

**Single Command:**
```bash
cd C:\Users\pc\Desktop\loan_lens\loan_lens
npm run dev
```

**This ONE command starts BOTH:**
- ✅ Frontend pages
- ✅ Backend APIs

## 📊 What You'll See

```
▲ Next.js 16.1.0
- Local: http://localhost:3000
- Network: http://192.168.x.x:3000
```

## 🧪 Testing

### Frontend:
- Visit: `http://localhost:3000/dashboard`

### Backend:
- Test: `POST http://localhost:3000/api/parse/upload`
- Test: `GET http://localhost:3000/api/report/cashflow?financial_year=2024-25`

## ✅ No Separate Servers Needed

Next.js handles everything in one process. You don't need to run Express + React separately.

