# LoanLens - Check for Errors and Issues

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  LoanLens Error Checker" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 1. Check .env.local
Write-Host "1️⃣  Checking .env.local..." -ForegroundColor Yellow
if (Test-Path ".env.local") {
    Write-Host "   ✅ .env.local exists" -ForegroundColor Green
    $envContent = Get-Content ".env.local" -Raw
    if ($envContent -match "DATABASE_URL") {
        Write-Host "   ✅ DATABASE_URL found" -ForegroundColor Green
    } else {
        Write-Host "   ❌ DATABASE_URL not found in .env.local" -ForegroundColor Red
    }
    if ($envContent -match "NEXTAUTH_SECRET") {
        Write-Host "   ✅ NEXTAUTH_SECRET found" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  NEXTAUTH_SECRET not found" -ForegroundColor Yellow
    }
} else {
    Write-Host "   ❌ .env.local NOT FOUND" -ForegroundColor Red
}
Write-Host ""

# 2. Check node_modules
Write-Host "2️⃣  Checking dependencies..." -ForegroundColor Yellow
if (Test-Path "node_modules") {
    Write-Host "   ✅ node_modules exists" -ForegroundColor Green
} else {
    Write-Host "   ❌ node_modules not found. Run: npm install" -ForegroundColor Red
}
Write-Host ""

# 3. Check port 3000
Write-Host "3️⃣  Checking port 3000..." -ForegroundColor Yellow
$port3000 = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
if ($port3000) {
    Write-Host "   ✅ Server is running on port 3000" -ForegroundColor Green
    Write-Host "   Process ID: $($port3000.OwningProcess)" -ForegroundColor Cyan
} else {
    Write-Host "   ⚠️  No server running on port 3000" -ForegroundColor Yellow
    Write-Host "   Run: .\START_SERVER.ps1" -ForegroundColor Cyan
}
Write-Host ""

# 4. Check for lock file
Write-Host "4️⃣  Checking for lock files..." -ForegroundColor Yellow
if (Test-Path ".next\dev\lock") {
    Write-Host "   ⚠️  Lock file exists (may cause issues)" -ForegroundColor Yellow
    Write-Host "   Run: Remove-Item .next\dev\lock -Force" -ForegroundColor Cyan
} else {
    Write-Host "   ✅ No lock file found" -ForegroundColor Green
}
Write-Host ""

# 5. Check Node.js processes
Write-Host "5️⃣  Checking Node.js processes..." -ForegroundColor Yellow
$nodeProcesses = Get-Process -Name node -ErrorAction SilentlyContinue
if ($nodeProcesses) {
    Write-Host "   Found $($nodeProcesses.Count) Node.js process(es):" -ForegroundColor Cyan
    $nodeProcesses | ForEach-Object {
        Write-Host "   - PID: $($_.Id), CPU: $([math]::Round($_.CPU, 2))s" -ForegroundColor Gray
    }
} else {
    Write-Host "   ⚠️  No Node.js processes running" -ForegroundColor Yellow
}
Write-Host ""

# 6. Test API endpoint (if server is running)
if ($port3000) {
    Write-Host "6️⃣  Testing API endpoints..." -ForegroundColor Yellow
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3000/api/auth/providers" -Method GET -UseBasicParsing -TimeoutSec 5 -ErrorAction Stop
        Write-Host "   ✅ API is responding (Status: $($response.StatusCode))" -ForegroundColor Green
    } catch {
        Write-Host "   ❌ API not responding: $($_.Exception.Message)" -ForegroundColor Red
    }
    Write-Host ""
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Check Complete" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

