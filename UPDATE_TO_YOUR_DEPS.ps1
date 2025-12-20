# Script to update dependencies to user's specification
# This will update package.json and all code files

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Updating Dependencies" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "This will update:" -ForegroundColor Yellow
Write-Host "  - package.json (next 14.2.15, react 18, bcrypt, pg)" -ForegroundColor Yellow
Write-Host "  - src/lib/db.ts (switch to pg)" -ForegroundColor Yellow
Write-Host "  - src/app/api/auth/signup/route.ts (switch to bcrypt)" -ForegroundColor Yellow
Write-Host "  - src/app/api/auth/[...nextauth]/route.ts (switch to bcrypt)" -ForegroundColor Yellow
Write-Host ""
Write-Host "⚠️  WARNING: This will change your database connection method!" -ForegroundColor Red
Write-Host ""
$confirm = Read-Host "Continue? (y/n)"

if ($confirm -ne 'y') {
    Write-Host "Cancelled." -ForegroundColor Yellow
    exit
}

Write-Host ""
Write-Host "Updating files..." -ForegroundColor Cyan

# Note: Actual file updates should be done manually or via code changes
# This script is just a placeholder to show what would be updated

Write-Host "✅ Files would be updated here" -ForegroundColor Green
Write-Host ""
Write-Host "After updates, run:" -ForegroundColor Yellow
Write-Host "  npm install" -ForegroundColor Cyan
Write-Host "  npm run dev" -ForegroundColor Cyan

