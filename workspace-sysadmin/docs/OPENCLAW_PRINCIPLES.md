# OpenClaw 原理解析手册

> 基于源码和官方文档的系统性解析
> 
> 最后更新：2026-03-22
> 
> 维护者：SysAdmin 🔧

---

## 目录

1. [架构概览](#架构概览)
2. [核心组件](#核心组件)
3. [消息路由机制](#消息路由机制)
4. [会话管理](#会话管理)
5. [心跳机制](#心跳机制)
6. [工具与技能系统](#工具与技能系统)
7. [配置热重载](#配置热重载)
8. [安全模型](#安全模型)
9. [故障排查](#故障排查)

---

## 架构概览

### 整体架构

```
┌─────────────────────────────────────────────────────────┐
│                    消息渠道层                              │
│  WhatsApp │ Telegram │ Slack │ Discord │ 飞书 │ ...      │
└─────────────┬──────────┬────────┬─────────┬─────────────┘
              │          │        │         │
              ▼          ▼        ▼         ▼
┌─────────────────────────────────────────────────────────┐
│                    Gateway (控制平面)                     │
│  ┌───────────────────────────────────────────────────┐  │
│  │ WebSocket 服务器 (127.0.0.1:18789)                │  │
│  │ - 会话管理                                         │  │
│  │ - 消息路由                                         │  │
│  │ - 工具调度                                         │  │
│  │ - 事件推送                                         │  │
│  └───────────────────────────────────────────────────┘  │
└────────────────────────┬────────────────────────────────┘
                         │
         ┌───────────────┼───────────────┐
         │               │               │
         ▼               ▼               ▼
┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│  Agent 运行时 │ │  CLI 客户端  │ │  macOS App │
│  (Pi 核心)    │ │  (openclaw) │ │  (Control) │
└─────────────┘ └─────────────┘ └─────────────┘
```

### 核心设计原则

1. **单一 Gateway** - 每台主机运行一个 Gateway 进程，管理所有消息渠道
2. **WebSocket 控制平面** - 所有客户端通过 WS 连接 Gateway
3. **会话隔离** - 不同渠道/用户的会话完全隔离
4. **热重载配置** - 大多数配置修改无需重启 Gateway

---

## 核心组件

### Gateway

**职责**：
- 维护所有渠道的连接（WhatsApp、Telegram、飞书等）
- 提供 WebSocket API 供客户端调用
- 管理会话状态和持久化
- 调度 Agent 运行和工具执行
- 推送事件（消息、状态、健康检查）

**关键配置**：
```json5
{
  gateway: {
    port: 18789,           // WS 端口
    bind: "127.0.0.1",     // 绑定地址
    auth: {
      mode: "token",       // 认证模式
      token: "xxx"         // 认证令牌
    },
    reload: {
      mode: "hybrid",      // 热重载模式
      debounceMs: 300      // 防抖时间
    }
  }
}
```

### Agent 运行时

**基础**：基于 Pi Agent 核心构建

**工作流程**：
```
1. 接收用户消息 (通过 Gateway 路由)
2. 加载会话上下文 (sessions.json + JSONL 记录)
3. 注入工作区文件 (SOUL.md, AGENTS.md, TOOLS.md 等)
4. 加载可用工具 (根据工具策略过滤)
5. 调用 LLM 生成响应
6. 执行工具调用 (如有)
7. 返回响应给用户
8. 持久化会话记录
```

**工作区文件**：
| 文件 | 作用 | 注入时机 |
|------|------|---------|
| `SOUL.md` | 人格、边界、语气 | 会话首条消息 |
| `IDENTITY.md` | 身份定义 | 会话首条消息 |
| `AGENTS.md` | 操作指令 + 记忆 | 会话首条消息 |
| `TOOLS.md` | 工具使用笔记 | 会话首条消息 |
| `USER.md` | 用户档案 | 会话首条消息 |
| `HEARTBEAT.md` | 心跳检查清单 | 每次心跳 |
| `BOOTSTRAP.md` | 首次引导 (一次性) | 新工作区 |

### Channels (渠道)

**支持的渠道**：
- WhatsApp (Baileys)
- Telegram (grammY)
- Slack (Bolt)
- Discord (discord.js)
- Google Chat
- Signal (signal-cli)
- iMessage / BlueBubbles
- 飞书 (WebSocket)
- LINE, Mattermost, Matrix, 等

**渠道配置模式**：
```json5
{
  channels: {
    feishu: {
      enabled: true,
      domain: "feishu",      // 或 "lark" (国际版)
      dmPolicy: "open",      // DM 策略
      groupPolicy: "open",   // 群聊策略
      accounts: {
        main: {
          appId: "cli_xxx",
          appSecret: "xxx",
          botName: "机器人名称"
        }
      }
    }
  }
}
```

---

## 消息路由机制

### 路由流程

```
用户消息
  │
  ▼
渠道接收 (WebSocket/轮询)
  │
  ▼
提取元数据 (chat_id, sender_id, message_id)
  │
  ▼
匹配 Bindings (agents.list + bindings 配置)
  │
  ▼
确定目标 Agent
  │
  ▼
生成会话键 (sessionKey)
  │
  ▼
加载/创建会话
  │
  ▼
注入上下文 + 工具
  │
  ▼
调用 LLM
  │
  ▼
执行工具 (如有)
  │
  ▼
返回响应
```

### 会话键生成规则

| 场景 | 会话键格式 | 说明 |
|------|-----------|------|
| **DM (默认)** | `agent:<agentId>:main` | 所有 DM 共享主会话 |
| **DM (per-channel-peer)** | `agent:<agentId>:feishu:direct:<open_id>` | 每渠道 + 每用户隔离 |
| **DM (per-peer)** | `agent:<agentId>:direct:<open_id>` | 每用户隔离 (跨渠道) |
| **群聊** | `agent:<agentId>:feishu:group:<chat_id>` | 每群聊隔离 |
| **心跳** | `agent:<agentId>:heartbeat` | 心跳专用会话 |
| **Cron** | `cron:<jobId>` | 定时任务隔离 |

### Bindings 匹配

**配置示例**：
```json5
{
  agents: {
    list: [
      { id: "main", default: true },
      { id: "sysadmin", workspace: "~/.openclaw/workspace-sysadmin" }
    ]
  },
  bindings: [
    {
      agentId: "main",
      match: { channel: "feishu", accountId: "main" }
    },
    {
      agentId: "sysadmin",
      match: {
        channel: "feishu",
        accountId: "sysadmin",
        peer: { kind: "group", id: "oc_xxx" }
      }
    }
  ]
}
```

**匹配优先级**：
1. 最具体的匹配 (peer.id + accountId + channel)
2. 次具体 (accountId + channel)
3. 默认 Agent (default: true)

---

## 会话管理

### 会话存储结构

```
~/.openclaw/agents/<agentId>/sessions/
├── sessions.json          # 会话索引 (所有会话元数据)
├── <sessionId>.jsonl      # 会话记录 (对话历史)
└── archive/               # 归档的会话
```

### sessions.json 结构

```json
{
  "agent:main:feishu:direct:ou_xxx": {
    "sessionId": "om_xxx",
    "updatedAt": "2026-03-22T01:00:00Z",
    "inputTokens": 10000,
    "outputTokens": 5000,
    "totalTokens": 15000,
    "contextTokens": 2000,
    "origin": {
      "label": "用户名称",
      "provider": "feishu",
      "from": "ou_xxx"
    }
  }
}
```

### 会话重置策略

**触发条件**：
1. **每日重置** - 每天凌晨 4 点 (可配置)
2. **空闲重置** - 超过 N 分钟无活动
3. **手动重置** - `/reset` 或 `/new` 命令
4. **会话过期** - 超过最大年龄

**配置示例**：
```json5
{
  session: {
    dmScope: "per-channel-peer",  // DM 隔离策略
    reset: {
      mode: "daily",
      atHour: 4,
      idleMinutes: 120
    },
    maintenance: {
      mode: "enforce",
      pruneAfter: "30d",
      maxEntries: 500
    }
  }
}
```

### 安全 DM 模式

**问题**：多用户场景下，默认所有 DM 共享同一会话，导致隐私泄露

**解决**：设置 `dmScope: "per-channel-peer"`

```json5
{
  session: {
    dmScope: "per-channel-peer"  // 推荐多用户场景
  }
}
```

---

## 心跳机制

### 心跳 vs Cron

| 特性 | 心跳 (Heartbeat) | Cron |
|------|-----------------|------|
| **触发** | 固定间隔 | 固定时间点 |
| **会话** | 可复用主会话 | 总是新建隔离会话 |
| **用途** | 定期检查 + 轻量任务 | 定时执行具体任务 |
| **配置** | `agents.defaults.heartbeat` | `cron.jobs` |

### 心跳配置

```json5
{
  agents: {
    defaults: {
      heartbeat: {
        every: "24h",              // 间隔
        model: "qwen3-coder-next", // 模型
        target: "feishu",          // 发送目标
        to: "feishu:ou_xxx",       // 接收用户
        directPolicy: "allow",     // 允许 DM 发送
        prompt: "检查系统日志...", // 提示词
        lightContext: true,        // 轻量上下文
        isolatedSession: true,     // 隔离会话 (节省 token)
        activeHours: {             // 活跃时间窗口
          start: "08:00",
          end: "24:00"
        }
      }
    }
  }
}
```

### 心跳响应契约

- **无异常** → 回复 `HEARTBEAT_OK` (被过滤，不发送)
- **有异常** → 回复警报内容 (发送给用户)

**HEARTBEAT.md 示例**：
```markdown
# 心跳检查清单

- 检查系统日志 (warning/error/fatal)
- 更新配置笔记
- 无异常回复 HEARTBEAT_OK
```

### 心跳可见性控制

```json5
{
  channels: {
    defaults: {
      heartbeat: {
        showOk: false,      // 隐藏 HEARTBEAT_OK (默认)
        showAlerts: true,   // 显示警报 (默认)
        useIndicator: true  // 发送指示器事件 (默认)
      }
    }
  }
}
```

---

## 工具与技能系统

### 工具分类

| 类别 | 工具示例 | 说明 |
|------|---------|------|
| **核心工具** | read, write, edit, exec | 文件操作和命令执行 |
| **会话工具** | sessions_list, sessions_send | 会话管理 |
| **渠道工具** | message, send | 消息发送 |
| **浏览器** | browser | 网页浏览 |
| **节点工具** | nodes.camera.snap | 设备操作 |
| **技能工具** | 由技能定义 | 扩展功能 |

### 工具策略

**配置示例**：
```json5
{
  agents: {
    list: [
      {
        id: "sysadmin",
        tools: {
          profile: "coding",  // 工具预设
          allow: [
            "read", "write", "edit",
            "message", "sessions_send"  // 允许主动发消息
          ],
          deny: [
            "apply_patch",      // 不支持的工具
            "browser", "canvas"  // 禁止的工具
          ]
        }
      }
    ]
  }
}
```

### 技能系统

**技能来源**：
1. **Bundled** - 安装包自带
2. **Managed** - `~/.openclaw/skills`
3. **Workspace** - `<workspace>/skills` (优先级最高)

**技能结构**：
```
<skill-name>/
├── SKILL.md          # 技能定义 (YAML frontmatter + 说明)
├── scripts/          # 脚本 (可选)
└── references/       # 参考资料 (可选)
```

**SKILL.md 示例**：
```markdown
---
name: lightclawbot-media
description: LightClawBot 文件收发能力
metadata: {"openclaw": {"emoji": "📁"}}
---

# 技能说明

本技能提供文件收发能力...

## 使用方法

...
```

### 技能门控

技能在加载时根据 metadata 过滤：

```markdown
---
name: image-lab
metadata: {
  "openclaw": {
    "requires": {
      "bins": ["uv"],
      "env": ["GEMINI_API_KEY"],
      "config": ["browser.enabled"]
    }
  }
}
---
```

---

## 配置热重载

### 重载模式

| 模式 | 行为 |
|------|------|
| **hybrid** (默认) | 安全变更立即生效，关键变更自动重启 |
| **hot** | 安全变更立即生效，需重启时记录警告 |
| **restart** | 任何变更都重启 |
| **off** | 禁用热重载 |

### 立即生效的配置

- `channels.*` - 所有渠道配置
- `agents.*` - Agent 配置和模型
- `bindings` - 路由绑定
- `tools.*` - 工具策略
- `session.*` - 会话管理
- `messages.*` - 消息处理
- `skills.*` - 技能配置
- `hooks`, `cron` - 自动化

### 需要重启的配置

- `gateway.port` - 端口
- `gateway.bind` - 绑定地址
- `gateway.auth` - 认证配置
- `gateway.tailscale` - Tailscale 配置
- `discovery` - 服务发现
- `plugins` - 插件

### 配置验证

```bash
# 查看当前配置
openclaw config show

# 获取配置哈希 (用于 patch)
openclaw gateway call config.get --params '{}'

# 部分更新
openclaw gateway call config.patch --params '{
  "raw": "{ channels: { feishu: { dmPolicy: \"open\" } } }",
  "baseHash": "<hash>"
}'
```

---

## 安全模型

### 配对机制

**DM 策略**：
- `pairing` (默认) - 未知用户收到配对码，需批准
- `allowlist` - 仅允许列表中的用户
- `open` - 允许所有用户
- `disabled` - 禁用 DM

**配对流程**：
```
1. 用户首次发送消息给机器人
2. 机器人回复配对码
3. 管理员运行：openclaw pairing approve feishu <CODE>
4. 用户被添加到允许列表
5. 后续消息正常处理
```

### 设备配对

所有 WS 客户端 (包括节点) 需要设备配对：

```
1. 客户端发送 connect 请求 (含设备身份)
2. Gateway 生成挑战 nonce
3. 客户端签名挑战
4. Gateway 验证并批准 (或要求配对)
5. 颁发设备令牌 (后续连接使用)
```

### 工具权限

**沙盒模式**：
```json5
{
  agents: {
    defaults: {
      sandbox: {
        mode: "non-main",  // 非主会话沙盒化
        scope: "agent"
      }
    }
  }
}
```

** elevated bash** (macOS)：
- 需要用户明确批准
- 通过 `/elevated on|off` 切换

### 敏感信息保护

- API 密钥使用 SecretRef (env/file/exec)
- 日志自动脱敏 token
- 配置验证拒绝未知键

---

## 故障排查

### 诊断命令

```bash
# 查看 Gateway 状态
openclaw gateway status

# 查看实时日志
openclaw logs --follow

# 健康检查
openclaw health

# 安全审计
openclaw security audit

# 配置诊断
openclaw doctor

# 查看会话
openclaw sessions --json

# 查看配对请求
openclaw pairing list feishu
```

### 常见问题

#### 1. 机器人不响应

**检查清单**：
- [ ] Gateway 是否运行 (`openclaw gateway status`)
- [ ] 渠道是否启用 (`channels.<name>.enabled`)
- [ ] 配对是否完成 (`openclaw pairing list`)
- [ ] 群聊是否需要@ (`groupPolicy`, `requireMention`)
- [ ] 日志是否有错误 (`openclaw logs --follow`)

#### 2. 消息发送失败

**可能原因**：
- 渠道认证过期 (重新登录/更新 token)
- 用户未配对 (批准配对)
- 工具权限不足 (检查 `tools.allow`)
- 会话被阻止 (检查 `session.sendPolicy`)

#### 3. 心跳不触发

**检查**：
- 心跳是否禁用 (`every: "0m"`)
- 活跃时间窗口 (`activeHours`)
- 主队列是否繁忙 (心跳会跳过繁忙时)
- HEARTBEAT.md 是否为空 (空文件会跳过)

#### 4. 工具调用失败

**排查步骤**：
1. 检查工具是否在 `tools.allow` 列表
2. 检查工具是否被 `tools.deny` 禁止
3. 检查技能门控条件 (bins/env/config)
4. 查看日志中的工具错误详情

### 日志位置

- **主日志**: Gateway 输出 (stdout/stderr)
- **会话记录**: `~/.openclaw/agents/<agentId>/sessions/*.jsonl`
- **Cron 日志**: `~/.openclaw/cron/runs/<jobId>.jsonl`
- **配置**: `~/.openclaw/openclaw.json`

---

## 附录

### 配置模板

**最小配置**：
```json5
{
  agents: {
    defaults: {
      workspace: "~/.openclaw/workspace"
    }
  },
  channels: {
    feishu: {
      enabled: true,
      dmPolicy: "open",
      accounts: {
        main: {
          appId: "cli_xxx",
          appSecret: "xxx"
        }
      }
    }
  }
}
```

**多 Agent 配置**：
```json5
{
  agents: {
    list: [
      { id: "main", default: true, workspace: "~/.openclaw/workspace" },
      { id: "sysadmin", workspace: "~/.openclaw/workspace-sysadmin" },
      { id: "strategist", workspace: "~/.openclaw/workspace-strategist" }
    ],
    defaults: {
      heartbeat: {
        every: "24h",
        target: "none"
      }
    }
  },
  bindings: [
    { agentId: "main", match: { channel: "feishu", accountId: "main" } },
    { agentId: "sysadmin", match: { channel: "feishu", accountId: "sysadmin" } }
  ]
}
```

### 关键路径

| 路径 | 说明 |
|------|------|
| `~/.openclaw/openclaw.json` | 主配置文件 |
| `~/.openclaw/workspace/` | 默认工作区 |
| `~/.openclaw/agents/<id>/sessions/` | 会话存储 |
| `~/.openclaw/skills/` | 全局技能 |
| `~/.openclaw/credentials/` | 渠道凭证 |
| `~/.openclaw/cron/jobs.json` | Cron 任务 |

### 参考链接

- **官方文档**: https://docs.openclaw.ai
- **GitHub**: https://github.com/openclaw/openclaw
- **ClawHub (技能市场)**: https://clawhub.com
- **Discord**: https://discord.gg/clawd

---

_稳定来自重复，可靠来自记录。_ 🦞
