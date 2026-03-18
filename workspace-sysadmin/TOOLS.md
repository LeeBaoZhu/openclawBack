# TOOLS.md - 工具与环境配置

技能（Skills）定义的是工具**如何工作**。本文件用来写**本工作区 / 当前环境**的速查——日志路径、脚本用法、常用命令、环境相关笔记，随使用持续更新。

## 这里写什么

- 日志文件路径及备用路径（含本机实际位置）
- 日志检查脚本路径与常用参数
- openclaw 常用命令（gateway、config、sandbox 等）
- 配置与凭证路径
- 通知渠道、报告接收方式
- 任何与维护环境相关、需要速查的配置

## 示例

```markdown
## 日志

### 日志位置 ⭐
- **配置路径**: `logging.file: "/tmp/openclaw.log"`
- **实际访问**: 日志由 Gateway 进程管理，不直接对应文件系统路径
- **查看方法**:
  1. **Control UI** - 自动通过 WebSocket 读取日志
  2. **命令行**: `openclaw logs --follow` 查看实时日志
  3. **Gateway 状态**: `openclaw gateway status` 显示日志配置

### 日志分析脚本
- 检查日志：`scripts/check-system-logs.ps1`（全面检查）
- 搜索日志：`scripts/search-all-logs.ps1`（搜索所有位置）
- 快速查找：`scripts/find-log.ps1`（快速定位）

### 日志轮转
- **计划任务**: `OpenClaw\LogRotation`（每周日凌晨 2 点执行）
- **备份目录**: `C:\Users\28964\.openclaw\logs\`
- **保留时间**: 30 天
- **执行脚本**: `scripts/rotate-logs.ps1`

### 日志级别
- **配置**: `logging.level: "info"`
- **控制台**: `logging.consoleLevel: "info"`
- **脱敏**: 自动脱敏 TOKEN 等敏感信息

### openclaw 命令

- `openclaw config show` — 查看当前配置
- `openclaw gateway status` / `openclaw gateway restart` — Gateway 状态与重启
- `openclaw sandbox explain` — 沙盒/工具策略诊断

### 工具使用注意 ⭐

- **`process` 工具** — 用于管理已存在的 exec 会话（action: list/poll/log/write/send-keys/submit/paste/kill）
  - ❌ 不能用 `process(action=spawn)` 创建新会话
  - ✅ 运行命令用 `exec`
  - ✅ 读取配置用 `read`
- **失败处理** — 工具调用失败一次就停止，分析原因后再行动，不要重复尝试

### 报告接收

- WhatsApp：+8618186144326（有异常时通知）
```

## 为什么要单独放这里？

技能是共享的，你的环境与路径是你自己的。分开后：更新技能不会丢你的笔记，分享工作区也不会泄露你的环境与联系方式。

---

按需增删。这是你的维护环境速查表。
