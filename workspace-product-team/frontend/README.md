# OpenClaw Dashboard - 前端项目

系统可视化仪表盘前端项目（任务执行看板 + 日志仪表盘）

---

## 📦 技术栈

| 层级 | 技术选型 | 版本 |
|------|----------|------|
| 框架 | React | 18.x |
| UI 组件 | Ant Design | 5.x |
| 图表 | ECharts | 5.x |
| 构建 | Vite | 5.x |
| 语言 | TypeScript | 5.x |

---

## 🚀 快速开始

```bash
# 安装依赖
npm install

# 开发模式
npm run dev

# 构建生产版本
npm run build

# 预览生产构建
npm run preview
```

---

## 📁 项目结构

```
frontend/
├── src/
│   ├── components/          # 可复用组件
│   │   ├── TaskTable.tsx    # 任务列表表格
│   │   ├── HealthGauge.tsx  # 健康度仪表盘
│   │   ├── TrendChart.tsx   # 趋势图
│   │   └── AlertList.tsx    # 告警列表
│   ├── pages/               # 页面
│   │   ├── TaskBoard.tsx    # 任务执行看板（REQ-002）
│   │   └── LogDashboard.tsx # 日志仪表盘（REQ-001）
│   ├── api/                 # API 调用
│   │   ├── cron.ts          # Cron 任务 API
│   │   └── health.ts        # 健康数据 API
│   ├── types/               # TypeScript 类型定义
│   │   └── index.ts
│   ├── App.tsx              # 根组件
│   └── main.tsx             # 入口文件
├── public/                  # 静态资源
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## 📄 页面路由

| 路径 | 页面 | 需求 | 状态 |
|------|------|------|------|
| `/` | 任务执行看板 | REQ-002 | ⏳ 待开发 |
| `/health` | 日志仪表盘 | REQ-001 | ⏳ 待开发 |

---

## 🔌 API 端点

开发环境代理配置：
- 前端请求：`/api/*`
- 代理目标：`http://localhost:38498/api/*`（Gateway）

详见 `docs/api-spec.md`

---

## 🎨 UI 规范

### 状态颜色
- 🟢 正常：`#52c41a`
- 🟡 警告：`#faad14`
- 🔴 失败：`#ff4d4f`

### 字体
- 主字体：`-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto`
- 代码字体：`'Fira Code', monospace`

---

## 📝 开发记录

### 2026-04-06
- [x] 项目初始化
- [ ] 组件开发
- [ ] 页面开发
- [ ] API 联调

---

_创建时间：2026-04-06_  
_负责人：Architect 🏗️_
