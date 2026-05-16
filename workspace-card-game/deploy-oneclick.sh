#!/usr/bin/env bash
set -euo pipefail

# =========================
# 一键部署脚本（Ubuntu/Debian）
# 说明：按需修改下面“可配置项”，然后执行：
#   sudo bash deploy-oneclick.sh
# =========================

if [[ "${EUID}" -ne 0 ]]; then
  echo "请使用 root 权限运行：sudo bash deploy-oneclick.sh"
  exit 1
fi

# ---------- 可配置项 ----------
APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WS_PORT="${WS_PORT:-3235}"

MYSQL_HOST="${MYSQL_HOST:-127.0.0.1}"
MYSQL_PORT="${MYSQL_PORT:-3306}"
MYSQL_DB="${MYSQL_DB:-card_game}"
MYSQL_USER="${MYSQL_USER:-card_user}"
MYSQL_PASSWORD="${MYSQL_PASSWORD:-card_password_change_me}"

NGINX_SITE_NAME="${NGINX_SITE_NAME:-card-game}"
WEB_ROOT="${WEB_ROOT:-/var/www/card-game}"
SERVER_NAME="${SERVER_NAME:-_}"   # 有域名可改成 example.com
# -----------------------------

echo "==> [1/8] 安装系统依赖"
apt-get update -y
apt-get install -y curl git nginx mysql-server ca-certificates gnupg ufw

echo "==> [2/8] 安装 Node.js 20 + PM2"
if ! command -v node >/dev/null 2>&1 || ! command -v npm >/dev/null 2>&1; then
  # 统一走 NodeSource，避免出现“有 node 但没有 npm”或 PATH 异常
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y nodejs
fi

# 某些发行版会拆分 npm 包，这里做兜底安装
if ! command -v npm >/dev/null 2>&1; then
  apt-get install -y npm
fi

echo "Node 版本: $(node -v 2>/dev/null || echo 'N/A')"
echo "npm 版本: $(npm -v 2>/dev/null || echo 'N/A')"
npm install -g pm2

echo "==> [3/8] 安装项目依赖"
cd "${APP_DIR}"
npm install --production

echo "==> [4/8] 初始化 MySQL 数据库与账号"
mysql -u root <<SQL
CREATE DATABASE IF NOT EXISTS \`${MYSQL_DB}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS '${MYSQL_USER}'@'%' IDENTIFIED BY '${MYSQL_PASSWORD}';
GRANT ALL PRIVILEGES ON \`${MYSQL_DB}\`.* TO '${MYSQL_USER}'@'%';
FLUSH PRIVILEGES;
SQL

echo "==> [5/8] 生成 .env"
cat > "${APP_DIR}/.env" <<ENV
MYSQL_HOST=${MYSQL_HOST}
MYSQL_PORT=${MYSQL_PORT}
MYSQL_USER=${MYSQL_USER}
MYSQL_PASSWORD=${MYSQL_PASSWORD}
MYSQL_DATABASE=${MYSQL_DB}
PORT=${WS_PORT}
ENV

echo "==> [6/8] 启动/重启 WebSocket 服务（PM2）"
if pm2 describe card-ws >/dev/null 2>&1; then
  pm2 restart card-ws
else
  pm2 start "${APP_DIR}/server/server.js" --name card-ws
fi
pm2 save
pm2 startup systemd -u root --hp /root >/dev/null 2>&1 || true

echo "==> [7/8] 发布前端静态文件并配置 Nginx"
mkdir -p "${WEB_ROOT}"
cp -r "${APP_DIR}/client/"* "${WEB_ROOT}/"

cat > "/etc/nginx/sites-available/${NGINX_SITE_NAME}" <<NGINX
server {
    listen 80;
    server_name ${SERVER_NAME};

    root ${WEB_ROOT};
    index index.html;

    location / {
        try_files \$uri \$uri/ /index.html;
    }
}
NGINX

ln -sf "/etc/nginx/sites-available/${NGINX_SITE_NAME}" "/etc/nginx/sites-enabled/${NGINX_SITE_NAME}"
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl enable nginx
systemctl reload nginx

echo "==> [8/8] 开放防火墙端口"
ufw allow OpenSSH || true
ufw allow 80/tcp || true
ufw allow "${WS_PORT}/tcp" || true
yes | ufw enable || true

IP_ADDR="$(hostname -I | awk '{print $1}')"
echo
echo "✅ 部署完成"
echo "前端地址: http://${IP_ADDR}/"
echo "WebSocket: ws://${IP_ADDR}:${WS_PORT}"
echo
echo "常用命令:"
echo "  pm2 logs card-ws"
echo "  pm2 restart card-ws"
