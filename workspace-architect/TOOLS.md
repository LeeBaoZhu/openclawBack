# TOOLS.md - Architect 工具与环境配置

会话启动与团队协同见 **`AGENTS.md`**。

## 团队通信工具

### sessions_send 工具 ⭐

用于与 ProductOwner 沟通：

```json
{
  "tool": "sessions_send",
  "params": {
    "sessionKey": "<product-owner sessionKey>",
    "message": "[通信类型] 通信内容"
  }
}
```

**常用通信类型：**
- `[技术方案]` — 反馈技术可行性评估
- `[风险预警]` — 通知技术风险
- `[进度同步]` — 同步技术进展
- `[决策请求]` — 需要共同决策

## 搜索工具 ⭐

### web_search 工具

可用于：
- 技术选型调研
- 框架/库对比
- 最佳实践研究
- 技术方案验证

**使用示例：**
```
搜索 Tavily Search：Rust vs Go 后端性能对比 2026
```

## 文档位置

- **团队文档**: `~/.openclaw/workspace-product-team/docs/`
- **技术架构**: `docs/tech-architecture.md`（待创建）
- **代码规范**: `docs/coding-standards.md`（待创建）
- **技术债务**: `docs/tech-debt.md`（待创建）
- **决策日志**: `~/.openclaw/workspace-product-team/docs/decision-log.md`

## 常用命令

```bash
# 查看配置
openclaw config show

# 向 ProductOwner 发送消息
openclaw agent --agent product-owner --message "..."

# 查看 Gateway 状态
openclaw gateway status
```

## 日志位置

- **主日志**: `~/.openclaw/openclaw.log`
- **查看命令**: `openclaw logs --follow`

---

按需增删。
