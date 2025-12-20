# Quick Setup Script for LoanLens
# Run this after cloning the repository

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "LoanLens - Quick Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if .env.local exists
if (-not (Test-Path ".env.local")) {
    Write-Host "⚠️  .env.local not found!" -ForegroundColor Yellow
    Write-Host "Creating template..." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Please edit .env.local with your credentials:" -ForegroundColor Yellow
    Write-Host "  - DATABASE_URL (from Neon Console)" -ForegroundColor Yellow
    Write-Host "  - NEXTAUTH_SECRET (generate with: openssl rand -base64 32)" -ForegroundColor Yellow
    Write-Host ""
    
    # Create template
    @"
# Database (Neon PostgreSQL)
DATABASE_URL=postgresql://neondb_owner:YOUR_PASSWORD@ep-icy-dream-ah5xlk96-pooler.c-3.us-east-1.aws.neon.tech/loan_lens?sslmode=require&channel_binding=require

# NextAuth
NEXTAUTH_SECRET=your-secret-key-here-min-32-chars
NEXTAUTH_URL=http://localhost:3000

# JWT (optional)
JWT_SECRET=your-jwt-secret-here
"@ | Out-File -FilePath ".env.local" -Encoding UTF8
    
    Write-Host "✅ Template created. Please edit .env.local now!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Press any key to continue after editing .env.local..." -ForegroundColor Yellow
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Installing dependencies..." -ForegroundColor Cyan
    npm install
    Write-Host ""
}

# Check database connection
Write-Host "🔍 Checking database connection..." -ForegroundColor Cyan
node ensure-database.js
Write-Host ""

# Start server
Write-Host "🚀 Starting development server..." -ForegroundColor Cyan
Write-Host "Server will be available at: http://localhost:3000" -ForegroundColor Green
Write-Host ""
npm run dev

