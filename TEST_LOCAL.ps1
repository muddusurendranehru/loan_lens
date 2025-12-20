# Test Locally - Start Server and Test Both Frontend & Backend
# Next.js runs BOTH frontend and backend on ONE server

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "LoanLens - Local Testing" -ForegroundColor Cyan
Write-Host "Frontend + Backend on ONE Server" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

cd C:\Users\MYPC\Desktop\loan_lens

# Cleanup first
Write-Host "🧹 Cleaning up old processes..." -ForegroundColor Yellow
Stop-Process -Name node -Force -ErrorAction SilentlyContinue
Remove-Item .next\dev\lock -Recurse -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

Write-Host ""
Write-Host "✅ Cleanup done!" -ForegroundColor Green
Write-Host ""
Write-Host "🚀 Starting Next.js Server..." -ForegroundColor Green
Write-Host "   This server handles:" -ForegroundColor Cyan
Write-Host "   • Frontend (React pages)" -ForegroundColor White
Write-Host "   • Backend (API routes)" -ForegroundColor White
Write-Host ""
Write-Host "📍 URLs:" -ForegroundColor Yellow
Write-Host "   Frontend: http://localhost:3000" -ForegroundColor Green
Write-Host "   Backend API: http://localhost:3000/api/*" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Test Commands (open in NEW PowerShell window):" -ForegroundColor Yellow
Write-Host "   # Test Backend API:" -ForegroundColor Cyan
Write-Host "   curl http://localhost:3000/api/db/test-connection" -ForegroundColor White
Write-Host ""
Write-Host "   # Test Frontend:" -ForegroundColor Cyan
Write-Host "   Start-Process http://localhost:3000" -ForegroundColor White
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

# Start the server
npm run dev

