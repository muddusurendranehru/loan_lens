@echo off
echo ========================================
echo LoanLens - Clean Start
echo ========================================
echo.

cd C:\Users\MYPC\Desktop\loan_lens

echo 1. Killing stuck processes...
taskkill /F /PID 1068 >nul 2>&1
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 >nul
echo    Done

echo.
echo 2. Removing lock file...
if exist ".next\dev\lock" (
    rmdir /S /Q ".next\dev\lock" >nul 2>&1
    echo    Lock file removed
) else (
    echo    No lock file found
)

echo.
echo 3. Removing stray package-lock.json...
if exist "C:\Users\MYPC\package-lock.json" (
    del /F /Q "C:\Users\MYPC\package-lock.json" >nul 2>&1
    echo    Removed
) else (
    echo    Not found
)

echo.
echo 4. Starting fresh server...
echo.
echo Server starting on http://localhost:3000
echo (or http://localhost:3001 if 3000 is busy)
echo.
echo Press Ctrl+C to stop
echo.

npm run dev

