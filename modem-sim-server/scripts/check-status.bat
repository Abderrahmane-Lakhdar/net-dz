@echo off
echo Checking CreditPro System Status...
echo.

REM Check if Node.js server is running
echo === Modem Server Status ===
netstat -an | findstr ":3001" >nul
if %ERRORLEVEL% EQU 0 (
    echo ✓ Modem Server is running on port 3001
) else (
    echo ✗ Modem Server is NOT running
)

echo.

REM Check if Cloudflare tunnel is running
echo === Cloudflare Tunnel Status ===
tasklist | findstr "cloudflared.exe" >nul
if %ERRORLEVEL% EQU 0 (
    echo ✓ Cloudflare Tunnel is running
) else (
    echo ✗ Cloudflare Tunnel is NOT running
)

echo.

REM Test WebSocket connection
echo === WebSocket Connection Test ===
echo Testing connection to wss://modem-sim-server.creditpro-dz.com...

REM Use PowerShell to test WebSocket (if available)
powershell -Command "try { $ws = New-Object System.Net.WebSockets.ClientWebSocket; $uri = [System.Uri]::new('wss://modem-sim-server.creditpro-dz.com'); $cts = New-Object System.Threading.CancellationTokenSource; $task = $ws.ConnectAsync($uri, $cts.Token); $task.Wait(5000); if($task.IsCompletedSuccessfully) { Write-Host '✓ WebSocket connection successful'; $ws.CloseAsync([System.Net.WebSockets.WebSocketCloseStatus]::NormalClosure, 'Test', $cts.Token).Wait(1000) } else { Write-Host '✗ WebSocket connection failed' } } catch { Write-Host '✗ WebSocket connection error:' $_.Exception.Message }" 2>nul

echo.

REM Check scheduled tasks
echo === Scheduled Tasks Status ===
schtasks /query /tn "CreditPro-ModemServer" >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo ✓ CreditPro-ModemServer task exists
) else (
    echo ✗ CreditPro-ModemServer task not found
)

schtasks /query /tn "CreditPro-CloudflareTunnel" >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo ✓ CreditPro-CloudflareTunnel task exists
) else (
    echo ✗ CreditPro-CloudflareTunnel task not found
)

echo.
echo Status check complete!
pause