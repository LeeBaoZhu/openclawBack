# OpenClaw 日志检查脚本
$ErrorActionPreference = "Continue"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "OpenClaw 日志检查" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 1. 检查配置中的日志路径
Write-Host "[1] 配置文件中的日志路径:" -ForegroundColor Yellow
$configPath = "$env:USERPROFILE\.openclaw\openclaw.json"
if (Test-Path $configPath) {
    $config = Get-Content $configPath -Raw | ConvertFrom-Json
    Write-Host "  logging.file = $($config.logging.file)" -ForegroundColor Gray
} else {
    Write-Host "  配置文件未找到" -ForegroundColor Red
}
Write-Host ""

# 2. 检查 .openclaw 目录
Write-Host "[2] .openclaw 目录内容:" -ForegroundColor Yellow
$openclawDir = "$env:USERPROFILE\.openclaw"
if (Test-Path $openclawDir) {
    $items = Get-ChildItem -Path $openclawDir -ErrorAction SilentlyContinue
    foreach ($item in $items) {
        if ($item.Name -like "*.log") {
            Write-Host "  [LOG] $($item.Name) - $([math]::Round($item.Length/1KB,2)) KB - $($item.LastWriteTime)" -ForegroundColor Green
        } else {
            Write-Host "  [DIR] $($item.Name)" -ForegroundColor Gray
        }
    }
} else {
    Write-Host "  目录不存在" -ForegroundColor Red
}
Write-Host ""

# 3. 检查 TEMP 目录
Write-Host "[3] TEMP 目录中的日志:" -ForegroundColor Yellow
$tempLog = "$env:TEMP\openclaw.log"
if (Test-Path $tempLog) {
    $file = Get-Item $tempLog
    Write-Host "  [FOUND] $tempLog" -ForegroundColor Green
    Write-Host "    大小：$([math]::Round($file.Length/1KB,2)) KB" -ForegroundColor Gray
    Write-Host "    修改：$($file.LastWriteTime)" -ForegroundColor Gray
} else {
    Write-Host "  未找到" -ForegroundColor Yellow
}
Write-Host ""

# 4. Gateway 状态
Write-Host "[4] Gateway 状态:" -ForegroundColor Yellow
try {
    $status = & openclaw gateway status 2>&1
    Write-Host $status -ForegroundColor Gray
} catch {
    Write-Host "  无法获取 Gateway 状态" -ForegroundColor Red
}
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
