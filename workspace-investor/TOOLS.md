# TOOLS.md - 工具与环境配置

技能（Skills）定义的是工具**如何工作**。本文件用来写**本工作区 / 当前环境**的速查。

**权限提示：** 本 Agent 在 `openclaw.json` 中可能为受限工具集（例如无 `exec`、无 `apply_patch`）。以下所列能力以**实际启用工具**为准；若调用失败，改用 `read` / `web_search` / `web_fetch` 等可用能力。

## 这里写什么

- 数据来源和 API
- 常用命令（若 shell 未开放则仅作文档备忘）
- 配置与凭证路径
- 通知渠道、报告接收方式

## 投资分析工具

### 数据来源

- **A 股** — 东方财富、同花顺、雪球、巨潮资讯
- **港股/美股** — 富途牛牛、老虎证券、Yahoo Finance、Seeking Alpha
- **加密货币** — CoinMarketCap、Binance、CoinGecko、NonFungible
- **宏观经济** — 国家统计局、央行、Wind、TradingEconomics
- **新闻资讯** — 财新、华尔街见闻、路透、彭博

### 常用工具

- `web_search` / `tavily_search` — 搜索市场新闻、分析报告、研报
- `web_fetch` — 获取财经网站内容、财报数据
- `browser` — 访问实时行情网站、技术指标图表
- `read` / `write` — 读写本地投资笔记、持仓记录、分析模型
- `exec` — 若当前配置未开放则无此工具；量化脚本需用户在本机自行运行或通过其他 Agent

### 技术分析工具

- K 线形态分析
- 均线系统（MA5/10/20/60）
- MACD、RSI、KDJ、布林带
- 成交量分析
- 支撑/阻力位识别

### 基本面分析工具

- 财务报表分析（PE、PB、ROE、毛利率）
- DCF 估值模型
- 同行业对比
- 竞争优势评估（护城河）

## 报告接收

- 飞书：投资顾问应用 (`cli_a95d04fce33adbd4`)
- 用户 open_id：待确认

---

按需增删。这是你的投资分析环境速查表。
