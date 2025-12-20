@echo off
echo ========================================
echo Testing Signup and Login Locally
echo ========================================
echo.

cd /d "%~dp0\loan_lens"

echo Checking if server is running...
timeout /t 2 >nul

echo.
echo Testing Signup and Login APIs...
echo.

node test-signup-login-local.js

echo.
echo ========================================
echo Manual Testing:
echo ========================================
echo.
echo 1. Signup Page:
echo    http://localhost:3001/signup
echo.
echo 2. Login Page:
echo    http://localhost:3001/login
echo.
echo 3. After login, you should be redirected to:
echo    http://localhost:3001/dashboard
echo.
echo Press any key to exit...
pause >nul

