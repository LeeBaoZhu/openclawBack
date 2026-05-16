# Cursor + Claude Code 高效开发手册

**版本：** 2026-04-08  
**适用对象：** 技术负责人 / 全栈开发者  
**核心理念：** 简单优先、证据驱动、协同增效

---

## 📋 目录

1. [工具定位与选择](#1-工具定位与选择)
2. [Cursor 最佳实践](#2-cursor-最佳实践)
3. [Claude Code 最佳实践](#3-claude-code-最佳实践)
4. [MCP 服务器配置](#4-mcp-服务器配置)
5. [协同工作流](#5-协同工作流)
6. [快速参考卡](#6-快速参考卡)

---

## 1. 工具定位与选择

### 核心差异

| 维度 | Cursor | Claude Code |
|------|--------|-------------|
| **形态** | GUI IDE（VS Code 分支） | 命令行工具 |
| **设计理念** | AI 作为协作者，精细打磨 | AI 作为执行者，自动化任务 |
| **上下文管理** | 可视化文件引用、@历史对话 | CLAUDE.md 配置文件、MCP 工具 |
| **适用场景** | 日常编码、调试、重构 | 批量任务、系统编排、CLI 集成 |
| **学习成本** | 低（VS Code 用户无缝迁移） | 中（需命令行基础） |

### 场景选择指南

```
┌─────────────────────────────────────────────────────────┐
│  任务类型                    │  推荐工具               │
├─────────────────────────────────────────────────────────┤
│  新功能开发（需要反复调试）   │  Cursor                │
│  代码重构（多文件联动）       │  Cursor 规划模式        │
│  Bug 修复（定位 + 修复）        │  Cursor                │
│  批量文件生成/修改           │  Claude Code           │
│  项目初始化/脚手架搭建        │  Claude Code           │
│  代码审查/架构分析           │  两者皆可             │
│  测试用例生成               │  Cursor TDD 模式        │
│  文档编写                  │  Claude Code           │
│  Git 操作自动化             │  Claude Code           │
│  数据库迁移/脚本执行         │  Claude Code           │
└─────────────────────────────────────────────────────────┘
```

### 推荐工作流

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  Cursor      │────▶│  Claude Code │────▶│  Cursor      │
│ 快速原型开发  │     │ 深度优化重构  │     │ 日常维护迭代  │
└──────────────┘     └──────────────┘     └──────────────┘
```

---

## 2. Cursor 最佳实践

### 2.1 核心快捷键

| 快捷键 | 功能 | 使用频率 |
|--------|------|----------|
| `Cmd/Ctrl + I` | 打开 AI 对话面板 | ⭐⭐⭐ |
| `Shift + Tab` | 激活规划模式 | ⭐⭐⭐ |
| `Escape` | 停止 Agent 生成 | ⭐⭐ |
| `Cmd/Ctrl + .` | 快速修复建议 | ⭐⭐ |
| `/ + 命令名` | 运行自定义命令 | ⭐ |

### 2.2 规划模式（Shift + Tab）

**最重要的功能，但 80% 用户跳过。**

**使用流程：**
1. 按 `Shift + Tab` 激活规划模式
2. Agent 分析代码库并提出澄清问题
3. Agent 生成详细实现计划（Markdown）
4. 你确认/修改计划
5. Agent 执行计划

**计划文件位置：** `.cursor/plans/feature-name.md`

**何时重新规划：**
- ✅ Agent 输出偏离预期时
- ✅ 任务复杂度超出初始估计时
- ❌ 不要试图通过多轮迭代修补代码（效率低）

### 2.3 上下文管理：少即是多

**常见错误：** 手动标记太多文件

```markdown
# ❌ 错误示例
@file1.ts @file2.ts @file3.ts @file4.ts "重构认证逻辑"

# ✅ 正确示例
"重构用户认证逻辑，支持 OAuth 登录"
```

**原则：**
- 让 Agent 自己搜索上下文（语义搜索 + Grep + 文件遍历）
- 只有当你确切知道涉及哪些文件且 Agent 找不到时，才手动指定
- 冗长对话积累"上下文噪音"时，开启新对话

**对话管理规则：**

| 场景 | 操作 |
|------|------|
| 切换到不同任务 | 开新对话 |
| Agent 困惑/循环 | 开新对话 |
| 完成逻辑单元 | 开新对话 |
| 同一功能迭代 | 继续当前 |
| 调试刚写的代码 | 继续当前 |
| 需要之前上下文 | 继续当前 |

**高级技巧：** 使用 `@Past Chats` 选择性导入历史对话上下文。

### 2.4 配置 Rules 和 Skills

#### Rules（静态上下文）

**位置：** `.cursor/rules/项目规范.md`

**内容示例：**
```markdown
# 项目规范

## 构建和测试
- 构建：`npm run build`
- 测试：`npm run test`
- 类型检查：`npm run typecheck`

## 代码风格
- 使用 ES Modules
- 优先使用解构
- 异步操作使用 async/await

## 工作流
- 每次修改后运行类型检查
- 提交前确保所有测试通过
```

**响应式规则原则：**
```
第 1 周：使用默认配置
    ↓
观察 Agent 行为模式
    ↓
发现重复出现的问题
    ↓
添加针对性规则
    ↓
持续观察和迭代
```

#### Skills（动态能力）

**位置：** `.cursor/skills/技能名/SKILL.md`

**用途：**
- 自定义命令（`/命令名` 触发）
- Hook 函数（Agent 动作前后执行）
- 领域知识（相关时自动加载）

### 2.5 测试驱动开发（TDD）

**TDD 与 AI Agent 天然契合。**

**工作流：**
```
1. 让 Agent 编写测试（明确输入/输出预期）
    ↓
2. 确认测试失败（红灯阶段）
    ↓
3. 提交测试文件
    ↓
4. 让 Agent 编写实现代码（明确告知不要修改测试）
    ↓
5. 迭代直到所有测试通过
```

**高效提示词示例：**
```
为用户登录函数编写单元测试，覆盖以下场景：
1. 正确的用户名和密码应该返回 token
2. 错误的密码应该返回 401
3. 不存在的用户应该返回 404

遵循 __tests__/auth.test.ts 中的现有测试模式。
先不要写实现代码——我要先确认测试会失败。
```

### 2.6 代码审查

**生成过程中：**
- 实时查看 diff
- 发现走偏立即按 `Escape` 打断

**生成之后：**
- 点击 `Review > Find Issues` 进行专门分析
- 让 Agent 解释关键决策和权衡

**Pull Request 审查：**
```
为这次重构生成一个 Mermaid 架构图，
展示各模块之间的调用关系。
```

### 2.7 并行执行多个 Agent

**原理：** Cursor 使用 Git Worktrees 管理并行 Agent，每个 Agent 操作独立的代码副本。

**适用场景：**
- 同一任务，不同模型（对比输出）
- 同一任务，不同方案（探索多条路径）
- 复杂任务分解（并行处理子任务）

**工作流：**
1. 用相同/相关提示词启动多个 Agent
2. 让每个 Agent 独立完成
3. 并排对比结果
4. 合并最佳方案到主分支

### 2.8 高效提示词模式

| 原则 | 示例 |
|------|------|
| **具体，不模糊** | ❌ "给 auth.ts 加测试" <br> ✅ "为 auth.ts 中的 logout 函数编写边界用例测试" |
| **提供可验证目标** | 使用 TypeScript、配置 linter、编写测试 |
| **协作，非命令** | "我想重构认证模块，你能先分析现有结构，提出几种方案吗？" |

---

## 3. Claude Code 最佳实践

### 3.1 核心命令

```bash
# 启动
claude                          # 当前目录启动
claude --version                # 查看版本

# 会话管理
claude --resume <session-id>    # 恢复会话
claude --list-sessions          # 列出会话

# 权限管理
/permissions                    # 管理工具权限
/permissions add <tool>         # 添加允许的工具
/permissions deny <tool>        # 拒绝的工具

# 文件操作
/read <file>                    # 读取文件
/edit <file>                    # 编辑文件
/write <file>                   # 写入文件

# 其他
/clear                          # 清除上下文
/exit                           # 退出
```

### 3.2 CLAUDE.md 配置文件

**位置：** 项目根目录 `CLAUDE.md`

**作用：** 为 Agent 提供持久化的项目上下文（类似 Cursor 的 Rules）

**内容示例：**
```markdown
# 项目概述

这是一个 Node.js + Express + MySQL 的后端服务。

## 技术栈
- Node.js 18+
- Express 4.x
- MySQL 8.0
- TypeScript 5.x

## 代码规范
- 使用 async/await 处理异步
- 错误处理使用 try-catch
- API 响应统一格式：{ code, data, message }

## 构建和测试
- 安装：`npm install`
- 开发：`npm run dev`
- 构建：`npm run build`
- 测试：`npm run test`

## 目录结构
- /src - 源代码
- /tests - 测试文件
- /docs - 文档
```

### 3.3 权限配置

**配置文件：** `~/.claude/settings.json`（全局）或 `.claude/settings.json`（项目级）

```json
{
  "env": {
    "ANTHROPIC_API_KEY": "your-api-key",
    "ANTHROPIC_BASE_URL": "https://api.yixia.ai/",
    "CLAUDE_CODE_MAX_OUTPUT_TOKENS": 64000,
    "CLAUDE_MODEL": "claude-4-sonnet"
  },
  "permissions": {
    "allow": ["bash", "read", "edit", "write"],
    "deny": ["rm", "sudo"],
    "additionalDirectories": ["../docs/", "../shared/"]
  }
}
```

### 3.4 高效提示词模式

```markdown
# ❌ 模糊
"优化一下代码"

# ✅ 具体
"分析 src/userService.ts 的性能瓶颈，
重点关注数据库查询部分，
提出 3 个优化方案并说明优缺点"

# ✅ 带约束
"重构 API 路由，要求：
1. 保持现有接口签名不变
2. 添加请求速率限制
3. 统一错误处理
4. 不要修改数据库连接配置"
```

---

## 4. MCP 服务器配置

### 4.1 什么是 MCP

**MCP (Model Context Protocol)** 是扩展 AI 能力的标准协议，让 Claude 能访问外部工具和数据源。

### 4.2 添加 MCP 服务器

```bash
# 基本语法
claude mcp add <名称> [选项]

# 示例：添加文件系统 MCP
claude mcp add filesystem npx -y @modelcontextprotocol/server-filesystem /path/to/allowed/dir

# 示例：添加 Git MCP
claude mcp add git npx -y @modelcontextprotocol/server-git

# 示例：添加数据库 MCP
claude mcp add postgres npx -y @modelcontextprotocol/server-postgres postgresql://localhost/mydb
```

### 4.3 推荐 MCP 服务器

| 名称 | 用途 | 安装命令 |
|------|------|----------|
| **filesystem** | 安全文件访问 | `npx -y @modelcontextprotocol/server-filesystem /allowed/path` |
| **git** | Git 操作增强 | `npx -y @modelcontextprotocol/server-git` |
| **postgres** | PostgreSQL 查询 | `npx -y @modelcontextprotocol/server-postgres <connection-string>` |
| **sqlite** | SQLite 查询 | `npx -y @modelcontextprotocol/server-sqlite <db-path>` |
| **puppeteer** | 网页自动化 | `npx -y @modelcontextprotocol/server-puppeteer` |
| **memory** | 长期记忆存储 | `npx -y @modelcontextprotocol/server-memory` |

### 4.4 查看和管理 MCP

```bash
# 查看已安装的 MCP
claude mcp list

# 删除 MCP
claude mcp remove <名称>

# 更新 MCP
claude mcp update <名称>
```

---

## 5. 协同工作流

### 5.1 典型开发流程

```
┌─────────────────────────────────────────────────────────────┐
│ 阶段 1: 需求分析                                              │
│ 工具：Claude Code                                            │
│ 任务：分析需求文档，提出技术方案，评估风险                      │
│ 输出：技术方案文档（Markdown）                                 │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│ 阶段 2: 原型开发                                              │
│ 工具：Cursor                                                 │
│ 任务：快速实现核心功能，编写单元测试                           │
│ 输出：可运行的代码 + 测试用例                                 │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│ 阶段 3: 深度优化                                              │
│ 工具：Claude Code                                            │
│ 任务：代码审查、性能分析、批量重构                            │
│ 输出：优化报告 + 重构后的代码                                 │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│ 阶段 4: 日常维护                                              │
│ 工具：Cursor                                                 │
│ 任务：Bug 修复、小功能迭代、代码审查                          │
│ 输出：稳定的代码库                                           │
└─────────────────────────────────────────────────────────────┘
```

### 5.2 具体场景示例

#### 场景 1：新功能开发

```bash
# 步骤 1: Claude Code 分析需求
claude
> 分析这个需求文档，提出技术实现方案，
  包括：模块划分、接口设计、数据模型、风险评估

# 步骤 2: Cursor 实现
# 打开 Cursor，Shift+Tab 进入规划模式
# 让 Agent 根据方案生成详细实现计划
# 确认后开始编码

# 步骤 3: Claude Code 批量优化
claude
> 审查 src/ 目录下的新代码，
  找出可以批量优化的模式（如重复代码、命名不一致）
  一次性修复所有问题
```

#### 场景 2：技术债务清理

```bash
# 步骤 1: Claude Code 分析
claude
> 分析整个项目的技术债务，包括：
  1. 过时的依赖
  2. 未使用的代码
  3. 缺少测试的模块
  4. 性能瓶颈
  输出详细报告

# 步骤 2: Cursor 逐项修复
# 打开 Cursor，针对每个问题创建计划
# 使用 TDD 模式确保修复质量

# 步骤 3: Claude Code 验证
claude
> 运行所有测试，确认修复没有引入回归问题
  生成测试覆盖率报告
```

#### 场景 3：代码审查

```bash
# 步骤 1: Cursor 初步审查
# 使用 Review > Find Issues 功能
# 让 Agent 解释关键决策

# 步骤 2: Claude Code 深度审查
claude
> 审查这个 Pull Request，关注：
  1. 安全性问题
  2. 性能影响
  3. 可维护性
  4. 与现有代码的一致性
  给出具体修改建议
```

### 5.3 配置同步

**保持两个工具的配置一致：**

```bash
# Cursor Rules (.cursor/rules/项目规范.md)
# 应与
# Claude Code CLAUDE.md
# 保持相同的：
# - 构建/测试命令
# - 代码风格规范
# - 项目结构说明
```

---

## 6. 快速参考卡

### 6.1 选择决策树

```
开始
  │
  ├─ 需要 GUI/可视化调试？ ────▶ Cursor
  │
  ├─ 需要批量处理多个文件？ ──▶ Claude Code
  │
  ├─ 需要反复迭代调试？ ──────▶ Cursor
  │
  ├─ 需要执行 CLI 命令/脚本？ ─▶ Claude Code
  │
  ├─ 需要架构级分析？ ────────▶ 两者皆可
  │
  └─ 不确定？ ───────────────▶ 先用 Cursor 原型，再用 Claude Code 优化
```

### 6.2 每日工作流检查清单

```markdown
## 晨间规划（5 分钟）
- [ ] 查看今日任务优先级
- [ ] 为复杂任务选择合适工具

## 开发中
- [ ] 复杂任务先用规划模式（Cursor Shift+Tab）
- [ ] 批量任务用 Claude Code
- [ ] 上下文过载时开启新对话

## 晚间回顾（10 分钟）
- [ ] 审查今日代码变更
- [ ] 更新 CLAUDE.md / .cursor/rules（如有新规范）
- [ ] 记录遇到的问题和解决方案
```

### 6.3 常见问题速查

| 问题 | 解决方案 |
|------|----------|
| Agent 输出质量下降 | 开启新对话，清理上下文 |
| Agent 反复犯同样错误 | 添加 Rules / 更新 CLAUDE.md |
| 任务执行偏离预期 | 用规划模式重新规划 |
| 上下文不够用 | 使用 @Past Chats 选择性导入 |
| 需要访问外部数据 | 配置 MCP 服务器 |

---

## 附录：推荐学习资源

- [Cursor 官方文档](https://cursor.com/docs)
- [Cursor Agent 最佳实践](https://cursor.com/blog/agent-best-practices)
- [Claude Code 官方文档](https://docs.anthropic.com/claude-code)
- [MCP 服务器列表](https://github.com/modelcontextprotocol/servers)

---

_最后更新：2026-04-08_  
_维护者：Architect Agent_
