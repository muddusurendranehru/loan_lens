@echo off
echo ============================================
echo   LoanLens Pro - Local Signup Test
echo ============================================
echo.

cd /d "%~dp0"

echo [1/3] Checking if server is running...
timeout /t 1 /nobreak >nul

curl -s http://localhost:3000 >nul 2>&1
if %errorlevel% equ 0 (
    echo    Server detected on port 3000
    set SERVER_URL=http://localhost:3000
    goto :test
)

curl -s http://localhost:3001 >nul 2>&1
if %errorlevel% equ 0 (
    echo    Server detected on port 3001
    set SERVER_URL=http://localhost:3001
    goto :test
)

echo    Server not running!
echo.
echo [ACTION REQUIRED] Please start the server:
echo    1. Open a NEW terminal window
echo    2. Run: cd loan_lens ^&^& npm run dev
echo    3. Wait for "Ready" message
echo    4. Then run this script again
echo.
pause
exit /b 1

:test
echo.
echo [2/3] Testing signup endpoint...
node -e "const fetch=require('node-fetch');const email='test_'+Date.now()+'@loanlens.com';fetch('%SERVER_URL%/api/auth/signup',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:email,password:'password123'})}).then(r=>r.json()).then(d=>{console.log('Status:',d.success?'SUCCESS':'FAILED');console.log('Response:',JSON.stringify(d,null,2));process.exit(d.success?0:1);}).catch(e=>{console.error('Error:',e.message);process.exit(1);});"
if %errorlevel% equ 0 (
    echo.
    echo [3/3] Result: SUCCESS! ^^^^
    echo    Signup is working correctly!
) else (
    echo.
    echo [3/3] Result: FAILED!
    echo    Check server logs for details
)

echo.
echo ============================================
echo   Test Complete
echo ============================================
pause

