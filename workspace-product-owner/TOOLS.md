# TOOLS.md - ProductOwner 工具与环境配置

会话启动与协作规则见 **`AGENTS.md`**。

## 团队通信工具

### sessions_send 工具 ⭐

用于与 Architect 沟通：

```json
{
  "tool": "sessions_send",
  "params": {
    "sessionKey": "<architect sessionKey>",
    "message": "[通信类型] 通信内容"
  }
}
```

**常用通信类型：**
- `[需求评审]` — 请求技术可行性评估
- `[优先级变更]` — 通知需求优先级调整
- `[进度同步]` — 同步产品进展
- `[决策请求]` — 需要共同决策

## 搜索工具 ⭐

### web_search 工具

可用于：
- 市场调研
- 竞品分析
- 用户趋势研究
- 行业动态收集

**使用示例：**
```
搜索 Tavily Search：2026 年项目管理工具趋势
```

## 文档位置

- **团队文档**: `~/.openclaw/workspace-product-team/docs/`
- **需求池**: `docs/product-backlog.md`（待创建）
- **路线图**: `docs/product-roadmap.md`（待创建）
- **决策日志**: `~/.openclaw/workspace-product-team/docs/decision-log.md`

## 常用命令

```bash
# 查看配置
openclaw config show

# 向 Architect 发送消息
openclaw agent --agent architect --message "..."

# 查看 Gateway 状态
openclaw gateway status
```

## 日志位置

- **主日志**: `~/.openclaw/openclaw.log`
- **查看命令**: `openclaw logs --follow`

---

按需增删。
