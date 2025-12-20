# 🔧 Production Error Fix Guide

## ❌ Current Error
```
500 Internal Server Error
"null value in column 'phone' violates not-null constraint"
```

## 🔍 Root Cause
The production database (Neon) has a `phone` column with `NOT NULL` constraint, but:
- Your code doesn't insert `phone` (only `email` and `password`)
- The schema.sql shows `phone` as optional (`VARCHAR(20)` without NOT NULL)
- **Schema drift** between local and production

---

## ✅ Solution Options

### Option 1: Make Phone Optional (Recommended)
**Run this SQL in Neon Console:**

```sql
-- Make phone column nullable
ALTER TABLE users 
ALTER COLUMN phone DROP NOT NULL;
```

**Why this is best:**
- Matches your schema.sql definition
- Keeps phone column for future use
- No data loss
- Minimal change

---

### Option 2: Remove Phone Column Entirely
**Run this SQL in Neon Console:**

```sql
-- Remove phone column completely
ALTER TABLE users DROP COLUMN IF EXISTS phone;
```

**Why you might do this:**
- You don't need phone at all
- Cleaner schema
- Matches your current code

**⚠️ Warning:** This deletes the phone column and all phone data.

---

### Option 3: Insert NULL Phone in API (Quick Fix)
**Update signup route to explicitly insert NULL:**

```typescript
await sql`
  INSERT INTO users (email, password, phone)
  VALUES (${email.toLowerCase()}, ${hashedPassword}, NULL)
`;
```

**Why this works:**
- Works immediately without schema change
- But phone stays NOT NULL (not ideal)

---

## 🧪 Diagnostic Steps

### Step 1: Check Actual Schema
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

**Expected output:**
- `phone` should show `is_nullable = 'YES'` (if fixed)
- If `is_nullable = 'NO'`, that's the problem!

---

### Step 2: Test Schema Check API
**After deploying updated code:**

```bash
curl https://loan-lens-bm36.onrender.com/api/db/check-schema
```

**This will show:**
- All columns in users table
- Which columns are nullable
- Current constraints

---

### Step 3: Verify Fix
**After running SQL fix:**

1. Check schema again (Step 1)
2. Test signup API:
```bash
curl -X POST https://loan-lens-bm36.onrender.com/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123456"}'
```

---

## 🚀 Deployment Checklist

### Before Fixing Schema:
- [ ] Check current schema in Neon Console
- [ ] Note which columns are NOT NULL
- [ ] Backup database (optional but recommended)

### After Fixing Schema:
- [ ] Verify schema change in Neon Console
- [ ] Test signup API endpoint
- [ ] Test signup form in browser
- [ ] Check Render logs for errors

### After Code Update:
- [ ] Push latest code to GitHub
- [ ] Trigger Render redeploy (or auto-deploy)
- [ ] Wait for build to complete
- [ ] Test signup again

---

## 📋 Quick Fix Commands

### 1. Fix Schema (Neon Console)
```sql
ALTER TABLE users ALTER COLUMN phone DROP NOT NULL;
```

### 2. Verify Fix
```sql
SELECT column_name, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'users' AND column_name = 'phone';
```

### 3. Test API
```bash
curl -X POST https://loan-lens-bm36.onrender.com/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123456"}'
```

---

## 🐛 Enhanced Error Logging

The updated signup route now logs:
- Full error message
- PostgreSQL error code
- Error detail (which column failed)
- Stack trace (in development)

**Check Render logs after signup attempt to see:**
```
Signup error: {
  message: "null value in column 'phone' violates not-null constraint",
  code: "23502",
  detail: "Failing row contains (uuid, email, password, null, ...)"
}
```

---

## ✅ Expected Result After Fix

**Successful signup response:**
```json
{
  "success": true,
  "message": "User created successfully. Please login."
}
```

**Status code:** `200 OK`

---

## 🔄 If Error Persists

1. **Check Render Environment Variables:**
   - `DATABASE_URL` points to correct Neon branch
   - `NEXTAUTH_SECRET` is set
   - `NEXTAUTH_URL` is `https://loan-lens-bm36.onrender.com`

2. **Check Render Build Logs:**
   - Ensure `bcryptjs` is installed
   - No build errors
   - Latest code is deployed

3. **Check Neon Connection:**
   - Test connection from Neon Console
   - Verify branch matches Render's DATABASE_URL

4. **Use Diagnostic Endpoint:**
   ```bash
   curl https://loan-lens-bm36.onrender.com/api/db/check-schema
   ```

---

## 📞 Next Steps

1. **Run the SQL fix** (Option 1 recommended)
2. **Test the signup API**
3. **Verify in browser**
4. **Monitor Render logs**

**The fix should take < 1 minute!** 🚀

