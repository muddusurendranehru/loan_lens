# LOAN LENS - Project Structure

## Directory Structure

```
loan_lens/
├── src/
│   ├── app/
│   │   ├── login/
│   │   │   └── page.tsx        ← Login form (email, password)
│   │   ├── signup/
│   │   │   └── page.tsx        ← Signup form (email, password, confirm password)
│   │   ├── dashboard/
│   │   │   └── page.tsx        ← Protected page (requires auth)
│   │   └── api/
│   │       └── auth/
│   │           └── [...nextauth]/
│   │               └── route.ts ← NextAuth configuration
│   ├── middleware.ts            ← Protects /dashboard route
│   └── lib/
│       ├── db.ts                ← Database connection (Neon PostgreSQL)
│       ├── schema.sql           ← Database schema
│       └── init-db.ts           ← Database initialization
├── .env.local                   ← Environment variables (DATABASE_URL, JWT_SECRET, etc.)
├── package.json                 ← Dependencies
└── PROJECT_RULES.md             ← Complete project rules document
```

## Key Files

### Authentication Pages

1. **`src/app/login/page.tsx`**
   - Fields: Email, Password
   - Redirects to `/dashboard` on success
   - Uses NextAuth `signIn` function

2. **`src/app/signup/page.tsx`**
   - Fields: Email, Password, Confirm Password
   - Creates new user account
   - Redirects to `/login` after signup

3. **`src/app/dashboard/page.tsx`**
   - Protected page (requires authentication)
   - Shows business cashflow tracker
   - Upload bank statements
   - View transactions and EBITDA data
   - Logout button

### API Routes

- **`src/app/api/auth/[...nextauth]/route.ts`**
  - NextAuth configuration
  - Credentials provider
  - JWT token generation

### Middleware

- **`src/middleware.ts`**
  - Protects `/dashboard` route
  - Redirects unauthenticated users to `/login`
  - Redirects authenticated users away from `/login` and `/signup`

### Database

- **`src/lib/db.ts`**
  - Neon PostgreSQL connection
  - Database utility functions

- **`src/lib/schema.sql`**
  - Database schema
  - Tables: `users`, `loan_emis`, `transactions`
  - All tables use UUID primary keys

## Environment Variables

Required in `.env.local`:
- `DATABASE_URL` - Neon PostgreSQL connection string
- `JWT_SECRET` - JWT token secret
- `NEXTAUTH_SECRET` - NextAuth secret
- `NEXTAUTH_URL` - Application URL (http://localhost:3000)

## Running the Project

1. Install dependencies: `npm install`
2. Set up `.env.local` with required variables
3. Start development server: `npm run dev`
4. Access at: http://localhost:3000

## Routes

- `/` - Home page
- `/login` - Login page
- `/signup` - Signup page
- `/dashboard` - Protected dashboard (requires auth)
- `/api/auth/*` - Authentication API routes
- `/api/db/*` - Database API routes
- `/api/parse/*` - File parsing API routes
- `/api/dashboard/*` - Dashboard data API routes

