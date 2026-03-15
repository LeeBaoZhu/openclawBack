# OpenClaw Log Rotation Script
# Usage: .\rotate-logs.ps1 [-KeepDays 30] [-RestartGateway $true]

param(
    [int]$KeepDays = 30,
    [bool]$RestartGateway = $true
)

$ErrorActionPreference = "Stop"

# Paths
$OpenClawDir = "$env:USERPROFILE\.openclaw"
$LogPath = "$OpenClawDir\openclaw.log"
$BackupDir = "$OpenClawDir\logs"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "OpenClaw Log Rotation" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if log file exists
if (-not (Test-Path $LogPath)) {
    Write-Host "[INFO] Log file not found: $LogPath" -ForegroundColor Yellow
    Write-Host "[INFO] Nothing to rotate, exiting." -ForegroundColor Yellow
    exit 0
}

# Get log file info
$logFile = Get-Item $LogPath
$logSizeMB = [math]::Round($logFile.Length / 1MB, 2)
Write-Host "[INFO] Current log: $LogPath" -ForegroundColor Gray
Write-Host "[INFO] File size: $logSizeMB MB" -ForegroundColor Gray
Write-Host "[INFO] Last modified: $($logFile.LastWriteTime)" -ForegroundColor Gray
Write-Host ""

# Create backup directory
if (-not (Test-Path $BackupDir)) {
    Write-Host "[INFO] Creating backup directory: $BackupDir" -ForegroundColor Gray
    New-Item -ItemType Directory -Force -Path $BackupDir | Out-Null
}

# Generate backup filename with timestamp
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$backupName = "openclaw.$timestamp.log"
$backupPath = Join-Path $BackupDir $backupName

# Move log file to backup
Write-Host "[INFO] Backing up log to: $backupPath" -ForegroundColor Green
try {
    Move-Item -Path $LogPath -Destination $backupPath -Force
    Write-Host "[OK] Backup complete" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Backup failed: $_" -ForegroundColor Red
    exit 1
}

# Restart Gateway (optional)
if ($RestartGateway) {
    Write-Host ""
    Write-Host "[INFO] Restarting Gateway to create new log file..." -ForegroundColor Gray
    
    try {
        & openclaw gateway restart 2>&1 | ForEach-Object { Write-Host $_ -ForegroundColor Gray }
        Write-Host "[OK] Gateway restart command sent" -ForegroundColor Green
        Write-Host "[INFO] Gateway will restart in a few seconds" -ForegroundColor Yellow
    } catch {
        Write-Host "[WARN] Gateway restart failed: $_" -ForegroundColor Yellow
        Write-Host "[INFO] Please restart manually: openclaw gateway restart" -ForegroundColor Yellow
    }
} else {
    Write-Host ""
    Write-Host "[INFO] Skipped Gateway restart" -ForegroundColor Yellow
    Write-Host "[INFO] New log file will be created on next Gateway start" -ForegroundColor Yellow
}

# Clean old log files
Write-Host ""
Write-Host "[INFO] Cleaning logs older than $KeepDays days..." -ForegroundColor Gray

try {
    $oldLogs = Get-ChildItem $BackupDir -Filter "openclaw.*.log" |
        Where-Object { $_.LastWriteTime -lt (Get-Date).AddDays(-$KeepDays) }
    
    $oldCount = $oldLogs.Count
    
    if ($oldCount -eq 0) {
        Write-Host "[INFO] No old logs to clean" -ForegroundColor Gray
    } else {
        Write-Host "[INFO] Found $oldCount old log files" -ForegroundColor Gray
        
        foreach ($oldLog in $oldLogs) {
            $sizeMB = [math]::Round($oldLog.Length / 1MB, 2)
            Write-Host "  - Deleting: $($oldLog.Name) ($sizeMB MB)" -ForegroundColor Gray
            Remove-Item $oldLog -Force
        }
        
        Write-Host "[OK] Cleanup complete, deleted $oldCount files" -ForegroundColor Green
    }
} catch {
    Write-Host "[WARN] Error cleaning old logs: $_" -ForegroundColor Yellow
}

# Show backup directory stats
Write-Host ""
Write-Host "[INFO] Backup directory stats:" -ForegroundColor Gray
try {
    $backupFiles = Get-ChildItem $BackupDir -Filter "openclaw.*.log"
    $totalSizeMB = [math]::Round(($backupFiles | Measure-Object Length -Sum).Sum / 1MB, 2)
    Write-Host "  - Files: $($backupFiles.Count)" -ForegroundColor Gray
    Write-Host "  - Total size: $totalSizeMB MB" -ForegroundColor Gray
    
    if ($backupFiles.Count -gt 0) {
        $newest = $backupFiles | Sort-Object LastWriteTime -Descending | Select-Object -First 1
        $oldest = $backupFiles | Sort-Object LastWriteTime -Ascending | Select-Object -First 1
        Write-Host "  - Newest: $($newest.Name)" -ForegroundColor Gray
        Write-Host "  - Oldest: $($oldest.Name)" -ForegroundColor Gray
    }
} catch {
    Write-Host "[WARN] Cannot stat backup directory: $_" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Log Rotation Complete" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
