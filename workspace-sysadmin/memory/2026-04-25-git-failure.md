# 2026-04-25 Git 推送失败记录

## 时间
2026-04-25 01:00 (Asia/Shanghai)

## 触发方式
Cron 任务 `sysadmin-daily-git-push` 自动执行

## 执行结果
- ✅ `git add -A` — 成功
- ✅ `git commit` — 成功，commit `a2d93fd5`，78 文件变更（+2343/-2674）
- ❌ `git push origin main` — 失败

## 失败原因
```
fatal: could not read Username for 'https://github.com': No such device or address
```

`~/.git-credentials` 文件大小为 0 bytes（空文件），credential.helper=store 但无凭证存储。

## 影响
- 本地 commit 已保留（a2d93fd5），数据不丢失
- 远程仓库未同步，版本备份中断
- 连续第 3 次推送失败（04-22 晚首次暴露，04-23 和 04-25 持续）

## 建议操作
1. 重新配置 GitHub Personal Access Token 到 `~/.git-credentials`
2. 格式：`https://<username>:<token>@github.com`
3. 可考虑使用 `git config credential.helper cache` 或 SSH key 替代

## 状态
待用户手动修复凭证
