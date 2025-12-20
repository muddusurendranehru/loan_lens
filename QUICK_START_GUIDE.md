# Quick Start Guide - LoanLens

## 📋 Summary

This document provides quick commands to get started with the LoanLens project.

## 🚀 Starting the Server

### Option 1: PowerShell Script
```powershell
.\START_2_SERVERS.ps1
```

### Option 2: Batch File
```cmd
START_2_SERVERS.bat
```

### Option 3: Manual Command
```powershell
cd loan_lens
npm run dev
```

**Note**: Next.js runs BOTH frontend and backend on ONE server (port 3000)

## 📁 Project Structure

```
src/
├── app/
│   ├── login/page.tsx          ← Login (email, password)
│   ├── signup/page.tsx          ← Signup (email, password, confirm password)
│   ├── dashboard/page.tsx      ← Protected dashboard
│   └── api/
│       └── auth/
│           ├── [...nextauth]/route.ts  ← NextAuth config
│           └── signup/route.ts         ← Signup API
├── middleware.ts                ← Protects /dashboard
└── lib/
    ├── db.ts                    ← Database connection
    └── schema.sql               ← Database schema
```

## 🔐 Environment Variables

Create `.env.local` in the `loan_lens` directory:

```env
DATABASE_URL=postgresql://neondb_owner:password@host/loan_lens?sslmode=require
JWT_SECRET=loan_lens_super_secret_key_2024_secure_token
NEXTAUTH_SECRET=loan_lens_nextauth_secret_key_2024
NEXTAUTH_URL=http://localhost:3000
```

## 🌐 Access Points

- **Frontend**: http://localhost:3000
- **Login**: http://localhost:3000/login
- **Signup**: http://localhost:3000/signup
- **Dashboard**: http://localhost:3000/dashboard (protected)

## ✅ Verification Checklist

1. ✅ Database connection working
2. ✅ Signup page has 3 fields (email, password, confirm password)
3. ✅ Login page has 2 fields (email, password)
4. ✅ Dashboard is protected (requires auth)
5. ✅ After login, redirects to dashboard
6. ✅ Signup API endpoint exists at `/api/auth/signup`

## 📚 Documentation Files

- `PROJECT_RULES.md` - Complete project rules (copy/paste ready)
- `PROJECT_STRUCTURE.md` - Detailed project structure
- `ENV_SETUP.md` - Environment variables setup guide

## 🛠️ Common Commands

```powershell
# Install dependencies
npm install

# Start development server
npm run dev

# Check environment variables
node check-env.js

# Test database connection
# Visit: http://localhost:3000/api/db/test-connection
```

## 🐛 Troubleshooting

### Server won't start
- Check if port 3000 is already in use
- Verify `.env.local` exists and has correct values
- Run `npm install` to ensure dependencies are installed

### Database connection error
- Verify `DATABASE_URL` in `.env.local`
- Check Neon console - database should be active
- Test connection: http://localhost:3000/api/db/test-connection

### Authentication not working
- Verify `NEXTAUTH_SECRET` is set in `.env.local`
- Restart server after changing environment variables
- Check browser console for errors

