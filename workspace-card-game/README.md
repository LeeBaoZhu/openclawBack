# 2v2 棋牌游戏 - 双扣

一个 2v2 对家棋牌游戏，支持逐张发牌、暂停控制、管理员功能。

## 🎮 功能特点

### 核心功能
- ✅ **2v2 对家模式** - 北南 vs 东西，队友配合
- ✅ **逐张发牌** - 支持暂停/恢复
- ✅ **管理员控制** - 设置发牌间隔、回退出牌
- ✅ **自动理牌** - 5、大小王、3、2 优先显示在左侧
- ✅ **无限制出牌** - 玩家可以出任何牌
- ✅ **战绩统计** - MySQL 数据库记录输赢

### 管理员功能
- 👑 **设置发牌间隔** - 100ms - 5000ms 可调
- 👑 **回退出牌** - 可以回退任意玩家的出牌
- 👑 **暂停/恢复游戏** - 随时暂停游戏

## 🚀 快速开始

### 一键部署（服务器）

将项目上传到服务器后，在项目根目录执行：

```bash
sudo bash deploy-oneclick.sh
```

如需自定义端口或数据库，可在执行时覆盖环境变量：

```bash
sudo WS_PORT=3235 MYSQL_DB=card_game MYSQL_USER=card_user MYSQL_PASSWORD='你的密码' bash deploy-oneclick.sh
```

### 1. 准备 MySQL

在 MySQL 中创建库（字符集建议 `utf8mb4`）：

```sql
CREATE DATABASE card_game CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

复制 `.env.example` 为项目根目录下的 `.env`，填写 `MYSQL_USER`、`MYSQL_PASSWORD`、`MYSQL_DATABASE` 等。服务端通过 `dotenv` 在启动时加载（见 `server/server.js`）。

### 2. 安装依赖

```bash
cd /root/.openclaw/workspace-card-game
npm install --production
```

### 3. 启动服务器

```bash
# 启动游戏服务器（WebSocket，默认端口 3235；需能连上 MySQL）
node server/server.js &

# 启动 HTTP 服务器（前端页面，端口 8080）
cd client
python3 -m http.server 8080 &
```

### 4. 访问游戏

浏览器打开：
```
http://<你的服务器 IP>:8080
```

### 5. 开始游戏

1. 输入固定昵称（`玩家1` / `玩家2` / `玩家3` / `玩家4`）
2. 等待 4 个玩家加入
3. 点击"开始发牌"
4. 按顺序逐张发牌（每人 27 张）
5. 顺时针轮流出牌
6. 先出完牌的队伍获胜

## 📁 项目结构

```
card-game/
├── server/
│   ├── server.js      # WebSocket 服务器
│   ├── game.js        # 游戏逻辑（发牌、出牌、暂停等）
│   └── database.js    # MySQL 数据库操作
├── client/
│   ├── index.html     # 登录/大厅（固定账号）
│   ├── game.html      # 游戏页面（暂停、理牌、管理员控制）
│   └── stats.html     # 战绩统计
├── database/          # 可选占位目录（数据在 MySQL）
├── package.json
└── README.md
```

## 🎯 游戏规则

### 基本规则
- **玩家数**：4 人
- **队伍**：北 + 南 vs 东 + 西（对家是队友）
- **牌数**：两副牌（108 张），每人 27 张
- **出牌**：顺时针轮流出牌，无牌型限制
- **获胜**：任一队员先出完牌，整个队伍获胜

### 理牌规则
手牌自动按以下顺序排列（从左到右）：
1. **5** （所有花色的 5）
2. **大小王** （大王在前，小王在后）
3. **3** （所有花色的 3）
4. **2** （所有花色的 2）
5. **其他牌** （A、K、Q、J、10...）

### 管理员功能
- **发牌间隔**：默认 1000ms（1 秒），可调整 100-5000ms
- **回退出牌**：输入历史索引，回退指定出牌
- **暂停游戏**：所有玩家可以随时暂停

## 📊 数据存储

### 内存数据库
- 使用 JSON 文件存储（`database/stats.json`）
- 自动保存每局游戏结果
- 记录玩家输赢场次、胜率

### games - 游戏记录表
- id: 对局 ID
- room_id: 会话标签（家庭局固定为 `family`，非多房间）
- winner_team_id: 获胜队伍
- duration_seconds: 游戏时长
- created_at: 创建时间

### game_players - 游戏玩家表
- game_id: 对局 ID
- player_id: 玩家 ID
- team_id: 队伍 ID
- is_winner: 是否获胜
- final_hand_count: 结束手牌数
- play_count: 出牌次数

## 🔧 技术栈

- **后端**：Node.js + ws (WebSocket)
- **数据库**：MySQL（mysql2 连接池）
- **前端**：Vue3 CDN (无需构建)
- **HTTP 服务器**：Python3 http.server

**优势：**
- ✅ 无需编译原生模块
- ✅ 安装快速（只需几秒）
- ✅ 跨平台兼容
- ✅ 易于部署和维护

## 📝 API 消息格式

### 客户端 → 服务器

```json
// 加入本局（家人连同一服务器即同桌）
// 仅支持固定账号：玩家1~玩家4（管理员固定为玩家1）
{ "action": "join", "nickname": "玩家1" }

// 开始发牌
{ "action": "startDealing" }

// 暂停游戏
{ "action": "pause" }

// 恢复游戏
{ "action": "resume" }

// 设置发牌间隔
{ "action": "setDealInterval", "interval": 2000 }

// 出牌
{ "action": "play", "cards": [1, 5, 9] }

// 不要
{ "action": "pass" }

// 回退出牌（管理员）
{ "action": "undoPlay", "playIndex": 5 }

// 管理员主动结束本局
{ "action": "endGame" }
```

### 服务器 → 客户端

```json
// 加入本局成功
{ "event": "joined", "playerId": 1, "isAdmin": false }

// 玩家列表同步（四人同一局）
{ "event": "playersUpdate", "players": [...] }

// 游戏开始
{ "event": "gameStart", "seats": [...] }

// 开始发牌
{ "event": "dealingStart", "interval": 1000 }

// 发牌进度
{ "event": "dealProgress", "dealIndex": 50, "total": 108 }

// 手牌更新
{ "event": "handUpdate", "cards: [...], "dealIndex": 50 }

// 出牌
{ "event": "played", "playerId": 1, "cards": [...], "remaining": 20 }

// 游戏暂停
{ "event": "gamePaused", "pausedBy": "玩家 1" }

// 游戏恢复
{ "event": "gameResumed" }

// 回退出牌
{ "event": "playUndone", "playerId": 1 }

// 游戏结束
{ "event": "gameOver", "winner": { "team": ["玩家 1", "玩家 3"] } }
```

## 🎮 游戏流程

```
1. 四名玩家连上服务器（同一局）
   ↓
2. 点击"开始发牌"
   ↓
3. 逐张发牌（支持暂停）
   ↓
4. 发牌完成，游戏开始
   ↓
5. 顺时针轮流出牌（无限制）
   ↓
6. 有玩家出完牌
   ↓
7. 游戏结束，记录战绩
```

## ⚙️ 配置说明

### 环境变量
```bash
PORT=3235  # WebSocket 服务器端口
```

### 发牌间隔
- 默认：1000ms（1 秒）
- 范围：100ms - 5000ms
- 管理员可在游戏中调整

## 📈 后续扩展

- [ ] 牌型验证（可选）
- [ ] 牌大小比较（可选）
- [ ] 角色系统
- [ ] 聊天功能
- [ ] 游戏回放

## 📞 问题反馈

有任何问题或建议，欢迎反馈！

## License

MIT
