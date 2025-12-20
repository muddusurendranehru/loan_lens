# 🔐 Environment Variables Setup Guide

## Current Status

**File:** `.env.local` (exists ✅)

## Required Environment Variables

### ✅ Currently Set (Required)
```env
DATABASE_URL=postgresql://neondb_owner:npg_zUbO5HZ9kDur@ep-icy-dream-ah5xlk96-pooler.us-east-1.aws.neon.tech/loan_lens?sslmode=require
JWT_SECRET=loan_lens_super_secret_key_2024_secure_token
NEXTAUTH_SECRET=loan_lens_nextauth_secret_key_2024
NEXTAUTH_URL=http://localhost:3000
```

### ⚠️ Optional (For Google Sheets API)
```env
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@project-id.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key\n-----END PRIVATE KEY-----\n"
```

---

## 📋 Complete .env.local Template

Create/update `.env.local` with ALL variables:

```env
# ============================================
# DATABASE (REQUIRED)
# ============================================
# Format: postgres://user:password@host.neon.tech/dbname?sslmode=require
# Get connection string from: https://console.neon.tech
DATABASE_URL=postgres://user:password@host.neon.tech/yourdb?sslmode=require

# ============================================
# AUTHENTICATION (REQUIRED)
# ============================================
JWT_SECRET=loan_lens_super_secret_key_2024_secure_token
NEXTAUTH_SECRET=loan_lens_nextauth_secret_key_2024
NEXTAUTH_URL=http://localhost:3000

# ============================================
# GOOGLE SHEETS API (OPTIONAL - for private sheets)
# ============================================
# Only needed if you want to access private Google Sheets
# If not set, app will use public CSV export (works for public sheets)
GOOGLE_SERVICE_ACCOUNT_EMAIL=
GOOGLE_PRIVATE_KEY=
```

---

## ✅ Verification Checklist

### 1. Check DATABASE_URL
```bash
# In PowerShell
$env:DATABASE_URL
```

**Format:** `postgres://user:password@host.neon.tech/dbname?sslmode=require`

**Should contain:**
- `postgresql://` or `postgres://` (both work)
- Username (e.g., `neondb_owner`)
- Host (e.g., `ep-icy-dream-ah5xlk96-pooler.us-east-1.aws.neon.tech`)
- Database name (e.g., `loan_lens` or `yourdb`)
- `?sslmode=require` (SSL mode - required for Neon)

### 2. Check JWT Secrets
```bash
$env:JWT_SECRET
$env:NEXTAUTH_SECRET
```

**Should be:** Long random strings (not empty)

### 3. Test Database Connection
Visit: http://localhost:3000/api/db/test-connection

**Expected:** `{ success: true, connection: {...} }`

---

## 🐛 Common Issues & Fixes

### Issue 1: "DATABASE_URL not found"
**Fix:**
1. Check `.env.local` exists in project root
2. Restart dev server: `npm run dev`
3. Verify file name is exactly `.env.local` (not `.env.local.txt`)

### Issue 2: "Database connection timeout"
**Fix:**
1. Verify DATABASE_URL is correct
2. Check Neon console - database is active
3. Try connection string from Neon dashboard (copy fresh)

### Issue 3: "Google Sheets API error"
**Fix:**
- If using public sheets: Not needed (app uses CSV export)
- If using private sheets: Add `GOOGLE_SERVICE_ACCOUNT_EMAIL` and `GOOGLE_PRIVATE_KEY`

### Issue 4: "NextAuth error"
**Fix:**
- Ensure `NEXTAUTH_SECRET` is set
- Ensure `NEXTAUTH_URL` matches your server URL
- Restart dev server after changing env vars

---

## 🔍 Verify Environment Variables in Code

### Check if variables are loaded:
Visit: http://localhost:3000/api/db/test-connection

This endpoint checks:
- ✅ DATABASE_URL exists
- ✅ Database connection works
- ✅ Tables exist

---

## 📝 Notes

1. **`.env.local` is gitignored** - Safe to store secrets
2. **Restart server** after changing `.env.local`
3. **No spaces** around `=` in `.env.local`
4. **Quotes needed** for values with spaces or special chars
5. **Google credentials** are optional - app works without them (uses public CSV)

---

## ✅ Current Status

- ✅ DATABASE_URL: Set
- ✅ JWT_SECRET: Set
- ✅ NEXTAUTH_SECRET: Set
- ✅ NEXTAUTH_URL: Set
- ⚠️ GOOGLE_SERVICE_ACCOUNT_EMAIL: Not set (optional)
- ⚠️ GOOGLE_PRIVATE_KEY: Not set (optional)

**Your environment is correctly configured for basic operation!**

Google Sheets API credentials are only needed if you want to access private sheets.

