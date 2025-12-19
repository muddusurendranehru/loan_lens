# 🛣️ LoanLens Routes Guide

## Current Route: `/login`

You're currently viewing the **Login Page** at `http://localhost:3000/login`

---

## 📋 Next.js Dev Overlay Menu Explained

The context menu you see shows:

### **Route: Static**
- **Meaning:** This page is statically rendered at build time
- **Type:** Client Component (`'use client'`)
- **File:** `src/app/login/page.tsx`

### **Bundler: Turbopack**
- **Meaning:** Next.js is using Turbopack (faster than Webpack)
- **Status:** ✅ Enabled (default in Next.js 14+)

### **Route Info** →
- Click to see detailed route information:
  - Route path
  - File location
  - Rendering type
  - Dependencies

### **Preferences** ⚙️
- Development settings
- Theme options
- Debugging tools

---

## 🗺️ All Available Routes

### **Frontend Pages (User-Facing)**

| Route | File | Type | Description |
|-------|------|------|-------------|
| `/` | `src/app/page.tsx` | Static | Home page (redirects to `/login` or `/dashboard`) |
| `/login` | `src/app/login/page.tsx` | Static | Login page (current page) |
| `/signup` | `src/app/signup/page.tsx` | Static | Sign up page |
| `/dashboard` | `src/app/dashboard/page.tsx` | Protected | Main dashboard (requires auth) |

### **Backend API Routes**

| Route | Method | File | Description |
|-------|--------|------|-------------|
| `/api/auth/[...nextauth]` | GET/POST | `src/app/api/auth/[...nextauth]/route.ts` | NextAuth authentication |
| `/api/db/test-connection` | GET | `src/app/api/db/test-connection/route.ts` | Test database connection |
| `/api/db/test` | GET | `src/app/api/db/test/route.ts` | Database schema test |
| `/api/db/test-insert-fetch` | GET | `src/app/api/db/test-insert-fetch/route.ts` | Test INSERT/FETCH operations |
| `/api/env/verify` | GET | `src/app/api/env/verify/route.ts` | Verify environment variables |
| `/api/parse/upload` | POST | `src/app/api/parse/upload/route.ts` | Upload & parse Excel/Google Sheets |
| `/api/parse/confirm` | POST | `src/app/api/parse/confirm/route.ts` | Save transactions to database |
| `/api/dashboard/months` | GET | `src/app/api/dashboard/months/route.ts` | Get monthly EMI summaries |
| `/api/dashboard/monthly` | GET | `src/app/api/dashboard/monthly/route.ts` | Get monthly EBITDA summary |

---

## 🔒 Route Protection

### **Protected Routes** (Require Authentication)
- `/dashboard` - Redirects to `/login` if not authenticated

### **Public Routes** (No Auth Required)
- `/login` - Login page
- `/signup` - Sign up page
- `/` - Home (redirects based on auth status)

### **Middleware Protection**
See `src/middleware.ts`:
- Protected paths: `/dashboard`
- Auth pages: `/login`, `/signup`
- Auto-redirects based on auth status

---

## 📍 Current Page Details

**Route:** `/login`
- **URL:** http://localhost:3000/login
- **Type:** Static (Client Component)
- **Purpose:** User authentication
- **Credentials:** admin@loanlens.com / securepassword123
- **After Login:** Redirects to `/dashboard`

---

## 🧭 Navigation Flow

```
/ (home)
  ↓
/login (if not authenticated)
  ↓
/dashboard (after login)
  ↓
  - Upload sheet → /api/parse/upload
  - Save transactions → /api/parse/confirm
  - View monthly data → /api/dashboard/monthly
```

---

## 💡 Quick Tips

1. **Right-click anywhere** on a page to see route info
2. **Route: Static** = Pre-rendered at build time (fast!)
3. **Route: Dynamic** = Rendered on each request
4. **Turbopack** = Faster bundler (Next.js 14+ default)

---

**You're currently on:** `/login` ✅

