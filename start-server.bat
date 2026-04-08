@echo off
setlocal

cd /d "%~dp0"

echo Starting server in %cd%
echo.

node server.js

echo.
echo Server stopped. Press any key to close this window.
pause >nul
