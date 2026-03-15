# OpenClaw 日志检查脚本
# 用法：.\check-logs.ps1 [-SinceHours 24] [-LogLevel "WARNING"]

param(
    [int]$SinceHours = 24,
    [string]$LogLevel = "WARNING",
    [string]$LogPath = "$env:TEMP\openclaw.log"
)

# 如果默认路径不存在，尝试备用路径
if (-not (Test-Path $LogPath)) {
    $LogPath = "$env:USERPROFILE\.openclaw\openclaw.log"
}

if (-not (Test-Path $LogPath)) {
    Write-Host "日志文件不存在：$LogPath" -ForegroundColor Yellow
    exit 1
}

Write-Host "=== OpenClaw 日志检查 ===" -ForegroundColor Cyan
Write-Host "日志文件：$LogPath"
Write-Host "时间范围：过去 $SinceHours 小时"
Write-Host "最低级别：$LogLevel"
Write-Host ""

# 计算时间阈值
$threshold = (Get-Date).AddHours(-$SinceHours)

# 读取并过滤日志
$logContent = Get-Content $LogPath -Tail 5000
$filteredLogs = @()

foreach ($line in $logContent) {
    # 简单的时间戳解析（假设格式包含日期）
    if ($line -match '\[(?<level>ERROR|WARN|FATAL|INFO)\]') {
        $level = $matches.level
        
        # 按级别过滤
        $shouldInclude = switch ($LogLevel) {
            "FATAL" { $level -eq "FATAL" }
            "ERROR" { $level -eq "ERROR" -or $level -eq "FATAL" }
            "WARNING" { $level -eq "WARN" -or $level -eq "ERROR" -or $level -eq "FATAL" }
            default { $true }
        }
        
        if ($shouldInclude) {
            $filteredLogs += $line
        }
    }
}

# 统计
$fatalCount = ($filteredLogs | Where-Object { $_ -match '\[FATAL\]' }).Count
$errorCount = ($filteredLogs | Where-Object { $_ -match '\[ERROR\]' }).Count
$warnCount = ($filteredLogs | Where-Object { $_ -match '\[WARN\]' }).Count

Write-Host "=== 统计 ===" -ForegroundColor Cyan
Write-Host "FATAL: $fatalCount" -ForegroundColor $(if ($fatalCount -gt 0) { "Red" } else { "Green" })
Write-Host "ERROR: $errorCount" -ForegroundColor $(if ($errorCount -gt 0) { "Red" } else { "Green" })
Write-Host "WARNING: $warnCount" -ForegroundColor $(if ($warnCount -gt 0) { "Yellow" } else { "Green" })
Write-Host ""

# 显示最新的问题
if ($filteredLogs.Count -gt 0) {
    Write-Host "=== 最新日志条目 ===" -ForegroundColor Cyan
    $filteredLogs | Select-Object -Last 20 | ForEach-Object {
        if ($_ -match '\[FATAL\]') {
            Write-Host $_ -ForegroundColor Red
        } elseif ($_ -match '\[ERROR\]') {
            Write-Host $_ -ForegroundColor Red
        } elseif ($_ -match '\[WARN\]') {
            Write-Host $_ -ForegroundColor Yellow
        } else {
            Write-Host $_
        }
    }
} else {
    Write-Host "未发现问题的日志条目" -ForegroundColor Green
}

# 输出 JSON 格式（供 Agent 解析）
Write-Host ""
Write-Host "=== JSON 输出 ===" -ForegroundColor Cyan
$output = @{
    logPath = $LogPath
    sinceHours = $SinceHours
    timestamp = (Get-Date -Format "yyyy-MM-dd HH:mm:ss")
    counts = @{
        fatal = $fatalCount
        error = $errorCount
        warning = $warnCount
        total = $filteredLogs.Count
    }
    status = if ($fatalCount -gt 0) { "critical" } elseif ($errorCount -gt 0) { "warning" } else { "healthy" }
}
$output | ConvertTo-Json -Depth 3
