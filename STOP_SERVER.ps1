# LoanLens - Stop Development Server

Write-Host "🛑 Stopping LoanLens server..." -ForegroundColor Yellow

# Stop all Node.js processes
$nodeProcesses = Get-Process -Name node -ErrorAction SilentlyContinue
if ($nodeProcesses) {
    Write-Host "Found $($nodeProcesses.Count) Node.js process(es), stopping..." -ForegroundColor Yellow
    Stop-Process -Name node -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 2
    Write-Host "✅ All Node.js processes stopped" -ForegroundColor Green
} else {
    Write-Host "⚠️  No Node.js processes found" -ForegroundColor Yellow
}

# Remove lock file
if (Test-Path ".next\dev\lock") {
    Remove-Item ".next\dev\lock" -Force -ErrorAction SilentlyContinue
    Write-Host "✅ Lock file removed" -ForegroundColor Green
}

Write-Host ""
Write-Host "✅ Server stopped successfully" -ForegroundColor Green

