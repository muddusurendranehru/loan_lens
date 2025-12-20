Write-Host "========================================" -ForegroundColor Cyan
Write-Host "LoanLens Pro - Local Testing" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$projectPath = "C:\Users\pc\Desktop\loan_lens\loan_lens"
Set-Location $projectPath

# 1. Check server status
Write-Host "[1] Checking server status..." -ForegroundColor Yellow
$conn = Test-NetConnection -ComputerName localhost -Port 3000 -WarningAction SilentlyContinue
if ($conn.TcpTestSucceeded) {
    Write-Host "   ✅ Server is RUNNING on http://localhost:3000" -ForegroundColor Green
} else {
    Write-Host "   ❌ Server is NOT running" -ForegroundColor Red
    Write-Host "   Start server: npm run dev" -ForegroundColor Yellow
}

Write-Host ""

# 2. Test Report API
Write-Host "[2] Testing Report API..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/report/cashflow?financial_year=2024-25" -Method Get
    Write-Host "   ✅ Report API working" -ForegroundColor Green
    Write-Host "   Total Inflow: ₹$($response.summary.total_inflow)" -ForegroundColor Cyan
    Write-Host "   Total Outflow: ₹$($response.summary.total_outflow)" -ForegroundColor Cyan
} catch {
    Write-Host "   ❌ Report API failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# 3. Test Database Connection
Write-Host "[3] Testing database connection..." -ForegroundColor Yellow
if (Test-Path "test-db-connection.js") {
    node test-db-connection.js
} else {
    Write-Host "   ⚠️  test-db-connection.js not found" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Testing complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan

