# Start Server and Test Full Flow

## Quick Start

### 1. Start the Server

```bash
npm run dev
```

Server will start at: **http://localhost:3000**

### 2. Test Flow in Browser

1. **Signup**: http://localhost:3000/signup
   - Enter: email, password, confirm password
   - Click "Sign Up"
   - Should redirect to `/login`

2. **Login**: http://localhost:3000/login
   - Enter: email, password
   - Click "Log In"
   - Should redirect to `/dashboard`

3. **Dashboard**: http://localhost:3000/dashboard
   - Upload Excel file or
   - Use API to add monthly data
   - View cashflow summary

### 3. Or Run Test Script

```bash
node test-full-flow.js
```

This will simulate:
- Signup (create user)
- Login (verify password)
- Add December 2024 data
- Display results

## Server Status

- Frontend: http://localhost:3000
- API Routes: http://localhost:3000/api/*
- Signup API: http://localhost:3000/api/auth/signup
- Login: NextAuth handles this
- Dashboard: http://localhost:3000/dashboard

