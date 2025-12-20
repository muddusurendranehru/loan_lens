# 🚀 LoanLens Setup Guide

## 📋 Prerequisites

- Node.js 18+ installed
- Git installed
- Neon PostgreSQL account (free tier works)

---

## 🔧 Step 1: Clone Repository

```bash
git clone https://github.com/muddusurendranehru/loan_lens.git
cd loan_lens
```

---

## 📦 Step 2: Install Dependencies

```bash
npm install
```

---

## 🔐 Step 3: Environment Variables

Create `.env.local` in the project root:

```env
# Database (Neon PostgreSQL)
DATABASE_URL=postgresql://neondb_owner:YOUR_PASSWORD@ep-icy-dream-ah5xlk96-pooler.c-3.us-east-1.aws.neon.tech/loan_lens?sslmode=require&channel_binding=require

# NextAuth
NEXTAUTH_SECRET=your-secret-key-here-min-32-chars
NEXTAUTH_URL=http://localhost:3000

# JWT (optional)
JWT_SECRET=your-jwt-secret-here

# Google Sheets API (optional - for Google Sheets upload)
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

**Get DATABASE_URL from:**
- Neon Console → Your Project → Connection String

**Generate NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

---

## 🗄️ Step 4: Setup Database

Run the schema SQL in Neon Console:

1. Go to Neon Console → SQL Editor
2. Copy contents from `src/lib/schema.sql`
3. Execute the SQL

Or use the verification script:
```bash
node ensure-database.js
```

---

## 👤 Step 5: Create First User

### Option A: Via API (Recommended)

```bash
# Start server first
npm run dev

# In another terminal, create user
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@homa.clinic","password":"securepassword123"}'
```

### Option B: Direct SQL (Neon Console)

```sql
INSERT INTO users (email, password, created_at)
VALUES (
  'admin@homa.clinic',
  '$2a$10$abcdefghijklmnopqrstuvwxyz123456789', -- Replace with bcrypt hash
  NOW()
);
```

**Generate bcrypt hash:**
```bash
node -e "const bcrypt=require('bcryptjs');bcrypt.hash('yourpassword',10).then(h=>console.log(h))"
```

---

## ▶️ Step 6: Start Development Server

### Windows (PowerShell)
```powershell
cd C:\Users\MYPC\Desktop\loan_lens
npm run dev
```

### Windows (Batch)
```batch
cd C:\Users\MYPC\Desktop\loan_lens
npm run dev
```

### Mac/Linux
```bash
cd ~/loan_lens
npm run dev
```

Server will start at: **http://localhost:3000**

---

## ✅ Step 7: Test Application

### 1. Test Frontend
- Open: http://localhost:3000
- Login: `admin@homa.clinic` / `securepassword123`

### 2. Test Backend API
```bash
# Test database connection
curl http://localhost:3000/api/db/test-connection

# Test signup
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123456"}'
```

### 3. Test Dashboard
- Login → Dashboard
- Upload Excel/CSV or Google Sheet URL
- Review detected transactions
- Save to database

---

## 🐛 Troubleshooting

### Port Already in Use
```powershell
# Kill process on port 3000
Stop-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess -Force
```

### Database Connection Failed
- Check `.env.local` exists
- Verify `DATABASE_URL` is correct
- Test connection in Neon Console

### Authentication Errors
- Verify `NEXTAUTH_SECRET` is set
- Check user exists in database
- Verify password hash matches

### Lock File Error
```powershell
Remove-Item -Recurse -Force .next\dev\lock -ErrorAction SilentlyContinue
npm run dev
```

---

## 📁 Project Structure

```
loan_lens/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   │   ├── [...nextauth]/route.ts  # NextAuth config
│   │   │   │   └── signup/route.ts         # User registration
│   │   │   ├── parse/
│   │   │   │   ├── upload/route.ts         # Parse Excel/Sheets
│   │   │   │   └── confirm/route.ts        # Save transactions
│   │   │   └── dashboard/
│   │   │       └── monthly/route.ts        # Monthly summary
│   │   ├── dashboard/page.tsx               # Main dashboard
│   │   ├── login/page.tsx                   # Login page
│   │   └── signup/page.tsx                  # Signup page
│   ├── lib/
│   │   ├── db.ts                            # Database connection
│   │   ├── schema.sql                       # Database schema
│   │   └── dateUtils.ts                     # Date utilities
│   └── middleware.ts                        # Auth middleware
├── .env.local                                # Environment variables
├── package.json
└── README.md
```

---

## 🚀 Quick Start Commands

```powershell
# Clone & Setup
git clone https://github.com/muddusurendranehru/loan_lens.git
cd loan_lens
npm install

# Create .env.local (copy from above)

# Start Server
npm run dev

# Test
Start-Process http://localhost:3000
```

---

## 📞 Support

- Database: Neon Console
- Issues: GitHub Issues
- Docs: See `README.md`

---

**Happy Coding! 🎉**

