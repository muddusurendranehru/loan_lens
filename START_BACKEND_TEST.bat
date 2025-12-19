@echo off
cd /d C:\Users\MYPC\Desktop\loan_lens
echo ========================================
echo Backend API Testing (Server Must Be Running)
echo ========================================
echo.
echo Make sure server is running first!
echo Start server: START.bat
echo.
echo Then test these backend APIs:
echo.
echo 1. Database Connection:
echo    curl http://localhost:3000/api/db/test-connection
echo.
echo 2. Environment Variables:
echo    curl http://localhost:3000/api/env/verify
echo.
echo 3. Signup API:
echo    curl -X POST http://localhost:3000/api/auth/signup -H "Content-Type: application/json" -d "{\"email\":\"test@test.com\",\"password\":\"test123456\"}"
echo.
pause

