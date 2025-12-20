# Quick Backend Test Script
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Testing Backend APIs" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$baseUrl = "http://localhost:3000"

Write-Host "1️⃣  Testing Database Connection..." -ForegroundColor Yellow
try {
    $signupResponse = Invoke-WebRequest -Uri "$baseUrl/api/auth/signup" -Method POST -Body $signupBody -ContentType "application/json" -UseBasicParsing
    Write-Host "✅ Signup: $($signupResponse.StatusCode)" -ForegroundColor Green
    Write-Host "   Response: $($signupResponse.Content)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Signup failed: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "   Error: $responseBody" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "2. Testing Login API (NextAuth)..." -ForegroundColor Yellow
Write-Host "   (Use browser: http://localhost:3000/login)" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Testing Dashboard API..." -ForegroundColor Yellow
Write-Host "   (Requires authentication)" -ForegroundColor Gray
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Backend test complete!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
