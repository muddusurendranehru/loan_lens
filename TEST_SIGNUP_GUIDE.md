# 🧪 Test Signup Locally - Quick Guide

## **Step 1: Start the Server**

Open a terminal and run:
```bash
cd loan_lens
npm run dev
```

Wait for: `✓ Ready on http://localhost:3000` (or 3001)

## **Step 2: Test Signup**

### **Option A: Browser Test (Recommended)**

1. Open browser: `http://localhost:3000/signup` (or `http://localhost:3001/signup`)
2. Enter:
   - **Email**: `test@loanlens.com`
   - **Password**: `password123`
3. Click **"Sign Up"**
4. ✅ Should redirect to `/login` if successful

### **Option B: Automated Test**

In a **new terminal** (keep server running):
```bash
cd loan_lens
node test-signup-simple.js
```

## **Expected Results**

### ✅ **Success:**
- Server responds with `{ "success": true }`
- User created in database
- Redirect to login page
- Can then login and access dashboard

### ❌ **Common Errors:**

**"fetch failed" / Connection refused**
→ Server not running. Start with `npm run dev`

**"Email already exists"**
→ User already registered. Try different email.

**"null value in column..."**
→ Database schema issue. Check `.env.local` has correct `DATABASE_URL`.

**"Operation timed out"**
→ Network/database issue. Check Neon connection.

## **Verify in Database**

After successful signup, check Neon Console:
- Tables → `users` → Should see new user
- Email should match what you entered
- Password should be hashed (starts with `$2b$`)

