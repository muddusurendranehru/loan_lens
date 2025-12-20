@echo off
echo ========================================
echo Starting LoanLens Pro Server
echo ========================================
echo.

cd /d "%~dp0\loan_lens"

echo Starting Next.js development server...
echo.
echo Server will be available at:
echo   http://localhost:3000 (or 3001 if 3000 is busy)
echo.
echo Press Ctrl+C to stop the server
echo.

npm run dev
