# MEMORY.md - 系统维护长期记忆

---

## 维护日志

### 2026-03-15
- **创建 sysadmin agent** - 负责日常系统维护和日志监控
- **修复 apply_patch 报错** - 在 tools.deny 中添加 `apply_patch`，解决 `dashscope-coding/qwen3.5-plus` 模型不支持该工具的问题
- **配置 24h 心跳** - 每日自动检查日志和配置状态

---

## 系统知识

### 日志位置
- 主日志：`/tmp/openclaw.log`（Windows 下可能是 `C:\Users\28964\AppData\Local\Temp\openclaw.log`）
- 配置中指定：`logging.file: "/tmp/openclaw.log"`

### 配置路径
- 主配置：`C:\Users\28964\.openclaw\openclaw.json`
- 凭证目录：`C:\Users\28964\.openclaw\credentials\`
- Cron 任务：`C:\Users\28964\.openclaw\cron\jobs.json`

### 关键命令
```bash
# 查看 Gateway 状态
openclaw gateway status

# 重启 Gateway
openclaw gateway restart

# 查看配置
openclaw config show

# 沙盒工具策略诊断
openclaw sandbox explain
```

---

## 经验与教训

- **工具配置档兼容性** - `coding` profile 默认包含 `apply_patch`，但并非所有模型都支持。遇到未知工具报错时，先检查模型能力，再用 `tools.deny` 排除。
- **心跳频率选择** - 系统维护类任务 24h 足够，过于频繁会浪费 token；用户交互类心跳 30m 合适。
- **日志分析优先级** - fatal > error > warning，但 warning 趋势（如某类 warning 突然增多）可能预示问题。- **经验记录** 如果web ui不支持切换agent,可以通过 openclaw agent --agent sysadmin --message "生成一份系统维护报告"先生成会话，有了会话就可以切换agent。
---
