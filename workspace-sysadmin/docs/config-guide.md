# OpenClaw 配置完全指南

_基于官方文档 https://docs.openclaw.ai/gateway/configuration-reference.md_

_最后更新：2026-03-15_
_维护员：SysAdmin 🔧_

---

## 配置结构总览

```
openclaw.json (JSON5 格式，支持注释和尾随逗号)
├── channels                  # 渠道配置（WhatsApp、Telegram、Discord 等）
├── agents                    # Agent 配置 ⭐
├── models                    # 模型配置 ⭐
├── tools                     # 工具策略配置 ⭐
├── gateway                   # Gateway 服务配置 ⭐
├── messages                  # 消息处理配置
├── commands                  # 命令配置
├── cron                      # 定时任务配置
├── logging                   # 日志配置
├── browser                   # 浏览器集成配置
├── skills                    # 技能配置
├── plugins                   # 插件配置
├── bindings                  # Agent-渠道绑定配置
├── web                       # Web 相关配置
└── 其他（broadcast、audio、session、approvals、hooks、canvasHost 等）
```

**所有配置项都是可选的** — OpenClaw 在缺失时使用安全默认值。

---

## 一、models — 模型配置

### 作用
定义可用的 AI 模型提供商、API 端点、认证信息和模型能力参数。

### 官方文档
https://docs.openclaw.ai/concepts/model-providers.md

### 结构
```json5
{
  "models": {
    "providers": {
      "<provider-id>": {
        "baseUrl": "API 端点",
        "apiKey": "认证密钥",
        "api": "API 类型",
        "models": [ ... ]
      }
    }
  }
}
```

### 提供商配置项

| 配置项 | 类型 | 说明 | 示例 |
|--------|------|------|------|
| `baseUrl` | string | API 基础 URL | `https://dashscope.aliyuncs.com/compatible-mode/v1` |
| `apiKey` | string | API 密钥（敏感信息） | `sk-xxx` |
| `api` | string | API 兼容类型 | `openai-completions` |
| `models` | array | 该提供商下的模型列表 | 见下方 |

### 模型配置项（models 数组内）

| 配置项 | 类型 | 说明 | 示例 |
|--------|------|------|------|
| `id` | string | 模型标识符 | `qwen3.5-plus` |
| `name` | string | 人类可读名称 | `Qwen3.5 Plus (Coding Plan)` |
| `api` | string | API 类型（继承提供商） | `openai-completions` |
| `reasoning` | boolean | 是否支持深度思考 | `true` / `false` |
| `input` | array | 支持的输入类型 | `["text"]` 或 `["text", "image"]` |
| `cost` | object | 计费标准 | `{"input": 0, "output": 0}` |
| `contextWindow` | number | 上下文窗口（tokens） | `262144` |
| `maxTokens` | number | 单次输出最大 tokens | `65536` |

### 模型别名配置（agents.defaults.models）

将完整模型 ID 映射为简短别名，方便在 Agent 配置中引用：

```json5
{
  "agents": {
    "defaults": {
      "models": {
        "dashscope-coding/qwen3.5-plus": { "alias": "coding" },
        "dashscope-coding/qwen3-coder-next": { "alias": "coder-next" },
        "dashscope-coding/glm-5": { "alias": "glm5" },
        "dashscope/qwen3-tts-vd-2026-01-26": { "alias": "tts" },
        "dashscope/qwen-image-2.0-pro": { "alias": "draw" }
      }
    }
  }
}
```

### 模型参数覆盖（可选）

```json5
{
  "agents": {
    "defaults": {
      "models": {
        "dashscope-coding/glm-5": {
          "alias": "glm5",
          "params": {
            "thinking": "high",  // 思考级别：low | medium | high
            "temperature": 0.7,
            "maxTokens": 32768
          }
        }
      }
    }
  }
}
```

---

## 二、agents — Agent 配置

### 作用
定义系统中可用的 Agent（智能体），包括其工作区、模型、工具权限、身份等。

### 官方文档
https://docs.openclaw.ai/concepts/agent.md

### 结构
```json5
{
  "agents": {
    "defaults": { ... },    // 默认配置（所有 Agent 继承）
    "list": [ ... ]         // Agent 列表
  }
}
```

### agents.defaults — 默认配置

所有 Agent 继承的默认设置：

#### 模型配置

```json5
{
  "agents": {
    "defaults": {
      "model": {
        "primary": "dashscope-coding/qwen3.5-plus",
        "fallbacks": [
          "dashscope-coding/qwen3-coder-next",
          "dashscope-coding/glm-5"
        ]
      },
      "imageModel": {
        "primary": "dashscope/qwen-image-2.0-pro",
        "fallbacks": []
      },
      "pdfModel": {
        "primary": "dashscope-coding/qwen3.5-plus",
        "fallbacks": ["dashscope-coding/kimi-k2.5"]
      },
      "pdfMaxBytesMb": 10,
      "pdfMaxPages": 20
    }
  }
}
```

| 配置项 | 说明 | 默认值 |
|--------|------|--------|
| `model.primary` | 默认主模型 | `anthropic/claude-opus-4-6` |
| `model.fallbacks` | 备用模型列表（按顺序故障转移） | `[]` |
| `imageModel.primary` | 图像生成/视觉模型 | - |
| `pdfModel.primary` | PDF 处理模型 | - |
| `timeoutSeconds` | 请求超时（秒） | `600` |
| `contextTokens` | 上下文 tokens 上限 | `200000` |
| `maxConcurrent` | 最大并发 Agent 运行数 | `1` |

#### 上下文修剪（contextPruning）

修剪**旧工具结果**从内存上下文中，不修改磁盘上的会话历史。

```json5
{
  "agents": {
    "defaults": {
      "contextPruning": {
        "mode": "cache-ttl",     // off | cache-ttl
        "ttl": "1h",             // 修剪间隔
        "keepLastAssistants": 3, // 保留最近助手消息数
        "softTrimRatio": 0.3,    // 软修剪比例
        "hardClearRatio": 0.5,   // 硬清除比例
        "minPrunableToolChars": 50000,
        "tools": {
          "deny": ["browser", "canvas"]  // 不修剪这些工具的结果
        }
      }
    }
  }
}
```

#### 会话压缩（compaction）

```json5
{
  "agents": {
    "defaults": {
      "compaction": {
        "mode": "safeguard",           // default | safeguard
        "reserveTokensFloor": 24000,   // 保留 tokens 下限
        "identifierPolicy": "strict",  // strict | off | custom
        "postCompactionSections": ["Session Startup", "Red Lines"],
        "model": "dashscope/qwen-turbo",  // 可选的压缩专用模型
        "memoryFlush": {
          "enabled": true,
          "softThresholdTokens": 6000
        }
      }
    }
  }
}
```

#### 心跳配置（heartbeat）

```json5
{
  "agents": {
    "defaults": {
      "heartbeat": {
        "every": "30m",              // 间隔（0m 禁用）
        "model": "dashscope/qwen-turbo",
        "session": "main",
        "to": "+8618186144326",
        "directPolicy": "allow",     // allow | block
        "target": "none",            // none | last | whatsapp | telegram | ...
        "prompt": "Read HEARTBEAT.md if it exists...",
        "ackMaxChars": 300,
        "suppressToolErrorWarnings": false,
        "lightContext": false,       // 轻量上下文
        "isolatedSession": false     // 独立会话（降低 token 消耗）
      }
    }
  }
}
```

#### 工作区配置

```json5
{
  "agents": {
    "defaults": {
      "workspace": "~/.openclaw/workspace",
      "repoRoot": "~/Projects/openclaw",  // 可选，自动检测
      "skipBootstrap": false,             // 跳过引导文件创建
      "bootstrapMaxChars": 20000,         // 单文件最大字符
      "bootstrapTotalMaxChars": 300000,   // 总字符上限
      "userTimezone": "Asia/Shanghai",    // 时区
      "timeFormat": "auto"                // auto | 12 | 24
    }
  }
}
```

#### 工具策略（tools）

```json5
{
  "agents": {
    "defaults": {
      "tools": {
        "profile": "coding",    // 工具配置文件
        "allow": ["read", "write", "edit", "exec", ...],
        "deny": ["apply_patch", "canvas", ...]
      }
    }
  }
}
```

#### 沙盒配置（sandbox）

Docker 沙盒隔离（可选）：

```json5
{
  "agents": {
    "defaults": {
      "sandbox": {
        "mode": "non-main",    // off | non-main | all
        "scope": "agent",      // session | agent | shared
        "workspaceAccess": "none",  // none | ro | rw
        "docker": {
          "image": "openclaw-sandbox:bookworm-slim",
          "network": "none",
          "memory": "1g",
          "cpus": 1
        }
      }
    }
  }
}
```

### agents.list — Agent 列表

每个 Agent 可覆盖 defaults 中的配置：

```json5
{
  "agents": {
    "list": [
      {
        "id": "main",
        "default": true,
        "name": "CEO Agent",
        "workspace": "~/.openclaw/workspace",
        "model": {
          "primary": "dashscope-coding/qwen3.5-plus",
          "fallbacks": [
            "dashscope-coding/qwen3-coder-next",
            "dashscope-coding/glm-5"
          ]
        },
        "identity": {
          "name": "CEO",
          "theme": "executive leader",
          "emoji": "👔",
          "avatar": "avatar/CEO.png"
        },
        "groupChat": {
          "mentionPatterns": ["@openclaw", "@助手"]
        },
        "heartbeat": {
          "every": "30m",
          "to": "+8618186144326",
          "directPolicy": "allow"
        },
        "tools": {
          "profile": "coding",
          "allow": ["browser", "read", "write", "edit", "exec", ...],
          "deny": ["apply_patch", "nodes.camera.snap", "bash", ...]
        }
      },
      {
        "id": "sysadmin",
        "name": "系统维护员",
        "workspace": "~/.openclaw/workspace-sysadmin",
        "model": {
          "primary": "dashscope-coding/qwen3.5-plus",
          "fallbacks": ["dashscope-coding/qwen3-coder-plus"]
        },
        "identity": {
          "name": "SysAdmin",
          "theme": "reliable system operator",
          "emoji": "🔧",
          "avatar": "avatar/SysAdmin.png"
        },
        "heartbeat": {
          "every": "24h",
          "model": "dashscope-coding/qwen3.5-plus",
          "session": "sysadmin",
          "prompt": "检查 OpenClaw 系统状态...",
          "to": "+8618186144326",
          "directPolicy": "allow"
        },
        "tools": {
          "profile": "coding",
          "allow": ["read", "write", "edit", "exec", ...],
          "deny": ["apply_patch", "browser", "canvas", ...]
        }
      }
    ]
  }
}
```

| 配置项 | 说明 |
|--------|------|
| `id` | Agent 唯一标识（必需） |
| `default` | 是否为默认 Agent |
| `name` | 显示名称 |
| `workspace` | 工作区路径 |
| `agentDir` | Agent 目录（可选） |
| `model` | 模型配置（覆盖 defaults） |
| `identity` | 身份配置（名称、emoji、头像） |
| `heartbeat` | 心跳配置（覆盖 defaults） |
| `tools` | 工具策略（覆盖 defaults） |
| `groupChat.mentionPatterns` | 群聊提及模式 |
| `params` | 模型参数覆盖 |

---

## 三、tools — 工具策略配置

### 作用
定义全局工具使用策略，包括允许/禁止的工具列表、Web 搜索/抓取配置等。

### 官方文档
https://docs.openclaw.ai/tools/index.md

### 结构
```json5
{
  "tools": {
    "profile": "coding",
    "allow": [ ... ],
    "deny": [ ... ],
    "web": { ... },
    "agentToAgent": { ... },
    "elevated": { ... }
  }
}
```

### 配置项详解

| 配置项 | 类型 | 说明 | 推荐值 |
|--------|------|------|--------|
| `profile` | string | 工具配置文件名 | `coding` / `default` |
| `allow` | array | 允许使用的工具列表 | 见下方 |
| `deny` | array | 禁止使用的工具列表 | 见下方 |
| `web.search.enabled` | boolean | 是否启用 Web 搜索 | `true` |
| `web.fetch.enabled` | boolean | 是否启用 Web 抓取 | `true` |
| `web.fetch.maxChars` | number | 抓取最大字符数 | `50000` |
| `agentToAgent.enabled` | boolean | 是否允许 Agent 间调用 | `true` |
| `elevated.enabled` | boolean | 是否允许提权操作 | `true` |
| `elevated.allowFrom` | object | 提权用户白名单 | `{"whatsapp": ["+86..."]}` |

### 常用工具列表

| 工具 | 用途 | 建议 |
|------|------|------|
| `read` | 读取文件 | ✅ 允许 |
| `write` | 写入文件 | ✅ 允许 |
| `edit` | 编辑文件 | ✅ 允许 |
| `exec` | 执行命令 | ⚠️ 按需 |
| `process` | 进程管理 | ✅ 允许 |
| `browser` | 浏览器自动化 | ⚠️ 按需 |
| `canvas` | 画布渲染 | ❌ 部分模型不支持 |
| `apply_patch` | 代码补丁 | ❌ 部分模型不支持 |
| `memory_search` | 记忆搜索 | ✅ 允许 |
| `web_fetch` | Web 抓取 | ✅ 允许 |
| `sessions_*` | 会话管理 | ✅ 允许 |
| `subagents` | 子 Agent 管理 | ✅ 允许 |

---

## 四、gateway — Gateway 服务配置

### 作用
配置 OpenClaw Gateway 服务，包括端口、认证、远程访问、控制 UI 等。

### 官方文档
https://docs.openclaw.ai/gateway/configuration.md

### 结构
```json5
{
  "gateway": {
    "port": 12328,
    "mode": "local",
    "bind": "loopback",
    "controlUi": { ... },
    "auth": { ... },
    "tailscale": { ... },
    "tls": { ... },
    "nodes": { ... }
  }
}
```

### 配置项详解

| 配置项 | 类型 | 说明 | 推荐值 |
|--------|------|------|--------|
| `port` | number | Gateway 监听端口 | `12328` |
| `mode` | string | 运行模式 | `local` / `remote` |
| `bind` | string | 绑定地址 | `loopback` / `all` |
| `controlUi.enabled` | boolean | 是否启用控制 UI | `true` |
| `controlUi.basePath` | string | 控制 UI 访问路径 | `/leo` |
| `auth.mode` | string | 认证模式 | `token` / `none` |
| `auth.token` | string | 访问令牌（敏感） | `xxx` |
| `tailscale.mode` | string | Tailscale 模式 | `off` / `on` |
| `tls.enabled` | boolean | 是否启用 HTTPS | `false` |
| `reload.mode` | string | 配置重载模式 | `hybrid` / `off` |
| `nodes.denyCommands` | array | 禁止的节点命令 | 见下方 |

### 控制 UI 访问

启用后，可通过浏览器访问：`http://localhost:12328/leo`

### 节点命令限制

```json5
{
  "gateway": {
    "nodes": {
      "denyCommands": [
        "camera.snap",
        "camera.clip",
        "screen.record",
        "contacts.add",
        "calendar.add",
        "reminders.add",
        "sms.send"
      ]
    }
  }
}
```

---

## 五、channels — 渠道配置

### 作用
配置各聊天渠道（WhatsApp、Telegram、Discord 等）的连接、访问控制、群组策略等。

### 官方文档
https://docs.openclaw.ai/channels/index.md

### 通用结构
```json5
{
  "channels": {
    "defaults": { ... },     // 默认策略
    "whatsapp": { ... },     // WhatsApp 配置
    "telegram": { ... },     // Telegram 配置
    "discord": { ... },      // Discord 配置
    "modelByChannel": { ... } // 按渠道指定模型
  }
}
```

### 渠道默认策略

```json5
{
  "channels": {
    "defaults": {
      "groupPolicy": "allowlist",  // open | allowlist | disabled
      "heartbeat": {
        "showOk": false,
        "showAlerts": true,
        "useIndicator": true
      }
    }
  }
}
```

### DM 访问策略（dmPolicy）

| 策略 | 行为 |
|------|------|
| `pairing` (默认) | 未知发送者获得一次性配对码，需管理员批准 |
| `allowlist` | 仅允许 `allowFrom` 中的发送者 |
| `open` | 允许所有 DM（需设置 `allowFrom: ["*"]`） |
| `disabled` | 忽略所有 DM |

### 群组策略（groupPolicy）

| 策略 | 行为 |
|------|------|
| `allowlist` (默认) | 仅允许配置中的群组 |
| `open` | 绕过群组白名单（提及控制仍生效） |
| `disabled` | 阻止所有群组消息 |

### WhatsApp 配置示例

```json5
{
  "channels": {
    "whatsapp": {
      "dmPolicy": "pairing",
      "allowFrom": ["+8618186144326"],
      "textChunkLimit": 4000,
      "chunkMode": "length",
      "mediaMaxMb": 50,
      "sendReadReceipts": true,
      "groups": {
        "*": { "requireMention": true }
      },
      "groupPolicy": "allowlist"
    }
  }
}
```

### Telegram 配置示例

```json5
{
  "channels": {
    "telegram": {
      "enabled": true,
      "botToken": "your-bot-token",
      "dmPolicy": "pairing",
      "allowFrom": ["tg:123456789"],
      "groups": {
        "*": { "requireMention": true }
      },
      "customCommands": [
        { "command": "backup", "description": "Git backup" }
      ],
      "historyLimit": 50,
      "mediaMaxMb": 100
    }
  }
}
```

### Discord 配置示例

```json5
{
  "channels": {
    "discord": {
      "enabled": true,
      "token": "your-bot-token",
      "mediaMaxMb": 8,
      "allowBots": false,
      "dmPolicy": "pairing",
      "allowFrom": ["1234567890"],
      "guilds": {
        "123456789012345678": {
          "slug": "friends-of-openclaw",
          "requireMention": false,
          "channels": {
            "general": { "allow": true },
            "help": {
              "allow": true,
              "requireMention": true,
              "systemPrompt": "Short answers only."
            }
          }
        }
      },
      "historyLimit": 20
    }
  }
}
```

### 按渠道指定模型

```json5
{
  "channels": {
    "modelByChannel": {
      "discord": {
        "123456789012345678": "anthropic/claude-opus-4-6"
      },
      "telegram": {
        "-1001234567890": "dashscope-coding/qwen3.5-plus"
      }
    }
  }
}
```

---

## 六、messages — 消息处理配置

### 作用
配置消息处理策略，包括响应前缀、群聊提及、消息队列、输入防抖等。

### 官方文档
https://docs.openclaw.ai/concepts/messages.md

### 配置项

```json5
{
  "messages": {
    "responsePrefix": "🦞",
    "groupChat": {
      "mentionPatterns": ["@openclaw", "@助手"],
      "historyLimit": 50
    },
    "queue": {
      "mode": "collect",           // collect | steer
      "byChannel": {
        "whatsapp": "collect",
        "telegram": "collect",
        "discord": "steer"
      },
      "debounceMs": 1000,
      "cap": 20,
      "drop": "summarize"
    },
    "inbound": {
      "debounceMs": 2000,
      "byChannel": {
        "whatsapp": 5000,
        "telegram": 3000
      }
    },
    "ackReaction": "👀",
    "removeAckAfterReply": true
  }
}
```

| 配置项 | 说明 | 推荐值 |
|--------|------|--------|
| `responsePrefix` | 响应消息前缀 | `🦞` |
| `groupChat.mentionPatterns` | 群聊提及模式（正则） | `["@openclaw"]` |
| `groupChat.historyLimit` | 群聊历史消息数 | `50` |
| `queue.mode` | 消息队列模式 | `collect` / `steer` |
| `queue.debounceMs` | 队列防抖（毫秒） | `1000` |
| `inbound.debounceMs` | 输入防抖（毫秒） | `2000` |
| `ackReaction` | 确认反应 emoji | `👀` |

---

## 七、commands — 命令配置

### 作用
配置聊天命令处理（如 `/command`、`!bash` 等）。

### 官方文档
https://docs.openclaw.ai/cli/index.md

### 配置项

```json5
{
  "commands": {
    "native": "auto",           // auto | true | false
    "text": true,               // 解析聊天消息中的 /command
    "bash": false,              // 允许 ! <cmd> 执行 shell
    "bashForegroundMs": 2000,
    "config": false,            // 允许 /config
    "debug": false,             // 允许 /debug
    "restart": true,            // 允许 /restart
    "useAccessGroups": true,
    "allowFrom": {
      "*": ["user1"],
      "discord": ["user:123"]
    }
  }
}
```

| 配置项 | 说明 |
|--------|------|
| `native: "auto"` | 自动为 Discord/Telegram 注册原生命令 |
| `text: true` | 解析聊天消息中的 `/command` |
| `bash: true` | 启用 `! <cmd>` 执行 host shell（需 elevated） |
| `config: true` | 启用 `/config` 读写配置 |
| `allowFrom` | 命令授权用户列表（设置后为唯一授权源） |

---

## 八、cron — 定时任务配置

### 作用
配置定时任务系统，用于周期性执行 Agent 任务。

### 官方文档
https://docs.openclaw.ai/automation/cron-jobs.md

### 配置项

```json5
{
  "cron": {
    "enabled": true,
    "store": "~/.openclaw/cron/jobs.json",
    "maxConcurrentRuns": 2,
    "retry": {
      "maxAttempts": 3,
      "backoffMs": [60000, 120000, 300000],
      "retryOn": ["rate_limit", "overloaded", "network", "server_error"]
    },
    "webhookToken": "xxx",
    "sessionRetention": "24h",
    "runLog": {
      "maxBytes": "2mb",
      "keepLines": 2000
    }
  }
}
```

### Cron vs Heartbeat

| 特性 | Cron | Heartbeat |
|------|------|-----------|
| 触发方式 | 固定时间点（如每周一 9:00） | 间隔时间（如每 30m） |
| 配置位置 | `cron/` 目录 | `agents.defaults.heartbeat` |
| 适用场景 | 周报、月度审查 | 日常巡检、状态检查 |

---

## 九、logging — 日志配置

### 作用
配置日志级别、输出位置、敏感信息脱敏等。

### 官方文档
https://docs.openclaw.ai/gateway/logging.md

### 配置项

```json5
{
  "logging": {
    "level": "info",
    "file": "/tmp/openclaw.log",
    "consoleLevel": "info",
    "consoleStyle": "pretty",
    "redactPatterns": [
      "\\bTOKEN\\b\\s*[=:]\\s*([\"']?)([^\\s\"']+)\\1"
    ]
  }
}
```

| 配置项 | 说明 | 推荐值 |
|--------|------|--------|
| `level` | 日志级别 | `info` / `debug` / `warn` |
| `file` | 日志文件路径 | `/tmp/openclaw.log` |
| `consoleLevel` | 控制台日志级别 | `info` |
| `consoleStyle` | 控制台样式 | `pretty` |
| `redactPatterns` | 敏感信息脱敏正则 | 见上方 |

### 日志轮转（重要）

**OpenClaw 没有内置日志轮转**，需要手动配置。

#### Windows 自动轮转（推荐）

使用提供的 PowerShell 脚本和计划任务：

```powershell
# 1. 以管理员身份运行 PowerShell
# 2. 执行配置脚本
cd C:\Users\28964\.openclaw\workspace-sysadmin\scripts
.\setup-log-rotation.ps1
```

**效果：**
- 每周日凌晨 2:00 自动执行
- 备份当前日志到 `~/.openclaw/logs/`
- 清理 30 天前的旧日志
- 自动重启 Gateway

**手动执行：**
```powershell
# 立即执行一次日志轮转
.\rotate-logs.ps1 -KeepDays 30 -RestartGateway $true

# 仅备份，不重启 Gateway
.\rotate-logs.ps1 -KeepDays 30 -RestartGateway $false
```

#### 日志级别建议

| 场景 | 推荐级别 |
|------|----------|
| 日常运行 | `info` |
| 故障排查 | `debug` |
| 节省空间 | `warn` |

---

## 十、browser — 浏览器集成配置

### 作用
配置浏览器自动化功能，包括 CDP 端口、无头模式、SSRF 策略等。

### 官方文档
https://docs.openclaw.ai/tools/browser.md

### 配置项

```json5
{
  "browser": {
    "enabled": true,
    "headless": false,
    "defaultProfile": "openclaw",
    "ssrfPolicy": {
      "dangerouslyAllowPrivateNetwork": true
    },
    "profiles": {
      "openclaw": {
        "cdpPort": 18800,
        "color": "#FF4500"
      },
      "work": {
        "cdpPort": 18801,
        "color": "#0066CC"
      }
    }
  }
}
```

| 配置项 | 说明 | 推荐值 |
|--------|------|--------|
| `enabled` | 是否启用浏览器 | `true` |
| `headless` | 无头模式 | `false` |
| `defaultProfile` | 默认浏览器配置 | `openclaw` |
| `profiles.<name>.cdpPort` | CDP 调试端口 | `18800` |
| `ssrfPolicy.dangerouslyAllowPrivateNetwork` | 允许内网访问 | `true` |

---

## 十一、bindings — Agent-渠道绑定

### 作用
将特定渠道/账号绑定到指定 Agent。

### 官方文档
https://docs.openclaw.ai/concepts/multi-agent.md

### 配置示例

```json5
{
  "bindings": [
    {
      "agentId": "main",
      "match": {
        "channel": "webchat",
        "accountId": "openclaw-control-ui"
      }
    },
    {
      "agentId": "sysadmin",
      "match": {
        "channel": "whatsapp",
        "peer": "+8618186144326"
      }
    }
  ]
}
```

| 配置项 | 说明 |
|--------|------|
| `agentId` | 目标 Agent ID |
| `match.channel` | 渠道类型（webchat、whatsapp、telegram 等） |
| `match.accountId` | 渠道账号 ID（可选） |
| `match.peer` | 对等体标识（如电话号码、用户 ID） |

---

## 十二、skills — 技能配置

### 作用
配置技能（Skills）的 API 密钥等参数。

### 官方文档
https://docs.openclaw.ai/tools/skills.md

### 配置示例

```json5
{
  "skills": {
    "entries": {
      "tavily-search": {
        "apiKey": "tvly-dev-xxx"
      }
    }
  }
}
```

---

## 十三、plugins — 插件配置

### 作用
配置插件的启用状态和参数。

### 官方文档
https://docs.openclaw.ai/tools/plugin.md

### 配置示例

```json5
{
  "plugins": {
    "allow": ["openclaw-tavily"],
    "entries": {
      "qwen-portal-auth": {
        "enabled": true
      },
      "openclaw-tavily": {
        "enabled": true,
        "config": {
          "apiKey": "tvly-dev-xxx"
        }
      }
    },
    "installs": {
      "openclaw-tavily": {
        "source": "npm",
        "spec": "openclaw-tavily",
        "version": "0.2.1"
      }
    }
  }
}
```

---

## 配置修改流程

### 1. 备份原配置
```bash
cp ~/.openclaw/openclaw.json ~/.openclaw/openclaw.json.bak
```

### 2. 编辑配置
- 使用 `edit` 工具精确修改
- 或手动编辑后验证 JSON 格式

### 3. 验证配置
```bash
openclaw config show
```

### 4. 重启 Gateway（如需）
```bash
openclaw gateway restart
```

### 5. 更新配置说明文档
- 更新 `docs/config-notes.md` 变更历史
- 更新 `docs/config-guide.md` 如有新配置项

---

## 常见配置场景

### 场景 1：添加新模型

1. 在 `models.providers.<provider>.models` 数组中添加模型定义
2. 在 `agents.defaults.models` 中添加别名映射
3. 在 Agent 的 `model.fallbacks` 中引用

### 场景 2：创建新 Agent

1. 在 `agents.list` 数组中添加新 Agent 配置
2. 指定 `id`、`name`、`workspace`
3. 配置 `model`、`identity`、`tools`
4. 在 `bindings` 中添加渠道绑定（可选）

### 场景 3：修改工具权限

1. 在 `agents.list[].tools.deny` 中添加禁止的工具
2. 或在 `tools.deny` 中全局禁止
3. 重启 Gateway 生效

### 场景 4：配置心跳

1. 在 `agents.list[].heartbeat` 中配置：
   - `every`: 间隔时间（如 `24h`）
   - `model`: 使用的模型
   - `prompt`: 心跳任务提示
   - `to`: 通知接收者
2. 或在 `agents.defaults.heartbeat` 中配置默认值

### 场景 5：配置渠道访问控制

1. 设置 `channels.<channel>.dmPolicy`（pairing | allowlist | open | disabled）
2. 设置 `channels.<channel>.allowFrom` 白名单
3. 设置 `channels.<channel>.groups` 群组策略

---

## 配置检查清单

修改配置后检查：

- [ ] JSON 格式有效（无语法错误）
- [ ] 模型 ID 在 providers 中已定义
- [ ] Agent ID 唯一
- [ ] 工作区路径存在或可创建
- [ ] 敏感信息（apiKey、token）已脱敏处理
- [ ] 变更已记录到 `docs/config-notes.md`

---

## 附录：配置速查表

### 模型别名速查

| 别名 | 完整 ID | 用途 |
|------|---------|------|
| `coding` | dashscope-coding/qwen3.5-plus | 通用主力 |
| `coder-next` | dashscope-coding/qwen3-coder-next | 代码生成 |
| `coder-plus` | dashscope-coding/qwen3-coder-plus | 代码增强 |
| `max` | dashscope-coding/qwen3-max-2026-01-23 | 复杂任务 |
| `glm5` | dashscope-coding/glm-5 | 深度思考 |
| `glm4` | dashscope-coding/glm-4.7 | 深度思考备选 |
| `kimi` | dashscope-coding/kimi-k2.5 | 视觉理解 |
| `minimax` | dashscope-coding/MiniMax-M2.5 | 长文本 |
| `tts` | dashscope/qwen3-tts-vd-2026-01-26 | 语音合成 |
| `draw` | dashscope/qwen-image-2.0-pro | 图像生成 |

### 常用命令速查

| 命令 | 用途 |
|------|------|
| `openclaw config show` | 查看当前配置 |
| `openclaw gateway status` | 查看 Gateway 状态 |
| `openclaw gateway restart` | 重启 Gateway |
| `openclaw agent --agent <id> --message "..."` | 向指定 Agent 发送消息 |
| `openclaw models list` | 列出可用模型 |
| `openclaw channels list` | 列出已配置渠道 |

### 内置别名速查

| 别名 | 模型 |
|------|------|
| `opus` | anthropic/claude-opus-4-6 |
| `sonnet` | anthropic/claude-sonnet-4-6 |
| `gpt` | openai/gpt-5.4 |
| `gpt-mini` | openai/gpt-5-mini |
| `gemini` | google/gemini-3.1-pro-preview |
| `gemini-flash` | google/gemini-3-flash-preview |

---

## 参考文档

- 官方配置参考：https://docs.openclaw.ai/gateway/configuration-reference.md
- 模型提供商：https://docs.openclaw.ai/concepts/model-providers.md
- Agent 概念：https://docs.openclaw.ai/concepts/agent.md
- 渠道配置：https://docs.openclaw.ai/channels/index.md
- 工具列表：https://docs.openclaw.ai/tools/index.md
- 中文文档镜像：https://docs.openclaw.ai

---

_本文档基于官方文档整理，配置变更时请同步更新。_
