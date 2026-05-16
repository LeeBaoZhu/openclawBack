# TOOLS.md - 工具与环境配置

技能（Skills）定义的是工具**如何工作**。本文件用来写**本团队 / 当前环境**的速查。

协作与通信约定见 **`AGENTS.md`**。

## 团队通信工具

### sessions_send 工具 ⭐

用于团队成员之间通信：

```json
{
  "tool": "sessions_send",
  "params": {
    "sessionKey": "<目标 agent sessionKey>",
    "message": "<通信内容>"
  }
}
```

**使用场景：**
- ProductOwner → Architect：需求评审请求、优先级变更通知
- Architect → ProductOwner：技术方案反馈、风险预警
- 双向：决策讨论、进度同步

**注意：**
- 重要通信需记录到 `memory/YYYY-MM-DD.md` 或 `docs/decision-log.md`
- 紧急事项可要求即时回复
- 常规事项可异步处理

## 搜索工具 ⭐

### web_search 工具

所有团队成员都已配置 `web_search` 工具，可用于：

**ProductOwner 使用场景：**
- 市场调研
- 竞品分析
- 用户趋势研究
- 行业动态收集

**Architect 使用场景：**
- 技术选型调研
- 框架/库对比
- 最佳实践研究
- 技术方案验证

**使用示例：**
```
搜索 Tavily Search：最新的前端框架对比
```

## 日志位置

- **主日志**: `~/.openclaw/openclaw.log`
- **查看命令**: `openclaw logs --follow`

## 常用命令

```bash
# 查看配置
openclaw config show

# 查看 Gateway 状态
openclaw gateway status

# 向特定 Agent 发送消息
openclaw agent --agent product-owner --message "..."
openclaw agent --agent architect --message "..."

# 列出所有 Agent
openclaw agents list
```

## 团队文档路径

- **组织结构**: `docs/org-chart.md`
- **通信协议**: `docs/communication-protocol.md`
- **决策日志**: `docs/decision-log.md`
- **产品路线图**: `docs/product-roadmap.md`
- **技术架构**: `docs/tech-architecture.md`

## 报告接收

- 有异常时通过配置渠道通知用户
- 常规报告在团队 memory 中记录

---

按需增删。这是团队的工具与环境速查表。
