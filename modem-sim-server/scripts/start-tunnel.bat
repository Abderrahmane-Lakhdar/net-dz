@echo off
echo Starting Cloudflare Tunnel for CreditPro...

REM Check if cloudflared is installed
where cloudflared >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Error: cloudflared is not installed or not in PATH
    echo Please install cloudflared from: https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/
    pause
    exit /b 1
)

REM Change to the modem-sim-server directory
cd /d "%~dp0.."

REM Check if tunnel config exists
if not exist "cloudflare-tunnel-config.yml" (
    echo Error: cloudflare-tunnel-config.yml not found
    echo Please ensure the tunnel configuration file exists
    pause
    exit /b 1
)

REM Check if credentials file exists
if not exist "C:\Users\Administrateur\.cloudflared\2d029445-340a-40ea-80b0-035f4f8b2e2f.json" (
    echo Error: Tunnel credentials file not found
    echo Please ensure the credentials file exists at:
    echo C:\Users\Administrateur\.cloudflared\2d029445-340a-40ea-80b0-035f4f8b2e2f.json
    pause
    exit /b 1
)

REM Start the tunnel
echo Starting Cloudflare Tunnel...
cloudflared tunnel --config cloudflare-tunnel-config.yml run

pause