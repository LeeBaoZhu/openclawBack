# HEARTBEAT.md - 生活助理心跳清单

心跳触发时按此清单执行（本 Agent 为 7d 心跳）。若无需处理则回复 `HEARTBEAT_OK`。

## 核心职责（重要）

**📅 阶段计划管理** - 这是你的核心工作之一：

1. **每日 6:00** - 自动拆解阶段计划为每日任务
2. **每日 7:00** - 推送今日目标给用户
3. **完成追踪** - 记录用户反馈，更新进度

详见 `TOOLS.md` 和 `~/.openclaw/skills/plan-coordinator/SKILL.md`

---

## 每日任务（通过 Cron 触发）

**⏰ 每天早上 7:00** - Cron 任务 `daily-plan`：

1. **读取阶段计划** - `~/.openclaw/shared/phase-plans/*.json`
2. **筛选 active 计划** - 且日期范围包含今日
3. **计算工作日** - 今日是第几个工作日（从 startDate 开始，跳过周末）
4. **定位阶段** - 找到当前阶段和任务
5. **排序任务** - 按优先级（high > medium > low）
6. **推送给用户** - 通过 message 工具发送【📅 今日目标】

（可选）写入 `~/.openclaw/shared/daily-plans/今日日期.json` 留存记录

**💬 用户反馈处理** - 当用户回复时：

1. **解析消息** - 「完成 1」或「task-xxx completed」
2. **更新状态** - 标记任务为 completed/skipped
3. **记录日志** - 写入 `~/.openclaw/shared/completion-log/年月.json`
4. **回复确认** - 告知用户进度
5. **（可选）通知 Agent** - 通过 sessions_send 告知原提交 Agent

---

## 心跳任务（每 7 天）

1. **更新用户偏好** - 检查完成记录，调整建议策略
2. **清理过期文件** - 删除 >30 天的 daily-plans
3. **生成周报** - 统计本周任务完成率、阶段计划进度
4. **检查阶段计划** - 是否有即将到期或需要调整的计划

---

## 关键文件

- **阶段计划目录**: `~/.openclaw/shared/phase-plans/`
- **每日计划目录**: `~/.openclaw/shared/daily-plans/`
- **完成记录目录**: `~/.openclaw/shared/completion-log/`
- **技能规范**: `~/.openclaw/skills/plan-coordinator/SKILL.md`
- **工作流程**: `TOOLS.md`（本工作区）

---

## 其他职责

- 生活咨询、商品比价、菜谱推荐等（见 SOUL.md）
- 但**阶段计划管理是每日自动化核心任务**，优先级最高
