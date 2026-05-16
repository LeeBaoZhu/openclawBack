// server/database.js
// MySQL 数据库操作（mysql2 连接池）

require('dotenv').config();

const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || '127.0.0.1',
  port: Number(process.env.MYSQL_PORT) || 3306,
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'card_game',
  waitForConnections: true,
  connectionLimit: 10,
  charset: 'utf8mb4'
});

let schemaReady = false;

async function ensureSchema() {
  if (schemaReady) return;
  await pool.query(`
    CREATE TABLE IF NOT EXISTS players (
      id INT AUTO_INCREMENT PRIMARY KEY,
      nickname VARCHAR(50) NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      last_played_at DATETIME NULL,
      UNIQUE KEY uk_nickname (nickname)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS games (
      id INT AUTO_INCREMENT PRIMARY KEY,
      room_id VARCHAR(50) NULL,
      winner_team_id INT NULL,
      duration_seconds INT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS game_players (
      game_id INT NOT NULL,
      player_id INT NOT NULL,
      team_id INT NOT NULL,
      is_winner TINYINT(1) NOT NULL DEFAULT 0,
      final_hand_count INT NULL,
      play_count INT NULL,
      PRIMARY KEY (game_id, player_id),
      CONSTRAINT fk_gp_game FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE,
      CONSTRAINT fk_gp_player FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE,
      INDEX idx_player (player_id),
      INDEX idx_game (game_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);
  schemaReady = true;
  console.log('📊 MySQL 表结构已就绪 (database:', process.env.MYSQL_DATABASE || 'card_game', ')');
}

async function getOrCreatePlayer(nickname) {
  await ensureSchema();
  await pool.execute('INSERT IGNORE INTO players (nickname) VALUES (?)', [nickname]);
  const [rows] = await pool.execute('SELECT * FROM players WHERE nickname = ?', [nickname]);
  return rows[0];
}

/** room_id 列存可选会话标签（如 family），非多房间 ID */
async function recordGame(sessionLabel, winnerTeamId, duration, players) {
  await ensureSchema();
  const [result] = await pool.execute(
    'INSERT INTO games (room_id, winner_team_id, duration_seconds) VALUES (?, ?, ?)',
    [sessionLabel, winnerTeamId, duration]
  );
  const gameId = result.insertId;

  for (const p of players) {
    const isWinner = p.teamId === winnerTeamId;
    await pool.execute(
      `INSERT INTO game_players (game_id, player_id, team_id, is_winner, final_hand_count, play_count)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [gameId, p.playerId, p.teamId, isWinner ? 1 : 0, p.finalHandCount, p.playCount]
    );
    await pool.execute('UPDATE players SET last_played_at = CURRENT_TIMESTAMP WHERE id = ?', [p.playerId]);
  }

  console.log(`📊 游戏记录已保存：${gameId} 号对局`);
}

async function getAllStats() {
  await ensureSchema();
  const [rows] = await pool.execute(`
    SELECT
      p.id,
      p.nickname,
      COALESCE(COUNT(gp.game_id), 0) AS total_games,
      COALESCE(SUM(CASE WHEN gp.is_winner THEN 1 ELSE 0 END), 0) AS wins,
      COALESCE(SUM(CASE WHEN NOT gp.is_winner THEN 1 ELSE 0 END), 0) AS losses,
      COALESCE(ROUND(100.0 * SUM(CASE WHEN gp.is_winner THEN 1 ELSE 0 END) / NULLIF(COUNT(gp.game_id), 0), 2), 0) AS win_rate
    FROM players p
    LEFT JOIN game_players gp ON p.id = gp.player_id
    GROUP BY p.id, p.nickname
    ORDER BY wins DESC
  `);
  return rows;
}

async function getPlayerStats(playerId) {
  await ensureSchema();
  const [rows] = await pool.execute(
    `
    SELECT
      p.id,
      p.nickname,
      COALESCE(COUNT(gp.game_id), 0) AS total_games,
      COALESCE(SUM(CASE WHEN gp.is_winner THEN 1 ELSE 0 END), 0) AS wins,
      COALESCE(SUM(CASE WHEN NOT gp.is_winner THEN 1 ELSE 0 END), 0) AS losses,
      COALESCE(ROUND(100.0 * SUM(CASE WHEN gp.is_winner THEN 1 ELSE 0 END) / NULLIF(COUNT(gp.game_id), 0), 2), 0) AS win_rate
    FROM players p
    LEFT JOIN game_players gp ON p.id = gp.player_id
    WHERE p.id = ?
    GROUP BY p.id, p.nickname
    `,
    [playerId]
  );
  if (rows.length === 0) {
    return {
      id: playerId,
      nickname: 'Unknown',
      total_games: 0,
      wins: 0,
      losses: 0,
      win_rate: 0
    };
  }
  return rows[0];
}

async function getPlayer(playerId) {
  await ensureSchema();
  const [rows] = await pool.execute('SELECT * FROM players WHERE id = ?', [playerId]);
  return rows[0];
}

async function closePool() {
  await pool.end();
}

module.exports = {
  getOrCreatePlayer,
  recordGame,
  getAllStats,
  getPlayerStats,
  getPlayer,
  close: closePool,
  pool
};
