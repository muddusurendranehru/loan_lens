@echo off
echo ========================================
echo Pushing LoanLens to GitHub
echo ========================================
echo.

cd C:\Users\MYPC\Desktop\loan_lens

echo 1. Checking git status...
git status
echo.

echo 2. Adding all files...
git add .
echo.

echo 3. Committing changes...
git commit -m "Update LoanLens: HOMA Clinic EBITDA Tracker"
echo.

echo 4. Pushing to GitHub...
git push -u origin main
echo.

if %ERRORLEVEL% EQU 0 (
    echo Successfully pushed to GitHub!
    echo Repository: https://github.com/muddusurendranehru/loan_lens
) else (
    echo Push failed. Check authentication or try manually.
)

echo.
echo Done!
pause


