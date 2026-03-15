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
### 日志

- 主日志：`C:\Users\28964\.openclaw\openclaw.log` 或 `%TEMP%\openclaw.log`
- 配置中：`logging.file: "/tmp/openclaw.log"`（Windows 下可能映射到 TEMP）

### 脚本

- 检查日志：`scripts/check-logs.ps1 -SinceHours 24`（昨日）
- 工作区根目录执行：`.\scripts\check-logs.ps1 -SinceHours 24`

### openclaw 命令

- `openclaw config show` — 查看当前配置
- `openclaw gateway status` / `openclaw gateway restart` — Gateway 状态与重启
- `openclaw sandbox explain` — 沙盒/工具策略诊断

### 报告接收

- WhatsApp：+8618186144326（有异常时通知）
```

## 为什么要单独放这里？

技能是共享的，你的环境与路径是你自己的。分开后：更新技能不会丢你的笔记，分享工作区也不会泄露你的环境与联系方式。

---

按需增删。这是你的维护环境速查表。
