@echo off
cd /d C:\Users\MYPC\Desktop\loan_lens
echo ========================================
echo Starting Frontend Server
echo ========================================
echo.
echo Frontend Pages:
echo   - http://localhost:3000/login
echo   - http://localhost:3000/signup
echo   - http://localhost:3000/dashboard
echo.
echo Backend APIs also available at:
echo   - http://localhost:3000/api/*
echo.
echo Press Ctrl+C to stop
echo.
call npm run dev

