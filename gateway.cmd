@echo off
rem OpenClaw Gateway (v2026.3.8)
set "TMPDIR=C:\Users\28964\AppData\Local\Temp"
set "OPENCLAW_GATEWAY_PORT=18789"
set "OPENCLAW_SYSTEMD_UNIT=openclaw-gateway.service"
set "OPENCLAW_WINDOWS_TASK_NAME=OpenClaw Gateway"
set "OPENCLAW_SERVICE_MARKER=openclaw"
set "OPENCLAW_SERVICE_KIND=gateway"
set "OPENCLAW_SERVICE_VERSION=2026.3.8"
F:\Program\nodejs\node.exe F:\Program\nvm\node_global\node_modules\openclaw\dist\index.js gateway --port 18789
