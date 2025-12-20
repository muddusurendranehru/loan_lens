@echo off
title LoanLens - Start Server and Test Signup
color 0A

echo ================================================
echo   LoanLens Pro - Start Server + Test Signup
echo ================================================
echo.

cd /d "%~dp0"

echo [1/3] Starting Next.js development server...
echo.
start "LoanLens Server" cmd /k "npm run dev"

echo Waiting 15 seconds for server to start...
timeout /t 15 /nobreak >nul

echo.
echo [2/3] Server should be running now!
echo.
echo [3/3] Testing signup...
echo.

node test-signup-simple.js

echo.
echo ================================================
echo   Next Steps:
echo ================================================
echo   1. Server is running in a new window
echo   2. Open browser: http://localhost:3000/signup
echo   3. Test with email + password
echo ================================================
echo.

pause

