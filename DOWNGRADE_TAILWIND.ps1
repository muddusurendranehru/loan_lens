# Downgrade Tailwind from v4 to v3
# This is needed to use @tailwind directives

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Downgrading Tailwind CSS v4 → v3" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

cd C:\Users\MYPC\Desktop\loan_lens

Write-Host "1️⃣  Removing Tailwind v4 packages..." -ForegroundColor Yellow
npm uninstall tailwindcss @tailwindcss/postcss

Write-Host ""
Write-Host "2️⃣  Installing Tailwind v3..." -ForegroundColor Yellow
npm install -D tailwindcss@^3.4.0 postcss autoprefixer

Write-Host ""
Write-Host "✅ Done! Tailwind v3 installed." -ForegroundColor Green
Write-Host ""
Write-Host "📋 Your setup:" -ForegroundColor Cyan
Write-Host "   • globals.css: @tailwind directives ✓" -ForegroundColor White
Write-Host "   • postcss.config.mjs: v3 config ✓" -ForegroundColor White
Write-Host "   • tailwind.config.js: v3 config ✓" -ForegroundColor White
Write-Host ""
Write-Host "🚀 Restart your server:" -ForegroundColor Yellow
Write-Host "   .\TEST_LOCAL.ps1" -ForegroundColor Cyan
Write-Host ""

