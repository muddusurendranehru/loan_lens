@echo off
cd /d C:\Users\MYPC\Desktop\loan_lens
echo ========================================
echo STEP 1: Testing Backend APIs First
echo ========================================
echo.
echo Testing database connection...
curl http://localhost:3000/api/db/test-connection -UseBasicParsing
echo.
echo.
echo Testing environment variables...
curl http://localhost:3000/api/env/verify -UseBasicParsing
echo.
echo.
echo ========================================
echo Backend APIs are ready!
echo Now start the server: START.bat
echo ========================================
pause

