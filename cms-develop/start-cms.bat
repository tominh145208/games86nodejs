@echo off
setlocal

cd /d "%~dp0"

echo Starting CMS in %cd%
echo.

node server.js

echo.
echo CMS stopped. Press any key to close this window.
pause >nul
