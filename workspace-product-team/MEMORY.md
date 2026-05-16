# MEMORY.md - 产品研发团队长期记忆

团队级长期记忆；读写约定见 **`AGENTS.md`**。成员个人记忆仍在各自工作区 `MEMORY.md`。

---

## 团队日志

### 2026-03-23
- **团队创建** — 创建产品研发团队，包含 ProductOwner 和 Architect 两个 Agent
- **组织结构定义** — 定义团队结构、通信协议、决策流程
- **工作区设置** — 创建 workspace-product-team、workspace-product-owner、workspace-architect
- **配置更新** — 更新 openclaw.json 添加两个 Agent 配置、飞书账号、绑定规则
- **文档创建** — 创建团队 SOUL/IDENTITY/AGENTS/TOOLS/MEMORY、组织结构图、通信协议、决策日志模板
- **搜索功能** — 为所有 Agent 添加 `web_search` 工具（使用 Tavily Search）

---

## 团队知识

### 通信机制
- **工具**: `sessions_send`
- **场景**: 需求评审、技术方案、风险预警、优先级调整
- **记录**: 重要通信写入 memory 文件或 decision-log.md

### 决策流程
1. ProductOwner 提出产品需求或变更
2. Architect 评估技术可行性和风险
3. 双方讨论并达成共识
4. 记录决策到 `docs/decision-log.md`
5. 执行并跟踪

### 工作区结构
```
workspace-product-team/          # 团队共享
workspace-product-owner/         # ProductOwner 独立
workspace-architect/             # Architect 独立
```

---

## 经验与教训

### 2026-05-11 — 协作断连 6 周复盘

**问题：** ProductOwner 与 Architect 自 04-16 起断连，路线图 6 周未更新，需求状态停滞。

**根因：**
1. 缺乏定期同步机制（无固定周会/站会）
2. ProductOwner 单方面等 Architect 响应，未主动轮询
3. 需求池缺乏"过期告警"的自动化触发

**可迁移模式：**
1. 协作关系需要主动维护，不能假设对方在线
2. 固定同步节奏（每周一 10 分钟）比"有事再沟通"更可靠
3. 产品文档应有更新时间戳和"超过 N 天未更新"的自动提醒

**改进行动：**
- [ ] 建立每周一 ProductOwner→Architect 主动同步
- [ ] 需求池添加"最后更新时间"元信息
- [ ] 心跳巡检增加"路线图过期检测"项

---
