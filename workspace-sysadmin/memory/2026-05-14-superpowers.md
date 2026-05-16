# Session: 2026-05-14 00:54:50 UTC

- **Session Key**: agent:sysadmin:feishu:direct:ou_bd0bb7c1d6a89633ec6a14ec8c04ef61
- **Session ID**: f09021fa-4689-4e8b-86e9-ee975a8cca2b
- **Source**: feishu

## Conversation Summary

assistant: 结果太泛了——全是超级英雄和超导公司。"powersuper" 在哪个上下文出现的？是 GitHub 项目、AI 工具、还是别的领域？给点上下文我精准搜。
user: Conversation info (untrusted metadata):
```json
{
  "message_id": "om_x100b6f6531f328a8b2484c03acb582f",
  "sender_id": "ou_bd0bb7c1d6a89633ec6a14ec8c04ef61",
  "sender": "Leo-李宝烛",
  "timestamp": "Thu 2026-05-14 08:31 GMT+8"
}
```

Sender (untrusted metadata):
```json
{
  "label": "Leo-李宝烛 (ou_bd0bb7c1d6a89633ec6a14ec8c04ef61)",
  "id": "ou_bd0bb7c1d6a89633ec6a14ec8c04ef61",
  "name": "Leo-李宝烛"
}
```

[message_id: om_x100b6f6531f328a8b2484c03acb582f]
Leo-李宝烛: 是github的项目
assistant: GitHub 上搜 "powersuper" 只有 2 个结果（一个葡萄牙语的 Minecraft 反代理工具），几乎可以忽略。但你大概率指的是 **`obra/superpowers`** — 一个非常火的 agentic skills 框架。

---

## obra/superpowers — 概览

| 项目 | 详情 |
|------|------|
| **仓库** | https://github.com/obra/superpowers |
| **作者** | Jesse (obra) — Claude Code 核心开发者 |
| **Star** | 931+（marketplace 仓库） |
| **定位** | 给 AI 编程 Agent 的**可组合技能框架 + 软件开发方法论** |

---

### 它做什么

不是直接写代码，而是给 coding agent 加一套**工作流纪律**：

1. **brainstorming** — 编码前先追问你要什么，输出设计文档，分段让你确认
2. **writing-plans** — 确认设计后生成实现计划（TDD/YAGNI/DRY），清晰到「热情但没品味的初级工程师」都能执行
3. **subagent-driven-development** — 启动子 agent 逐个执行任务，自动 review，可自主工作数小时不偏离计划
4. **using-git-worktrees** — 自动创建隔离分支、跑项目初始化、验证测试基线

支持 **Claude Code / Codex CLI / Cursor / Gemini CLI / Copilot CLI** 等主流 harness。

---

### 跟你（OpenClaw 体系）的关系

这本质上是 **OpenClaw Skills 的竞品/对标项目**。核心差异：

- **OpenClaw Skills** — 通用 Agent Skills 框架，覆盖文档、会议、搜索、运维等多领域
- **Superpowers** — 专注**编码场景**的方法论，解决「AI 写的代码能用但不可维护」的问题

值得关注的信号：**agentic skills 正在成为行业共识**。Superpowers 今年的爆发说明市场在从「让 AI 写代码」进化到「让 AI 按工程纪律写代码」。你的 OpenClaw 技能体系可以借鉴它的自动化工作流触发机制（skills trigger automatically based on context）。

---

是不是这个？还是说你在哪个社群/文章里看到过别的 "powersuper" 的提法？
user: Conversation info (untrusted metadata):
```json
{
  "message_id": "om_x100b6f65cc8b7504b24ca30ff9d8671",
  "sender_id": "ou_bd0bb7c1d6a89633ec6a14ec8c04ef61",
  "sender": "Leo-李宝烛",
  "timestamp": "Thu 2026-05-14 08:32 GMT+8"
}
```

Sender (untrusted metadata):
```json
{
  "label": "Leo-李宝烛 (ou_bd0bb7c1d6a89633ec6a14ec8c04ef61)",
  "id": "ou_bd0bb7c1d6a89633ec6a14ec8c04ef61",
  "name": "Leo-李宝烛"
}
```

[message_id: om_x100b6f65cc8b7504b24ca30ff9d8671]
Leo-李宝烛: glm5.1
assistant: **GLM-5.1** — 智谱 2026年3月27日发布，4月8日开源。

| 维度 | 数据 |
|------|------|
| **架构** | 744B MoE，40B 活跃参数/token |
| **许可** | MIT 开源，HuggingFace: `zai-org/GLM-5.1` |
| **SWE-bench Pro** | 全球第三、国产第一、开源第一（超越 Opus 4.6） |
| **Terminal-Bench 2.0** | 63.5（Opus 4.6 = 65.4，非常接近） |
| **NL2Repo** | 远超 GLM-5 |
| **核心卖点** | 单次任务**持续自主工作 8 小时**，自主拆解任务→试错→修复→交付 |
| **定价** | 涨价 10%，Coding 缓存命中价接近 Claude Sonnet 4.6 |
| **可用渠道** | OpenRouter (`z-ai/glm-5.1`)、z.ai、bigmodel.cn |

---

**跟你的体系直接相关的信号：**

1. **OpenClaw 已知问题** — GitHub issue `openclaw/openclaw#76048`：GLM-5 reasoning 模型在 OpenClaw 2026.4.29 返回空响应（和之前 DeepSeek V4 `reasoning_content` 问题类似，可能同根同源）

2. **superpowers + GLM-5.1 的叠加** — obra/superpowers 是方法论层，GLM-5.1 是执行层。GLM-5.1 的「8小时自主工作」定位和 superpowers 的「subagent-driven-development」天然匹配

3. **性价比信号** — 涨价后对齐 Claude 定价，说明智谱在从「性价比」转向「能力看齐」。考虑到你追求成本效率（1/17 成本达成同等能力），可以关注 OpenRouter 上 `z-ai/glm-5.1` 的实际价格和表现。

---

是想评估 GLM-5.1 能不能接入 guidor/OpenClaw 体系，还是在关注开源模型格局？
user: Conversation info (untrusted metadata):
```json
{
  "message_id": "om_x100b6f65c6101074b29e4d80618c818",
  "sender_id": "ou_bd0bb7c1d6a89633ec6a14ec8c04ef61",
  "sender": "Leo-李宝烛",
  "timestamp": "Thu 2026-05-14 08:34 GMT+8"
}
```

Sender (untrusted metadata):
```json
{
  "label": "Leo-李宝烛 (ou_bd0bb7c1d6a89633ec6a14ec8c04ef61)",
  "id": "ou_bd0bb7c1d6a89633ec6a14ec8c04ef61",
  "name": "Leo-李宝烛"
}
```

[message_id: om_x100b6f65c6101074b29e4d80618c818]
Leo-李宝烛: glm5.1本地部署的要求是啥，硬件和软件
assistant: ## GLM-5.1 本地部署要求

### 模型规格

| 项目 | 数值 |
|------|------|
| 架构 | 744B 总参 / 40B 活跃 (MoE) |
| 精度 | BF16 → **1.65TB** 磁盘 / FP8 版本更小 |
| 上下文窗口 | 200K tokens |

---

### 🖥 硬件要求（阶梯式）

| 方案 | 精度 | 磁盘 | 内存/显存 | 适用硬件 |
|------|------|------|-----------|----------|
| **CPU 极简** | 1-bit GGUF | ~200GB | 180-220GB RAM | 高端工作站（128核+256GB） |
| **CPU+单GPU 混合** | 2-bit GGUF | ~236GB | 1×24GB GPU + 256GB RAM | Mac M2 Ultra 192GB / RTX 4090+256GB RAM |
| **Mac 统一内存** | 2-bit GGUF | ~236GB | 256GB 统一内存 | Mac Studio M3 Ultra |
| **FP8 满血** | FP8 | ~800GB | 8×H200 (~860GB VRAM) | 数据中心 |
| **BF16 原生** | BF16 | 1.65TB | 10+×H200 | 数据中心 |

> ⚠️ 你的腾讯云轻量服务器跑不了——即使是 1-bit 量化也需要 ~200GB RAM，这不是云主机级别的事。

---

### 📦 推理框架

| 框架 | 版本要求 | 场景 |
|------|----------|------|
| **llama.cpp** + GGUF | 最新 | CPU / 单GPU混合，最实用 |
| **vLLM** | v0.19.0+ | 多GPU服务器 |
| **SGLang** | v0.5.10+ | 多GPU，支持 speculative decoding |
| **KTransformers** | v0.5.3+ | 异构计算优化 |
| **Unsloth Studio** | 最新 | 图形化一键部署（仅GGUF） |

---

### 🎯 实用推荐

**如果想低成本体验**：
- 走 z.ai API（云端调用，1024 价格约 0.8元/百万token）
- 或用 OpenRouter 上的 GLM-5.1，直接接入 guidor

**如果想本地跑**：
- 最低门槛：买一台 **Mac Studio M3 Ultra 256GB**，用 Unsloth 2-bit GGUF，一套约 3-5 万
- 单 GPU 方案：RTX 6000 Ada（48GB VRAM）+ 256GB 系统 RAM + llama.cpp MoE offloading

---

**结论**：GLM-5.1 本地部署对个人是重型投资。对你来说，更务实的路径是——通过 API/OpenRouter 接入，把 GLM-5.1 作为 `guidor` 的一个后端 provider，跟现在的 DeepSeek V4 Pro 并行使用。
user: Conversation info (untrusted metadata):
```json
{
  "message_id": "om_x100b6f65d0e3b4acb2ebf23b0e9dbe8",
  "sender_id": "ou_bd0bb7c1d6a89633ec6a14ec8c04ef61",
  "sender": "Leo-李宝烛",
  "timestamp": "Thu 2026-05-14 08:40 GMT+8"
}
```

Sender (untrusted metadata):
```json
{
  "label": "Leo-李宝烛 (ou_bd0bb7c1d6a89633ec6a14ec8c04ef61)",
  "id": "ou_bd0bb7c1d6a89633ec6a14ec8c04ef61",
  "name": "Leo-李宝烛"
}
```

[message_id: om_x100b6f65d0e3b4acb2ebf23b0e9dbe8]
Leo-李宝烛: Superpowers和SpecKit有什么区别？
assistant: ## Superpowers vs Spec Kit

两者定位完全不同——**一个管过程，一个管文档**。

| 维度 | **Superpowers** | **Spec Kit** |
|------|----------------|-------------|
| **作者** | Jesse Vincent (独立开发者) | GitHub/Microsoft (官方) |
| **定位** | 编码 Agent 的「工作方法论插件」 | 「规约驱动开发」工具链 |
| **核心思想** | 给 AI coding agent 一套自动触发的开发流程 | 让 spec 成为可执行的，直接驱动代码生成 |
| **安装方式** | 各 agent 插件市场安装（Claude Code `/plugin install`、Cursor `/add-plugin`） | 安装 `specify` CLI 工具，再集成到 agent |
| **触发机制** | **上下文自动触发** — agent 检测到你「在写代码」就自动介入 | **手动 slash 命令** — `/speckit.specify` → `/speckit.plan` → `/speckit.tasks` → `/speckit.implement` |
| **工作流** | Brainstorm → Design（短块可读）→ Plan（分任务 2-5min/个）→ 子Agent分批执行 → TDD 红绿重构 → Code Review → 合入分支 | /specify（写需求）→ /plan（定技术方案）→ /tasks（拆任务）→ /implement（执行） |
| **落地** | 不产出独立的 spec 文件，规则嵌入 agent 行为 | **产出结构化 spec/plan/task 文件**，可存 Git 可复用 |
| **哲学标签** | TDD 强制、子Agent并发、YAGNI、DRY、验证先于声明 | 规约即代码、可执行规格、跨 agent 可移植 |

---

### 🎯 一句话区分

- **Superpowers** = 教你的 AI 程序员「怎么干活」— 先问清楚需求→出方案→拆任务→TDD写代码→审查，一套纪律流程
- **Spec Kit** = 先写好详细规格书，AI 按规格「照章施工」— 规格文件是源代码，代码只是编译产物

---

### 💡 对你的场景

两个都可以集成进你现有的工具链。但基于你的偏好（显式约束 > 自由裁量、可审计可复现），**Spec Kit 更像你的风格**——它产出的 spec 文件是静态可审核的，每一步都有书面记录；Superpowers 则更像「内置素养」，过程被自动吸附但你不一定看到每一步。

> 你服务器上的 Claude Code 已经可以用 `/plugin install superpowers@claude-plugins-official` 试 Superpowers；Spec Kit 需要先 `uv tool install specify-cli` 再做项目初始化。
user: Conversation info (untrusted metadata):
```json
{
  "message_id": "om_x100b6f65f6bb2cbcb4c86f6df103183",
  "sender_id": "ou_bd0bb7c1d6a89633ec6a14ec8c04ef61",
  "sender": "Leo-李宝烛",
  "timestamp": "Thu 2026-05-14 08:47 GMT+8"
}
```

Sender (untrusted metadata):
```json
{
  "label": "Leo-李宝烛 (ou_bd0bb7c1d6a89633ec6a14ec8c04ef61)",
  "id": "ou_bd0bb7c1d6a89633ec6a14ec8c04ef61",
  "name": "Leo-李宝烛"
}
```

[message_id: om_x100b6f65f6bb2cbcb4c86f6df103183]
Leo-李宝烛: 感觉都是可以自动出需求文档，然后改代码给到的
assistant: 对，现象层面确实都是「说需求→出文档→改代码」。但**机制上有本质差异**：

**Spec Kit** 产出的 spec/plan/task 是**独立文件**，存在你的 Git 仓库里，下次改需求可以拿着老 spec 改，其他 agent 也能读同一份 spec 继续干——spec 是资产。

**Superpowers** 的「文档」活在对话里，设计文档是 chat 上下文的一部分，不会自动落地成文件。它更偏向「让 agent 干活时有纪律」，但不给你留下可复用的书面痕迹。

所以如果你的核心诉求是**可审计、可复现、跨 agent 可交接**，Spec Kit 合适。如果想要的是**写代码的 agent 别瞎写**，Superpowers 更轻量——装完就行，不用额外维护文档。
user: Conversation info (untrusted metadata):
```json
{
  "message_id": "om_x100b6f65f32820acb32c6a64d0234ee",
  "sender_id": "ou_bd0bb7c1d6a89633ec6a14ec8c04ef61",
  "sender": "Leo-李宝烛",
  "timestamp": "Thu 2026-05-14 08:48 GMT+8"
}
```

Sender (untrusted metadata):
```json
{
  "label": "Leo-李宝烛 (ou_bd0bb7c1d6a89633ec6a14ec8c04ef61)",
  "id": "ou_bd0bb7c1d6a89633ec6a14ec8c04ef61",
  "name": "Leo-李宝烛"
}
```

[message_id: om_x100b6f65f32820acb32c6a64d0234ee]
Leo-李宝烛: Superpowers是不是存在上下文过大的风险？
assistant: 是的，**这是 Superpowers 模式最根本的弱点**。

因为设计文档活在对话里，每轮对话都要把「人格规则 + 设计规范 + 项目结构 + 当前进度」塞进上下文。项目越大，上下文膨胀越快。

相比之下 **Spec Kit 的优势恰好在这个点上**：spec/plan/tasks 写成文件后，agent 只需要读当前 task 对应的 spec 片段 + 相关代码，不用把全部设计文档都吃进去。

**简单总结**：

| | 上下文效率 | 可交接性 | 上手成本 |
|---|---|---|---|
| **Superpowers** | ❌ 随项目膨胀 | ❌ 无书面痕迹 | ✅ 装完即用 |
| **Spec Kit** | ✅ 按需读文件 | ✅ Git 可追 | 多一步维护 spec |

所以实质上是在**前期投入（维护 spec）换后期效率（不爆上下文）**。如果你的项目持续迭代超过 3-5 个 feature，Spec Kit 的投入就会回本。一次性小任务 Superpowers 更划算。
user: Conversation info (untrusted metadata):
```json
{
  "message_id": "om_x100b6f658f0f30a4b19a3cb20c0acee",
  "sender_id": "ou_bd0bb7c1d6a89633ec6a14ec8c04ef61",
  "sender": "Leo-李宝烛",
  "timestamp": "Thu 2026-05-14 08:49 GMT+8"
}
```

Sender (untrusted metadata):
```json
{
  "label": "Leo-李宝烛 (ou_bd0bb7c1d6a89633ec6a14ec8c04ef61)",
  "id": "ou_bd0bb7c1d6a89633ec6a14ec8c04ef61",
  "name": "Leo-李宝烛"
}
```

[message_id: om_x100b6f658f0f30a4b19a3cb20c0acee]
Leo-李宝烛: Browser use 有啥用？
assistant: **Browser Use** = 开源 Python 库，让 AI agent 像人一样操控真实浏览器（点击、填表、翻页、提取数据）。

---

## 核心思路

把网页的 DOM 元素（按钮、输入框、文本）转换成 LLM 能"读懂"的结构化文本，agent 据此自主决策下一步操作。不走截图识别路线（更便宜、更可复现）。

## 能干什么

- 自动填表、提交、爬取登录后的数据
- 跨多个网站串联操作（如「去 A 网站查价格 → 去 B 网站下单」）
- 自动化测试、监控、RPA 类任务
- 被 Manus（那个爆火的中国 AI agent）用作底层浏览器引擎

## 怎么用

```python
from browser_use import Agent, Browser, ChatBrowserUse

agent = Agent(
    task="打开 GitHub 看 browser-use 有多少 star",
    llm=ChatBrowserUse(),
    browser=Browser(),
)
await agent.run()
```

装完即用，指定任务描述 + LLM 后端就行。

## 跟你已有的东西的关系

| | Browser Use | OpenClaw 内置 browser |
|---|---|---|
| **定位** | 独立 agent，自主决策浏览器操作 | 工具，被动执行 AI 指令 |
| **适用** | 「去把这个流程跑完」 | 「帮我截个图/打开这个页面」 |
| **集成** | Python pip 安装 | 已内建在 OpenClaw |

**对你的场景**：如果你未来想做「agent 自主完成跨网站的多步操作」（比如自动比价下单、自动采集多源数据），Browser Use 值得一试。当前日常的网页截图/单页操作，OpenClaw 内置 browser 就够了。
