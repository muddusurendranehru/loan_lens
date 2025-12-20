# 🧪 Local Testing - Complete Guide

## ⚡ Quick Start (One Command)

### Option 1: Double-Click Batch File (Easiest)
Just double-click: **`RUN_TESTS.bat`** or **`QUICK_START.bat`**

### Option 2: PowerShell with Full Path
```powershell
C:\Users\MYPC\Desktop\loan_lens\RUN_TESTS.ps1
```

Or if execution policy blocks it:
```powershell
powershell -ExecutionPolicy Bypass -File "C:\Users\MYPC\Desktop\loan_lens\RUN_TESTS.ps1"
```

### Option 3: Command Prompt
```cmd
cd C:\Users\MYPC\Desktop\loan_lens
RUN_TESTS.bat
```

**This will:**
1. ✅ Clean up old processes
2. ✅ Start Next.js server on port 3001
3. ✅ Wait for server to be ready
4. ✅ Run complete test suite (Signup → Login → Dashboard)
5. ✅ Show test results

---

## 📋 Manual Testing (2 Commands)

### Terminal 1: Start Server
```powershell
cd C:\Users\MYPC\Desktop\loan_lens
npm run dev
```
**Server URL:** http://localhost:3001

### Terminal 2: Run Tests
```powershell
cd C:\Users\MYPC\Desktop\loan_lens
node C:\Users\MYPC\Desktop\loan_lens\test-signup-login-dashboard.js
```

Or from any directory:
```powershell
node C:\Users\MYPC\Desktop\loan_lens\test-signup-login-dashboard.js
```

---

## 🧪 What Gets Tested

### 1. Database Connection ✅
- Tests `DATABASE_URL` from `.env.local`
- Verifies Neon PostgreSQL connection
- Endpoint: `/api/db/test-connection`

### 2. Signup API ✅
- Creates new user with unique email
- Tests password hashing
- Verifies user insertion
- Endpoint: `/api/auth/signup`

### 3. Login API ✅
- Tests NextAuth credentials flow
- Verifies authentication
- Endpoint: `/api/auth/callback/credentials`

### 4. Pages Accessibility ✅
- Signup page: `/signup`
- Login page: `/login`
- Dashboard page: `/dashboard`

---

## 🌐 Browser Testing (After Automated Tests)

### Step 1: Signup
1. Open: http://localhost:3001/signup
2. Enter:
   - Email: `test@example.com`
   - Password: `test123456`
   - Confirm Password: `test123456`
3. Click "Sign Up"
4. **Expected:** Redirect to `/login?registered=true`

### Step 2: Login
1. Open: http://localhost:3001/login
2. Enter:
   - Email: `test@example.com`
   - Password: `test123456`
3. Click "Log In"
4. **Expected:** Redirect to `/dashboard`

### Step 3: Dashboard
1. Should auto-redirect after login
2. **Expected:** Dashboard page loads
3. Test features:
   - View data
   - Insert data
   - Logout

---

## 📊 Expected Test Output

```
🧪 COMPLETE TEST SUITE: SIGNUP → LOGIN → DASHBOARD
======================================================================
Base URL: http://localhost:3001
Test Email: test_1703123456789@example.com
Test Password: test123456
======================================================================

⏳ Waiting for server to be ready...
✅ Server is ready!

1️⃣  TESTING SIGNUP API
──────────────────────────────────────────────────
   ✅ Signup successful!
   📧 Email: test_1703123456789@example.com
   🆔 User ID: abc123-def456-ghi789
   📅 Created: 2024-12-21T10:30:45.123Z

2️⃣  TESTING LOGIN API
──────────────────────────────────────────────────
   ✅ Login API call successful!
   🍪 Session cookie received

3️⃣  TESTING PAGES
──────────────────────────────────────────────────
   ✅ Signup Page: Accessible (200)
   ✅ Login Page: Accessible (200)
   ✅ Dashboard Page: Accessible (200)

4️⃣  TESTING DATABASE CONNECTION
──────────────────────────────────────────────────
   ✅ Database connection successful!
   📊 Database: loan_lens
   ⏰ Time: 2024-12-21T10:30:45.123Z

======================================================================
📋 TEST SUMMARY
======================================================================
Database Connection: ✅ PASS
Signup API:          ✅ PASS
Login API:            ✅ PASS
Pages Accessible:    ✅ PASS
======================================================================

✅ ALL TESTS PASSED!

🔗 Test URLs:
   Signup:   http://localhost:3001/signup
   Login:    http://localhost:3001/login
   Dashboard: http://localhost:3001/dashboard
```

---

## 🐛 Troubleshooting

### Issue: Server Not Starting
**Solution:**
```powershell
.\CLEAN_START.ps1
```

### Issue: Port 3001 Already in Use
**Solution:**
```powershell
# Find process
netstat -ano | findstr :3001

# Kill process (replace PID)
taskkill /PID [PID_NUMBER] /F
```

### Issue: Database Connection Failed
**Check:**
1. `.env.local` exists in project root
2. `DATABASE_URL` is set correctly
3. Test connection: http://localhost:3001/api/db/test-connection

**Fix:**
```powershell
# Verify environment
node -e "console.log(process.env.DATABASE_URL)"
```

### Issue: Tests Fail with "ECONNREFUSED"
**Solution:**
1. Make sure server is running (`npm run dev`)
2. Wait 10-15 seconds after starting server
3. Check server is on port 3001 (not 3000)

### Issue: Signup Returns 500 Error
**Check:**
1. Database connection works
2. `users` table exists
3. Check server logs for detailed error

**Fix:**
```powershell
# Ensure users table exists
# Visit: http://localhost:3001/api/db/ensure-users-table
```

---

## 🔍 Quick Test (Server Already Running)

If server is already running:
```powershell
.\QUICK_TEST_LOCAL.ps1
```

Or:
```powershell
node test-signup-login-dashboard.js
```

---

## 📝 Test Files Created

1. **`test-signup-login-dashboard.js`** - Complete test suite
2. **`START_AND_TEST.ps1`** - PowerShell script (start + test)
3. **`START_AND_TEST.bat`** - Batch file (start + test)
4. **`QUICK_TEST_LOCAL.ps1`** - Quick test (server running)
5. **`TEST_LOCAL_COMMANDS.md`** - Detailed command guide
6. **`LOCAL_TEST_SUMMARY.md`** - This file

---

## ✅ Success Checklist

After running tests, verify:

- [ ] Server starts without errors
- [ ] Database connection test passes
- [ ] Signup API creates user successfully
- [ ] Login API responds (NextAuth works)
- [ ] All pages load (200 status)
- [ ] Can signup in browser
- [ ] Can login in browser
- [ ] Dashboard loads after login
- [ ] Logout works

---

## 🚀 Next Steps

1. ✅ Run automated tests: `.\START_AND_TEST.ps1`
2. ✅ Test in browser: http://localhost:3001/signup
3. ✅ Create account and login
4. ✅ Test dashboard features
5. ✅ Verify data insert/fetch works

---

## 📞 Support

If tests fail:
1. Check server logs
2. Verify `.env.local` configuration
3. Test database connection separately
4. Check port conflicts

**Test Database Connection:**
http://localhost:3001/api/db/test-connection

**Verify Environment:**
http://localhost:3001/api/env/verify

