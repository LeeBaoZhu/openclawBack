// server/server.js
// WebSocket 游戏服务器 — 单实例家庭局（不区分多房间）

require('dotenv').config();

const WebSocket = require('ws');
const { Game } = require('./game');
const db = require('./database');

const PORT = process.env.PORT || 3235;
const wss = new WebSocket.Server({ port: PORT });

/** 本机唯一一局游戏（家人联机，无房间列表） */
let game = null;

function getGame() {
  if (!game) game = new Game();
  return game;
}

const playerSessions = new Map();

/** 发牌定时器（单局共用一个） */
let dealTimer = null;

/** 写入战绩时的会话标识（仅作区分，非多房间） */
const SESSION_LABEL = 'family';

/** 固定账号（与游戏无关配置放在后端） */
const FIXED_ACCOUNTS = [
  { nickname: '玩家1', isAdmin: true },
  { nickname: '玩家2', isAdmin: false },
  { nickname: '玩家3', isAdmin: false },
  { nickname: '玩家4', isAdmin: false }
];

function normalizeNickname(raw) {
  return String(raw || '')
    .trim()
    .replace(/[\s\u3000]+/g, '') // 去掉空格与全角空格
    .replace(/^玩家([1-4])$/, '玩家$1');
}

console.log('🎮 游戏服务器启动中（家庭局单实例）...');

wss.on('connection', (ws) => {
  console.log('📡 新玩家连接');

  ws.on('message', (data) => {
    try {
      const msg = JSON.parse(data);
      console.log('📨 收到消息:', msg.action);

      switch (msg.action) {
        case 'join':
          handleJoin(ws, msg).catch((err) => {
            console.error('❌ join 失败:', err);
            ws.send(JSON.stringify({ event: 'error', message: '加入失败' }));
          });
          break;
        case 'startGame':
          handleStartGame(ws);
          break;
        case 'startDealing':
          handleStartDealing(ws);
          break;
        case 'throwTrump':
          handleThrowTrump(ws, msg);
          break;
        case 'coverTrump':
          handleCoverTrump(ws, msg);
          break;
        case 'coverExchange':
          handleCoverExchange(ws, msg);
          break;
        case 'passCover':
          handlePassCover(ws);
          break;
        case 'pause':
          handlePause(ws, msg);
          break;
        case 'resume':
          handleResume(ws);
          break;
        case 'setDealInterval':
          handleSetDealInterval(ws, msg);
          break;
        case 'play':
          handlePlay(ws, msg);
          break;
        case 'pass':
          handlePass(ws, msg);
          break;
        case 'undoPlay':
          handleUndoPlay(ws, msg);
          break;
        case 'flipCenter':
          handleFlipCenter(ws);
          break;
        case 'setScore':
          handleSetScore(ws, msg);
          break;
        case 'endGame':
          handleEndGame(ws);
          break;
        case 'getStats':
          handleGetStats(ws).catch((err) => {
            console.error('❌ getStats 失败:', err);
            ws.send(JSON.stringify({ event: 'error', message: '获取统计失败' }));
          });
          break;
        default:
          console.log('⚠️ 未知消息类型:', msg.action);
      }
    } catch (err) {
      console.error('❌ 消息处理错误:', err);
    }
  });

  ws.on('close', () => {
    console.log('📴 玩家断开连接');
    const pid = ws.playerId;
    if (game && pid != null) {
      game.removePlayer(pid);
      broadcast({
        event: 'playersUpdate',
        players: game.getPlayers()
      });
      broadcastState();
    }
    playerSessions.delete(ws);
  });

  ws.on('error', (err) => {
    console.error('❌ WebSocket 错误:', err);
  });
});

async function handleJoin(ws, msg) {
  const inputNickname = normalizeNickname(msg.nickname);
  const account = FIXED_ACCOUNTS.find((a) => a.nickname === inputNickname);
  if (!account) {
    ws.send(JSON.stringify({
      event: 'error',
      message: `仅支持固定账号登录：${FIXED_ACCOUNTS.map((a) => a.nickname).join('、')}`
    }));
    return;
  }
  const nickname = account.nickname;

  const player = await db.getOrCreatePlayer(nickname);
  const playerId = player.id;
  playerSessions.set(ws, playerId);

  const g = getGame();
  const duplicate = g.players.find((p) => p.nickname === nickname);
  if (duplicate) {
    ws.send(JSON.stringify({
      event: 'error',
      message: `${nickname} 已在本局在线，请勿重复登录`
    }));
    return;
  }
  if (g.players.length >= 4) {
    ws.send(JSON.stringify({
      event: 'error',
      message: '本局已满 4 人'
    }));
    return;
  }

  const resolvedAdmin = account.isAdmin;
  g.addPlayer(playerId, ws, nickname, resolvedAdmin);

  ws.playerId = playerId;

  console.log(`✅ 玩家 ${nickname}(${playerId}) 加入家庭局${resolvedAdmin ? ' (管理员)' : ''}`);

  ws.send(JSON.stringify({
    event: 'joined',
    playerId,
    isAdmin: resolvedAdmin
  }));

  const stats = await db.getPlayerStats(playerId);
  ws.send(JSON.stringify({
    event: 'playerStats',
    stats: stats
  }));

  broadcast({
    event: 'playersUpdate',
    players: g.getPlayers()
  });
  broadcastState();
}

function handleStartGame(ws) {
  if (!game) return;
  const playerId = playerSessions.get(ws);
  const player = game.players.find((p) => p.playerId === playerId);
  if (!player || !player.isAdmin) {
    ws.send(JSON.stringify({ event: 'error', message: '只有管理员可以开始开局' }));
    return;
  }

  if (game.players.length === 4) {
    console.log('🎲 4 人已满，游戏开始！');

    game.startTime = Date.now();
    game.start();

    broadcast({
      event: 'gameStart',
      seats: game.getSeats()
    });
    broadcastState();
  } else {
    ws.send(JSON.stringify({ event: 'error', message: `当前仅 ${game.players.length}/4 人，无法开局` }));
  }
}

function handleStartDealing(ws) {
  if (!game) return;
  const playerId = playerSessions.get(ws);
  const player = game.players.find((p) => p.playerId === playerId);
  if (!player || !player.isAdmin) {
    ws.send(JSON.stringify({ event: 'error', message: '只有管理员可以开始发牌' }));
    return;
  }
  if (game.players.length < 4) {
    ws.send(JSON.stringify({ event: 'error', message: `当前仅 ${game.players.length}/4 人，无法发牌` }));
    return;
  }
  if (!Array.isArray(game.seats) || game.seats.length !== 4) {
    ws.send(JSON.stringify({ event: 'error', message: '请先点击“开始开局”，再点击“开始发牌”' }));
    return;
  }
  if (game.isDealing) {
    ws.send(JSON.stringify({ event: 'error', message: '已经在发牌中' }));
    return;
  }

  try {
    game.startDealing();
  } catch (err) {
    ws.send(JSON.stringify({ event: 'error', message: err.message || '开始发牌失败' }));
    return;
  }

  broadcast({
    event: 'dealingStart',
    interval: game.dealInterval
  });
  broadcastState();

  if (dealTimer) {
    clearInterval(dealTimer);
    dealTimer = null;
  }

  dealTimer = setInterval(() => {
    if (!game || !game.isDealing) {
      clearInterval(dealTimer);
      dealTimer = null;
      if (game) {
        broadcastState();
      }
      return;
    }
    if (!game.isPaused) {
      try {
        game.dealOneCard();
      } catch (err) {
        console.error('❌ 发牌异常:', err);
        game.isDealing = false;
        game.phase = 'waiting';
        clearInterval(dealTimer);
        dealTimer = null;
        broadcast({
          event: 'error',
          message: `发牌异常：${err.message || '未知错误'}`
        });
        broadcastState();
        return;
      }
      if (!game.isDealing) {
        broadcast({
          event: 'trumpPhaseStart'
        });
        broadcastState();
      }
    }
  }, game.dealInterval);
}

function handleThrowTrump(ws, msg) {
  const playerId = playerSessions.get(ws);
  if (!game) return;
  try {
    game.throwTrump(playerId, msg.cards || []);
    broadcast({
      event: 'trumpThrown',
      playerId
    });
    game.sendHands();
    broadcastState();
  } catch (err) {
    ws.send(JSON.stringify({ event: 'error', message: err.message }));
  }
}

function handleCoverTrump(ws, msg) {
  const playerId = playerSessions.get(ws);
  if (!game) return;
  try {
    game.coverTrump(playerId, msg.cards || []);
    broadcast({
      event: 'trumpCovered',
      playerId
    });
    game.sendHands();
    broadcastState();
  } catch (err) {
    ws.send(JSON.stringify({ event: 'error', message: err.message }));
  }
}

function handleCoverExchange(ws, msg) {
  const playerId = playerSessions.get(ws);
  if (!game) return;
  try {
    game.exchangeCover(playerId, msg.cards || []);
    broadcast({
      event: 'coverExchanged',
      playerId
    });
    game.sendHands();
    broadcastState();
  } catch (err) {
    ws.send(JSON.stringify({ event: 'error', message: err.message }));
  }
}

function handlePassCover(ws) {
  const playerId = playerSessions.get(ws);
  if (!game) return;
  try {
    game.passCover(playerId);
    if (game.phase === 'playing') {
      broadcast({ event: 'trumpPlayingStart' });
    }
    broadcastState();
  } catch (err) {
    ws.send(JSON.stringify({ event: 'error', message: err.message }));
  }
}

function handlePause(ws, msg) {
  if (!game) return;
  game.pause(playerSessions.get(ws));
  broadcastState();
}

function handleResume(ws) {
  if (!game) return;
  game.resume();
  broadcastState();
}

function handleSetDealInterval(ws, msg) {
  if (!game) return;

  game.setDealInterval(msg.interval);
  broadcastState();

  if (dealTimer) {
    clearInterval(dealTimer);
    dealTimer = null;

    if (game.isDealing) {
      dealTimer = setInterval(() => {
        if (!game || !game.isDealing) {
          clearInterval(dealTimer);
          dealTimer = null;
          return;
        }
        if (!game.isPaused) {
          game.dealOneCard();
        }
      }, msg.interval);
    }
  }
}

function handlePlay(ws, msg) {
  const playerId = playerSessions.get(ws);

  if (!game) return;

  if (game && game.canPlay(playerId)) {
    try {
      game.recordPlay(playerId);
      game.play(playerId, msg.cards);

      broadcast({
        event: 'played',
        playerId,
        cards: msg.cards,
        remaining: game.getHandCount(playerId),
        historyIndex: game.getPlayHistory().length - 1
      });

      if (game.checkWin()) {
        const duration = Math.floor((Date.now() - game.startTime) / 1000);
        db.recordGame(SESSION_LABEL, game.winner.teamId, duration, game.getPlayerStats()).catch((err) => {
          console.error('❌ 保存对局记录失败:', err);
        });

        broadcast({
          event: 'gameOver',
          winner: game.winner
        });
        broadcastState();

        setTimeout(() => {
          db.getAllStats()
            .then((allStats) => {
              broadcast({
                event: 'statsUpdate',
                stats: allStats
              });
            })
            .catch((err) => console.error('❌ 获取统计失败:', err));
        }, 1000);
      }
      broadcastState();
    } catch (err) {
      ws.send(JSON.stringify({
        event: 'error',
        message: err.message
      }));
    }
  }
}

function handlePass(ws, msg) {
  const playerId = playerSessions.get(ws);

  if (!game) return;

  if (game && game.canPlay(playerId)) {
    game.pass(playerId);

    broadcast({
      event: 'passed',
      playerId
    });
    broadcastState();
  }
}

function handleUndoPlay(ws, msg) {
  const playerId = playerSessions.get(ws);

  if (!game) return;

  const player = game.players.find((p) => p.playerId === playerId);

  if (player && player.isAdmin) {
    const success = game.undoPlay(msg.playIndex);
    if (!success) {
      ws.send(JSON.stringify({
        event: 'error',
        message: '回退失败'
      }));
    }
    broadcastState();
  } else {
    ws.send(JSON.stringify({
      event: 'error',
      message: '只有管理员可以回退出牌'
    }));
  }
}

function handleFlipCenter(ws) {
  const playerId = playerSessions.get(ws);
  if (!game) return;
  const player = game.players.find((p) => p.playerId === playerId);
  if (!player || !player.isAdmin) {
    ws.send(JSON.stringify({ event: 'error', message: '只有管理员可以翻牌' }));
    return;
  }
  game.flipCenter(playerId);
  broadcast({ event: 'centerFlipped' });
  broadcastState();
}

function handleSetScore(ws, msg) {
  const playerId = playerSessions.get(ws);
  if (!game) return;
  const player = game.players.find((p) => p.playerId === playerId);
  if (!player || !player.isAdmin) {
    ws.send(JSON.stringify({ event: 'error', message: '只有管理员可以设置分数' }));
    return;
  }
  game.setTeam0Score(msg.team0Score, playerId);
  broadcast({ event: 'scoreUpdated' });
  broadcastState();
}

function handleEndGame(ws) {
  const playerId = playerSessions.get(ws);
  if (!game) return;

  const player = game.players.find((p) => p.playerId === playerId);
  if (!player || !player.isAdmin) {
    ws.send(JSON.stringify({
      event: 'error',
      message: '只有管理员可以结束本局'
    }));
    return;
  }

  const result = game.forceEndGame(playerId);
  if (dealTimer) {
    clearInterval(dealTimer);
    dealTimer = null;
  }

  broadcast({
    event: 'gameForceEnded',
    by: result.by
  });
  broadcastState();
}

async function handleGetStats(ws) {
  const allStats = await db.getAllStats();
  ws.send(JSON.stringify({
    event: 'allStats',
    stats: allStats
  }));
}

function broadcast(data) {
  if (!game) return;

  game.players.forEach((p) => {
    if (p.ws.readyState === WebSocket.OPEN) {
      p.ws.send(JSON.stringify(data));
    }
  });
}

function broadcastState() {
  if (!game) return;
  broadcast({
    event: 'stateSync',
    state: game.getState()
  });
}

console.log(`✅ 服务器已启动：ws://localhost:${PORT}`);
console.log(`📊 MySQL：${process.env.MYSQL_HOST || '127.0.0.1'} / ${process.env.MYSQL_DATABASE || 'card_game'}`);
