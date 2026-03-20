# OpenClaw 技能编写规范

_统一技能目录结构、编写标准与最佳实践，帮助所有 Agent 创建高质量技能。_

**最后更新**: 2026-03-19  
**参考**: 官方 skill-creator 技能、OpenClaw 文档

---

## 📖 第一部分：关于技能

### 什么是技能？

技能是模块化、自包含的包，通过提供专业知识、工作流和工具来扩展 Codex 的能力。可以把它们看作特定领域或任务的「入职指南」——将 Codex 从通用 Agent 转变为配备专业知识的专用 Agent。

### 技能提供什么

1. **专业工作流** — 特定领域的多步骤流程
2. **工具集成** — 处理特定文件格式或 API 的说明
3. **领域专业知识** — 特定知识、schema、业务逻辑
4. **捆绑资源** — 脚本、参考资料、资产，用于复杂重复任务

---

## 📁 第二部分：存放位置

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
│   └── openclaw-tavily/
│       └── skills/
│           └── tavily-search/
│
└── workspace-*/               # Agent 工作区（不推荐放技能）
    └── skills/                # ❌ 避免：仅当技能专属于某 Agent 时使用
```

### 三种存放位置对比

| 位置 | 路径 | 用途 | 加载方式 |
|------|------|------|----------|
| **全局技能** | `~/.openclaw/skills/` | 所有 Agent 共享的技能 | 自动加载 |
| **插件技能** | `~/.openclaw/extensions/<plugin>/skills/` | 插件附带的技能 | 插件启用时加载 |
| **Agent 专属** | `~/.openclaw/workspace-<agent>/skills/` | 仅特定 Agent 使用 | 需配置 `agents.list[].skills` |

### ✅ 判断流程

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

### ⚠️ 常见错误

**错误**: 把专属技能放在全局目录

**案例**: 2026-03-19 创建 `agent-creator` 技能时，先放在了 `~/.openclaw/skills/`，后来才意识到这个技能只有 sysadmin 用。

**教训**: 创建技能前先判断使用范围，不要本能地放在「顺手」的全局位置。

---

## 📋 第三部分：技能结构

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

### 资源详解

#### scripts/ — 可执行脚本

- **何时使用**: 同一段代码被重复生成，或需要确定性可靠性
- **示例**: `scripts/rotate_pdf.py` 用于 PDF 旋转
- **优势**: Token 高效、确定性执行、可能无需加载到上下文即可执行

#### references/ — 参考文档

- **何时使用**: Codex 工作时需要参考的文档
- **示例**: 
  - `references/finance.md` — 财务 schema
  - `references/api_docs.md` — API 规范
  - `references/policies.md` — 公司政策
- **最佳实践**: 
  - 文件超过 10k 词时，在 SKILL.md 中包含 grep 搜索模式
  - 避免信息重复：信息应只存在于 SKILL.md 或 references 之一

#### assets/ — 资源文件

- **何时使用**: 技能需要的文件将用于最终输出
- **示例**: 
  - `assets/logo.png` — 品牌资产
  - `assets/frontend-template/` — HTML/React 样板代码
  - `assets/slides.pptx` — PPT 模板

### ❌ 不要包含的文件

技能只应包含直接支持其功能的基本文件。**不要创建**：

- README.md
- INSTALLATION_GUIDE.md
- QUICK_REFERENCE.md
- CHANGELOG.md
- 任何关于创建过程的辅助文档

技能只包含 AI Agent 完成任务所需的信息，不包含设置测试流程或用户文档。

---

## ✍️ 第四部分：SKILL.md 编写标准

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
- 将用户提供的标题标准化为连字符格式（如 "Plan Mode" → `plan-mode`）
- 按工具命名空间以提高清晰度（如 `gh-address-comments`）

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
description: Comprehensive document creation, editing, and analysis with support for tracked changes, comments, formatting preservation, and text extraction. Use when Codex needs to work with professional documents (.docx files) for: (1) Creating new documents, (2) Modifying or editing content, (3) Working with tracked changes, (4) Adding comments, or any other document tasks.
```

**❌ 差的示例：**
```yaml
description: 一个搜索技能  # 太模糊
```
```yaml
description: 处理各种文档  # 没有触发场景
```

**重要**: 所有「何时使用」信息放在 description 中，不要放在 body 里。body 只在触发后加载，所以 body 中的「何时使用」部分对 Codex 没有触发帮助。

**不要包含其他字段** — 只有 `name` 和 `description`。

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

## 🎯 第五部分：核心设计原则

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

**比喻**: Codex 像在探索路径——狭窄的桥需要护栏（低自由度），开阔的田野允许多条路线（高自由度）。

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

**模式 3: 条件详情**
```markdown
# DOCX 处理

## 创建文档
使用 docx-js 创建新文档。见 [DOCX-JS.md](references/docx-js.md)。

## 编辑文档
简单编辑直接修改 XML。

**修订模式**: 见 [REDLINING.md](references/redlining.md)
**OOXML 详情**: 见 [OOXML.md](references/ooxml.md)
```

**重要指南**:
- **避免深层嵌套引用** — references 保持一层深度，所有文件直接从 SKILL.md 引用
- **结构化长文件** — 超过 100 行的文件，在顶部包含目录

---

## 🛠️ 第六部分：创建技能流程

### Step 1: 理解需求（具体示例）

明确技能的使用场景：
- 用户会说什么触发这个技能？
- 需要完成什么任务？
- 有哪些边界情况？

**示例问题**:
> 「这个技能应该支持哪些功能？编辑、旋转、还有其他吗？」
> 「能举几个这个技能如何使用的例子吗？」
> 「用户说什么会触发这个技能？」

避免一次问太多问题。从最重要的开始，根据需要跟进。

### Step 2: 规划可复用内容

分析每个示例，确定需要什么资源：

| 需求 | 资源类型 |
|------|----------|
| 重复执行相同代码 → | `scripts/` |
| 需要查阅 API/schema → | `references/` |
| 输出固定模板 → | `assets/` |

**示例分析**:

- **pdf-editor**: 每次旋转 PDF 都要重写相同代码 → `scripts/rotate_pdf.py`
- **frontend-builder**: 每次都要写 boilerplate HTML/React → `assets/hello-world/`
- **bigquery**: 每次都要重新发现表 schema → `references/schema.md`

### Step 3: 初始化技能

```bash
# 基础技能
scripts/init_skill.py my-skill --path ~/.openclaw/skills

# 带资源目录
scripts/init_skill.py my-skill --path ~/.openclaw/skills --resources scripts,references

# 带示例文件
scripts/init_skill.py my-skill --path ~/.openclaw/skills --resources scripts --examples
```

脚本会：
- 在指定路径创建技能目录
- 生成带 frontmatter 和 TODO 占位符的 SKILL.md 模板
- 根据 `--resources` 创建资源目录
- 根据 `--examples` 添加示例文件

### Step 4: 实现技能

1. **先写 resources**：scripts/、references/、assets/
2. **再写 SKILL.md**：frontmatter + body
3. **测试脚本**：确保 scripts/ 中的代码能运行

**学习成熟设计模式**:
- **多步骤流程**: 参考 workflows.md
- **特定输出格式**: 参考 output-patterns.md

### Step 5: 打包技能

```bash
scripts/package_skill.py ~/.openclaw/skills/my-skill
```

打包脚本会：
1. **自动验证**:
   - YAML frontmatter 格式和必需字段
   - 技能命名和目录结构
   - description 完整性和质量
   - 文件组织和资源引用

2. **生成 .skill 文件** (zip 格式)

**安全限制**: symlinks 会被拒绝，打包失败。

验证失败会报告错误，修复后重新运行。

### Step 6: 迭代

1. 在真实任务上使用技能
2. 发现问题或低效
3. 更新 SKILL.md 或 resources
4. 重新测试

---

## ⚙️ 第七部分：配置与触发

### 配置技能参数

在 `~/.openclaw/openclaw.json` 中：

```json
{
  "skills": {
    "entries": {
      "tavily-search": {
        "apiKey": "tvly-dev-..."
      },
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

## 🚫 第八部分：不要做什么

### 不要创建多余文件

**❌ 不要创建**:
- README.md
- INSTALLATION_GUIDE.md
- QUICK_REFERENCE.md
- CHANGELOG.md
- 任何给人类看的说明文档

**✅ 只保留**:
- SKILL.md（给 Codex 看）
- scripts/（可执行代码）
- references/（Codex 查阅的文档）
- assets/（输出资源）

### 不要过度解释

Codex 已经知道：
- 常见编程语言的语法
- 标准库的用法
- 通用的设计模式

**只写 Codex 不知道的**:
- 特定 API 的 endpoint
- 公司内部的 schema
- 特殊的业务流程

### 不要深嵌套引用

- references/ 文件直接从 SKILL.md 引用
- 不要 references/ 内部再互相引用多层
- 保持一层引用关系

---

## 📊 第九部分：质量检查清单

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
- [ ] 打包验证通过

---

## 📝 变更历史

| 日期 | 变更内容 | 原因 |
|------|----------|------|
| 2026-03-19 | 参考官方 skill-creator 重构 | 借鉴成熟设计原则和流程 |
| 2026-03-19 | 初始版本：存放位置规范 | 统一各 Agent 技能目录结构 |

---

**参考资料**:
- 官方 skill-creator: `F:\Program\nvm\node_global\node_modules\openclaw\skills\skill-creator\SKILL.md`
- 官方文档：https://docs.openclaw.ai/agents/skills
