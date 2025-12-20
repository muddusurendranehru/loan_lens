# 🔍 Step-by-Step Alignment Verification Guide

## Purpose
Verify that backend, frontend, and database are correctly aligned.

---

## ✅ Quick Check (PowerShell)

```powershell
.\VERIFY_ALIGNMENT.ps1
```

---

## ✅ Quick Check (Node.js)

```bash
node VERIFY_ALIGNMENT.js
```

---

## 📋 Manual Step-by-Step Check

### STEP 1: Environment Variables

**Check:** `.env.local` exists and has required variables

```powershell
# Check file exists
Test-Path .env.local

# Check content (don't show values)
Get-Content .env.local | Select-String "DATABASE_URL|NEXTAUTH_SECRET|NEXTAUTH_URL"
```

**Required:**
- ✅ `DATABASE_URL=postgresql://...`
- ✅ `NEXTAUTH_SECRET=...`
- ✅ `NEXTAUTH_URL=http://localhost:3000`

---

### STEP 2: Database Connection

**Check:** Can connect to Neon database

**Option A: Use verification script**
```bash
node ensure-database.js
```

**Option B: Check in Neon Console**
1. Go to: https://console.neon.tech
2. Select your project
3. Go to SQL Editor
4. Run:
```sql
SELECT NOW() as current_time, current_database() as db_name;
```

**Expected:** Returns current time and database name

---

### STEP 3: Database Schema

**Check:** `users` table structure matches code

**In Neon Console SQL Editor:**
```sql
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'users'
ORDER BY ordinal_position;
```

**Expected columns:**
- `id` (UUID, NOT NULL) ✅
- `email` (VARCHAR, NOT NULL, UNIQUE) ✅
- `password` (VARCHAR, NOT NULL) ✅
- `phone` (VARCHAR, NULLABLE) ✅ **IMPORTANT: Must be nullable!**
- `created_at` (TIMESTAMP, DEFAULT NOW()) ✅

**⚠️ Critical Check:**
```sql
SELECT is_nullable 
FROM information_schema.columns 
WHERE table_name = 'users' AND column_name = 'phone';
```

**Must return:** `is_nullable = 'YES'` (nullable)

**If NOT NULL, fix:**
```sql
ALTER TABLE users ALTER COLUMN phone DROP NOT NULL;
```

---

### STEP 4: Backend API Routes

**Check:** Signup route exists and is correct

**File:** `src/app/api/auth/signup/route.ts`

**Must contain:**
- ✅ Imports `sql` from `@/lib/db`
- ✅ Imports `bcrypt` from `bcryptjs`
- ✅ POST handler
- ✅ Validates email and password
- ✅ Hashes password with `bcrypt.hash()`
- ✅ Inserts: `INSERT INTO users (email, password)`
- ✅ **Does NOT insert phone column**

**Check code:**
```powershell
Get-Content src/app/api/auth/signup/route.ts | Select-String "INSERT INTO users"
```

**Expected:** `INSERT INTO users (email, password)`

**❌ Wrong:** `INSERT INTO users (email, password, phone)`

---

### STEP 5: Frontend Signup Page

**Check:** Signup page calls correct API

**File:** `src/app/signup/page.tsx`

**Must contain:**
- ✅ Email input field
- ✅ Password input field
- ✅ Form submission
- ✅ Calls `/api/auth/signup`
- ✅ Handles errors

**Check:**
```powershell
Get-Content src/app/signup/page.tsx | Select-String "/api/auth/signup"
```

**Expected:** Should find the API endpoint

---

### STEP 6: Frontend Login Page

**Check:** Login page uses NextAuth

**File:** `src/app/login/page.tsx`

**Must contain:**
- ✅ Email input
- ✅ Password input
- ✅ Uses `signIn` from `next-auth/react`
- ✅ Redirects to `/dashboard` on success

**Check:**
```powershell
Get-Content src/app/login/page.tsx | Select-String "next-auth/react|/dashboard"
```

---

### STEP 7: NextAuth Configuration

**Check:** NextAuth uses database

**File:** `src/app/api/auth/[...nextauth]/route.ts`

**Must contain:**
- ✅ Uses `CredentialsProvider`
- ✅ Queries `users` table
- ✅ Compares password with `bcrypt.compareSync()`
- ✅ Returns user object on success

**Check:**
```powershell
Get-Content src/app/api/auth/[...nextauth]/route.ts | Select-String "users WHERE email|bcrypt.compareSync"
```

---

### STEP 8: Database Connection File

**Check:** Database connection is correct

**File:** `src/lib/db.ts`

**Must contain:**
- ✅ Imports `neon` from `@neondatabase/serverless`
- ✅ Uses `process.env.DATABASE_URL`
- ✅ Exports `sql`

**Check:**
```powershell
Get-Content src/lib/db.ts
```

---

### STEP 9: Dependencies

**Check:** All required packages installed

**File:** `package.json`

**Required dependencies:**
- ✅ `@neondatabase/serverless`
- ✅ `bcryptjs`
- ✅ `next-auth`
- ✅ `next`
- ✅ `react`

**Check:**
```powershell
Get-Content package.json | ConvertFrom-Json | Select-Object -ExpandProperty dependencies
```

---

## 🔧 Common Alignment Issues

### Issue 1: Phone Column NOT NULL
**Symptom:** Signup returns 500 error
**Fix:**
```sql
ALTER TABLE users ALTER COLUMN phone DROP NOT NULL;
```

### Issue 2: Wrong API Endpoint
**Symptom:** Frontend shows network error
**Fix:** Check signup page calls `/api/auth/signup`

### Issue 3: Missing Environment Variables
**Symptom:** Database connection fails
**Fix:** Create `.env.local` with `DATABASE_URL`

### Issue 4: Stale Code
**Symptom:** Code doesn't match database
**Fix:** 
1. Pull latest code: `git pull`
2. Rebuild: `npm run build`
3. Restart: `npm run dev`

---

## ✅ Verification Checklist

- [ ] `.env.local` exists with all required variables
- [ ] Database connection works
- [ ] `users` table exists with correct columns
- [ ] `phone` column is nullable (NOT NOT NULL)
- [ ] Signup API route exists and is correct
- [ ] Signup API only inserts `email` and `password`
- [ ] Frontend signup page calls `/api/auth/signup`
- [ ] Login page uses NextAuth
- [ ] NextAuth queries database
- [ ] All dependencies installed

---

## 🚀 After Verification

If all checks pass:

1. **Test signup:**
   ```bash
   curl -X POST http://localhost:3000/api/auth/signup \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"test123456"}'
   ```

2. **Test in browser:**
   - Go to: http://localhost:3000/signup
   - Enter email and password
   - Should redirect to login

3. **Test login:**
   - Go to: http://localhost:3000/login
   - Enter credentials
   - Should redirect to dashboard

---

## 📞 If Issues Found

1. **Run verification script:**
   ```powershell
   .\VERIFY_ALIGNMENT.ps1
   ```

2. **Check specific step:**
   - Review the step that failed
   - Follow the fix instructions

3. **Re-verify:**
   - Run script again
   - All steps should pass

---

**All aligned? Your app should work! 🎉**

