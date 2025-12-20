# Quick Test - Server is Running
# Run this in a NEW PowerShell window

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Quick Test - Server Running" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$baseUrl = "http://localhost:3000"

Write-Host "1️⃣  Testing Backend API..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/db/test-connection" -Method GET -UseBasicParsing -TimeoutSec 5
    Write-Host "   ✅ Backend API: Working!" -ForegroundColor Green
    Write-Host "   Response: $($response.Content)" -ForegroundColor White
} catch {
    Write-Host "   ❌ Backend API: Failed" -ForegroundColor Red
    Write-Host "   Error: $_" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "2️⃣  Opening Frontend..." -ForegroundColor Yellow
Start-Process $baseUrl
Write-Host "   ✅ Browser opened!" -ForegroundColor Green

Write-Host ""
Write-Host "3️⃣  Test URLs:" -ForegroundColor Yellow
Write-Host "   • Home: $baseUrl" -ForegroundColor Cyan
Write-Host "   • Login: $baseUrl/login" -ForegroundColor Cyan
Write-Host "   • Dashboard: $baseUrl/dashboard" -ForegroundColor Cyan

Write-Host ""
Write-Host "📋 Login Credentials:" -ForegroundColor Yellow
Write-Host "   Email: admin@homa.clinic" -ForegroundColor White
Write-Host "   Password: securepassword123" -ForegroundColor White

Write-Host ""
Write-Host "✅ All tests complete!" -ForegroundColor Green

