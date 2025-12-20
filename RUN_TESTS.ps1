# Run Tests - Full Path Version
# Usage: Right-click → Run with PowerShell, or run from PowerShell with full path

# Set execution policy for this session
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process -Force

# Full path to project
$projectPath = "C:\Users\MYPC\Desktop\loan_lens"

# Navigate to project
Set-Location $projectPath

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "LoanLens - Start Server & Test" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Project Path: $projectPath" -ForegroundColor Gray
Write-Host ""

# Clean up old processes
Write-Host "Cleaning up old processes..." -ForegroundColor Yellow
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

# Remove lock file
Remove-Item -Path "$projectPath\.next\dev\lock" -ErrorAction SilentlyContinue

Write-Host "✅ Cleanup complete" -ForegroundColor Green
Write-Host ""

# Check if .env.local exists
if (-not (Test-Path "$projectPath\.env.local")) {
    Write-Host "⚠️  WARNING: .env.local not found!" -ForegroundColor Yellow
    Write-Host "   Please create .env.local with DATABASE_URL and other required variables" -ForegroundColor Yellow
    Write-Host ""
}

# Start server in background
Write-Host "🚀 Starting Next.js server on http://localhost:3001..." -ForegroundColor Cyan
Write-Host ""

$serverJob = Start-Job -ScriptBlock {
    Set-Location "C:\Users\MYPC\Desktop\loan_lens"
    npm run dev
}

# Wait for server to start
Write-Host "⏳ Waiting for server to start (10 seconds)..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Run tests
Write-Host ""
Write-Host "🧪 Running tests..." -ForegroundColor Cyan
Write-Host ""

& node "$projectPath\test-signup-login-dashboard.js"

$testResult = $LASTEXITCODE

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Test Complete!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📝 Server Status:" -ForegroundColor Yellow
Write-Host "   Server is running in background job" -ForegroundColor Gray
Write-Host "   Access at: http://localhost:3001" -ForegroundColor Gray
Write-Host ""
Write-Host "🔗 Quick Links:" -ForegroundColor Yellow
Write-Host "   Signup:   http://localhost:3001/signup" -ForegroundColor White
Write-Host "   Login:   http://localhost:3001/login" -ForegroundColor White
Write-Host "   Dashboard: http://localhost:3001/dashboard" -ForegroundColor White
Write-Host ""
Write-Host "🛑 To stop the server:" -ForegroundColor Yellow
Write-Host "   Stop-Job -Name $($serverJob.Name)" -ForegroundColor Gray
Write-Host "   Remove-Job -Name $($serverJob.Name)" -ForegroundColor Gray
Write-Host ""

if ($testResult -eq 0) {
    Write-Host "✅ All tests passed!" -ForegroundColor Green
} else {
    Write-Host "❌ Some tests failed. Check output above." -ForegroundColor Red
}

Write-Host ""
Write-Host "Press any key to continue..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

