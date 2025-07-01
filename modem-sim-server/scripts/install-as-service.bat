@echo off
echo Installing CreditPro as Windows Service...

REM Check if running as administrator
net session >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo This script must be run as Administrator
    echo Right-click and select "Run as administrator"
    pause
    exit /b 1
)

REM Install Node.js service using nssm (if available)
where nssm >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo Installing Modem Server service...
    nssm install "CreditPro-ModemServer" node "%~dp0..\src\server.js"
    nssm set "CreditPro-ModemServer" AppDirectory "%~dp0.."
    nssm set "CreditPro-ModemServer" DisplayName "CreditPro Modem Server"
    nssm set "CreditPro-ModemServer" Description "CreditPro SIM Manager Backend Service"
    nssm set "CreditPro-ModemServer" Start SERVICE_AUTO_START
    
    echo Installing Cloudflare Tunnel service...
    nssm install "CreditPro-Tunnel" cloudflared "tunnel --config %~dp0..\cloudflare-tunnel-config.yml run"
    nssm set "CreditPro-Tunnel" AppDirectory "%~dp0.."
    nssm set "CreditPro-Tunnel" DisplayName "CreditPro Cloudflare Tunnel"
    nssm set "CreditPro-Tunnel" Description "CreditPro Cloudflare Tunnel Service"
    nssm set "CreditPro-Tunnel" Start SERVICE_AUTO_START
    
    echo Services installed successfully!
    echo You can start them with:
    echo   net start CreditPro-ModemServer
    echo   net start CreditPro-Tunnel
) else (
    echo NSSM not found. Please install NSSM first:
    echo https://nssm.cc/download
    echo.
    echo Alternative: Use Task Scheduler method below
)

echo.
echo === Alternative: Task Scheduler Setup ===
echo 1. Open Task Scheduler (taskschd.msc)
echo 2. Create Basic Task
echo 3. Name: CreditPro Modem Server
echo 4. Trigger: When the computer starts
echo 5. Action: Start a program
echo 6. Program: %~dp0start-all.bat
echo 7. Check "Run with highest privileges"

pause