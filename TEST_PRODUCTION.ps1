# Test Production Signup API
# Run this to diagnose the production error

$baseUrl = "https://loan-lens-bm36.onrender.com"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Production API Diagnostics" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Test 1: Check Schema
Write-Host "1. Checking database schema..." -ForegroundColor Yellow
try {
    $schemaResponse = Invoke-RestMethod -Uri "$baseUrl/api/db/check-schema" -Method GET
    Write-Host "✅ Schema check successful" -ForegroundColor Green
    $schemaResponse | ConvertTo-Json -Depth 5
} catch {
    Write-Host "❌ Schema check failed: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 2: Test Signup
Write-Host "2. Testing signup API..." -ForegroundColor Yellow
$testEmail = "test-$(Get-Date -Format 'yyyyMMddHHmmss')@example.com"
$testPassword = "test123456"

$body = @{
    email = $testEmail
    password = $testPassword
} | ConvertTo-Json

try {
    $signupResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/signup" -Method POST -Body $body -ContentType "application/json"
    Write-Host "✅ Signup successful!" -ForegroundColor Green
    $signupResponse | ConvertTo-Json
} catch {
    Write-Host "❌ Signup failed" -ForegroundColor Red
    Write-Host "Status: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    try {
        $errorStream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($errorStream)
        $errorBody = $reader.ReadToEnd()
        Write-Host "Error details:" -ForegroundColor Red
        $errorBody | ConvertFrom-Json | ConvertTo-Json -Depth 3
    } catch {
        Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    }
}
Write-Host ""

# Test 3: Test Duplicate Email
Write-Host "3. Testing duplicate email (should return 409)..." -ForegroundColor Yellow
try {
    $duplicateResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/signup" -Method POST -Body $body -ContentType "application/json"
    Write-Host "⚠️  Duplicate email not caught (unexpected)" -ForegroundColor Yellow
} catch {
    if ($_.Exception.Response.StatusCode.value__ -eq 409) {
        Write-Host "✅ Duplicate email correctly rejected (409)" -ForegroundColor Green
    } else {
        Write-Host "❌ Unexpected error: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    }
}
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Diagnostics Complete" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

