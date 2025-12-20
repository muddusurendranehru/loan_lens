@echo off
echo ========================================
echo Starting LoanLens Server
echo (Frontend + Backend on ONE server)
echo ========================================
echo.

cd /d "%~dp0"
cd loan_lens

echo Cleaning up...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 1 >nul

echo Starting server...
npm run dev

