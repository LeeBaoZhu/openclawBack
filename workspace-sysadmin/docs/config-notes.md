# OpenClaw 配置笔记（openclaw.json 说明文档）

本文档由系统维护员维护，用于说明与跟踪 `openclaw.json` 的配置：核心摘要、变更历史、已知问题与待确认事项。配置变更或巡检结论更新时请同步修改此处。

## 最后更新
2026-03-19 22:59

## 核心配置摘要

### 默认模型
| 别名 | 模型 | 用途 |
|------|------|------|
| coding | dashscope-coding/qwen3.5-plus | 主模型 |
| kimi | dashscope-coding/kimi-k2.5 | 备用 |
| max | dashscope-coding/qwen3-max-2026-01-23 | 备用 |
| light | dashscope/qwen-turbo | 轻量任务 |
| plus-paygo | dashscope/qwen-plus | 备用 |

### 启用的 Agent
| ID | 名称 | 工作区 | 模型 |
|----|------|--------|------|
| main | CEO Agent | ~/.openclaw/workspace | dashscope-coding/qwen3.5-plus |
| sysadmin | 系统维护员 | ~/.openclaw/workspace-sysadmin | dashscope/qwen-turbo |

### 启用的渠道
| 渠道 | 状态 | 备注 |
|------|------|------|
| webchat | ✅ | 控制 UI /leo |
| whatsapp | ✅ | 心跳通知 |

### 工具策略
- **Profile:** `coding`
- **Deny:** `apply_patch` (模型不支持)
- **Elevated:** 启用

### 关键配置
- **上下文窗口:** 200K tokens
- **会话修剪:** cache-ttl 模式，1h TTL
- **心跳间隔:** 30m (main), 24h (sysadmin)
- **最大并发:** 10

---

## 变更历史

| 日期 | 变更内容 | 原因 |
|------|----------|------|
| 2026-03-19 | 创建 Agent 创建技能 `workspace-sysadmin/skills/agent-creator/` | 标准化 Agent 创建流程，供 sysadmin 自用 |
| 2026-03-19 | 创建全局技能规范 `~/.openclaw/docs/skill-structure.md` | 统一各 Agent 技能目录结构 |
| 2026-03-15 | 添加 `apply_patch` 到 deny 列表 | 模型不支持该工具，启动报错 |
| 2026-03-15 | 创建 sysadmin agent | 系统维护自动化需求 |

---

## 待确认事项

- [ ] 日志文件实际位置确认（/tmp/openclaw.log 或 ~/.openclaw/openclaw.log）
- [ ] 日志轮转策略是否需要配置
- [ ] 是否需要添加更多监控指标（token 用量、API 调用失败率）
- [ ] 全局技能目录 `~/.openclaw/skills/` 是否需要预创建

---

## 文档索引

| 文档 | 用途 |
|------|------|
| `~/.openclaw/docs/skill-structure.md` | 技能存放规范（全局） |
| `workspace-sysadmin/skills/agent-creator/SKILL.md` | Agent 创建技能（sysadmin 自用） |
| `docs/config-notes.md` | 本文件：openclaw.json 配置说明 |

---

## 已知问题

| 问题 | 状态 | 备注 |
|------|------|------|
| `apply_patch` 工具不可用 | ✅ 已修复 | 添加到 deny 列表 |
