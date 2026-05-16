# MEMORY.md - 系统维护长期记忆

经筛选的长期记忆；读写时机见 **`AGENTS.md`**。日报在 **`memory/YYYY-MM-DD.md`**；配置说明见 **`docs/config-notes.md`**。

---

## 维护日志

### 2026-05-15 ⭐ 投递编排 Harness 三层架构
- **应用 harness engineering 优化投递编排**，创建三层防护：
  1. **单一真相源** — `cron/delivery-map.json`：所有 Agent→open_id 映射的权威定义
  2. **前置校验护栏** — `scripts/validate-delivery.py`：交叉校验 jobs.json vs delivery-map.json，检测 `target`→`to` bug、缺失字段、跨应用 open_id 错误；支持 `--fix` 自愈 + `.bak` 自动备份
  3. **可观测性 & 恢复** — 集成到每日巡检（AGENTS.md 已更新），`docs/delivery-architecture.md` 文档化
- 当前状态：15/15 任务投递配置校验通过

### 2026-05-14 ⭐ delivery.to 修复
- **心跳巡检**：日志 WARN 72, ERROR 9, FATAL 0（05-14 00:57-09:00）
- **🔴 核心问题**：05-13 reset 将 jobs.json 中所有 `delivery.to` 改为 `delivery.target`，导致所有 cron 任务投递失败
  - **根因**：OpenClaw cron 系统的 delivery 字段为 `to`（非 `target`），使用 `target` 时报 "requires target" 错误。GitHub issue #23322 确认此 bug。
  - **修复**：14 个任务的 `delivery.target` → `delivery.to`，`delivery` 必须包含：`channel` + `to` + `mode`
- **compaction 超时 2 次**：ai-news-research 和另一 session，因 Pro 模型 + 超长历史
- **默认模型已切回 Flash**：`guidor/deepseek-v4-flash`
- **config-notes.md 精简**：633 行 → ~50 行，去除 stale 历史
- **已验证**：`delivery.to` 格式正确但测试任务因 `schedule.kind` 缺失未触发（已知 `wakeMode: now` 仍需 `schedule` 字段）

### 2026-04-26
- **系统日志巡检** - 昨日（4月25日）日志统计：WARN 33, ERROR 21, FATAL 0
  - 主要问题：Cron 任务消息发送失败（4个任务持续异常）、Agent 文件编辑失败（oldText 不匹配）
  - 问题类型与 4月24-25日相同，无新增
  - 配置笔记已更新（docs/config-notes.md）
  - 报告已通过飞书发送
- **Cron 任务异常** - 5/13 任务异常：git-push/daily-plan/lifehelper-review-reminder（Message failed，2-3天）；main-weekly-learning/strategist-weekly-learning（飞书凭证问题，12天）

### 2026-04-27
- **系统日志巡检** - 今日（4月27日）巡检完成，昨日（4月26日）日志统计：WARN 52, ERROR 28, FATAL 0
  - 问题类型与 4月25-26 日相同，无新增
  - 主要关注持续性异常任务：main-weekly-learning（13天）、strategist-weekly-learning（13天）、daily-plan（连续3次）、sysadmin-daily-git-push（连续2次）
  - LLM fallback 机制正常工作（qwen3.5-plus → qwen3-coder-plus）
  - Git 同步连续 5 天失败（Token 过期），本地 commit 安全，无数据丢失
  - 配置笔记已更新（docs/config-notes.md 2026-04-27 18:12）
  - 维护记录已写入 memory/2026-04-27.md
- **Git 数据同步** - 本地 commit 成功 `d5c39077`（130 文件变更），推送到 GitHub 失败（Token 过期，连续第 5 天）
  - 本地数据安全，无丢失
  - 建议用户更新 GitHub Personal Access Token 并配置到本地 git credential
- **日志轮转** - sysadmin-log-rotation 任务 02:00 执行成功，日志 43MB（低于轮转阈值），备份目录 44K，剩余 0 个备份文件

### 2026-05-13 ⭐⭐ 重要发现 — DeepSeek V4 reasoning_content 破坏流式输出
- **问题**: Feishu blockStreaming 配置正确但用户感知不到流式效果
- **根因**: DeepSeek V4 全系列（guidor/deepseek-v4-pro、deepseek-v4-flash、直连 API）在**不传 `thinking: {type: "disabled"}` 时**，LLM 回复文本全部放在 `reasoning_content` 字段，`content` 字段全程为空
  - OpenClaw 的 blockStreaming 机制只监听 `content` 字段做块级拆分（minChars: 800）
  - `content` 始终为空 → 永不触发块推送 → 流式卡片开了但用户看到的是最后一次全量输出
  - 日志中 "Started streaming" → 2秒后 "Closed streaming" 即是明证
- **验证**: 直接 curl 测试 guidor API — 不传 thinking 时 SSE chunks 全在 `reasoning_content`；传 `thinking: {type: "disabled"}` 后 `content` 正常逐 token 更新
- **修复尝试**: 在 `agents.defaults.models["guidor/deepseek-v4-pro"]` 添加 `"params": {"thinking": "off"}`，**待验证 OpenClaw 是否将 params.thinking 透传为 API 参数**

### 2026-05-02
- **系统日志巡检** - 今日（5月2日）巡检完成，昨日（5月1日）日志统计：WARN 349, ERROR 339, FATAL 0
  - 问题类型与 4-30 一致，无新增
  - Error 总量增长（150→339）主要来自 LLM 超时和 lane task error（memory-scene-extract 52条 + main lane 35条）
  - Warning 增长（~60→349）主要来自 lightclawbot plugin warnings（52条）和 model fallback（19条）
  - Cron 异常任务 4 个：daily-plan(8次)、lifehelper-daily-review-reminder(2次)、main-weekly-learning(empty)、strategist-weekly-learning(2次)
  - 报告已通过飞书发送
- **Git 数据同步** - 4-30 已恢复，5-1 正常

### 2026-04-30
- **系统日志巡检** - 今日（4月30日）巡检完成，昨日（4月29日）日志统计：WARN ~60, ERROR ~150, FATAL 0
  - 新增问题：Tavily Search API 500 错误（2条，第三方API问题）、lifehelper-daily-review-reminder 首次失败
  - 持续问题：LLM 超时（168条，fallback正常）、persona.md 缺失（282条）、open_id cross app（52条）、edit failed（104条）
  - Cron 异常任务 4 个：daily-plan(7次)、lifehelper-daily-review-reminder(1次)、main-weekly-learning(3次)、strategist-weekly-learning(2次)
  - 报告已通过飞书发送
- **Git 数据同步** - sysadmin-daily-git-push 任务 lastRunStatus: ok（恢复）

### 2026-04-25
- **系统日志巡检** - 昨日（4月24日）日志统计：WARN 87, ERROR 104, FATAL 0
  - 主要问题：persona.md 文件读取失败（10+条）、LLM 超时触发 failover（2条）
  - 问题类型与 4月23日相同，无新增
  - 配置笔记已更新（docs/config-notes.md）
- **Git 数据同步** - 成功 commit 8936d11（更新 config-notes.md），推送失败（Token 过期，同昨日问题）
- **配置笔记更新** - 4月20日之后无配置变更，已更新最后更新时间戳

### 2026-04-24
### 2026-03-15
- **创建 sysadmin agent** - 负责日常系统维护和日志监控
- **修复 apply_patch 报错** - 在 tools.deny 中添加 `apply_patch`，解决 `dashscope-coding/qwen3.5-plus` 模型不支持该工具的问题
- **配置 24h 心跳** - 每日自动检查日志和配置状态
- **配置日志轮转** - 创建 PowerShell 脚本和 Windows 计划任务，每周自动备份和清理日志

### 2026-03-25
- **修复 lifehelper cron 任务** - `daily-plan` 每日 7:00 触发失败，原因：`delivery` 缺少 `channel` 字段，系统有多渠道（lightclawbot + feishu）无法自动选择。修复：在 `jobs.json` 的 `delivery` 中添加 `"channel": "feishu"`
- **飞书 WebSocket 波动** - 早上日志出现 `system busy`（code 1000040345）+ token 获取失败，连续重试 260+ 次。属飞书端临时限流，后续自动恢复。需持续观察是否反复出现

### 2026-04-04 ⭐ 重要教训
- **lifehelper 定时任务 open_id 错误** - 所有 lifehelper 的 Cron 任务（daily-plan, lifehelper-daily-review-reminder, lifehelper-weekly-learning）使用错误的 open_id 导致消息发送失败（HTTP 400, error 99992361: open_id cross app）。
  - **根因**：飞书开放平台中，同一个用户在不同应用下的 `open_id` 是不同的（隐私保护机制）。sysadmin 应用下的 `ou_bd0bb7c1d6a89633ec6a14ec8c04ef61` 不能用于 lifehelper 应用。
  - **正确配置**：lifehelper 应用下的用户 open_id = `ou_fb2e7f148b502e7981c11e9c0f2cace5`
  - **修复**：更新所有 lifehelper 任务的 `delivery.to` 为 `user:ou_fb2e7f148b502e7981c11e9c0f2cace5`
  - **验证**：创建测试任务 `lifehelper-test-immediate` 成功发送测试消息
  - **规范**：以后添加 lifehelper 定时任务时，必须使用 `delivery.to: "user:ou_fb2e7f148b502e7981c11e9c0f2cace5"`

### 2026-05-03
- **main-weekly-learning 飞书配置已修复 ✅** - 之前因 `Feishu account "default" not configured` 连续失败 3 次，已修复 delivery 配置为 `account: "main"`，最近一次运行状态 ok。标记为已解决，下次巡检不再列为问题。

### 2026-04-04 ⭐ 所有 Agent 飞书 open_id 配置规范
| Agent | 应用 ID | 用户 open_id | delivery.to 配置 |
|-------|--------|-------------|-----------------|
| main (CEO) | `cli_a937d2339678dcc5` | `ou_543d6577cd3ad27f748e5e8913838a1b` | `user:ou_543d6577cd3ad27f748e5e8913838a1b` |
| sysadmin | `cli_a9340b99e0389bde` | `ou_bd0bb7c1d6a89633ec6a14ec8c04ef61` | `user:ou_bd0bb7c1d6a89633ec6a14ec8c04ef61` |
| strategist | `cli_a93405978578dbdb` | `ou_72de9e52b705b59bcaaa61a679c92d46` | `user:ou_72de9e52b705b59bcaaa61a679c92d46` |
| lifehelper | `cli_a934061d57f85bd7` | `ou_79fa84f314603ff9d7b6ef944e5d3c8c` | `user:ou_79fa84f314603ff9d7b6ef944e5d3c8c` |
| healthadvisor | `cli_a9371dd4d078dbcb` | `ou_fb2e7f148b502e7981c11e9c0f2cace5` | `user:ou_fb2e7f148b502e7981c11e9c0f2cace5` |
| product-owner | `cli_a94e198977f95bc3` | `ou_1f6a2206fbf18db40dd59acff15b2841` | `user:ou_1f6a2206fbf18db40dd59acff15b2841` |
| architect | `cli_a94e1aa3f6b89bc2` | `ou_c6acb488a489dbcefc955a4a1c216bd0` | `user:ou_c6acb488a489dbcefc955a4a1c216bd0` |

**重要**：创建新定时任务时，必须根据 `agentId` 查表选择正确的 `delivery.to` 配置。

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

### 2026-03-19 ⭐ 重要教训
**错误**: 创建 `agent-creator` 技能时，先放在了全局目录 `~/.openclaw/skills/`，后来才意识到应该放在 sysadmin 工作区。

**原因**: 
- 没有先判断技能的使用范围
- 忘记了刚制定的技能存放规范
- 本能地放在了「顺手」的全局位置

**解决方案**:
- 技能存放前先看 `~/.openclaw/docs/skill-structure.md`
- 问自己：「这个技能是所有 Agent 都需要用，还是只有某个 Agent 专用？」
- **全局技能** → `~/.openclaw/skills/`（如 tavily-search）
- **专属技能** → `workspace-<agent>/skills/`（如 agent-creator 仅供 sysadmin 使用）

**改进措施**:
- ✅ 已更新 `agent-creator` 技能到正确位置 `workspace-sysadmin/skills/`
- ✅ 在 `agent-creator/SKILL.md` 开头添加说明：「本技能仅供 sysadmin 使用」
- ✅ 在技能规范文档中强调判断标准

### 2026-03-22 ⭐ 重要知识
**知识点**: OpenClaw 配置修改后**自动热重载**，不需要重启 Gateway。

**背景**: 用户提醒配置改完立即生效，不需要建议重启。

**改进措施**:
- ✅ 修改 `openclaw.json` 后直接说「配置已完成」
- ✅ 不再建议 `openclaw gateway restart`
- ✅ 仅在新增插件、技能或 Gateway 本身故障时才需要重启

**例外情况**（需要重启）:
- 安装/更新插件后
- 安装/更新技能后
- Gateway 进程异常
- 配置热重载失败（日志会提示）

---

### 2026-03-26
- **用户约定：「提交本地数据」** - 用户说「提交本地数据」时，默认执行：cd /root/.openclaw → git add . → git commit → git push
- **Cron 任务配置教训** ⭐ - 新建 Cron 任务时，`delivery` 必须包含 `channel` 和 `target` 字段，否则执行时报错「Delivering to Feishu requires target」。修复方法：在 delivery 中添加 `"channel": "feishu"` 和 `"target": "user:ou_bd0bb7c1d6a89633ec6a14ec8c04ef61"`
- **⚠️ 飞书应用配置教训** - openclaw.json 中的 appId/appSecret 是占位符，实际未创建。**禁止假设配置已存在**。正确流程：用户先在飞书开放平台创建应用 → 获取 appId/appSecret → 提供给 AI → AI 更新配置。不要随机生成或假设配置已生效。
- **sysadmin 飞书应用权限问题** ✅ - 2026-03-26 23:29 - 问题：无法创建/编辑飞书文档（99991672 错误）。原因：系统维护员对应的应用 `cli_a9340b99e0389bde` 未开通文档权限。解决：在飞书开放平台开通 `docx:document`, `docx:document:create`, `wiki:wiki`, `wiki:wiki:readonly`, `wiki:space:retrieve` 等权限。验证：成功创建测试文档 https://feishu.cn/docx/MxmLdGmMdoCpljxB6rhcyJ25nlg
- **产品负责人应用权限问题** ⚠️ - 待确认产品负责人应用 `cli_a94e198977f95bc3` 是否开通文档权限，每个 Agent 有独立飞书应用，需分别配置

### 2026-03-25 ⭐ 重要教训
**错误**: `daily-plan` Cron 任务连续失败，生活助理早上没给用户发消息，用户自己发现才来问。

**原因**: 
- 系统配置了多个渠道（lightclawbot + feishu），Cron 任务的 `delivery` 只写了 `"mode": "announce"` 没有指定 `channel`
- Cron runner 不知道往哪个渠道发，直接报错
- `jobs.json` 中 `consecutiveErrors: 1` 说明之前就失败了，但没人注意到

**解决方案**:
- 在 `delivery` 中显式指定 `"channel": "feishu"`

**改进措施**:
- ✅ **配置多渠道时，所有 Cron 任务的 delivery 必须显式指定 channel** — 不能依赖自动推断
- ✅ **新建 Cron 任务时，检查清单应包含**：schedule、agentId、delivery.channel、payload — 缺一不可
- ✅ **日常巡检应主动检查 `jobs.json` 的 `lastRunStatus`** — 不能等用户发现任务没跑才知道
- ✅ **Cron 任务失败应视为 error 级别事件**，在日报中主动报告，不要等用户来问

### 2026-04-03 ⭐⭐⭐ 重要教训 — Exec 审批双层配置问题
**错误**: strategist/lifehelper 等 Agent 执行 exec 命令时报错「Exec approval is required, but Feishu does not support chat exec approvals」，即使 `openclaw.json` 中已配置 `tools.exec.ask: "off"`。

**原因**: 
- OpenClaw 的 exec 审批有**两层配置**，有效策略取两者中**更严格**的那个：
  1. **请求策略**: `openclaw.json` → `tools.exec.*`（用户配置）
  2. **执行策略**: `~/.openclaw/exec-approvals.json` → host-local 审批状态（实际执行）
- 只修改了 `openclaw.json`，但 `exec-approvals.json` 仍然是 `"security": "allowlist"`, `"ask": "on-miss"`
- 不同 Agent 的 session 是独立创建的，修改配置后**已有 session 不会自动更新权限**，需要重建 session 或重启 Gateway

**解决方案**:
```bash
# 方法 1: 使用 CLI 命令更新 host-local 审批配置（推荐）
openclaw approvals set --stdin <<'EOF'
{
  "version": 1,
  "defaults": {
    "security": "full",
    "ask": "off",
    "askFallback": "full",
    "autoAllowSkills": true
  }
}
EOF

# 方法 2: 直接编辑 exec-approvals.json 文件
# 修改 defaults 部分为上述配置
```

**改进措施**:
- ✅ **修改 exec 审批配置时，必须同时检查两个文件**：
  - `openclaw.json` → `tools.exec.*`
  - `~/.openclaw/exec-approvals.json` → `defaults.*`
- ✅ **使用 `openclaw approvals get` 命令验证有效策略**，确认两层配置已同步
- ✅ **YOLO 模式标准配置**（无需审批）:
  - `tools.exec.security: "full"`
  - `tools.exec.ask: "off"`
  - `exec-approvals.json.defaults.security: "full"`
  - `exec-approvals.json.defaults.ask: "off"`
  - `exec-approvals.json.defaults.askFallback: "full"`
- ✅ **配置完成后无需重启 Gateway**，但如果已有 session 缓存旧权限，可能需要重启或等待 session 自然过期

**诊断命令**:
```bash
# 查看当前有效审批策略
openclaw approvals get

# 查看 openclaw.json 中的 exec 配置
grep -A5 '"exec"' ~/.openclaw/openclaw.json

# 查看 exec-approvals.json 内容
cat ~/.openclaw/exec-approvals.json
```

**官方文档参考**: https://docs.openclaw.ai/tools/exec-approvals

---

### 2026-05-11 ⭐⭐⭐ 重要教训 — 不支持字段导致 hot-reload 失败，通道全断

**故障**: 全部 13 个 cron 任务从 2026-05-11 00:08 起 delivery 全部失败（`Unknown channel: feishu` / `Channel is required (no configured channels detected)`）。

**根因**: 用户在 `agents.defaults.compaction` 中添加了 `notifyUser: true`（同时替换了 `model` 行），该字段 OpenClaw v2026.3.24 不支持，导致 config hot-reload 跳过/部分失败，**飞书 channel 被反注册**。

**关键发现**:
- `notifyUser` 是 compaction 相关字段，当前版本不支持
- Hot-reload 失败不仅使新配置不生效，还会**反注册已有的 channel 插件**
- 影响是全局的：所有 agent 的 cron 任务都无法投递

**修复步骤**:
1. 从 `agents.defaults.compaction` 移除 `notifyUser: true` 和 `keepRecentTokens: 80000`
2. `openclaw gateway restart` — 必须重启 Gateway 才能重新注册 channel

**教训**:
- ✅ 在 `openclaw.json` 中添加新字段前，确认当前版本支持该字段
- ✅ 修改 `agents.defaults` 级别配置尤其危险，影响所有 agent
- ✅ 不支持字段不只是「被忽略」，会导致 hot-reload 中断和副作用（channel 反注册）
- ✅ 修改配置后应验证消息通道是否仍可用（发送测试消息）

### 其他经验
- **工具配置档兼容性** - `coding` profile 默认包含 `apply_patch`，但并非所有模型都支持。遇到未知工具报错时，先检查模型能力，再用 `tools.deny` 排除。
- **心跳频率选择** - 系统维护类任务 24h 足够，过于频繁会浪费 token；用户交互类心跳 30m 合适。
- **日志分析优先级** - fatal > error > warning，但 warning 趋势（如某类 warning 突然增多）可能预示问题。
- **经验记录** - 如果 web ui 不支持切换 agent，可以通过 `openclaw agent --agent sysadmin --message "生成一份系统维护报告"` 先生成会话，有了会话就可以切换 agent。

---
### 2026-04-08
- **修复 LX Music 外网访问问题** - server 无法访问 http://43.129.20.177:9527/hello
  - **根因**：腾讯云轻量应用服务器的「防火墙」规则需要添加端口 9527，规则添加后约 30 秒到几分钟生效
  - **现象**：本地监听正常（ss -tlnp | grep 9527 显示 0.0.0.0:9527），本地访问正常（curl localhost:9527/hello 返回 Hello），但公网 IP 访问超时
  - **解决步骤**：
    1. 确认轻量服务器防火墙规则已添加（端口 9527, TCP, 0.0.0.0/0, 允许）
    2. 等待 30+ 秒让规则生效
    3. 通过 curl http://43.129.20.177:9527/hello --connect-timeout 5 验证
  - **配置文件**：/root/lx-music-sync/config.js
  - **服务状态**：正常运行，外网访问已验证通过
  - **规范**：轻量服务器防火墙规则添加后需等待 30 秒到几分钟生效，不可立即测试

**重要教训** ⭐：腾讯云轻量应用服务器（Lighthouse）没有传统「安全组」概念，而是用「防火墙」功能，配置位置在腾讯云控制台 → 轻量应用服务器 → 防火墙，添加规则后需等待生效（通常 30 秒-数分钟）。此问题易与标准 CVM 的安全组混淆。

**改进措施**:
- ✅ 已更新 docs/config-notes.md 记录 LX Music 服务器配置和防火墙设置
- ✅ 已在 MEMORY.md 记录此问题和解决方案
- ✅ 明确区分轻量服务器「防火墙」与 CVM「安全组」的配置方式
- ✅ 记录规则生效延迟现象，下次遇到类似问题优先检查等待时间

---

### 2026-04-09 ⭐⭐⭐ 定时任务消息投递问题排查流程

**问题**：用户说「没收到定时任务消息」，但 cron 任务状态显示 `lastRunStatus: ok`

**排查流程**（按顺序执行）：

1. **检查 cron 任务配置**
   ```bash
   cat /root/.openclaw/cron/jobs.json | jq '.jobs[] | {id, delivery: .delivery.to}'
   ```
   - 确认 `delivery.to` 格式正确：`user:ou_xxx`
   - 确认 open_id 与 Agent 应用匹配（不同应用的 open_id 不通用）

2. **检查任务执行日志**
   ```bash
   tail -3 /root/.openclaw/cron/runs/<任务 ID>.jsonl
   ```
   - 查看 `status` 是 `ok` 还是 `error`
   - 查看 `deliveryStatus` 是 `delivered` 还是 `unknown`
   - 查看 `error` 字段的具体错误信息

3. **直接测试消息投递**
   - 使用 message 工具直接发送测试消息到目标 open_id
   - 如果失败（HTTP 400）→ **应用缺少飞书权限**
   - 如果成功但用户没收到 → **open_id 错误**

4. **检查飞书应用权限**
   - 打开飞书开放平台 → 对应应用 → 权限管理
   - 确认开通：`im:message`、`im:message:send_as_bot`、`im:chat`
   - **权限开通后可能需要 5-10 分钟生效，或需要重启 Gateway**

5. **确认 open_id 正确性**
   - 在飞书开放平台 → 应用 → 测试用户列表 查看用户的 open_id
   - 或在飞书会话中让机器人发送 `/whoami` 查看当前会话的 user_id
   - **不同应用下的 open_id 不同，不能用 sysadmin 的 open_id 给 lifehelper 发消息**

**常见错误**：
- ❌ open_id 格式错误：缺少 `user:` 前缀
- ❌ open_id 跨应用使用：sysadmin 的 open_id 不能用于 lifehelper
- ❌ 应用缺少飞书权限：需要在开放平台开通 `im:message` 等权限
- ❌ 权限刚开通未生效：等待 5-10 分钟或重启 Gateway
- ❌ cron 表达式格式错误：`0 20:42 * * *` ❌ 应为 `42 20 * * *` ✅

**解决方案**：
1. open_id 错误 → 在飞书开放平台查看正确的 open_id
2. 权限缺失 → 开通权限后等待生效或重启 Gateway
3. 配置混乱 → 统一所有 Agent 使用同一个 open_id（都走 sysadmin 渠道）

**本次案例**：
- lifehelper 应用缺少 `im:message` 权限 → 用户在开放平台开通 → 等待生效 → 测试成功
- 最终配置：sysadmin 任务发当前会话，lifehelper 任务发另一个会话

---

### 2026-04-10 ⭐ lifehelper open_id 错误修复

**问题**：lifehelper 定时任务从 4 月 10 日开始失败，错误代码 `99992361: open_id cross app`

**根因**：
- 原配置使用 `ou_fb2e7f148b502e7981c11e9c0f2cace5`，该 open_id 不属于 lifehelper 应用
- 正确 open_id 应在 lifehelper 机器人私聊中通过 `/whoami` 获取

**修复**：
- 正确 open_id：`ou_79fa84f314603ff9d7b6ef944e5d3c8c`（在 lifehelper 机器人私聊中获取）
- 更新所有 lifehelper 任务的 `delivery.to` 为 `user:ou_79fa84f314603ff9d7b6ef944e5d3c8c`
- 创建测试任务验证成功

**教训**：
- ✅ 不同飞书应用下的 open_id 不同，必须在对应应用的机器人私聊中获取
- ✅ 不能假设多个应用共享同一个 open_id
- ✅ 获取 open_id 时必须确认是在目标应用的会话中

---

### 2026-04-21 ⭐ 日志轮转任务执行记录

**任务**：sysadmin-log-rotation 定时任务执行
- **执行时间**：2026-04-21 02:10:05 (Asia/Shanghai)
- **执行结果**：✅ 成功
- **日志大小**：31MB（低于轮转阈值，无需轮转）
- **备份清理**：已清理 7 天前过期备份
- **备份目录状态**：大小 44K，剩余备份文件数 0

**备注**：日志大小正常，系统运行稳定。


