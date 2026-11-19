# source-sync · 来源巡检 Worker（Phase 7）

每周一 03:17 UTC 由 Cron 触发，也可以手动 POST 触发。职责：

1. 读取 Supabase `sources`（Phase 7 新表）；
2. HEAD 校验 `url` 可达性（每次最多 `MAX_LINKS` 条）；
3. 超过 `STALE_DAYS`（默认 180 天）未复核的来源入队；
4. 失败/过期项写入 `update_queue`（`status='pending'`）；
5. 每次运行写一条 `sync_runs`。

管理员在 SQL Editor 里调用 `select public.review_update('<queue-id>', 'approved');`
完成抽检，发布动作由人工改数据后重新生成前端数据。

## 部署

```bash
cd workers/source-sync
npm install
npx wrangler secret put SUPABASE_URL          # https://<ref>.supabase.co
npx wrangler secret put SUPABASE_SERVICE_KEY  # service_role，仅存于 CF Secrets
npx wrangler secret put SYNC_TOKEN            # 手动触发令牌
npx wrangler deploy
```

部署后到 Cloudflare Dashboard → Workers → hyper-source-sync → Triggers 确认 Cron 已挂上。
手动验证：

```bash
curl -X POST https://hyper-source-sync.<account>.workers.dev/run \
  -H "x-sync-token: <SYNC_TOKEN>"
```

## 与本地同步的关系

| 场景 | 入口 | 产物 |
| --- | --- | --- |
| 本地 / CI 全量核对 DOI | `node scripts/sync-sources.mjs --online` | `data/update-log.json`、`data/sync-state.json` |
| 线上定时巡检链接与时效 | 本 Worker | Supabase `update_queue` / `sync_runs` |
| 内容发布前质量门 | `node scripts/check-sources.mjs` | 终端 137 项断言 |

> 密钥只允许写入 Wrangler Secrets，禁止写进 `wrangler.toml` 或任何公开文件。
