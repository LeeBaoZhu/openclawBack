# OpenClaw Log Rotation - Setup Scheduled Task
# Run as Administrator

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "OpenClaw Log Rotation Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Script paths
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$RotateScript = Join-Path $ScriptDir "rotate-logs.ps1"
$TaskName = "OpenClaw\LogRotation"
$TaskDescription = "Weekly log rotation - backups and cleans logs older than 30 days"

Write-Host "[INFO] Rotate script: $RotateScript" -ForegroundColor Gray
Write-Host "[INFO] Task name: $TaskName" -ForegroundColor Gray
Write-Host ""

# Check if rotate script exists
if (-not (Test-Path $RotateScript)) {
    Write-Host "[ERROR] Rotate script not found: $RotateScript" -ForegroundColor Red
    exit 1
}

# Check if task already exists
$existingTask = Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue

if ($existingTask) {
    Write-Host "[WARN] Task already exists" -ForegroundColor Yellow
    $overwrite = Read-Host "Overwrite existing configuration? (Y/N)"
    if ($overwrite -ne 'Y' -and $overwrite -ne 'y') {
        Write-Host "[INFO] Cancelled" -ForegroundColor Yellow
        exit 0
    }
    
    Write-Host "[INFO] Removing existing task..." -ForegroundColor Gray
    Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false
}

# Create scheduled task action
$action = New-ScheduledTaskAction -Execute "PowerShell.exe" `
    -Argument "-NoProfile -ExecutionPolicy Bypass -File `"$RotateScript`" -KeepDays 30 -RestartGateway `$true"

# Create weekly trigger (Sunday 2:00 AM)
$trigger = New-ScheduledTaskTrigger -Weekly -DaysOfWeek Sunday -At 2am

# Create task settings
$settings = New-ScheduledTaskSettingsSet `
    -AllowStartIfOnBatteries `
    -DontStopIfGoingOnBatteries `
    -StartWhenAvailable `
    -RunOnlyIfNetworkAvailable:$false `
    -ExecutionTimeLimit (New-TimeSpan -Hours 1) `
    -RestartCount 3 `
    -RestartInterval (New-TimeSpan -Minutes 5)

# Create principal (run as current user with highest privileges)
$principal = New-ScheduledTaskPrincipal -UserId $env:USERNAME -LogonType S4U -RunLevel Highest

# Register the task
Write-Host "[INFO] Creating scheduled task..." -ForegroundColor Gray

try {
    Register-ScheduledTask `
        -TaskName $TaskName `
        -Description $TaskDescription `
        -Action $action `
        -Trigger $trigger `
        -Settings $settings `
        -Principal $principal `
        -ErrorAction Stop | Out-Null
    
    Write-Host "[OK] Task created successfully" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Failed to create task: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "[INFO] Please run PowerShell as Administrator" -ForegroundColor Yellow
    exit 1
}

# Show summary
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Configuration Summary" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Task name: $TaskName" -ForegroundColor Gray
Write-Host "Schedule: Every Sunday at 2:00 AM" -ForegroundColor Gray
Write-Host "Keep days: 30 days" -ForegroundColor Gray
Write-Host "Restart Gateway: Yes" -ForegroundColor Gray
Write-Host ""
Write-Host "Management commands:" -ForegroundColor Cyan
Write-Host "  Status: Get-ScheduledTask -TaskName '$TaskName'" -ForegroundColor Gray
Write-Host "  Run now: Start-ScheduledTask -TaskName '$TaskName'" -ForegroundColor Gray
Write-Host "  Disable: Disable-ScheduledTask -TaskName '$TaskName'" -ForegroundColor Gray
Write-Host "  Enable: Enable-ScheduledTask -TaskName '$TaskName'" -ForegroundColor Gray
Write-Host "  Delete: Unregister-ScheduledTask -TaskName '$TaskName' -Confirm:`$false" -ForegroundColor Gray
Write-Host ""
Write-Host "Log location: $env:USERPROFILE\.openclaw\logs\" -ForegroundColor Gray
Write-Host ""
Write-Host "[OK] Setup complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
