# TOOLS.md - 生活助理环境与自动化速查

> 阶段计划、Cron 与推送流程见本章；职责边界见 **`IDENTITY.md`**，启动读文件见 **`AGENTS.md`**，一页速查见 **`QUICKGUIDE.md`**。

## 核心职责

**阶段计划拆解** - 每日 6:00 自动读取所有阶段计划，计算当日任务

**每日目标推送** - 每日 7:00 推送排序后的任务清单

**进度追踪** - 记录用户完成情况，更新阶段计划进度

---

## 工作流程

### 每日 6:00（Cron：拆解计划）

```markdown
1. 读取 `~/.openclaw/shared/phase-plans/*.json`
2. 筛选条件：
   - status = "active"
   - startDate <= 今日 <= endDate
3. 对每个计划计算：
   a. 今日是第几个工作日（从 startDate 开始，跳过周末）
   b. 当前处于哪个阶段（累加各阶段 workdays）
   c. 该阶段的具体任务
4. 生成每日计划文件：
   - 路径：`~/.openclaw/shared/daily-plans/YYYY-MM-DD.json`
   - 包含所有计划的当日任务
5. 计算每个计划的进度百分比
```

#### 工作日计算示例

```
计划：2026-03-25 开始，今日 2026-03-27
- 03-25 (周二): 第 1 天
- 03-26 (周三): 第 2 天
- 03-27 (周四): 第 3 天
→ 今日是第 3 个工作日

计划：2026-03-25 开始，今日 2026-03-29（周六）
- 03-25 (周二): 第 1 天
- 03-26 (周三): 第 2 天
- 03-27 (周四): 第 3 天
- 03-28 (周五): 第 4 天
- 03-29 (周六): 跳过
→ 今日是周末，不生成任务
```

#### 阶段定位示例

```
计划总览：
- Phase 1 (市场分析): 3 天
- Phase 2 (目标设定): 2 天
- Phase 3 (规划文档): 2 天

今日是第 3 个工作日：
- 累加：Phase 1 = 3 天
- 3 <= 3 → 当前处于 Phase 1 的最后一天
- 任务：整理分析报告

今日是第 5 个工作日：
- 累加：Phase 1 = 3 天，Phase 1+2 = 5 天
- 5 <= 5 → 当前处于 Phase 2 的最后一天
- 任务：与 CEO 对齐目标
```

### 每日 7:00（Cron：推送给用户）

```markdown
1. 读取 `~/.openclaw/shared/daily-plans/今日日期.json`
2. 排序规则：
   - 第一优先级：priority (high > medium > low)
   - 第二优先级：estimatedMinutes (短的在前，快速完成)
3. 生成消息格式：

【📅 今日目标】YYYY-MM-DD

🔴 高优先级（X 项）
1. [category] 任务标题 - 预估时间（计划名·阶段 第 N 天）
2. ...

🟡 中优先级（X 项）
1. ...

🟢 低优先级（X 项）
1. ...

📊 阶段计划进度
- 计划名 1：X/Y 天（当前阶段）
- 计划名 2：X/Y 天（当前阶段）

💡 回复「完成 1」或「task-xxx completed」标记任务完成
```

4. 通过 `message` 工具发送给用户

### 用户反馈处理

```markdown
当用户回复时：

1. 解析消息：
   - 「完成 1」→ 第 1 个任务
   - 「task-daily-xxx completed」→ 特定任务 ID
   - 「跳过 2」→ 跳过第 2 个任务

2. 更新 `daily-plans/今日日期.json`：
   - status: "completed" 或 "skipped"
   - completedAt: ISO8601 时间戳

3. 记录到 `completion-log/年月.json`

4. （可选）更新阶段计划进度：
   - 读取 phase-plans 中对应计划
   - 增加 completedDays 计数

5. 回复用户确认：
   ✅ 已标记完成：[任务标题]
   今日进度：2/5（40%）
   📊 Q2 战略规划：3/10 天

6. （可选）通过 sessions_send 通知原 Agent
```

---

## 文件结构

```
workspace-lifehelper/
├── HEARTBEAT.md
├── TOOLS.md（本文件）
├── MEMORY.md
└── scripts/
    └── decompose-plans.ps1  # 拆解脚本（可选）

~/.openclaw/shared/
├── phase-plans/              # 阶段计划（Agent 提交）
│   ├── strategist-q2-plan.json
│   ├── healthadvisor-march-plan.json
│   └── ...
├── daily-plans/              # 每日计划（自动生成）
│   ├── 2026-03-25.json
│   └── ...
└── completion-log/           # 完成记录
    └── 2026-03.json
```

---

## 消息模板

### 每日目标推送

```markdown
【📅 今日目标】2026-03-25

🔴 高优先级（3 项）
1. [work] 收集行业数据 - 90 分钟（Q2 战略规划·市场分析 第 1 天）
2. [health] 晨间拉伸 - 15 分钟（3 月健康习惯 第 1 天）
3. [health] 健身房锻炼 - 60 分钟（3 月健康习惯 第 1 天）

🟡 中优先级（1 项）
1. [health] 23:00 前睡觉（3 月健康习惯 第 1 天）

📊 阶段计划进度
- Q2 战略规划：1/10 天（市场分析）
- 3 月健康习惯：1/7 天（每日习惯）

💡 建议执行顺序：按列表顺序，高优先级优先完成
回复「完成 1」或「task-xxx completed」标记任务完成
```

### 完成确认回复

```markdown
✅ 已标记完成：收集行业数据
今日进度：1/4（25%）

📊 阶段计划进度
- Q2 战略规划：1/10 天（市场分析）
- 3 月健康习惯：1/7 天（每日习惯）

继续加油！还剩 3 项任务。
```

### 周报/月报模板

```markdown
## 阶段计划周报（2026-03-25 ~ 2026-03-31）

### 总体统计
- 总任务数：35 项
- 完成率：82%（29/35）
- 高优先级完成率：90%

### 各计划进度
| 计划 | 进度 | 状态 |
|------|------|------|
| Q2 战略规划 | 5/10 天 | 正常 |
| 3 月健康习惯 | 7/7 天 | ✅ 完成 |

### 按类别
- work: 85% (17/20)
- health: 80% (12/15)

### 建议
- 健康习惯已养成，建议进入下一阶段
- 战略规划进度正常，继续保持
```

---

## 与其他 Agent 协作

### 接收阶段计划

Agent 通过 `write` 工具直接写入：
- 路径：`~/.openclaw/shared/phase-plans/<agentId>-<计划名>.json`
- 格式：见 `plan-coordinator` 技能

### 通知进度更新

可选：通过 `sessions_send` 通知原 Agent：

```json
{
  "sessionKey": "strategist",
  "message": "Q2 战略规划已完成 5/10 天，当前阶段：目标设定。用户反馈：进度顺利。"
}
```

---

## 特殊情况处理

### 周末和节假日

- **周末**：默认不生成任务（workdaysPerWeek = 5）
- **每天都是工作日**：workdaysPerWeek = 7（如健康习惯）
- **节假日**：可在计划中添加 `holidays: ["2026-04-01"]` 跳过

### 计划延期

```json
// Agent 更新计划
{
  "id": "phase-plan-str-001",
  "endDate": "2026-04-14",  // 延长一周
  "totalWorkdays": 15,       // 增加 5 天
  "status": "active"
}
```

### 计划暂停

```json
{
  "id": "phase-plan-str-001",
  "status": "paused",
  "pausedAt": "2026-03-28T10:00:00+08:00",
  "pausedReason": "等待 CEO 反馈"
}
```

生活助理检测到 `status = "paused"` 时不生成当日任务。

### 多计划冲突

当同一天任务过多时：
1. 按优先级排序
2. 高优先级任务超过 5 项时，标记「今日任务较多，建议优先完成高优先级」
3. 可选通知相关 Agent 调整计划

---

## Cron 配置

```json
{
  "jobs": [
    {
      "id": "daily-plan-decompose",
      "schedule": "0 6 * * *",
      "agentId": "lifehelper",
      "message": "读取阶段计划，拆解为今日任务"
    },
    {
      "id": "daily-plan-push",
      "schedule": "0 7 * * *",
      "agentId": "lifehelper",
      "message": "读取每日计划，推送给用户"
    },
    {
      "id": "weekly-plan-report",
      "schedule": "0 9 * * 1",
      "agentId": "lifehelper",
      "message": "生成上周计划完成报告"
    }
  ]
}
```

---

**相关技能**: `plan-coordinator`  
**阶段计划目录**: `~/.openclaw/shared/phase-plans/`  
**每日计划目录**: `~/.openclaw/shared/daily-plans/`
