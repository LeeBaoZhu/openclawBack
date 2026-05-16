# OpenClaw Dashboard API 接口文档

**版本：** 1.0.0  
**更新时间：** 2026-04-06  
**基础路径：** `/api`

---

## 📋 接口概览

| 接口 | 方法 | 描述 | 需求 |
|------|------|------|------|
| `/api/cron/jobs` | GET | 获取 Cron 任务列表 | REQ-002 |
| `/api/cron/jobs/:id` | GET | 获取单个任务详情 | REQ-002 |
| `/api/cron/jobs/:id/run` | POST | 手动触发任务执行 | REQ-002 |
| `/api/cron/jobs/:id` | PUT | 启用/禁用任务 | REQ-002 |
| `/api/health/dashboard` | GET | 获取健康度仪表盘数据 | REQ-001 |
| `/api/health/trends` | GET | 获取告警趋势数据 | REQ-001 |
| `/api/health/alerts` | GET | 获取告警列表 | REQ-001 |

---

## 🔌 Cron 任务接口

### 1. 获取任务列表

**请求：**
```http
GET /api/cron/jobs
```

**响应：**
```json
{
  "success": true,
  "data": [
    {
      "id": "sysadmin-log-rotation",
      "name": "系统日志轮转",
      "schedule": "0 2 * * *",
      "enabled": true,
      "status": "ok",
      "lastRunAt": "2026-04-06T02:00:00Z",
      "nextRunAt": "2026-04-07T02:00:00Z",
      "lastDurationMs": 18060,
      "consecutiveErrors": 0,
      "deliveryStatus": "delivered"
    }
  ],
  "total": 12,
  "stats": {
    "ok": 10,
    "warning": 1,
    "error": 1,
    "successRate": 83.33
  }
}
```

**字段说明：**
| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | string | 任务唯一标识 |
| `name` | string | 任务名称 |
| `schedule` | string | Cron 表达式 |
| `enabled` | boolean | 是否启用 |
| `status` | string | 状态：ok/warning/error |
| `lastRunAt` | string | 上次执行时间 |
| `nextRunAt` | string | 下次执行时间 |
| `lastDurationMs` | number | 上次执行耗时（毫秒） |
| `consecutiveErrors` | number | 连续错误次数 |
| `deliveryStatus` | string | 投递状态：delivered/failed |

---

### 2. 获取任务详情

**请求：**
```http
GET /api/cron/jobs/:id
```

**响应：**
```json
{
  "success": true,
  "data": {
    "id": "sysadmin-log-rotation",
    "name": "系统日志轮转",
    "agentId": "sysadmin",
    "schedule": "0 2 * * *",
    "enabled": true,
    "payload": {
      "kind": "agentTurn",
      "message": "凌晨 2:00 自动执行日志轮转..."
    },
    "state": {
      "lastRunAtMs": 1775412000003,
      "lastRunStatus": "ok",
      "lastDurationMs": 18060,
      "consecutiveErrors": 0
    },
    "history": [
      {
        "runAt": "2026-04-06T02:00:00Z",
        "status": "ok",
        "durationMs": 18060
      }
    ]
  }
}
```

---

### 3. 手动触发任务

**请求：**
```http
POST /api/cron/jobs/:id/run
```

**响应：**
```json
{
  "success": true,
  "message": "任务已触发，将在后台执行",
  "data": {
    "runId": "abc-123-def",
    "estimatedDurationMs": 20000
  }
}
```

**错误响应：**
```json
{
  "success": false,
  "error": "TASK_DISABLED",
  "message": "任务已禁用，无法手动触发"
}
```

---

### 4. 启用/禁用任务

**请求：**
```http
PUT /api/cron/jobs/:id
Content-Type: application/json

{
  "enabled": false
}
```

**响应：**
```json
{
  "success": true,
  "message": "任务已禁用",
  "data": {
    "id": "sysadmin-log-rotation",
    "enabled": false,
    "updatedAt": "2026-04-06T10:30:00Z"
  }
}
```

---

## 🏥 健康仪表盘接口

### 1. 获取健康度仪表盘

**请求：**
```http
GET /api/health/dashboard
```

**响应：**
```json
{
  "success": true,
  "data": {
    "score": 85,
    "level": "warning",
    "summary": {
      "totalAlerts": 12,
      "errorCount": 2,
      "warningCount": 10,
      "fatalCount": 0
    },
    "components": [
      {
        "name": "Cron 任务",
        "status": "warning",
        "message": "1 个任务连续失败"
      },
      {
        "name": "Feishu API",
        "status": "ok",
        "message": "正常"
      }
    ]
  }
}
```

**字段说明：**
| 字段 | 类型 | 说明 |
|------|------|------|
| `score` | number | 健康度评分（0-100） |
| `level` | string | 等级：ok/warning/error |
| `summary` | object | 告警汇总 |
| `components` | array | 组件状态列表 |

**评分规则：**
- 100 分：无 error/warning
- 每个 error 扣 10 分
- 每个 warning 扣 2 分
- 每个 fatal 扣 20 分

---

### 2. 获取告警趋势

**请求：**
```http
GET /api/health/trends?days=7
```

**参数：**
| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `days` | number | 7 | 天数：7 或 30 |

**响应：**
```json
{
  "success": true,
  "data": {
    "period": "7d",
    "series": [
      {
        "date": "2026-04-01",
        "error": 3,
        "warning": 5,
        "fatal": 0
      },
      {
        "date": "2026-04-02",
        "error": 1,
        "warning": 2,
        "fatal": 0
      }
    ]
  }
}
```

---

### 3. 获取告警列表

**请求：**
```http
GET /api/health/alerts?limit=10&offset=0
```

**参数：**
| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `limit` | number | 10 | 每页数量 |
| `offset` | number | 0 | 偏移量 |
| `level` | string | all | 过滤：error/warning/fatal |

**响应：**
```json
{
  "success": true,
  "data": {
    "total": 50,
    "alerts": [
      {
        "id": "alert-001",
        "level": "error",
        "category": "cron_failure",
        "message": "Cron 任务 sysadmin-log-rotation 连续失败 3 次",
        "suggestion": "检查 delivery.to 配置格式",
        "createdAt": "2026-04-06T02:05:00Z",
        "resolved": false
      }
    ]
  }
}
```

**字段说明：**
| 字段 | 类型 | 说明 |
|------|------|------|
| `level` | string | 级别：error/warning/fatal |
| `category` | string | 分类：cron_failure/permission/api_key/network |
| `message` | string | 告警信息 |
| `suggestion` | string | 建议措施 |
| `createdAt` | string | 创建时间 |
| `resolved` | boolean | 是否已解决 |

---

## 🔐 认证

所有接口需要通过 Gateway 认证：
```http
Authorization: Bearer <gateway-token>
```

Token 配置位置：`openclaw.json.gateway.auth.token`

---

## 📊 状态码

| 状态码 | 说明 |
|--------|------|
| 200 | 成功 |
| 400 | 请求参数错误 |
| 401 | 认证失败 |
| 403 | 权限不足 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |

---

## 📝 错误码

| 错误码 | 说明 |
|--------|------|
| `TASK_NOT_FOUND` | 任务不存在 |
| `TASK_DISABLED` | 任务已禁用 |
| `INVALID_CRON_EXPR` | Cron 表达式无效 |
| `DATA_PARSE_ERROR` | 数据解析失败 |

---

_文档维护：Architect 🏗️_  
_最后更新：2026-04-06_
