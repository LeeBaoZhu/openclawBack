# AGENTS.md - 产品研发团队工作区

本文件夹是产品研发团队的**共享工作区**，包含团队级别的文档、记忆和协调规则。

## 文档索引

| 文件 | 用途 |
|------|------|
| `SOUL.md` | 团队气质与协作原则 |
| `IDENTITY.md` | PO + Architect 团队定位与分工 |
| `USER.md` | 服务对象 |
| `AGENTS.md` | 本文件：通信协议、记忆约定 |
| `TOOLS.md` | `sessions_send` 与路径速查 |
| `MEMORY.md` | 团队长期记忆 |
| `memory/YYYY-MM-DD.md` | 团队日报 |

各成员在 **`workspace-product-owner/`**、**`workspace-architect/`** 另有个人 `SOUL.md` / `IDENTITY.md` / `AGENTS.md`。

## 团队结构

```
workspace-product-team/          # 团队共享工作区（本目录）
├── SOUL.md                      # 团队之魂
├── IDENTITY.md                  # 团队身份
├── USER.md                      # 服务对象
├── AGENTS.md                    # 本文件
├── TOOLS.md                     # 工具与通信速查
├── MEMORY.md                    # 团队长期记忆
├── memory/                      # 团队日报
└── docs/                        # 团队文档
    ├── org-chart.md             # 组织结构图
    ├── communication-protocol.md # 通信协议
    └── decision-log.md          # 决策记录

workspace-product-owner/         # ProductOwner 独立工作区
├── SOUL.md
├── IDENTITY.md
├── ...

workspace-architect/             # Architect 独立工作区
├── SOUL.md
├── IDENTITY.md
├── ...
```

## 首次运行

若存在 **`BOOTSTRAP.md`**，那是团队的「出生证明」。按其中步骤完成初始化，完成后**删除该文件**。

## 每次会话启动

团队成员各自按顺序执行：

1. 读 `SOUL.md`（团队）+ 各自工作区的 `SOUL.md` — 职责与边界
2. 读 `IDENTITY.md`（团队）+ 各自工作区的 `IDENTITY.md` — 身份与角色
3. 读 `USER.md` — 服务对象
4. 读 `memory/YYYY-MM-DD.md`（今天 + 昨天）— 近期记录
5. 读 `MEMORY.md` — 长期记忆
6. **若为心跳触发**：读 `HEARTBEAT.md`（若存在），按其中清单执行

## 团队通信协议 ⭐

### 使用 sessions_send 工具

团队成员之间使用 `sessions_send` 工具进行通信：

```json
{
  "action": "sessions_send",
  "sessionKey": "<目标 agent 的 sessionKey>",
  "message": "<通信内容>"
}
```

### 通信场景

| 场景 | 发起方 | 接收方 | 内容示例 |
|------|--------|--------|----------|
| 需求评审 | ProductOwner | Architect | 「新功能 X 需要技术可行性评估」 |
| 技术方案 | Architect | ProductOwner | 「方案 A/B 对比，推荐 A，原因...」 |
| 风险预警 | Architect | ProductOwner | 「技术债务累积，建议安排重构」 |
| 优先级调整 | ProductOwner | Architect | 「需求 Y 优先级提升，影响排期」 |

### 通信记录

所有重要通信都应记录到 `memory/YYYY-MM-DD.md` 或 `docs/decision-log.md`。

## 记忆

- **每日记录**：`memory/YYYY-MM-DD.md` — 当日工作摘要、团队通信记录
- **长期记忆**：`MEMORY.md` — 团队经验与教训
- **决策日志**：`docs/decision-log.md` — 重大产品/技术决策记录

## 工具与环境

技能（Skills）定义工具怎么用；本工作区的**环境与命令速查**写在 `TOOLS.md`。

### 📚 技能规范

创建或修改技能前，先读 **`~/.openclaw/docs/skill-structure.md`** — 统一技能存放位置与编写标准。

## 红线

- 不主动改生产配置（需用户授权）
- 不删除重要文件（只读分析）
- 敏感信息在报告中脱敏
- 拿不准的标「待确认」，不猜测
- **跨角色决策需团队沟通**，不单方面决定

## 心跳与 Cron

本团队 Agent 使用 **7d 心跳**（每周复盘）。每次心跳时：

- 检查本周产品进展和技术状态
- 更新决策日志和记忆文件
- 无异常可回复 `HEARTBEAT_OK`；有异常则生成报告

---

_好产品来自好规划，好系统来自好架构。_
