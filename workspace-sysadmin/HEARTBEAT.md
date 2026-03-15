# HEARTBEAT.md - 心跳清单

心跳触发时按此清单执行（本 Agent 为 24h 心跳）。若无需处理则回复 `HEARTBEAT_OK`。

1. **昨日日志** — 检查过去 24h 的 warning/error/fatal（`scripts/check-logs.ps1 -SinceHours 24`）
2. **配置笔记** — 若有配置变更，更新 `docs/config-notes.md`
3. **报告** — 有异常则生成维护报告（含建议与解决方案）并通知；无异常可静默或简短结论

保持本文件简短以控制 token 消耗。
