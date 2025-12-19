# LoanLens - Test API Endpoints

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  LoanLens API Tester" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$baseUrl = "http://localhost:3000"

# Check if server is running
$port3000 = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
if (-not $port3000) {
    Write-Host "❌ Server is not running on port 3000" -ForegroundColor Red
    Write-Host "   Start server first: .\START_SERVER.ps1" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Server is running" -ForegroundColor Green
Write-Host ""

# Test 1: NextAuth Providers
Write-Host "1️⃣  Testing: GET /api/auth/providers" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/auth/providers" -Method GET -UseBasicParsing -TimeoutSec 5
    Write-Host "   ✅ Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "   Response: $($response.Content)" -ForegroundColor Gray
} catch {
    Write-Host "   ❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 2: CSRF Token
Write-Host "2️⃣  Testing: GET /api/auth/csrf" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/auth/csrf" -Method GET -UseBasicParsing -TimeoutSec 5
    Write-Host "   ✅ Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "   Response: $($response.Content)" -ForegroundColor Gray
} catch {
    Write-Host "   ❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 3: Session (should fail without auth)
Write-Host "3️⃣  Testing: GET /api/auth/session" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/auth/session" -Method GET -UseBasicParsing -TimeoutSec 5
    Write-Host "   ✅ Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "   Response: $($response.Content)" -ForegroundColor Gray
} catch {
    Write-Host "   ⚠️  Expected (no session): $($_.Exception.Message)" -ForegroundColor Yellow
}
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  API Tests Complete" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "💡 To test login:" -ForegroundColor Cyan
Write-Host "   Open: http://localhost:3000/login" -ForegroundColor White
Write-Host "   Use credentials from your database" -ForegroundColor White

