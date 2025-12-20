# Open Frontend in Browser
# Run this in a SEPARATE PowerShell window while server is running

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Opening Frontend in Browser" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$url = "http://localhost:3000"

Write-Host "🌐 Opening browser..." -ForegroundColor Yellow
Write-Host "   URL: $url" -ForegroundColor Green
Write-Host ""

# Check if server is running
try {
    $response = Invoke-WebRequest -Uri $url -Method GET -UseBasicParsing -TimeoutSec 2
    Write-Host "✅ Server is running!" -ForegroundColor Green
    Start-Process $url
    Write-Host ""
    Write-Host "📋 Test these pages:" -ForegroundColor Yellow
    Write-Host "   • Login: $url/login" -ForegroundColor White
    Write-Host "   • Dashboard: $url/dashboard (after login)" -ForegroundColor White
} catch {
    Write-Host "❌ Server is NOT running!" -ForegroundColor Red
    Write-Host ""
    Write-Host "⚠️  Start the server first:" -ForegroundColor Yellow
    Write-Host "   Run: .\TEST_LOCAL.ps1" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "Done!" -ForegroundColor Green

