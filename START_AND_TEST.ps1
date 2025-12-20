# Start Server and Run Complete Tests
# This script starts the Next.js server and runs signup/login/dashboard tests
# Usage: Right-click → Run with PowerShell, or: powershell -ExecutionPolicy Bypass -File "C:\Users\MYPC\Desktop\loan_lens\START_AND_TEST.ps1"

# Set execution policy for this session
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process -Force

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "LoanLens - Start Server & Test" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Full path to project
$projectPath = "C:\Users\MYPC\Desktop\loan_lens"

# Navigate to project
Set-Location $projectPath
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
Write-Host "   (Server runs on port 3001 as configured in package.json)" -ForegroundColor Gray
Write-Host ""

$serverJob = Start-Job -ScriptBlock {
    Set-Location $using:projectPath
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

# Keep server running
Write-Host "Server will continue running. Press Ctrl+C to stop." -ForegroundColor Gray
Write-Host ""

# Wait for user to stop
try {
    Wait-Job -Job $serverJob | Out-Null
} catch {
    Write-Host "Server stopped." -ForegroundColor Yellow
    Stop-Job -Job $serverJob -ErrorAction SilentlyContinue
    Remove-Job -Job $serverJob -ErrorAction SilentlyContinue
}

