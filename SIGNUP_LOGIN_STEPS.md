# 🚀 Signup & Login Testing Steps

## ✅ Step 1: Start the Server

Open PowerShell and run:
```powershell
cd C:\Users\pc\Desktop\loan_lens\loan_lens
npm run dev
```

Wait for: `✓ Ready in ...` message
Server will run on: `http://localhost:3000` or `http://localhost:3001`

---

## ✅ Step 2: Test Signup (3 ways)

### Option A: Browser Test (Recommended)
1. Open browser: `http://localhost:3000/signup` (or `3001` if 3000 is busy)
2. Fill in:
   - **Email**: `test@loanlens.com` (or any email)
   - **Password**: `password123` (minimum 6 characters)
3. Click **"Sign Up"** button
4. **Expected**: Alert "Account created! Redirecting to login..."
5. **Expected**: Automatically redirected to `/login` page

### Option B: API Test (Command Line)
```powershell
cd C:\Users\pc\Desktop\loan_lens\loan_lens
node test-signup-now.js
```
**Expected**: `✅ SUCCESS! Signup worked!`

### Option C: Manual API Test (cURL)
```powershell
curl -X POST http://localhost:3000/api/auth/signup -H "Content-Type: application/json" -d "{\"email\":\"test2@loanlens.com\",\"password\":\"password123\"}"
```

---

## ✅ Step 3: Verify User in Database

1. Go to Neon Console: https://console.neon.tech
2. Navigate to your `loan_lens` database
3. Open `users` table
4. **Expected**: See your new user with:
   - Email (lowercased)
   - `password` column: Hashed password (starts with `$2b$10$...`)
   - `password_hash` column: Same hashed password
   - `phone` column: Empty string `''`

---

## ✅ Step 4: Test Login

### Browser Test:
1. Go to: `http://localhost:3000/login`
2. Fill in:
   - **Email**: Same email you used for signup
   - **Password**: Same password
3. Click **"Sign In"** or **"Login"** button
4. **Expected**: Automatically redirected to `/dashboard`

### Check Terminal Logs:
Look for:
- `User not found:` → Wrong email
- `Invalid password` → Wrong password
- No errors → Login successful!

---

## ✅ Step 5: Verify Dashboard Access

After login:
1. **Expected**: You see the dashboard at `/dashboard`
2. **Expected**: No redirect back to login (means auth worked)
3. **Expected**: Dashboard shows upload form, reports, etc.

---

## ✅ Step 6: Test Logout (Optional)

1. Find logout button/option on dashboard
2. Click logout
3. **Expected**: Redirected to `/login`
4. **Expected**: Trying to access `/dashboard` redirects back to login

---

## 🔍 Troubleshooting

### ❌ Signup fails with 500 error
**Check server terminal** for:
- `🔥 FATAL ERROR: [error message]`
- Common issues:
  - Database connection failed → Check `DATABASE_URL` in `.env.local`
  - Duplicate email → Try different email
  - Missing columns → Database schema mismatch

### ❌ Login fails
**Check server terminal** for:
- `User not found:` → Email doesn't exist (signup first!)
- `Invalid password` → Password doesn't match
- `Auth error:` → Database connection issue

### ❌ Redirect doesn't work
- Clear browser cache
- Check `NEXTAUTH_URL` in `.env.local` matches server URL
- Check `NEXTAUTH_SECRET` is set

---

## 📋 Quick Checklist

- [ ] Server running (`npm run dev`)
- [ ] Signup page accessible (`/signup`)
- [ ] Signup successful (200 OK)
- [ ] User appears in database
- [ ] Login page accessible (`/login`)
- [ ] Login successful → redirects to dashboard
- [ ] Dashboard accessible (protected route works)

---

## 🎯 Expected Database Schema

Your `users` table should have:
- `id` (UUID, primary key)
- `email` (text, unique, NOT NULL)
- `password` (text, NOT NULL) → Bcrypt hash
- `password_hash` (text, NOT NULL) → Same Bcrypt hash
- `phone` (text, NOT NULL) → Empty string `''`
- `role` (text, default: 'patient')
- `created_at` (timestamp)
- `updated_at` (timestamp)

---

## ✅ Success Criteria

**Signup works when:**
- ✅ No 500 errors
- ✅ Returns `{"success": true}`
- ✅ User appears in database
- ✅ Redirects to login page

**Login works when:**
- ✅ No authentication errors
- ✅ Redirects to dashboard
- ✅ Can access protected routes
- ✅ Session persists (refresh page, still logged in)

