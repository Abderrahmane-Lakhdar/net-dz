@echo off
echo Starting CreditPro Complete System...

REM Get the script directory
set SCRIPT_DIR=%~dp0

REM Start the modem server in a new window
echo Starting Modem Server...
start "CreditPro Modem Server" cmd /k "%SCRIPT_DIR%start-modem-server.bat"

REM Wait a few seconds for the server to start
timeout /t 5 /nobreak >nul

REM Start the Cloudflare tunnel in a new window
echo Starting Cloudflare Tunnel...
start "CreditPro Cloudflare Tunnel" cmd /k "%SCRIPT_DIR%start-tunnel.bat"

echo Both services are starting...
echo Check the opened windows for status information.
pause