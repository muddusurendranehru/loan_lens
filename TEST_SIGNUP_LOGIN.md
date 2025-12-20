# Local Signup and Login Testing Guide

## 🧪 Automated Testing

### Run Test Script

```bash
# Option 1: Direct node command
node test-signup-login-local.js

# Option 2: Use batch script
test-signup-login.bat
```

### What the Test Does

1. **Tests Signup API** (`POST /api/auth/signup`)
   - Creates a test user with timestamped email
   - Verifies user creation
   - Checks for error handling

2. **Tests Login API** (`POST /api/auth/callback/credentials`)
   - Attempts to authenticate with created user
   - Verifies NextAuth credentials flow

3. **Tests Page Accessibility**
   - Checks `/signup` page loads
   - Checks `/login` page loads

---

## 🔗 Manual Testing URLs

### 1. Signup Page
**URL:** `http://localhost:3001/signup`

**Steps:**
1. Fill in Email
2. Enter Password (min 6 characters)
3. Confirm Password
4. Click "Sign Up"

**Expected Result:**
- ✅ Success: Redirects to `/login`
- ❌ Error: Shows error message (email exists, validation failed, etc.)

### 2. Login Page
**URL:** `http://localhost:3001/login`

**Steps:**
1. Enter registered email
2. Enter password
3. Click "Log In"

**Expected Result:**
- ✅ Success: Redirects to `/dashboard`
- ❌ Error: Shows "Invalid email or password"

### 3. Dashboard (Protected Route)
**URL:** `http://localhost:3001/dashboard`

**Expected Behavior:**
- ✅ If logged in: Shows dashboard
- ❌ If not logged in: Redirects to `/login?callbackUrl=/dashboard`

---

## 📋 Test Credentials

The test script generates unique credentials:
- **Email:** `test_<timestamp>@example.com`
- **Password:** `test123456`
- **Phone:** `9876543210`

For manual testing, use any email/password combination.

---

## ✅ Test Checklist

### Signup Flow
- [ ] Signup page loads correctly
- [ ] Email validation works
- [ ] Password validation works (min 6 chars)
- [ ] Confirm password validation works
- [ ] Success: User created and redirected to login
- [ ] Error: Duplicate email shows error
- [ ] Error: Phone constraint handled (if applicable)

### Login Flow
- [ ] Login page loads correctly
- [ ] Valid credentials: Redirects to dashboard
- [ ] Invalid email: Shows error
- [ ] Invalid password: Shows error
- [ ] Empty fields: Shows validation error

### Protected Routes
- [ ] `/dashboard` requires authentication
- [ ] Redirects to login if not authenticated
- [ ] Returns to original page after login
- [ ] `/login` and `/signup` redirect to dashboard if already logged in

---

## 🐛 Common Issues

### Issue: "Phone is required" error
**Solution:**
- The API now handles this with error message
- Check if database allows NULL or empty string for phone
- Update schema if needed: `ALTER TABLE users ALTER COLUMN phone DROP NOT NULL;`

### Issue: "Email already exists"
**Solution:**
- Use a different email
- Or delete the test user from database

### Issue: Login redirects but dashboard shows error
**Solution:**
- Check NextAuth configuration
- Verify session is being created
- Check browser cookies

### Issue: Server not running
**Solution:**
```bash
cd loan_lens
npm run dev
```

---

## 📊 Expected API Responses

### Signup Success
```json
{
  "success": true,
  "user": {
    "id": "uuid-here",
    "email": "test@example.com",
    "phone": "9876543210"
  }
}
```

### Signup Error (Email exists)
```json
{
  "error": "Email already exists"
}
```

### Signup Error (Phone required)
```json
{
  "error": "Phone is required"
}
```

### Login Success
- Redirects to `/dashboard`
- Sets authentication cookie

### Login Error
```json
{
  "error": "Invalid email or password"
}
```

---

## 🔍 Debugging Tips

1. **Check Server Logs:**
   - Watch terminal for error messages
   - Look for database connection issues
   - Check API route errors

2. **Check Browser Console:**
   - Open DevTools (F12)
   - Check Network tab for API calls
   - Look for JavaScript errors

3. **Check Database:**
   ```sql
   -- View all users
   SELECT id, email, phone, created_at FROM users;
   
   -- Check specific user
   SELECT * FROM users WHERE email = 'test@example.com';
   ```

4. **Verify Environment Variables:**
   - Check `.env.local` has `DATABASE_URL`
   - Check `NEXTAUTH_SECRET` is set
   - Check `NEXTAUTH_URL` is correct

---

## ✅ Success Criteria

All tests pass when:
- ✅ Signup creates user successfully
- ✅ Login authenticates successfully
- ✅ Protected routes require authentication
- ✅ Error messages display correctly
- ✅ Redirects work as expected

---

**Last Updated:** Current Date  
**Server URL:** http://localhost:3001

