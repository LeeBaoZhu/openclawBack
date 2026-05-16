#!/bin/bash
# Git 初始化脚本

cd /root/.openclaw/workspace-sysadmin

echo "📁 当前目录：$(pwd)"

# 检查是否已初始化
if [ -d ".git" ]; then
    echo "⚠️ Git 仓库已存在"
else
    echo "✅ 初始化 Git 仓库"
    git init
fi

# 添加所有文件
echo "📦 添加所有文件"
git add -A

# 显示状态
echo "📋 Git 状态："
git status

# 提交
echo "💾 提交更改"
git commit -m "Initial commit: 系统维护员工作区初始化

- 阶段计划协调系统 (plan-coordinator skill)
- 生活助理每日拆解推送流程
- Cron 定时任务配置
- 示例阶段计划文件
- 完整文档和工作流程

Ref: 多 Agent 计划协调方案"

# 显示日志
echo "📜 最近提交："
git log --oneline -3

echo ""
echo "✅ Git 初始化完成！"
