# Supabase 数据库说明（Phase 6–8）

本目录有三个文件：

| 文件 | 用途 |
|---|---|
| `schema.sql` | 基线：账户 / 学习数据 / 反馈 / 词条来源等 17 张表，幂等可重复执行 |
| `community-v2.sql` | 论坛化升级：社区 6 张表（含 `reactions` / `bans`）、管理 RPC、Realtime；在 `schema.sql` 之后执行，幂等 |
| `README.md` | 本说明（表结构、安全模型、RPC 约定、运维） |

完整上线步骤见 [`../DEPLOY.md`](../DEPLOY.md)。

> 两个 SQL 文件都要求会话的 `search_path` 含 `extensions`：Supabase 把 `pgcrypto` 装在该 schema，缺了会在 `digest()` 处报 `42883`。`community-v2.sql` 已在脚本顶部和函数内显式声明。

---

## 一、19 张表（schema.sql 17 + community-v2.sql 2）

| 表 | 主键 | 对应本地数据 | 说明 |
|---|---|---|---|
| `profiles` | `id` → `auth.users` | `nb-locale` / `nb-theme` / `nb-font` | 昵称、语言、主题、字号偏好；注册时触发器自动建档 |
| `user_progress` | `(user_id, term_id)` | `nb-progress.visited[]` | 已学词条、访问次数、首次/最近时间 |
| `user_favorites` | `(user_id, term_id)` | `nb-favorites[]` | 收藏；取消即删行 |
| `user_mistakes` | `(user_id, id)` | `nb-mistakes[]` | 错题本；`id` 沿用本地 id 保证幂等 |
| `user_quiz_stats` | `user_id` | `nb-quiz-stats` | 测验次数 / 对 / 错 |
| `sr_cards` | `(user_id, term_id)` | — | 间隔重复卡（SM-2 简化：ease / interval_days / due_at） |
| `feedback` | `id` | `nb-feedback[]` | 反馈箱；`code` 为内部凭据（匿名续查用，不展示） |
| `admins` | `email` | — | 管理员白名单（必须与 Auth 用户邮箱一致） |
| `terms` | `id` | `data/terms*.json` | Phase 7 词条登记（公开只读） |
| `sources` | `id` | `data/sources.json` | Phase 7 来源登记（公开只读） |
| `term_references` | `(term_id, source_id)` | `term.references[]` | Phase 7 词条 ↔ 来源引用（公开只读） |
| `update_queue` | `id` | `data/update-log.json` | Phase 7 待审更新队列（公开只读；`review_update()` 改状态） |
| `sync_runs` | `id` | `data/sync-state.json` | Phase 7 定时同步记录（公开只读） |
| `community_posts` | `id` | `nb-community-posts[]` | Phase 8 帖子；未隐藏公开读，写删限本人 / 管理员；含置顶 / 精华 / 锁定 |
| `community_replies` | `id` | `post.replies[]` | Phase 8 楼层回复；同帖子规则 |
| `community_reports` | `id` | `nb-community-reports[]` | Phase 8 举报；仅本人与管理员可读 |
| `community_checkins` | `(user_id, day)` | `nb-checkin.days[]` | Phase 8 打卡；一人一天一行，仅本人可读写 |
| `community_reactions` | `(target_id, kind, user_id)` | `post.likes` / `post.favs` | 点赞 / 收藏；一人对一目标一种互动一行 |
| `community_bans` | `key` | `nb-community-bans` | 管理端禁言名单（`key` 为账号 id 或署名） |

所有业务表都有 `updated_at`，并由 `touch_updated_at()` 触发器自动维护；
社区帖子额外用 `community_touch_updated_at()` 在更新时刷新 `updated_at`。

---

## 二、安全模型（改动前必须读懂）

```
anon（未登录）
  ├─ 学习 / 账户 / 反馈表没有策略 → select 返回 0 行
  ├─ community_*：只能读 hidden = false 的公开内容，不能写
  └─ 只能调用两个 SECURITY DEFINER RPC：
       submit_feedback(...)      提交反馈（同 IP 60 秒限 12 条）
       get_feedback_by_code(...) 凭 code 取回一条（匿名用户自动同步回复用；不暴露 ip / contact / user_id）

authenticated（已登录）
  ├─ profiles / user_* / sr_cards：只允许 auth.uid() = user_id 的行（RLS）
  ├─ feedback：只能读自己提交的（user_id = auth.uid()）
  ├─ community_posts / replies / reactions / reports：写只允许 auth.uid() = user_id
  └─ 且邮箱在 public.admins 时，is_admin() 放行全表读写
```

要点：

1. **RLS 是唯一权限边界**，前端 anon key 公开是正常设计。
2. **不要给 anon 加学习数据表的写策略**，否则整表可被拖走；社区的匿名读策略只放行 `hidden = false`。
3. `service_role` 在本项目中**完全不需要**，也绝不允许出现在前端。
4. `admins` 表只允许本人读自己那行，避免泄露管理员名单。
5. 社区管理（置顶 / 精华 / 锁定 / 隐藏 / 删除 / 禁言）只走 `community_admin(p_pass, p_action, ...)`，函数内校验口令摘要，不接受前端直接 PATCH 管理字段。

---

## 三、RPC 约定

| 函数 | 调用角色 | 入参 | 返回 |
|---|---|---|---|
| `submit_feedback` | anon / authenticated | `p_type, p_type_other, p_body, p_contact, p_page, p_device, p_width` | `table(code, id)` |
| `get_feedback_by_code` | anon / authenticated | `p_code` | `table(code, type, status, body, created_at, reply, replied_at)` |
| `admin_list_feedback` | authenticated + 白名单 | `p_status, p_limit, p_offset` | `setof feedback` |
| `admin_reply_feedback` | authenticated + 白名单 | `p_id, p_reply, p_status` | `feedback` |
| `is_admin` | 策略内部 | — | `boolean` |
| `delete_my_data` | authenticated | — | `void` |
| `community_admin_ok` | 策略内部 / 管理端 | `p_pass` | `boolean`（口令摘要比对） |
| `community_admin` | 社区管理端 | `p_pass, p_action, p_id, p_key, p_name, p_days, p_reason` | `jsonb` |
| `account_set_name` | authenticated | `p_name` | `jsonb`（账号名唯一性校验） |

前端调用（`cloud.js` / `forum.js` 已封装）：

```js
await NB.cloud.rpc('submit_feedback', { p_type: 'err', p_body: '……' });
await NB.cloud.rpc('get_feedback_by_code', { p_code: 'a2c4e6' });
await NB.cloud.rpc('admin_reply_feedback', { p_id, p_reply: '已修复', p_status: 'replied' });
await NB.cloud.rpc('community_admin', { p_pass: '******', p_action: 'pin', p_id: 'post-1' });
```

`admin_reply_feedback` 的 `p_reply = null` 表示「只改状态、保留原回复」，
供管理端「标记已读 / 未读」使用。

---

## 四、Realtime

`schema.sql` 会把 `feedback`、`user_progress`、`user_favorites`、
`user_mistakes`、`sr_cards` 加入 `supabase_realtime` publication（幂等）。
`community-v2.sql` 另外把 `community_posts`、`community_replies`、
`community_reactions`、`community_bans` 加入同一 publication。

前端 `cloud.js` 订阅本人行变更；`forum.js` 订阅社区行变更。
WebSocket 不可用时自动回退到轮询（学习数据 3 分钟；论坛按页面加载与本地刷新兜底）。

---

## 五、同步策略（前端 `cloud.js`）

| 场景 | 策略 |
|---|---|
| 首次登录 | **merge**：进度 / 收藏 / 错题取并集，测验统计取 max，绝不清空任何一边 |
| 本地改动后 | **mirror**：防抖 1.2 秒，全量 upsert + 删除云端多余行（本地为权威） |
| 收到 Realtime | **pull + merge**：只并入云端新增，不删本地 |
| 断网 | 保留 pending，不发起请求；`online` 事件后补推 |
| 未配置 / 未登录 | 全部跳过，纯本地运行，不报错 |

论坛（`forum.js`）是另一套策略：云端可用且能拉到数据时以云端为准，
否则回退本机 `nb-community-*`；发帖 / 回复在未登录时只落本机。

---

## 六、运维

**备份**：Dashboard → Database → Backups，或 Table Editor 导出 CSV。

**清空某人数据**：以其账号登录后执行 `select public.delete_my_data();`。

**换管理员**：
```sql
insert into public.admins (email) values ('新邮箱@example.com') on conflict do nothing;
delete from public.admins where email = '旧邮箱@example.com';
```
并确保 Auth 里存在新邮箱用户。

**重置结构**：先整段执行 `schema.sql`，再执行 `community-v2.sql`。两者都幂等，不会删业务数据。

**论坛云端首次建立**：在 Supabase Dashboard → SQL Editor 整段执行 `community-v2.sql`，或用 Management API 提交同一文件。执行后可用公开 key 验证：6 张 `community_*` 表返回 200、`community_admin_ok('错误口令')` 返回 `false`、匿名 INSERT 被 RLS 拒绝（`401 / 42501`）。

**免费额度**：500 MB 数据库 / 5 GB 带宽/月 / 5 万月活，纯文本完全够用。
