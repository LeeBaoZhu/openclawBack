#!/bin/bash
# Git 初始化脚本 - Linux 环境
set -e

cd /root/.openclaw/workspace-sysadmin

echo "🚀 Git 初始化..."
echo ""

if [ -d ".git" ]; then
    echo "⚠️ Git 仓库已存在"
else
    git init
    echo "✅ Git 仓库初始化完成"
fi

git add -A
echo "📦 已添加所有文件"

git commit -m "Initial commit: 系统维护员工作区 - 多 Agent 计划协调系统"
echo "💾 提交完成"

echo ""
echo "📜 提交历史:"
git log --oneline -3

echo ""
echo "✅ 完成！"
