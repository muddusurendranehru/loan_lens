# Clean Start Script - Fixes all common issues before starting

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "LoanLens - Clean Start" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Navigate to project
cd C:\Users\MYPC\Desktop\loan_lens

Write-Host "1️⃣  Killing stuck processes..." -ForegroundColor Yellow
# Kill the stuck process using port 3000 or 3001
Stop-Process -Id 1068 -ErrorAction SilentlyContinue
Write-Host "   ✅ Killed process 1068" -ForegroundColor Green

# Kill any other Node.js dev servers
taskkill /f /im node.exe 2>$null
Start-Sleep -Seconds 2
Write-Host "   ✅ Killed all Node.js processes" -ForegroundColor Green

Write-Host ""
Write-Host "2️⃣  Removing lock file..." -ForegroundColor Yellow
# Delete the lock file (if still stuck)
Remove-Item -Recurse -Force .next\dev\lock -ErrorAction SilentlyContinue
if (Test-Path ".next\dev\lock") {
    Write-Host "   ⚠️  Lock file still exists" -ForegroundColor Yellow
} else {
    Write-Host "   ✅ Lock file removed" -ForegroundColor Green
}

Write-Host ""
Write-Host "3️⃣  Removing stray package-lock.json..." -ForegroundColor Yellow
# Remove stray package-lock.json from user root
Remove-Item C:\Users\MYPC\package-lock.json -ErrorAction SilentlyContinue
if (Test-Path "C:\Users\MYPC\package-lock.json") {
    Write-Host "   ⚠️  Could not remove user root package-lock.json" -ForegroundColor Yellow
} else {
    Write-Host "   ✅ Removed stray package-lock.json" -ForegroundColor Green
}

Write-Host ""
Write-Host "4️⃣  Starting fresh server..." -ForegroundColor Yellow
Write-Host ""
Write-Host "🚀 Server starting on http://localhost:3000" -ForegroundColor Green
Write-Host "   (or http://localhost:3001 if 3000 is busy)" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Ctrl+C to stop" -ForegroundColor Yellow
Write-Host ""

# Start fresh
npm run dev

