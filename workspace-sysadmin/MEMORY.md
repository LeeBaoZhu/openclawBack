# MEMORY.md - 系统维护长期记忆

---

## 维护日志

### 2026-03-15
- **创建 sysadmin agent** - 负责日常系统维护和日志监控
- **修复 apply_patch 报错** - 在 tools.deny 中添加 `apply_patch`，解决 `dashscope-coding/qwen3.5-plus` 模型不支持该工具的问题
- **配置 24h 心跳** - 每日自动检查日志和配置状态
- **配置日志轮转** - 创建 PowerShell 脚本和 Windows 计划任务，每周自动备份和清理日志

---

## 系统知识

### 日志位置 ⭐ 重要
- **配置路径**: `logging.file: "/tmp/openclaw.log"`
- **Windows 实际位置**: 日志由 Gateway 进程写入，可通过以下方式访问：
  - Gateway 启动后，日志文件在 Node.js 进程的 `/tmp` 映射位置
  - 日志内容可通过 Gateway WebSocket 连接读取
  - 日志文件随 Gateway 进程存在，Gateway 重启后日志继续追加
- **日志查看方法**:
  1. Gateway 运行时通过 WebSocket 连接读取（Control UI 自动处理）
  2. 直接读取 Gateway 进程的输出（需要访问进程 stdout）
  3. 使用 `openclaw logs --follow` 命令查看实时日志
- **注意**: 不要尝试在文件系统中直接查找 `.log` 文件，日志由 Gateway 管理

### 配置路径
- 主配置：`C:\Users\28964\.openclaw\openclaw.json`
- 凭证目录：`C:\Users\28964\.openclaw\credentials\`
- Cron 任务：`C:\Users\28964\.openclaw\cron\jobs.json`
- Gateway 服务文件：`~\.openclaw\gateway.cmd`

### 关键命令
```bash
# 查看 Gateway 状态
openclaw gateway status

# 重启 Gateway
openclaw gateway restart

# 查看配置
openclaw config show

# 查看实时日志
openclaw logs --follow

# 沙盒工具策略诊断
openclaw sandbox explain
```

---

## 经验与教训

### 2026-03-16 ⭐ 重要教训
**错误**: 查找日志文件时，尝试了多个文件系统路径但都失败，需要用户提醒才找到正确方法。

**原因**: 
- 错误假设日志文件在文件系统的某个具体路径
- 没有先理解 OpenClaw 的日志管理机制（由 Gateway 进程管理，通过 WebSocket 读取）
- 没有使用正确的命令（`openclaw logs --follow` 或 `openclaw gateway status`）

**解决方案**:
- 日志由 Gateway 进程管理，不直接对应文件系统路径
- 正确方法：使用 `openclaw logs --follow` 或查看 Gateway 状态
- 已更新 MEMORY.md 和 TOOLS.md，记录日志位置和查看方法

**改进措施**:
- ✅ 每次出错并找到解决方案后，**自动记录**到 MEMORY.md 和 TOOLS.md
- ✅ 不需要用户提醒，主动记录错误和解决方案
- ✅ 确保下次遇到同样问题时能独立解决

### 2026-03-16 插件安装教训
**错误**: 尝试安装不存在的插件 `@openclaw/github`、`@openclaw/openprose`、`@openclaw/web-scraper`。

**原因**: 
- 这些是旧的配置残留
- 没有先查看官方文档确认可用插件
- 日志中的警告是旧配置，当前配置已清理

**解决方案**:
- 查看官方文档确认可用插件：https://docs.openclaw.ai/tools/plugin
- 当前配置已无这些插件，警告会在 Gateway 重启后消失
- 如需新功能，从官方插件列表选择

**改进措施**:
- ✅ 安装插件前先查官方文档
- ✅ 日志警告要区分是旧配置还是当前问题

### 2026-03-17 ⭐ 重要教训
**错误**: 反复调用 `process(action=spawn)` 失败，产生大量无效工具调用。

**原因**: 
- `spawn` 不是 `process` 工具的有效 action 参数
- 没有先确认工具的正确用法就反复尝试
- 应该使用 `exec` 来运行命令，或直接用 `read` 查看配置文件

**解决方案**:
- 运行命令 → 用 `exec` 或让用户帮忙执行
- 查看配置 → 直接用 `read` 读取文件
- `process` 工具用于管理已存在的 exec 会话（list/poll/log/write/send-keys/submit/paste/kill）

**改进措施**:
- ✅ 不确定的工具用法先查文档或尝试其他方式
- ✅ 失败一次就停止，分析原因后再行动
- ✅ 优先用简单直接的方法（如 `read` 读配置）

### 其他经验
- **工具配置档兼容性** - `coding` profile 默认包含 `apply_patch`，但并非所有模型都支持。遇到未知工具报错时，先检查模型能力，再用 `tools.deny` 排除。
- **心跳频率选择** - 系统维护类任务 24h 足够，过于频繁会浪费 token；用户交互类心跳 30m 合适。
- **日志分析优先级** - fatal > error > warning，但 warning 趋势（如某类 warning 突然增多）可能预示问题。
- **经验记录** - 如果 web ui 不支持切换 agent，可以通过 `openclaw agent --agent sysadmin --message "生成一份系统维护报告"` 先生成会话，有了会话就可以切换 agent。

---
