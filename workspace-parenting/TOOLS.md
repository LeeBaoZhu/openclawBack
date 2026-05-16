# TOOLS.md - 工具与环境配置

技能（Skills）定义的是工具**如何工作**。本文件用来写**本工作区 / 当前环境**的速查。

会话启动顺序见 **`AGENTS.md`**。

## 日志

- **主日志**: `~/.openclaw/openclaw.log`

## 常用命令

- `openclaw config show` — 查看当前配置
- `openclaw gateway status` — Gateway 状态
- `openclaw agent --agent parenting --message "..."` — 向育儿专家发送消息

## 报告接收

- 飞书：后续配置（复用 lifehelper 应用或新建应用）

## 技能位置

- **专属技能**：`~/.openclaw/workspace-parenting/skills/` — 育儿专家专用技能
- **全局技能**：`~/.openclaw/skills/` — 所有 Agent 共享的技能

## 用户约定

- **「提交本地数据」** → 执行：`cd /root/.openclaw && git add . && git commit && git push`

---

按需增删。这是你的维护环境速查表。
