# Push to GitHub - PowerShell Safe Version
# This script avoids && syntax issues

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Pushing LoanLens to GitHub" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

cd C:\Users\MYPC\Desktop\loan_lens

# Check if git is available
try {
    $gitVersion = git --version
    Write-Host "✅ Git found: $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Git not found! Please install Git first." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "1️⃣  Checking git status..." -ForegroundColor Yellow
git status

Write-Host ""
Write-Host "2️⃣  Adding all files..." -ForegroundColor Yellow
git add .

Write-Host ""
Write-Host "3️⃣  Committing changes..." -ForegroundColor Yellow
$commitMessage = "Update LoanLens: HOMA Clinic EBITDA Tracker"
git commit -m $commitMessage

if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  No changes to commit (or commit failed)" -ForegroundColor Yellow
    Write-Host "   This is OK if everything is already committed" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "4️⃣  Pushing to GitHub..." -ForegroundColor Yellow
git push -u origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Successfully pushed to GitHub!" -ForegroundColor Green
    Write-Host "   Repository: https://github.com/muddusurendranehru/loan_lens" -ForegroundColor Cyan
} else {
    Write-Host ""
    Write-Host "❌ Push failed. Common issues:" -ForegroundColor Red
    Write-Host "   - Not authenticated (use: git config --global user.name 'Your Name')" -ForegroundColor Yellow
    Write-Host "   - Not authenticated (use: git config --global user.email 'your@email.com')" -ForegroundColor Yellow
    Write-Host "   - Need to set up GitHub authentication (Personal Access Token)" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "   Try: git push -u origin main" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "Done!" -ForegroundColor Green


