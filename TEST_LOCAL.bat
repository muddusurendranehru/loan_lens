@echo off
echo ========================================
echo LoanLens Pro - Local Testing Commands
echo ========================================
echo.

cd /d "C:\Users\pc\Desktop\loan_lens\loan_lens"

echo [1] Checking server status...
powershell -Command "Test-NetConnection -ComputerName localhost -Port 3000 -WarningAction SilentlyContinue | Select-Object TcpTestSucceeded"

echo.
echo [2] Testing Report API...
curl http://localhost:3000/api/report/cashflow?financial_year=2024-25

echo.
echo [3] Database connection test...
node test-db-connection.js

echo.
echo ========================================
echo Testing complete!
echo ========================================
pause

