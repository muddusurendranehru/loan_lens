@echo off
echo ========================================
echo   LoanLens Development Server
echo ========================================
echo.

REM Check if .env.local exists
if not exist ".env.local" (
    echo ERROR: .env.local file not found!
    echo Please create .env.local with DATABASE_URL
    pause
    exit /b 1
)

echo .env.local found
echo.

REM Kill existing Node processes
echo Checking for existing processes...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 >nul

REM Remove lock file
if exist ".next\dev\lock" (
    del /F /Q ".next\dev\lock" >nul 2>&1
    echo Lock file removed
)

echo.
echo Starting Next.js development server...
echo Frontend: http://localhost:3000
echo Backend API: http://localhost:3000/api/*
echo.
echo Press Ctrl+C to stop the server
echo.

npm run dev
