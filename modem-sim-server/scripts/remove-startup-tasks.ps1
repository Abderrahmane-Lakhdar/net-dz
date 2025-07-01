# PowerShell script to remove Windows startup tasks
# Run as Administrator

Write-Host "Removing Windows Startup Tasks for CreditPro..." -ForegroundColor Yellow

$taskNames = @("CreditPro-ModemServer", "CreditPro-CloudflareTunnel")

foreach ($taskName in $taskNames) {
    try {
        Unregister-ScheduledTask -TaskName $taskName -Confirm:$false
        Write-Host "✓ Removed task: $taskName" -ForegroundColor Green
    } catch {
        Write-Host "✗ Failed to remove task: $taskName (may not exist)" -ForegroundColor Red
    }
}

Write-Host "`nAll tasks removed!" -ForegroundColor Green