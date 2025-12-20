@echo off
echo ========================================
echo LoanLens Pro - Start Server and Test
echo ========================================
echo.

cd /d "%~dp0"
cd loan_lens

echo [1/3] Checking setup...
if not exist package.json (
    echo ERROR: package.json not found
    pause
    exit /b 1
)

if not exist .env.local (
    echo ERROR: .env.local not found
    echo Please create .env.local with DATABASE_URL
    pause
    exit /b 1
)

echo [2/3] Installing dependencies (if needed)...
call npm install

echo.
echo [3/3] Starting development server...
echo.
echo Server will start at: http://localhost:3000
echo.
echo Test endpoints:
echo   POST http://localhost:3000/api/parse/upload
echo   GET  http://localhost:3000/api/report/cashflow?financial_year=2024-25
echo.
echo Press Ctrl+C to stop the server
echo.

npm run dev

