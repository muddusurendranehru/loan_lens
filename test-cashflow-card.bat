@echo off
echo ========================================
echo Testing MonthlyCashflowCard Component
echo ========================================
echo.

cd /d "%~dp0\loan_lens"

echo Starting Next.js development server...
echo.
echo Open browser to: http://localhost:3000/test-cashflow-card
echo.
echo Press Ctrl+C to stop the server
echo.

npm run dev

