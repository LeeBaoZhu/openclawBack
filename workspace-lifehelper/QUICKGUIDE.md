# QUICKGUIDE.md - 生活助理快速指南

与 **`TOOLS.md`**（完整流程）、**`HEARTBEAT.md`**（心跳项）、**`AGENTS.md`**（文档索引与启动顺序）配套使用。

## 📅 阶段计划管理（核心自动化任务）

### 你每天自动执行的工作

**7:00 - 拆解并推送（一次性完成）**
```bash
读取：~/.openclaw/shared/phase-plans/*.json
筛选：status = "active" 且 startDate <= 今日 <= endDate
计算：今日是第几个工作日（跳过周末）
定位：当前处于哪个阶段和任务
排序：priority (high > medium > low)
发送：通过 message 工具推送给用户
（可选）写入：~/.openclaw/shared/daily-plans/今日日期.json 留存
```

**用户回复时**
```bash
解析：「完成 1」或「task-xxx completed」
更新：daily-plans 文件中任务状态
记录：completion-log/年月.json
回复：确认进度
```

### 关键文件位置

| 文件 | 路径 | 用途 |
|------|------|------|
| 阶段计划 | `~/.openclaw/shared/phase-plans/` | Agent 提交的长期计划 |
| 每日计划 | `~/.openclaw/shared/daily-plans/` | 你自动生成的当日任务 |
| 完成记录 | `~/.openclaw/shared/completion-log/` | 用户完成情况统计 |
| 技能规范 | `~/.openclaw/skills/plan-coordinator/SKILL.md` | 详细格式和逻辑 |

### 示例：拆解逻辑

```
阶段计划：Q2 战略规划（10 个工作日）
- Phase 1（市场分析）：3 天
- Phase 2（目标设定）：2 天
- Phase 3（规划文档）：2 天

今日是 2026-03-25（startDate）
→ 第 1 个工作日
→ 当前阶段：Phase 1（市场分析）
→ 今日任务：收集行业数据、竞品分析、整理分析报告（按天分配）
```

### 示例：推送消息格式

```markdown
【📅 今日目标】2026-03-25

🔴 高优先级（3 项）
1. [work] 收集行业数据 - 90 分钟
   （Q2 战略规划·市场分析 第 1 天）
2. [health] 晨间拉伸 - 15 分钟
   （3 月健康习惯 第 1 天）
3. [health] 健身房锻炼 - 60 分钟
   （3 月健康习惯 第 1 天）

📊 阶段计划进度
- Q2 战略规划：1/10 天（市场分析）
- 3 月健康习惯：1/7 天（每日习惯）
```

---

## 🏠 生活服务（传统职责）

- 生活咨询、商品比价、菜谱推荐等
- 详见 SOUL.md

---

**Cron 配置**: `~/.openclaw/cron/jobs.json`
- `daily-plan`: 0 7 * * *
