---
name: plan-coordinator
description: 多 Agent 阶段计划协调系统。所有 Agent 共同维护一个共享计划文件，生活助手每日自动拆解并推送。当用户或 Agent 提到「提交计划」、「阶段计划」、「项目计划」、「周计划」、「月计划」、「生成计划」、「拆解计划」时触发。
---

# 多 Agent 阶段计划协调系统

## 核心设计

**所有 Agent 共同维护一个共享计划文件** → 生活助手每日自动拆解 → 推送给用户

```
Agent 提交计划 → 写入 plan.json → 每日 7:00 读取 → 计算今日任务 → 推送给用户
```

---

## 文件结构

```
~/.openclaw/shared/
└── plan.json          # 所有 Agent 共享的阶段计划文件
```

---

## plan.json 格式

```json
{
  "version": 1,
  "updatedAt": "2026-04-04T22:00:00+08:00",
  "plans": [
    {
      "id": "phase-plan-str-001",
      "agentId": "strategist",
      "agentName": "战略规划师",
      "title": "Q2 战略规划",
      "description": "完成 2026 年第二季度战略规划",
      "startDate": "2026-03-25",
      "endDate": "2026-04-07",
      "totalWorkdays": 10,
      "workdaysPerWeek": 5,
      "phases": [
        {
          "phaseId": "phase-1",
          "name": "市场分析",
          "workdays": 3,
          "tasks": [
            {
              "title": "收集行业数据",
              "priority": "high",
              "estimatedMinutes": 90,
              "category": "work"
            },
            {
              "title": "竞品分析",
              "priority": "high",
              "estimatedMinutes": 120,
              "category": "work"
            }
          ]
        },
        {
          "phaseId": "phase-2",
          "name": "目标设定",
          "workdays": 2,
          "tasks": [
            {
              "title": "制定 OKR 初稿",
              "priority": "high",
              "estimatedMinutes": 120,
              "category": "work"
            }
          ]
        }
      ],
      "status": "active",
      "createdAt": "2026-03-24T08:30:00+08:00"
    },
    {
      "id": "phase-plan-health-001",
      "agentId": "healthadvisor",
      "agentName": "健康顾问",
      "title": "3 月健康习惯养成",
      "description": "培养晨间拉伸、健身、早睡习惯",
      "startDate": "2026-03-25",
      "endDate": "2026-03-31",
      "totalWorkdays": 7,
      "workdaysPerWeek": 7,
      "phases": [
        {
          "phaseId": "phase-daily",
          "name": "每日习惯",
          "workdays": 7,
          "tasks": [
            {
              "title": "晨间拉伸",
              "priority": "high",
              "estimatedMinutes": 15,
              "category": "health"
            },
            {
              "title": "健身房锻炼",
              "priority": "high",
              "estimatedMinutes": 60,
              "category": "health"
            },
            {
              "title": "23:00 前睡觉",
              "priority": "medium",
              "estimatedMinutes": 0,
              "category": "health"
            }
          ]
        }
      ],
      "status": "completed",
      "createdAt": "2026-03-24T08:00:00+08:00"
    }
  ]
}
```

---

## 字段说明

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `version` | number | ✅ | 配置文件版本（当前为 1） |
| `updatedAt` | string | ✅ | 最后更新时间（ISO8601） |
| `plans` | array | ✅ | 所有阶段计划列表 |
| `plans[].id` | string | ✅ | 计划唯一标识，格式 `phase-plan-<agentId>-<序号>` |
| `plans[].agentId` | string | ✅ | 提交计划的 Agent ID |
| `plans[].agentName` | string | ✅ | Agent 显示名称 |
| `plans[].title` | string | ✅ | 计划标题（简短） |
| `plans[].description` | string | ❌ | 计划详细描述 |
| `plans[].startDate` | string | ✅ | 开始日期 (YYYY-MM-DD) |
| `plans[].endDate` | string | ✅ | 结束日期 (YYYY-MM-DD) |
| `plans[].totalWorkdays` | number | ✅ | 总工作日数 |
| `plans[].workdaysPerWeek` | number | ❌ | 每周工作日（默认 5，每天执行填 7） |
| `plans[].phases` | array | ✅ | 阶段列表 |
| `plans[].phases[].phaseId` | string | ✅ | 阶段唯一标识 |
| `plans[].phases[].name` | string | ✅ | 阶段名称 |
| `plans[].phases[].workdays` | number | ✅ | 该阶段的工作日数 |
| `plans[].phases[].tasks` | array | ✅ | 该阶段的任务列表 |
| `plans[].phases[].tasks[].title` | string | ✅ | 任务标题 |
| `plans[].phases[].tasks[].priority` | string | ✅ | `high`/`medium`/`low` |
| `plans[].phases[].tasks[].estimatedMinutes` | number | ❌ | 预估耗时（分钟） |
| `plans[].phases[].tasks[].category` | string | ❌ | `work`/`health`/`family`/`personal`/`learning` |
| `plans[].status` | string | ✅ | `active`/`paused`/`completed`/`cancelled` |
| `plans[].createdAt` | string | ✅ | ISO8601 时间戳 |

---

## 使用方式

### 方式 1：自然语言提交（推荐 ⭐）

**Agent 只需说人话**，技能自动解析并写入 plan.json：

```
我要提交 Q2 战略规划计划：
- 时间：3 月 25 日到 4 月 7 日，大概 10 个工作日
- 第一阶段：市场分析，3 天，包括收集行业数据、竞品分析
- 第二阶段：目标设定，2 天，制定 OKR 初稿、与 CEO 对齐
```

**技能自动处理**：
1. 解析自然语言 → 提取阶段和任务
2. 生成符合格式的 JSON
3. 读取现有 plan.json
4. 将新计划添加到 `plans` 数组
5. 更新 `updatedAt`
6. 写回 plan.json
7. 回复确认

---

### 方式 2：直接编辑 plan.json

```markdown
1. 读取文件：~/.openclaw/shared/plan.json
2. 在 `plans` 数组中添加新计划
3. 更新 `updatedAt` 为当前时间
4. 使用 `write` 工具保存
```

---

### 方式 3：更新已有计划

```markdown
1. 读取 plan.json
2. 找到对应 `plans[].id` 的计划
3. 修改需要更新的字段（如 status、phases）
4. 更新 `updatedAt`
5. 写回文件
```

---

## 生活助手工作流程（每日 7:00）

### 步骤 1：读取 plan.json

```javascript
const planData = require('~/.openclaw/shared/plan.json');
```

---

### 步骤 2：筛选有效计划

```javascript
const today = '2026-04-04';
const activePlans = planData.plans.filter(plan => 
  plan.status === 'active' &&
  plan.startDate <= today &&
  plan.endDate >= today
);
```

---

### 步骤 3：计算每个计划的今日任务

```javascript
function getTodayTasks(plan, today) {
  // 计算今天是第几个工作日（从 startDate 开始，跳过周末）
  const workdayIndex = calculateWorkdayIndex(plan.startDate, today, plan.workdaysPerWeek);
  
  if (workdayIndex < 0 || workdayIndex >= plan.totalWorkdays) {
    return []; // 不在计划周期内
  }
  
  // 找到当前阶段
  let currentPhase = null;
  let accumulatedDays = 0;
  for (const phase of plan.phases) {
    if (workdayIndex >= accumulatedDays && workdayIndex < accumulatedDays + phase.workdays) {
      currentPhase = phase;
      break;
    }
    accumulatedDays += phase.workdays;
  }
  
  if (!currentPhase) return [];
  
  // 计算当前阶段的第几天
  const phaseDay = workdayIndex - accumulatedDays + 1;
  
  // 返回阶段任务
  return currentPhase.tasks.map(task => ({
    ...task,
    phasePlanId: plan.id,
    phaseName: currentPhase.name,
    phaseDay: phaseDay,
    totalDays: plan.totalWorkdays,
    planTitle: plan.title,
    agentId: plan.agentId,
    agentName: plan.agentName
  }));
}
```

---

### 步骤 4：合并所有任务并排序

```javascript
const allTasks = [];
activePlans.forEach(plan => {
  const tasks = getTodayTasks(plan, today);
  allTasks.push(...tasks);
});

// 按优先级排序：high > medium > low
const priorityOrder = { high: 0, medium: 1, low: 2 };
allTasks.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
```

---

### 步骤 5：生成推送消息

```markdown
【📅 今日目标】2026-04-04

🔴 高优先级
1. [work] 收集行业数据 - 90 分钟（Q2 战略规划·市场分析 第 1 天）
2. [health] 晨间拉伸 - 15 分钟（3 月健康习惯 第 5 天）
3. [health] 健身房锻炼 - 60 分钟（3 月健康习惯 第 5 天）

🟡 中优先级
1. [health] 23:00 前睡觉（3 月健康习惯 第 5 天）

📊 阶段计划进度
- Q2 战略规划：1/10 天（市场分析）
- 3 月健康习惯：5/7 天（每日习惯）

💡 回复「完成 1」标记任务完成
```

---

### 步骤 6：发送给用户

使用 `message` 工具发送：

```javascript
{
  "action": "send",
  "channel": "feishu",
  "target": "user:ou_fb2e7f148b502e7981c11e9c0f2cace5",
  "message": "【📅 今日目标】2026-04-04\n\n..."
}
```

---

## 工作日计算规则

| 规则 | 说明 |
|------|------|
| 默认工作日 | 周一至周五（workdaysPerWeek=5） |
| 每天执行 | workdaysPerWeek=7（如健康习惯） |
| 跳过周末 | workdaysPerWeek=5 时，周六日不计入 |
| 节假日 | 暂不处理 |

### 工作日计算函数

```javascript
function calculateWorkdayIndex(startDate, targetDate, workdaysPerWeek) {
  const start = new Date(startDate);
  const target = new Date(targetDate);
  let workdayCount = 0;
  let current = new Date(start);
  
  while (current <= target) {
    const dayOfWeek = current.getDay();
    const isWeekend = (dayOfWeek === 0 || dayOfWeek === 6);
    
    if (workdaysPerWeek === 7 || !isWeekend) {
      if (current.getTime() === target.getTime()) {
        return workdayCount;
      }
      workdayCount++;
    }
    
    current.setDate(current.getDate() + 1);
  }
  
  return -1; // 超出计划范围
}
```

---

## 快速提交模板

**Agent 提交计划时，直接说**：

```
提交计划：
标题：[计划名称]
时间：[开始日期] 到 [结束日期]
每周工作日：[5 或 7，默认 5]
阶段：
1. [阶段名] - [天数] 天 - [任务 1]、[任务 2]...
2. [阶段名] - [天数] 天 - [任务 1]、[任务 2]...
```

**示例 1：战略规划（工作日执行）**
```
提交计划：
标题：Q2 战略规划
时间：2026-03-25 到 2026-04-07
每周工作日：5
阶段：
1. 市场分析 - 3 天 - 收集行业数据、竞品分析、整理报告
2. 目标设定 - 2 天 - 制定 OKR、与 CEO 对齐
3. 规划文档 - 2 天 - 撰写文档、团队评审
```

**示例 2：健康习惯（每天执行）**
```
提交计划：
标题：3 月健康习惯养成
时间：2026-03-25 到 2026-03-31
每周工作日：7
阶段：
1. 每日习惯 - 7 天 - 晨间拉伸、健身房锻炼、23:00 前睡觉
```

---

## Cron 任务配置

```json
{
  "id": "daily-plan",
  "name": "每日计划拆解与推送",
  "schedule": {
    "kind": "cron",
    "expr": "0 7 * * *"
  },
  "agentId": "lifehelper",
  "session": "lifehelper",
  "enabled": true,
  "payload": {
    "kind": "agentTurn",
    "message": "早上 7:00 读取 ~/.openclaw/shared/plan.json，计算今日任务并推送给用户"
  },
  "delivery": {
    "mode": "announce",
    "channel": "feishu",
    "to": "user:ou_fb2e7f148b502e7981c11e9c0f2cace5"
  }
}
```

---

## 文件操作示例

### 读取 plan.json

```javascript
const fs = require('fs');
const planPath = '/root/.openclaw/shared/plan.json';
const planData = JSON.parse(fs.readFileSync(planPath, 'utf8'));
```

---

### 添加新计划

```javascript
const newPlan = {
  id: 'phase-plan-health-002',
  agentId: 'healthadvisor',
  agentName: '健康顾问',
  title: '备孕维生素补充计划',
  startDate: '2026-03-30',
  endDate: '2026-09-30',
  totalWorkdays: 180,
  workdaysPerWeek: 7,
  phases: [
    {
      phaseId: 'phase-prep',
      name: '准备期',
      workdays: 60,
      tasks: [
        { title: '每日补充维生素', priority: 'high', estimatedMinutes: 1, category: 'health' }
      ]
    }
  ],
  status: 'active',
  createdAt: new Date().toISOString()
};

planData.plans.push(newPlan);
planData.updatedAt = new Date().toISOString();
fs.writeFileSync(planPath, JSON.stringify(planData, null, 2));
```

---

### 更新计划状态

```javascript
const planIndex = planData.plans.findIndex(p => p.id === 'phase-plan-health-001');
if (planIndex !== -1) {
  planData.plans[planIndex].status = 'completed';
  planData.updatedAt = new Date().toISOString();
  fs.writeFileSync(planPath, JSON.stringify(planData, null, 2));
}
```

---

## 注意事项

1. **计划提交时机** - Agent 在开始项目前提交，而非每天提交
2. **计划更新** - Agent 可随时更新 plan.json 中的计划（修改 phases、调整时间、变更 status）
3. **进度追踪** - 生活助手每日自动计算，无需 Agent 干预
4. **暂停/恢复** - Agent 可修改 status 为 `paused` 暂停计划
5. **完成标记** - 用户可回复「完成 X」标记任务完成（可选功能）

---

## 相关配置

### 共享目录

```bash
mkdir -p /root/.openclaw/shared/
```

### 初始化 plan.json

```json
{
  "version": 1,
  "updatedAt": "2026-04-04T22:00:00+08:00",
  "plans": []
}
```

---

**实施步骤**:
1. 创建目录 `~/.openclaw/shared/`
2. 初始化 `plan.json`（空 plans 数组）
3. Agent 按格式提交阶段计划
4. 生活助手配置 Cron 每日 7:00 读取并推送
5. 测试完整流程
