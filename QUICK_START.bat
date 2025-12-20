@echo off
REM Quick Start - Simplest way to test
REM Just double-click this file!

cd /d "C:\Users\MYPC\Desktop\loan_lens"

echo Starting server and tests...
echo.

start "LoanLens Server" cmd /k "cd /d C:\Users\MYPC\Desktop\loan_lens && npm run dev"

timeout /t 10 >nul

cd /d "C:\Users\MYPC\Desktop\loan_lens"
node test-signup-login-dashboard.js

echo.
echo Done! Server is running in the other window.
echo Open: http://localhost:3001
pause

