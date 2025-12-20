# Install new dependencies for signup API
# This installs pg and bcrypt

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Installing Dependencies" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Installing:" -ForegroundColor Yellow
Write-Host "  - pg (PostgreSQL driver)" -ForegroundColor Cyan
Write-Host "  - bcrypt (Password hashing)" -ForegroundColor Cyan
Write-Host "  - @types/pg (TypeScript types)" -ForegroundColor Cyan
Write-Host "  - @types/bcrypt (TypeScript types)" -ForegroundColor Cyan
Write-Host ""

npm install

Write-Host ""
Write-Host "✅ Dependencies installed!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. Test signup API: npm run dev" -ForegroundColor Cyan
Write-Host "  2. Visit: http://localhost:3000/signup" -ForegroundColor Cyan

