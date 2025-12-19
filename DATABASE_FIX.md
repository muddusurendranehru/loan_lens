# 🔧 Database Connection Fix

## ❌ Problem

**Error:** `password authentication failed for user 'neondb_owner'`

This means your Neon database password has expired or changed.

---

## ✅ Solution

### Step 1: Get Fresh Connection String from Neon

1. Go to: https://console.neon.tech
2. Select your project: `proud-sunset-82737074`
3. Click on **"Connection Details"** or **"Connection String"**
4. Copy the **PostgreSQL connection string**
5. It should look like:
   ```
   postgresql://neondb_owner:NEW_PASSWORD@ep-xxx-pooler.us-east-1.aws.neon.tech/loan_lens?sslmode=require
   ```

### Step 2: Update .env.local

Replace the `DATABASE_URL` in `.env.local` with the new connection string.

**Current (expired):**
```env
DATABASE_URL=postgresql://neondb_owner:npg_zUbO5HZ9kDur@ep-icy-dream-ah5xlk96-pooler.us-east-1.aws.neon.tech/loan_lens?sslmode=require
```

**New (from Neon console):**
```env
DATABASE_URL=postgresql://neondb_owner:YOUR_NEW_PASSWORD@ep-xxx-pooler.us-east-1.aws.neon.tech/loan_lens?sslmode=require
```

### Step 3: Restart Dev Server

```bash
# Stop current server (Ctrl+C)
# Then restart
npm run dev
```

### Step 4: Verify Connection

```bash
node ensure-database.js
```

Should show: `✅ Connected to: loan_lens`

---

## 🚀 Quick Fix Script

After updating `.env.local`, run:

```bash
node ensure-database.js
```

This will:
- ✅ Test connection
- ✅ Create `users` table if missing
- ✅ Create `transactions` table if missing
- ✅ Show current status

---

## 📋 After Fix

Once connected, try signup again:
1. Go to: http://localhost:3000/signup
2. Enter email and password
3. Should work now! ✅

---

**Get the fresh connection string from Neon Console and update `.env.local`!**

