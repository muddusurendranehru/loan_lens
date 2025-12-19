# 🔧 Manual Setup Commands

## Step 1: Update .env.local Manually

Open `.env.local` file and replace the `DATABASE_URL` line with:

```env
DATABASE_URL=postgresql://neondb_owner:npg_zUbO5HZ9kDur@ep-icy-dream-ah5xlk96-pooler.c-3.us-east-1.aws.neon.tech/loan_lens?sslmode=require&channel_binding=require
```

**Full .env.local should look like:**
```env
DATABASE_URL=postgresql://neondb_owner:npg_zUbO5HZ9kDur@ep-icy-dream-ah5xlk96-pooler.c-3.us-east-1.aws.neon.tech/loan_lens?sslmode=require&channel_binding=require
JWT_SECRET=loan_lens_super_secret_key_2024_secure_token
NEXTAUTH_SECRET=loan_lens_nextauth_secret_key_2024
NEXTAUTH_URL=http://localhost:3000
```

---

## Step 2: Verify Database Connection

**PowerShell:**
```powershell
node ensure-database.js
```

**Expected output:**
```
✅ Connected to: loan_lens
✅ Users table exists
✅ Transactions table exists
```

---

## Step 3: Start Development Server

**Note:** Next.js runs both frontend AND backend in ONE server (port 3000)

**PowerShell:**
```powershell
npm run dev
```

**Or if you want to specify port:**
```powershell
$env:PORT=3000; npm run dev
```

**Expected output:**
```
  ▲ Next.js 14.x.x
  - Local:        http://localhost:3000
  - Ready in X seconds
```

---

## Step 4: Test in Browser

1. **Signup:** http://localhost:3000/signup
2. **Login:** http://localhost:3000/login
3. **Dashboard:** http://localhost:3000/dashboard

---

## 🔍 Verify .env.local Was Updated

**PowerShell:**
```powershell
Get-Content .env.local | Select-String "DATABASE_URL"
```

**Should show:**
```
DATABASE_URL=postgresql://neondb_owner:npg_zUbO5HZ9kDur@ep-icy-dream-ah5xlk96-pooler.c-3.us-east-1.aws.neon.tech/loan_lens?sslmode=require&channel_binding=require
```

---

## 🛑 Stop Server

Press `Ctrl+C` in the terminal where server is running.

---

## 📋 Quick Checklist

- [ ] Updated `.env.local` with new DATABASE_URL
- [ ] Verified connection: `node ensure-database.js`
- [ ] Started server: `npm run dev`
- [ ] Server running on http://localhost:3000
- [ ] Tested signup page
- [ ] Tested login page

---

**Copy-paste these commands one by one!**

