# 🧪 Local Testing Guide - Signup, Login, Dashboard

## Quick Start (2 Commands)

### Option 1: Automated (Recommended)
```powershell
# Start server and run all tests
.\START_AND_TEST.ps1
```

### Option 2: Manual (Step by Step)

#### Step 1: Start Server (Terminal 1)
```powershell
cd C:\Users\MYPC\Desktop\loan_lens
npm run dev
```
**Server runs on:** http://localhost:3001

#### Step 2: Run Tests (Terminal 2)
```powershell
cd C:\Users\MYPC\Desktop\loan_lens
node test-signup-login-dashboard.js
```

---

## What Gets Tested

✅ **Database Connection** - Verifies DATABASE_URL works  
✅ **Signup API** - Tests user registration  
✅ **Login API** - Tests authentication  
✅ **Pages** - Verifies signup, login, dashboard pages load  

---

## Manual Browser Testing

After running automated tests, test in browser:

1. **Signup Page**
   - URL: http://localhost:3001/signup
   - Test: Create new account
   - Expected: Redirect to `/login?registered=true`

2. **Login Page**
   - URL: http://localhost:3001/login
   - Test: Login with created credentials
   - Expected: Redirect to `/dashboard`

3. **Dashboard Page**
   - URL: http://localhost:3001/dashboard
   - Test: Verify dashboard loads (requires login)
   - Expected: Dashboard content visible

---

## Test Credentials (Auto-generated)

The test script uses unique credentials:
- **Email:** `test_[timestamp]@example.com`
- **Password:** `test123456`

Each test run creates a new user to avoid conflicts.

---

## Troubleshooting

### Server Not Starting
```powershell
# Clean start
.\CLEAN_START.ps1
npm run dev
```

### Port Already in Use
```powershell
# Kill process on port 3001
netstat -ano | findstr :3001
taskkill /PID [PID_NUMBER] /F
```

### Database Connection Failed
1. Check `.env.local` exists
2. Verify `DATABASE_URL` is correct
3. Test connection: http://localhost:3001/api/db/test-connection

### Tests Fail
1. Ensure server is running (`npm run dev`)
2. Wait 10 seconds after starting server
3. Check server logs for errors

---

## Quick Test (Server Already Running)

If server is already running, just test:
```powershell
.\QUICK_TEST_LOCAL.ps1
```

---

## Expected Output

```
🧪 COMPLETE TEST SUITE: SIGNUP → LOGIN → DASHBOARD
======================================================================
Base URL: http://localhost:3001
Test Email: test_1234567890@example.com
Test Password: test123456
======================================================================

⏳ Waiting for server to be ready...
✅ Server is ready!

1️⃣  TESTING SIGNUP API
──────────────────────────────────────────────────
   ✅ Signup successful!
   📧 Email: test_1234567890@example.com
   🆔 User ID: abc123-def456-...

2️⃣  TESTING LOGIN API
──────────────────────────────────────────────────
   ✅ Login API call successful!

3️⃣  TESTING PAGES
──────────────────────────────────────────────────
   ✅ Signup Page: Accessible (200)
   ✅ Login Page: Accessible (200)
   ✅ Dashboard Page: Accessible (200)

4️⃣  TESTING DATABASE CONNECTION
──────────────────────────────────────────────────
   ✅ Database connection successful!

======================================================================
📋 TEST SUMMARY
======================================================================
Database Connection: ✅ PASS
Signup API:          ✅ PASS
Login API:            ✅ PASS
Pages Accessible:    ✅ PASS
======================================================================

✅ ALL TESTS PASSED!
```

---

## Next Steps After Tests Pass

1. ✅ Open http://localhost:3001/signup in browser
2. ✅ Create a test account
3. ✅ Login and verify dashboard loads
4. ✅ Test dashboard features (insert/fetch data)

