@echo off
echo Starting CreditPro Modem Server...

REM Change to the modem-sim-server directory
cd /d "%~dp0.."

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Error: Node.js is not installed or not in PATH
    echo Please install Node.js from: https://nodejs.org/
    pause
    exit /b 1
)

REM Check if npm dependencies are installed
if not exist "node_modules" (
    echo Installing dependencies...
    npm install
)

REM Start the modem server
echo Starting modem-sim-server on port 3001...
npm run dev

pause