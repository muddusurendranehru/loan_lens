# Quick Local Test - Just run tests (assumes server is running)
Write-Host "🧪 Running Local Tests..." -ForegroundColor Cyan
Write-Host ""

Set-Location "C:\Users\MYPC\Desktop\loan_lens"

node test-signup-login-dashboard.js

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ All tests passed!" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "❌ Tests failed. Make sure server is running:" -ForegroundColor Red
    Write-Host "   npm run dev" -ForegroundColor Yellow
}

