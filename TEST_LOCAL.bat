@echo off
REM Complete Local Test Commands
REM Copy and paste these commands

echo ========================================
echo LOAN LENS - LOCAL TESTING
echo ========================================
echo.
echo METHOD 1: Start Server (Window 1)
echo ---------------------------------
echo cd C:\Users\MYPC\Desktop\loan_lens
echo npm run dev
echo.
echo METHOD 2: Test in Browser (Window 2)
echo --------------------------------------
echo Open browser and go to:
echo http://localhost:3001/signup
echo http://localhost:3001/login
echo http://localhost:3001/dashboard
echo.
echo METHOD 3: Run Automated Tests
echo -------------------------------
echo cd C:\Users\MYPC\Desktop\loan_lens
echo node test-signup-login-dashboard.js
echo.
echo ========================================
echo.
pause
