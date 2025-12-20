# Clean Start Script for LoanLens
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "LoanLens - Clean Start" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Navigate to project
Set-Location "C:\Users\MYPC\Desktop\loan_lens"

# Kill any existing Node processes
Write-Host "Cleaning up old processes..." -ForegroundColor Yellow
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

# Remove lock file
Remove-Item -Path ".next\dev\lock" -ErrorAction SilentlyContinue

Write-Host "✅ Cleanup complete" -ForegroundColor Green
Write-Host ""
Write-Host "Starting server on http://localhost:3000" -ForegroundColor Cyan
Write-Host ""

# Start server
npm run dev
