@echo off
REM Run Tests - Simple Batch File
REM Double-click this file or run from command prompt

cd /d "C:\Users\MYPC\Desktop\loan_lens"

echo ========================================
echo LoanLens - Start Server ^& Test
echo ========================================
echo.
echo Project Path: C:\Users\MYPC\Desktop\loan_lens
echo.

echo Cleaning up old processes...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 >nul

echo ✅ Cleanup complete
echo.

echo 🚀 Starting Next.js server on http://localhost:3001...
echo.

start "LoanLens Server" cmd /k "cd /d C:\Users\MYPC\Desktop\loan_lens && npm run dev"

echo ⏳ Waiting for server to start (10 seconds)...
timeout /t 10 >nul

echo.
echo 🧪 Running tests...
echo.

cd /d "C:\Users\MYPC\Desktop\loan_lens"
node test-signup-login-dashboard.js

echo.
echo ========================================
echo Test Complete!
echo ========================================
echo.
echo 📝 Server Status:
echo    Server is running in new window
echo    Access at: http://localhost:3001
echo.
echo 🔗 Quick Links:
echo    Signup:   http://localhost:3001/signup
echo    Login:   http://localhost:3001/login
echo    Dashboard: http://localhost:3001/dashboard
echo.
echo ✅ Tests complete! Check server window for status.
echo.
pause

