@echo off
echo ========================================
echo Testing Server Connection
echo ========================================
echo.
echo Testing: http://localhost:3000
echo.
curl http://localhost:3000 -UseBasicParsing
echo.
echo.
echo If you see HTML output, server is running!
echo.
pause

