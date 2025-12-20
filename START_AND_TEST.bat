@echo off
echo ========================================
echo LoanLens - Start Server and Test
echo ========================================
echo.

cd C:\Users\MYPC\Desktop\loan_lens

echo Cleaning up...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 >nul

echo Starting Next.js Server...
echo.
echo This server handles BOTH frontend and backend!
echo.
echo Frontend: http://localhost:3000
echo Backend:  http://localhost:3000/api/*
echo.
echo Press Ctrl+C to stop
echo.

npm run dev

