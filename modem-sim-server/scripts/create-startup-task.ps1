# PowerShell script to create Windows startup tasks
# Run as Administrator

Write-Host "Creating Windows Startup Tasks for CreditPro..." -ForegroundColor Green

# Get the current directory
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectPath = Split-Path -Parent $scriptPath

# Task 1: Modem Server
$taskName1 = "CreditPro-ModemServer"
$taskDescription1 = "CreditPro Modem Server - Automatic Startup"
$taskAction1 = New-ScheduledTaskAction -Execute "cmd.exe" -Argument "/c `"$scriptPath\start-modem-server.bat`""
$taskTrigger1 = New-ScheduledTaskTrigger -AtStartup
$taskSettings1 = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable
$taskPrincipal1 = New-ScheduledTaskPrincipal -UserId "SYSTEM" -LogonType ServiceAccount -RunLevel Highest

try {
    Register-ScheduledTask -TaskName $taskName1 -Action $taskAction1 -Trigger $taskTrigger1 -Settings $taskSettings1 -Principal $taskPrincipal1 -Description $taskDescription1 -Force
    Write-Host "✓ Created task: $taskName1" -ForegroundColor Green
} catch {
    Write-Host "✗ Failed to create task: $taskName1" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
}

# Task 2: Cloudflare Tunnel
$taskName2 = "CreditPro-CloudflareTunnel"
$taskDescription2 = "CreditPro Cloudflare Tunnel - Automatic Startup"
$taskAction2 = New-ScheduledTaskAction -Execute "cmd.exe" -Argument "/c `"$scriptPath\start-tunnel.bat`""
$taskTrigger2 = New-ScheduledTaskTrigger -AtStartup
$taskSettings2 = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable
$taskPrincipal2 = New-ScheduledTaskPrincipal -UserId "SYSTEM" -LogonType ServiceAccount -RunLevel Highest

# Add delay for tunnel (start after modem server)
$taskTrigger2.Delay = "PT30S"  # 30 seconds delay

try {
    Register-ScheduledTask -TaskName $taskName2 -Action $taskAction2 -Trigger $taskTrigger2 -Settings $taskSettings2 -Principal $taskPrincipal2 -Description $taskDescription2 -Force
    Write-Host "✓ Created task: $taskName2" -ForegroundColor Green
} catch {
    Write-Host "✗ Failed to create task: $taskName2" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
}

Write-Host "`nTasks created successfully!" -ForegroundColor Green
Write-Host "You can manage these tasks in Task Scheduler (taskschd.msc)" -ForegroundColor Yellow
Write-Host "`nTo test the tasks manually:" -ForegroundColor Yellow
Write-Host "Start-ScheduledTask -TaskName '$taskName1'" -ForegroundColor Cyan
Write-Host "Start-ScheduledTask -TaskName '$taskName2'" -ForegroundColor Cyan