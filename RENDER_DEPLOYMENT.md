# Render Deployment Guide

## ✅ Code Pushed to GitHub
Repository: `https://github.com/muddusurendranehru/loan_lens.git`
Branch: `main`
Commit: `f340b40`

---

## 🚀 Deploy to Render

### Step 1: Create New Web Service on Render

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository:
   - Select: `muddusurendranehru/loan_lens`
   - Branch: `main`

### Step 2: Configure Build Settings

**Build Command:**
```bash
npm install && npm run build
```

**Start Command:**
```bash
npm start
```

**Environment:** `Node`

**Node Version:** `20.x` (or latest LTS)

### Step 3: Set Environment Variables

Add these in Render Dashboard → Environment:

**Required:**
```
DATABASE_URL=postgresql://neondb_owner:YOUR_PASSWORD@ep-icy-dream-ah5xlk96-pooler.c-3.us-east-1.aws.neon.tech/loan_lens?sslmode=require
```

```
NEXTAUTH_SECRET=your_secret_key_here_min_32_chars
```

```
NEXTAUTH_URL=https://your-app-name.onrender.com
```

**Optional (if using Google Sheets):**
```
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----
```

### Step 4: Deploy

1. Click **"Create Web Service"**
2. Render will automatically:
   - Clone your repo
   - Install dependencies
   - Build the app
   - Deploy it

### Step 5: Verify Deployment

1. Wait for build to complete (usually 5-10 minutes)
2. Check build logs for any errors
3. Visit your app URL: `https://your-app-name.onrender.com`

---

## 🔧 Render Configuration Summary

**Service Type:** Web Service  
**Build Command:** `npm install && npm run build`  
**Start Command:** `npm start`  
**Auto-Deploy:** Yes (on push to main branch)

---

## 📝 Important Notes

1. **First Deploy:** May take 10-15 minutes
2. **Cold Starts:** Free tier has ~30s cold start time
3. **Environment Variables:** Must be set before first deploy
4. **Database:** Make sure Neon database is accessible from Render
5. **Port:** Render sets `PORT` automatically (your `start` script uses `$PORT`)

---

## 🐛 Troubleshooting

**Build Fails:**
- Check build logs in Render dashboard
- Verify all dependencies in `package.json`
- Ensure Node version is compatible

**App Crashes:**
- Check runtime logs
- Verify `DATABASE_URL` is correct
- Ensure `NEXTAUTH_SECRET` is set (min 32 chars)
- Check `NEXTAUTH_URL` matches your Render URL

**Database Connection Issues:**
- Verify Neon database allows external connections
- Check `DATABASE_URL` format (postgresql:// or postgres://)
- Ensure SSL is enabled (`?sslmode=require`)

---

## ✅ Deployment Checklist

- [x] Code pushed to GitHub
- [ ] Render service created
- [ ] Environment variables set
- [ ] Build command configured
- [ ] Start command configured
- [ ] First deployment successful
- [ ] App accessible at Render URL
- [ ] Signup/Login tested
- [ ] Dashboard loads correctly
- [ ] Cashflow report works

---

**Your Render URL will be:** `https://your-app-name.onrender.com`

