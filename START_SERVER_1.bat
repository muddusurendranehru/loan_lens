@echo off
cd /d C:\Users\MYPC\Desktop\loan_lens
echo ========================================
echo Starting LoanLens Server (Frontend + Backend)
echo ========================================
echo.
echo Current Directory: %CD%
echo Server will start at: http://localhost:3000
echo.
echo Press Ctrl+C to stop
echo.
call npm run dev

