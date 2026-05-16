// server/game.js
// 游戏逻辑核心 - 完善版

class Game {
  constructor() {
    this.players = [];           // 玩家列表
    this.seats = [];             // 座位映射（随机分配后）
    this.deck = [];              // 牌堆
    this.hands = {};             // 每个玩家的手牌
    this.currentPlayerIndex = 0; // 当前出牌玩家索引 (0-3)
    this.lastPlay = null;        // 上一手牌
    this.playHistory = [];       // 出牌历史记录（用于回退）
    this.startTime = null;       // 游戏开始时间
    this.playCounts = {};        // 每个玩家出牌次数
    this.winner = null;          // 获胜者信息
    
    // 新增功能
    this.isPaused = false;       // 游戏暂停状态
    this.dealInterval = 1000;    // 发牌间隔（毫秒），默认 1 秒
    this.dealIndex = 0;          // 当前发牌索引
    this.isDealing = false;      // 是否正在发牌
    this.pausedBy = null;        // 暂停的玩家 ID
    this.phase = 'waiting';      // waiting / dealing / trump / playing / ended

    // 中央区与手工记分
    this.centerPlays = [];       // 当前中央展示
    this.centerHistory = [];     // 翻牌后历史
    this.team0Score = 0;         // 手工记分（可负）
    this.scoreUpdatedBy = null;

    // 甩牌/顶牌/还牌
    this.trump = {
      locked: false,
      suit: null,
      holderId: null,
      lastCards: [],
      structure: null,
      pendingExchange: null,
      passPlayerIds: []
    };
  }

  // 添加玩家（管理员身份由服务端固定配置下发）
  addPlayer(playerId, ws, nickname, isAdmin = false) {
    this.players.push({ playerId, ws, nickname, isAdmin });
    this.playCounts[playerId] = 0;
  }

  // 移除玩家
  removePlayer(playerId) {
    this.players = this.players.filter(p => p.playerId !== playerId);
    this.seats = this.seats.filter(p => p.playerId !== playerId);
    delete this.hands[playerId];
    delete this.playCounts[playerId];
    if (this.currentPlayerIndex >= this.seats.length) {
      this.currentPlayerIndex = 0;
    }
  }

  // 获取玩家列表
  getPlayers() {
    return this.players.map(p => ({
      playerId: p.playerId,
      nickname: p.nickname,
      isAdmin: p.isAdmin
    }));
  }

  // 获取座位信息
  getSeats() {
    return this.seats.map((p, index) => ({
      playerId: p.playerId,
      nickname: p.nickname,
      position: this.getPositionName(index),
      teamId: (index % 2 === 0) ? 1 : 2,
      isAdmin: p.isAdmin
    }));
  }

  // 位置名称
  getPositionName(index) {
    const names = ['北', '东', '南', '西'];
    return names[index];
  }

  // 开始游戏（分配座位）
  start() {
    // 随机分配座位
    this.seats = this.shuffleArray([...this.players]);
    this.phase = 'waiting';
    this.centerPlays = [];
    this.centerHistory = [];
    this.team0Score = 0;
    this.scoreUpdatedBy = null;
    this.trump = {
      locked: false,
      suit: null,
      holderId: null,
      lastCards: [],
      structure: null,
      pendingExchange: null,
      passPlayerIds: []
    };
    console.log('🎴 座位分配:', this.seats.map(p => p.nickname));
  }

  // 生成牌堆（两副牌，108 张）
  generateDeck() {
    const cards = [];
    let id = 0;
    
    // 两副牌：54 * 2 = 108
    for (let deck = 0; deck < 2; deck++) {
      // 花色：0=黑桃，1=红桃，2=梅花，3=方块，4=王
      for (let suit = 0; suit <= 4; suit++) {
        const count = suit === 4 ? 2 : 13;  // 王只有 2 张
        for (let rank = 1; rank <= count; rank++) {
          cards.push({
            id: id++,
            suit,
            rank,
            value: this.getCardValue(suit, rank)
          });
        }
      }
    }
    return cards;
  }

  // 牌力值 - 按 5，大小王，3,2 顺序排序
  getCardValue(suit, rank) {
    if (suit === 4) {
      // 王：大王 > 小王
      return rank === 2 ? 100 : 99;
    }
    if (rank === 5) {
      // 5 最大优先级
      return 200 + suit;
    }
    if (rank === 3) {
      // 3 次之
      return 150 + suit;
    }
    if (rank === 2) {
      // 2 再次
      return 140 + suit;
    }
    // 其他按正常顺序
    return rank;
  }

  // 洗牌
  shuffleDeck() {
    for (let i = this.deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
    }
  }

  // 发牌（逐张发牌，支持暂停）
  startDealing() {
    if (!Array.isArray(this.seats) || this.seats.length !== 4) {
      throw new Error('请先开始开局，再开始发牌');
    }
    this.isDealing = true;
    this.phase = 'dealing';
    this.dealIndex = 0;
    this.deck = this.generateDeck();
    this.shuffleDeck();
    
    // 初始化手牌
    this.seats.forEach(p => {
      this.hands[p.playerId] = [];
    });
    
    console.log('🃏 开始发牌...');
  }

  // 发一张牌
  dealOneCard() {
    if (!this.isDealing || this.isPaused) return false;
    
    if (this.dealIndex >= 108) {
      // 发牌完成
      this.isDealing = false;
      this.phase = 'trump';
      console.log('✅ 发牌完成');
      return false;
    }
    
    // 按顺序发给玩家
    const playerIndex = this.dealIndex % 4;
    const player = this.seats[playerIndex];
    const card = this.deck[this.dealIndex];

    if (!player || player.playerId == null || !this.hands[player.playerId]) {
      throw new Error('发牌失败：座位信息异常，请重新开局');
    }
    this.hands[player.playerId].push(card);
    
    // 发送手牌更新给该玩家
    if (player.ws && player.ws.readyState === 1) {
      player.ws.send(JSON.stringify({
        event: 'handUpdate',
        cards: this.hands[player.playerId],
        dealIndex: this.dealIndex + 1,
        total: 108
      }));
    }
    
    // 广播发牌进度
    const handCounts = {};
    this.seats.forEach((p) => {
      handCounts[p.playerId] = this.getHandCount(p.playerId);
    });

    this.broadcast({
      event: 'dealProgress',
      dealIndex: this.dealIndex + 1,
      total: 108,
      currentPlayer: playerIndex,
      handCounts
    });
    
    this.dealIndex++;
    return true;
  }

  // 设置发牌间隔
  setDealInterval(ms) {
    this.dealInterval = ms;
    console.log(`⏱️ 发牌间隔设置为 ${ms}ms`);
  }

  // 暂停游戏
  pause(playerId) {
    this.isPaused = true;
    this.pausedBy = playerId;
    const player = this.players.find(p => p.playerId === playerId);
    console.log(`⏸️ 游戏暂停 by ${player?.nickname}`);
    
    this.broadcast({
      event: 'gamePaused',
      pausedBy: player?.nickname || playerId
    });
  }

  // 恢复游戏
  resume() {
    this.isPaused = false;
    this.pausedBy = null;
    console.log('▶️ 游戏恢复');
    
    this.broadcast({
      event: 'gameResumed'
    });
  }

  // 发送手牌给每个玩家
  sendHands() {
    this.seats.forEach(p => {
      p.ws.send(JSON.stringify({
        event: 'hand',
        cards: this.hands[p.playerId]
      }));
    });
  }

  // 获取当前出牌玩家
  getCurrentPlayer() {
    return this.seats[this.currentPlayerIndex];
  }

  // 是否可以出牌
  canPlay(playerId) {
    return !this.isPaused && 
           !this.isDealing && 
           this.phase === 'playing' &&
           this.getCurrentPlayer().playerId === playerId;
  }

  // 记录出牌次数
  recordPlay(playerId) {
    this.playCounts[playerId]++;
  }

  // 出牌（不做任何限制）
  play(playerId, cards) {
    // 移除手牌
    this.hands[playerId] = this.hands[playerId].filter(
      c => !cards.includes(c.id)
    );
    
    // 记录到历史
    const playRecord = {
      playerId,
      cards,
      timestamp: Date.now(),
      handCount: this.hands[playerId].length
    };
    this.playHistory.push(playRecord);

    this.centerPlays.push({
      playerId,
      cards: this.getCardsByIds(cards),
      timestamp: Date.now()
    });
    
    // 记录最后一手牌
    this.lastPlay = { playerId, cards };
    this.passCount = 0;
    
    // 下一个玩家
    this.nextPlayer();
    
    return true;
  }

  // 回退出牌（管理员功能）
  undoPlay(playIndex) {
    if (playIndex < 0 || playIndex >= this.playHistory.length) {
      return false;
    }
    
    const record = this.playHistory[playIndex];
    const player = this.seats.find(p => p.playerId === record.playerId);
    
    if (!player) return false;
    
    // 恢复手牌
    const cardsToRestore = this.deck.filter(c => 
      record.cards.includes(c.id)
    );
    this.hands[record.playerId].push(...cardsToRestore);
    
    // 从历史中移除
    this.playHistory.splice(playIndex, 1);

    const idx = this.centerPlays.findIndex((x) =>
      x.playerId === record.playerId &&
      Array.isArray(x.cards) &&
      x.cards.length === record.cards.length &&
      x.cards.every((c) => record.cards.includes(c.id))
    );
    if (idx >= 0) {
      this.centerPlays.splice(idx, 1);
    }
    
    // 更新当前玩家
    this.currentPlayerIndex = this.seats.findIndex(
      p => p.playerId === record.playerId
    );
    
    console.log(`↩️ 回退出牌：${player.nickname}`);
    
    this.broadcast({
      event: 'playUndone',
      playerId: record.playerId,
      cards: record.cards
    });
    
    // 发送恢复的手牌
    player.ws.send(JSON.stringify({
      event: 'hand',
      cards: this.hands[record.playerId]
    }));
    
    return true;
  }

  // 不要
  pass(playerId) {
    this.passCount++;
    
    // 如果 3 个人都不要，当前玩家获得出牌权
    if (this.passCount >= 3) {
      this.lastPlay = null;
      this.passCount = 0;
    }
    
    this.nextPlayer();
  }

  // 下一个玩家（顺时针）
  nextPlayer() {
    this.currentPlayerIndex = (this.currentPlayerIndex + 1) % 4;
  }

  // 获取手牌数
  getHandCount(playerId) {
    return this.hands[playerId] ? this.hands[playerId].length : 0;
  }

  // 检查胜负
  checkWin() {
    for (const [playerId, hand] of Object.entries(this.hands)) {
      if (hand.length === 0) {
        // 找到该玩家的座位
        const seatIndex = this.seats.findIndex(p => p.playerId === playerId);
        const player = this.seats[seatIndex];
        
        // 队伍：0 或 2 → 队伍 1，1 或 3 → 队伍 2
        const teamId = (seatIndex % 2 === 0) ? 1 : 2;
        
        // 队友（对家）
        const teammateIndex = (seatIndex + 2) % 4;
        const teammate = this.seats[teammateIndex];
        
        this.winner = {
          teamId,
          team: [player.nickname, teammate.nickname],
          winnerId: playerId
        };
        
        console.log(`🎉 游戏结束！队伍${teamId}获胜：${this.winner.team.join(' & ')}`);
        this.phase = 'ended';
        return true;
      }
    }
    return false;
  }

  // 获取玩家统计（用于记录到数据库）
  getPlayerStats() {
    return this.seats.map((p, index) => ({
      playerId: p.playerId,
      teamId: (index % 2 === 0) ? 1 : 2,
      isWinner: false,  // 游戏结束后由数据库更新
      finalHandCount: this.hands[p.playerId].length,
      playCount: this.playCounts[p.playerId]
    }));
  }

  // 获取出牌历史
  getPlayHistory() {
    return this.playHistory;
  }

  // 管理员主动结束本局（不计算赢家）
  forceEndGame(adminPlayerId) {
    const admin = this.players.find((p) => p.playerId === adminPlayerId);
    this.isDealing = false;
    this.isPaused = false;
    this.pausedBy = null;
    this.winner = null;
    this.phase = 'ended';
    return {
      by: admin?.nickname || `玩家${adminPlayerId}`
    };
  }

  // 仅管理员执行：翻牌（清空中央展示，入历史）
  flipCenter(adminPlayerId) {
    const admin = this.players.find((p) => p.playerId === adminPlayerId);
    if (this.centerPlays.length > 0) {
      this.centerHistory.push({
        by: admin?.nickname || `玩家${adminPlayerId}`,
        timestamp: Date.now(),
        plays: this.centerPlays
      });
      this.centerPlays = [];
    }
  }

  // 手工记分（可负）
  setTeam0Score(score, adminPlayerId) {
    this.team0Score = Number(score) || 0;
    const admin = this.players.find((p) => p.playerId === adminPlayerId);
    this.scoreUpdatedBy = admin?.nickname || `玩家${adminPlayerId}`;
  }

  getCardsByIds(ids) {
    const set = new Set(ids);
    return this.deck.filter((c) => set.has(c.id));
  }

  removeCardsFromHand(playerId, ids) {
    const hand = this.hands[playerId] || [];
    const map = new Set(ids);
    if (ids.some((id) => !hand.some((c) => c.id === id))) return false;
    this.hands[playerId] = hand.filter((c) => !map.has(c.id));
    return true;
  }

  detectPairRun(cards) {
    if (!Array.isArray(cards) || cards.length < 2 || cards.length % 2 !== 0) return null;
    const suit = cards[0].suit;
    if (cards.some((c) => c.suit !== suit)) return null;
    const byRank = new Map();
    cards.forEach((c) => byRank.set(c.rank, (byRank.get(c.rank) || 0) + 1));
    if ([...byRank.values()].some((cnt) => cnt !== 2)) return null;
    const ranks = [...byRank.keys()].sort((a, b) => a - b);
    for (let i = 1; i < ranks.length; i++) {
      if (ranks[i] !== ranks[i - 1] + 1) return null;
    }
    return {
      kind: 'pairRun',
      suit,
      pairCount: ranks.length,
      cardCount: cards.length
    };
  }

  getCardPower(card) {
    const trumpSuit = this.trump.suit;
    if (card.suit === 4) return card.rank === 2 ? 190 : 180; // 大小王
    if (card.rank === 5 && card.suit === trumpSuit) return 200; // 天5
    if (card.rank === 5) return 170;
    if (card.rank === 3 && card.suit === trumpSuit) return 160;
    if (card.rank === 3) return 150;
    if (card.rank === 2 && card.suit === trumpSuit) return 140;
    if (card.rank === 2) return 130;
    const rankPower = card.rank === 1 ? 14 : card.rank; // A 最高
    if (card.suit === trumpSuit) return 100 + rankPower;
    return 50 + rankPower;
  }

  getGroupPower(cards) {
    return Math.max(...cards.map((c) => this.getCardPower(c)));
  }

  throwTrump(playerId, cardIds) {
    if (this.phase !== 'trump') throw new Error('当前不是甩牌阶段');
    if (this.trump.lastCards.length > 0) throw new Error('已有人甩牌，不能再次甩牌');
    const cards = this.getCardsByIds(cardIds);
    const structure = this.detectPairRun(cards);
    if (!structure) throw new Error('甩牌仅支持同花色对子/连对');
    if (!this.removeCardsFromHand(playerId, cardIds)) throw new Error('手牌不足');

    this.trump.locked = true;
    this.trump.suit = structure.suit;
    this.trump.holderId = playerId;
    this.trump.lastCards = [...cardIds];
    this.trump.structure = structure;
    this.trump.pendingExchange = null;
    this.trump.passPlayerIds = [];
  }

  coverTrump(playerId, cardIds) {
    if (this.phase !== 'trump') throw new Error('当前不是顶牌阶段');
    if (!this.trump.lastCards.length) throw new Error('尚未甩牌');
    if (this.trump.pendingExchange) throw new Error('请先完成还牌');
    if (playerId === this.trump.holderId) throw new Error('当前持牌者不能顶自己');

    const cards = this.getCardsByIds(cardIds);
    const structure = this.detectPairRun(cards);
    if (!structure) throw new Error('顶牌仅支持同花色对子/连对');
    if (structure.cardCount !== this.trump.structure.cardCount) throw new Error('顶牌结构必须一致');
    if (!this.removeCardsFromHand(playerId, cardIds)) throw new Error('手牌不足');

    const oldCards = this.getCardsByIds(this.trump.lastCards);
    if (this.getGroupPower(cards) <= this.getGroupPower(oldCards)) {
      // 顶牌失败，还原
      this.hands[playerId].push(...cards);
      throw new Error('顶牌未超过上一手');
    }

    // 收牌：顶牌成功者获得被顶掉的牌
    this.hands[playerId].push(...oldCards);

    this.trump.pendingExchange = {
      fromPlayerId: playerId,
      toPlayerId: this.trump.holderId,
      count: oldCards.length
    };
    this.trump.holderId = playerId;
    this.trump.lastCards = [...cardIds];
    this.trump.structure = structure;
    this.trump.passPlayerIds = [];
  }

  exchangeCover(playerId, returnCardIds) {
    const pending = this.trump.pendingExchange;
    if (!pending) throw new Error('当前无需还牌');
    if (pending.fromPlayerId !== playerId) throw new Error('只有顶牌成功者可以还牌');
    if (!Array.isArray(returnCardIds) || returnCardIds.length !== pending.count) {
      throw new Error(`需归还 ${pending.count} 张牌`);
    }
    if (!this.removeCardsFromHand(playerId, returnCardIds)) throw new Error('还牌失败，手牌不足');
    const cards = this.getCardsByIds(returnCardIds);
    this.hands[pending.toPlayerId].push(...cards);
    this.trump.pendingExchange = null;
  }

  passCover(playerId) {
    if (this.phase !== 'trump') return;
    if (!this.trump.lastCards.length) return;
    if (this.trump.pendingExchange) throw new Error('请先完成还牌');
    if (playerId === this.trump.holderId) throw new Error('当前持牌者无需不顶');
    if (!this.trump.passPlayerIds.includes(playerId)) {
      this.trump.passPlayerIds.push(playerId);
    }
    if (this.trump.passPlayerIds.length >= 3) {
      this.phase = 'playing';
      const idx = this.seats.findIndex((p) => p.playerId === this.trump.holderId);
      this.currentPlayerIndex = idx >= 0 ? idx : 0;
    }
  }

  getState() {
    const handCounts = {};
    this.seats.forEach((p) => {
      handCounts[p.playerId] = this.getHandCount(p.playerId);
    });
    const currentPlayer = this.seats[this.currentPlayerIndex];
    return {
      phase: this.phase,
      centerPlays: this.centerPlays,
      team0Score: this.team0Score,
      scoreUpdatedBy: this.scoreUpdatedBy,
      trump: {
        locked: this.trump.locked,
        suit: this.trump.suit,
        holderId: this.trump.holderId,
        lastCards: this.getCardsByIds(this.trump.lastCards),
        pendingExchange: this.trump.pendingExchange,
        passCount: this.trump.passPlayerIds.length
      },
      currentPlayerId: currentPlayer ? currentPlayer.playerId : null,
      handCounts
    };
  }

  // 随机打乱数组
  shuffleArray(arr) {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  // 广播消息
  broadcast(data) {
    this.seats.forEach(p => {
      if (p.ws.readyState === 1) { // WebSocket.OPEN
        p.ws.send(JSON.stringify(data));
      }
    });
  }
}

module.exports = { Game };
