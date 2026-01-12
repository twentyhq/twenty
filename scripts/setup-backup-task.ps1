# Twenty CRM Backup Task Scheduler Setup
# Creates a scheduled task to run backup on user login

$TaskName = "TwentyCRM-DailyBackup"
$ScriptPath = "$PSScriptRoot\backup-database.sh"
$BashPath = "C:\Program Files\Git\bin\bash.exe"

# Check if Git Bash exists
if (-not (Test-Path $BashPath)) {
    Write-Error "Git Bash not found at $BashPath. Please install Git for Windows."
    exit 1
}

# Remove existing task if it exists
$existingTask = Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue
if ($existingTask) {
    Write-Host "Removing existing task..."
    Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false
}

# Create the action
$Action = New-ScheduledTaskAction -Execute $BashPath -Argument $ScriptPath

# Create the trigger (at logon)
$Trigger = New-ScheduledTaskTrigger -AtLogOn

# Create additional trigger for daily at 2 AM
$DailyTrigger = New-ScheduledTaskTrigger -Daily -At 2am

# Set the principal (run whether user is logged on or not)
$Principal = New-ScheduledTaskPrincipal -UserId "$env:USERDOMAIN\$env:USERNAME" -LogonType Interactive

# Register the scheduled task
Register-ScheduledTask -TaskName $TaskName `
    -Action $Action `
    -Trigger $Trigger,$DailyTrigger `
    -Principal $Principal `
    -Description "Automated backup for Twenty CRM database"

Write-Host "Scheduled task '$TaskName' created successfully!"
Write-Host "Backups will run:"
Write-Host "  - On user login"
Write-Host "  - Daily at 2:00 AM"
Write-Host "  - Saved to: $env:USERPROFILE\Desktop\twenty-backups"
