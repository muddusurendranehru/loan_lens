# 🚀 Access Your LoanLens Pro Server

## Quick Access URLs

### Frontend Pages:
- **Home**: http://localhost:3000 (or http://localhost:3001)
- **Login**: http://localhost:3000/login
- **Signup**: http://localhost:3000/signup
- **Dashboard**: http://localhost:3000/dashboard

### API Endpoints:
- **Upload API**: http://localhost:3000/api/parse/upload
- **Report API**: http://localhost:3000/api/report/cashflow?financial_year=2024-25

---

## 🏃 Start Server

```powershell
cd C:\Users\pc\Desktop\loan_lens\loan_lens
npm run dev
```

**Or use script:**
```powershell
.\START_SERVER.bat
```

---

## ✅ Check Server Status

```powershell
# Check port 3000
Test-NetConnection -ComputerName localhost -Port 3000

# Check port 3001 (if 3000 is busy)
Test-NetConnection -ComputerName localhost -Port 3001
```

---

## 🔍 Which Port is Running?

Next.js will automatically use:
- Port **3000** (default) if available
- Port **3001** if 3000 is busy
- Port **3002** if both are busy
- etc.

Check the terminal output when you run `npm run dev` to see which port it's using!

---

## 🌐 Open in Browser

After server starts, open:
```
http://localhost:3000
```

If you see a port conflict, Next.js will show the actual port in the terminal.

