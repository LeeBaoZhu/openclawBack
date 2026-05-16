---
name: skill-creator
description: Create, edit, improve, or audit AgentSkills. Use when creating a new skill from scratch or when asked to improve, review, audit, tidy up, or clean up an existing skill or SKILL.md file. Also use when editing or restructuring a skill directory (moving files to references/ or scripts/, removing stale content, validating against the AgentSkills spec). Triggers on phrases like "create a skill", "author a skill", "tidy up a skill", "improve this skill", "review the skill", "clean up the skill", "audit the skill", "生成技能", "创建技能", "编写技能".
---

# Skill Creator - 技能创建指南

本技能提供创建、编辑和优化 OpenClaw 技能的完整指导。结合官方规范和本地最佳实践。

**最后更新**: 2026-03-23  
**参考**: 官方 skill-creator + 本地 skill-structure.md

---

## 📖 关于技能

### 什么是技能？

技能是模块化、自包含的包，通过提供专业知识、工作流和工具来扩展 Codex 的能力。可以把它们看作特定领域或任务的「入职指南」——将 Codex 从通用 Agent 转变为配备专业知识的专用 Agent。

### 技能提供什么

1. **专业工作流** — 特定领域的多步骤流程
2. **工具集成** — 处理特定文件格式或 API 的说明
3. **领域专业知识** — 特定知识、schema、业务逻辑
4. **捆绑资源** — 脚本、参考资料、资产，用于复杂重复任务

---

## 📁 存放位置

### 目录结构

```
~/.openclaw/
├── skills/                    # ⭐ 用户自定义技能（推荐位置）
│   ├── my-skill/
│   │   ├── SKILL.md          # 必需：技能定义文件
│   │   ├── scripts/          # 可选：可执行脚本
│   │   ├── references/       # 可选：参考文档
│   │   └── assets/           # 可选：资源文件
│   └── another-skill/
│
├── extensions/                # 插件技能（插件自带，自动加载）
│   └── <plugin>/skills/
│
└── workspace-*/               # Agent 工作区（仅专属技能）
    └── skills/                # ⚠️ 仅当技能专属于某 Agent 时使用
```

### 判断流程

创建技能前先问：

```
这个技能是所有 Agent 都需要用，还是只有特定 Agent 专用？
    ↓
所有 Agent 都用 → 放全局 `~/.openclaw/skills/`
    ↓
只有特定 Agent 用 → 放工作区 `workspace-<agent>/skills/`
```

### 具体规则

1. **默认放全局**：90% 的技能应放在 `~/.openclaw/skills/`
   - 示例：`tavily-search`（搜索）、`weather`（天气）

2. **插件自带**：通过 `openclaw plugins install <plugin>` 安装，自动放在 `extensions/`

3. **专属技能**：仅当技能与特定 Agent 强绑定时
   - 示例：`agent-creator`（仅 sysadmin 用来创建 Agent）
   - 示例：`log-analyzer`（仅 sysadmin 用来分析日志）

---

## 📋 技能结构

### 完整目录结构

```
my-skill/
├── SKILL.md              # 必需，含 YAML frontmatter
├── scripts/              # 可选：确定性高的代码
│   ├── helper.py
│   └── process.sh
├── references/           # 可选：参考文档
│   ├── api-docs.md
│   └── schema.md
└── assets/               # 可选：输出用到的资源
    └── template.html
```

### 各目录用途

| 目录 | 用途 | 何时使用 |
|------|------|----------|
| `scripts/` | 可执行代码（Python/Bash 等） | 需要确定性执行、避免重复生成相同代码 |
| `references/` | 参考文档、API 说明、schema | Codex 需要查阅的详细信息 |
| `assets/` | 模板、图片、boilerplate 代码 | 输出时直接使用的资源文件 |

### ❌ 不要包含的文件

技能只应包含直接支持其功能的基本文件。**不要创建**：

- README.md
- INSTALLATION_GUIDE.md
- QUICK_REFERENCE.md
- CHANGELOG.md
- 任何关于创建过程的辅助文档

---

## ✍️ SKILL.md 编写标准

### 结构

每个 SKILL.md 包含：

- **Frontmatter** (YAML): 包含 `name` 和 `description` — Codex 仅通过这两个字段判断何时使用技能
- **Body** (Markdown): 使用指南，仅在技能触发后加载

### YAML Frontmatter（必需）

```yaml
---
name: my-skill
description: 清晰描述技能功能和触发场景
---
```

#### name 命名规则

- 小写字母 + 数字 + 连字符
- 如：`pdf-editor`、`web-search`、`bigquery-analyzer`
- 长度 < 64 字符

#### description 编写要点 ⭐ 最重要

**description 是技能的主要触发机制**，决定 Codex 何时使用该技能。

**必须包含：**
1. 技能做什么（功能）
2. 何时使用（触发场景）
3. 关键词（用户可能说的话）

**✅ 好的示例：**
```yaml
description: Web search, extraction, and crawling via Tavily API. Use when user asks to: search the web, find information, extract content from URLs, do research, or explore websites.
```

```yaml
description: 企业微信文档操作。支持文档创建、编辑、读取和智能表格管理。当用户提到"创建文档"、"编辑文档"、"查看文档"、"智能表格"时使用。
```

**❌ 差的示例：**
```yaml
description: 一个搜索技能  # 太模糊
```
```yaml
description: 处理各种文档  # 没有触发场景
```

**重要**: 所有「何时使用」信息放在 description 中，不要放在 body 里。body 只在触发后加载，所以 body 中的「何时使用」部分对 Codex 没有触发帮助。

### Body 编写指南

#### 结构建议

```markdown
# 技能名称

## 快速开始
简短说明如何使用该技能，包含 1-2 个核心示例

## 核心功能
列出主要功能点

## 使用示例
提供 3-5 个典型用户请求示例

## 注意事项
边界情况、限制、需要用户确认的操作

## 相关资源
- 脚本：`scripts/xxx.py`
- 参考：`references/xxx.md`
- 模板：`assets/xxx.html`
```

#### 编写原则

1. **使用命令式/不定式语气** — 「使用 xxx」、「调用 xxx」而非「你可以 xxx」
2. **简洁优先** — 上下文窗口是公共资源，只写 Codex 不知道的信息
3. **示例驱动** — 用具体例子说明用法，而非抽象描述
4. **保持 SKILL.md < 500 行** — 接近限制时拆分到 references/

---

## 🎯 核心设计原则

### 1. 精简是关键 (Concise is Key)

**默认假设：Codex 已经很聪明。** 只添加 Codex 没有的上下文。

**挑战每个信息：**
- 「Codex 真的需要这个解释吗？」
- 「这段话值得占用 token 吗？」

**✅ 好：**
```markdown
使用 pdfplumber 提取文本：
```python
import pdfplumber
with pdfplumber.open("file.pdf") as pdf:
    text = pdf.pages[0].extract_text()
```
```

**❌ 差：**
```markdown
PDF 是一种便携式文档格式，由 Adobe 开发...
它有很多用途，比如...
要提取文本，你可以使用很多库，其中 pdfplumber 是一个不错的选择...
```

### 2. 设置合适的自由度 (Degrees of Freedom)

根据任务脆弱性选择指导粒度：

| 自由度 | 形式 | 适用场景 |
|--------|------|----------|
| **高** (文字描述) | 启发式指导 | 多种方法都可行、依赖上下文决策 |
| **中** (伪代码/脚本) | 带参数的脚本 | 有推荐模式、允许一定变化 |
| **低** (具体脚本) | 固定流程、少参数 | 操作脆弱、一致性关键、必须按特定顺序 |

### 3. 渐进披露 (Progressive Disclosure)

技能使用三级加载系统管理上下文：

```
1. Metadata (name + description) → 始终在上下文 (~100 词)
2. SKILL.md body → 触发后加载 (<5k 词)
3. Bundled resources → 按需加载 (无限制)
```

#### 渐进披露模式

**模式 1: 高级指南 + 参考**
```markdown
# PDF 处理

## 快速开始
使用 pdfplumber 提取文本：
[代码示例]

## 高级功能
- **表单填写**: 见 [FORMS.md](references/forms.md)
- **API 参考**: 见 [REFERENCE.md](references/api.md)
- **示例集合**: 见 [EXAMPLES.md](references/examples.md)
```

**模式 2: 按领域组织**
```
bigquery-skill/
├── SKILL.md (概述和导航)
└── reference/
    ├── finance.md (收入、账单指标)
    ├── sales.md (机会、渠道)
    ├── product.md (API 使用、功能)
    └── marketing.md (活动、归属)
```

**重要指南**:
- **避免深层嵌套引用** — references 保持一层深度，所有文件直接从 SKILL.md 引用
- **结构化长文件** — 超过 100 行的文件，在顶部包含目录

---

## 🛠️ 创建技能流程

### Step 1: 理解需求

明确技能的使用场景：
- 用户会说什么触发这个技能？
- 需要完成什么任务？
- 有哪些边界情况？

**示例问题**:
> 「这个技能应该支持哪些功能？」
> 「能举几个这个技能如何使用的例子吗？」
> 「用户说什么会触发这个技能？」

### Step 2: 规划可复用内容

分析每个示例，确定需要什么资源：

| 需求 | 资源类型 |
|------|----------|
| 重复执行相同代码 → | `scripts/` |
| 需要查阅 API/schema → | `references/` |
| 输出固定模板 → | `assets/` |

### Step 3: 初始化技能目录

```bash
mkdir -p ~/.openclaw/skills/my-skill
cd ~/.openclaw/skills/my-skill
mkdir -p scripts references assets
```

### Step 4: 编写 SKILL.md

1. **先写 frontmatter**（name + description）
2. **再写 body**（快速开始、核心功能、使用示例）
3. **最后添加资源引用**

### Step 5: 实现资源

1. **scripts/**：编写并测试可执行脚本
2. **references/**：整理参考文档
3. **assets/**：准备模板和资源文件

### Step 6: 测试与迭代

1. 在真实任务上使用技能
2. 发现问题或低效
3. 更新 SKILL.md 或 resources
4. 重新测试

---

## ⚙️ 配置与触发

### 配置技能参数

在 `~/.openclaw/openclaw.json` 中：

```json
{
  "skills": {
    "entries": {
      "my-skill": {
        "apiKey": "${MY_SKILL_KEY}",
        "customOption": "value"
      }
    }
  }
}
```

### 触发机制

技能通过 **description** 字段匹配用户请求：

| 用户请求 | 匹配的技能 description 关键词 |
|----------|------------------------------|
| "搜索一下 XXX" | `search the web`, `find information` |
| "帮我写个 PDF 处理脚本" | `PDF manipulation`, `edit PDF files` |
| "分析这个数据库" | `database query`, `analyze data` |

**技巧**: 在 description 中列出用户可能说的所有变体。

---

## 🚫 常见错误

### 错误 1: 存放位置错误

**错误**: 把专属技能放在全局目录

**案例**: `agent-creator` 技能只供 sysadmin 使用，却放在了 `~/.openclaw/skills/`

**解决**: 创建技能前先判断使用范围

### 错误 2: description 太模糊

**错误**:
```yaml
description: 一个处理文档的技能
```

**正确**:
```yaml
description: 企业微信文档操作。支持文档创建、编辑、读取和智能表格管理。当用户提到"创建文档"、"编辑文档"、"查看文档"、"智能表格"时使用。
```

### 错误 3: 包含多余文件

**错误**: 创建 README.md、INSTALLATION_GUIDE.md 等人类文档

**正确**: 只保留 SKILL.md、scripts/、references/、assets/

### 错误 4: 过度解释

**错误**: 解释 Codex 已知的概念（如 Python 语法、标准库用法）

**正确**: 只写 Codex 不知道的（特定 API endpoint、内部 schema、特殊业务流程）

---

## 📊 质量检查清单

创建技能后自查：

### Frontmatter
- [ ] name 使用小写 + 连字符
- [ ] description 包含功能和触发场景
- [ ] description 包含用户可能说的关键词
- [ ] 没有其他 YAML 字段

### Body
- [ ] 使用命令式语气
- [ ] 包含 3-5 个使用示例
- [ ] 核心流程清晰
- [ ] 详细信息已移至 references/
- [ ] SKILL.md < 500 行

### 资源
- [ ] scripts/ 中的代码已测试
- [ ] references/ 文件有清晰的标题结构
- [ ] assets/ 文件确实需要
- [ ] 没有多余的文档文件

### 整体
- [ ] 技能放在正确位置（全局/插件/专属）

---

## 📝 变更历史

| 日期 | 变更内容 | 原因 |
|------|----------|------|
| 2026-03-23 | 整合官方规范和本地 skill-structure.md | 统一所有 Agent 的技能创建标准 |
| 2026-03-19 | 初始版本：存放位置规范 | 统一各 Agent 技能目录结构 |

---

**参考资料**:
- 官方 skill-creator: `~/.local/share/pnpm/global/5/.pnpm/openclaw@*/node_modules/openclaw/skills/skill-creator/SKILL.md`
- 本地规范：`/root/.openclaw/docs/skill-structure.md`
- 官方文档：https://docs.openclaw.ai/agents/skills
