# OpenClaw 配置笔记

## 最后更新
2026-05-15 09:16 (Asia/Shanghai) — 心跳巡检

## 核心配置摘要
- 默认模型：`guidor/deepseek-v4-flash` + fallback: `deepseek/deepseek-v4-flash`
- 启用的渠道：feishu, lightclawbot, ddingtalk, wecom, openclaw-qqbot, openclaw-weixin
- 启用的 Agent：sysadmin, main, strategist, lifehelper, healthadvisor, product-owner, architect, investor, parenting
- exec 审批：security=full, ask=off（YOLO 模式）
- 心跳：24h
- 飞书 blockStreaming：on

## 变更历史

| 日期 | 变更内容 | 原因 |
|------|----------|------|
| 2026-05-14 09:10 | **delivery.to 全部修复**：14 个 cron 任务 `delivery.target` → `delivery.to` | 05-13 reset 将 `delivery.to` 改为 `target`，OpenClaw #23322 bug 导致无法识别 |
| 2026-05-14 09:00 | **心跳巡检**：日志 WARN 72, ERROR 9。Cron delivery.to 缺失。默认模型切 Flash。config-notes 精简至核心条目 | 常规心跳 + 清理 stale 历史 |
| 2026-05-13 21:07 | **blockStreamingDefault**："off" → "on" | 修复飞书流式输出不生效 |
| 2026-05-13 21:06 | **飞书流式双开验证通过** | reset 后重建验收 |
| 2026-05-13 20:43 | **架构师凭证补全**（reset 后唯一缺失） | 独缺 feishu_app_creds |
| 2026-05-13 14:29 | **sqz v1.0.9 + DeepClaude 部署**；模型临时切 v4-flash | guidor extra_body.thinking 不支持 + Pro 超时 |
| 2026-05-13 | **openclaw reset 清零重建** | 级联故障+双故障叠加，保留 memory-tdai |
| 2026-05-11 16:29 | **Feishu blockStreaming 开启**；streamingIntervalSeconds: 3 → 2 | 流式输出体验优化 |
| 2026-05-11 02:30 | **不支持字段导致 hot-reload 失败** — 全部 cron 投递中断 | agents.defaults.compaction 含 `notifyUser`（当前版本不支持），channel 反注册 |
| 2026-05-09 12:30 | **所有 Agent 统一 DeepSeek V4 Pro**（guidor 代理） | 公司 Key 成本不计，统一模型提升质量 |
| 2026-05-01 21:55 | **cron jobs.json 修复** — JSON 文件被损坏（混入非 JSON 文本） | 未知原因文件头混入文本行，Python 脚本清理修复 |

## 已知持续问题

| 问题 | 状态 | 影响 |
|------|------|------|
| memory-tdai EmbeddingService 不可用 | 持续（无 API key） | 退回关键词搜索，无功能影响 |
| lightclawbot huashu-nuwa 无 provenance | 持续 | 仅 WARN，不影响功能 |
| Git 数据同步失败 | 间歇（Token 过期时） | 数据在本地，无丢失风险 |
| daily-plan / lifehelper-daily-review-reminder 持续失败 | 跟踪中 | 需进一步诊断（可能是 sessionTarget/lifehelper 配置问题） |

## 待确认事项
- [ ] daily-plan、lifehelper-daily-review-reminder 投递失败根因（非 delivery.to 问题）
- [ ] b6b81114（lifehelper-mothers-day-followup）已 disable + deleteAfterRun，需确认是否清理
- [ ] 02:00 log-rotation 检查日志轮转脚本是否实际运行
