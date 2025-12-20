@echo off
echo ========================================
echo Testing Dashboard and Cashflow Card
echo ========================================
echo.

cd /d "%~dp0\loan_lens"

echo Checking if server is running...
timeout /t 2 >nul

echo.
echo Testing API endpoints...
echo.

node test-dashboard-api.js

echo.
echo ========================================
echo Manual Testing:
echo ========================================
echo.
echo 1. Cashflow Card Test Page:
echo    http://localhost:3001/test-cashflow-card
echo.
echo 2. Dashboard (with card integration):
echo    http://localhost:3001/dashboard
echo.
echo 3. Modern Dashboard:
echo    http://localhost:3001/dashboard-new
echo.
echo Press any key to exit...
pause >nul

