Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Starting LoanLens Server" -ForegroundColor Cyan
Write-Host "(Frontend + Backend on ONE server)" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

cd C:\Users\MYPC\Desktop\loan_lens

# Quick cleanup before starting
Write-Host "Cleaning up..." -ForegroundColor Yellow
Stop-Process -Name node -Force -ErrorAction SilentlyContinue
Remove-Item .next\dev\lock -Recurse -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 1

Write-Host "Starting server..." -ForegroundColor Green
npm run dev

