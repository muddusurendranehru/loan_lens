# Start Development Server
# Always runs from correct directory

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Starting LoanLens Development Server" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Navigate to project directory
Set-Location "C:\Users\MYPC\Desktop\loan_lens"

Write-Host "Current directory: $(Get-Location)" -ForegroundColor Green
Write-Host ""
Write-Host "Starting server..." -ForegroundColor Yellow
Write-Host "Server will be available at: http://localhost:3000" -ForegroundColor Cyan
Write-Host ""

# Start Next.js dev server
npm run dev
