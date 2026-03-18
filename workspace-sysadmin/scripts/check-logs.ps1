# 检查日志文件
$logPaths = @(
    "$env:USERPROFILE\.openclaw\openclaw.log",
    "$env:TEMP\openclaw.log",
    "C:\Users\28964\.openclaw\openclaw.log",
    "C:\Users\28964\AppData\Local\Temp\openclaw.log"
)

Write-Host "Checking OpenClaw log files..." -ForegroundColor Cyan
Write-Host ""

foreach ($path in $logPaths) {
    if (Test-Path $path) {
        $file = Get-Item $path
        Write-Host "[FOUND] $path" -ForegroundColor Green
        Write-Host "  Size: $([math]::Round($file.Length / 1KB, 2)) KB" -ForegroundColor Gray
        Write-Host "  Modified: $($file.LastWriteTime)" -ForegroundColor Gray
        Write-Host ""
    } else {
        Write-Host "[NOT FOUND] $path" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "Checking Gateway status..." -ForegroundColor Cyan
openclaw gateway status
