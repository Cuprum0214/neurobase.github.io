# Phase 6 · 全栈上线手册（Supabase + Edge Functions + GitHub + Vercel）

本文件是 Phase 6「全栈接入（含后端与托管开通）」的唯一操作口径。
代码已全部就绪，**按顺序做完 5 步即可上线**；任何一步失败都不会影响本地离线使用。

```
浏览器（file:// 或 Vercel）
  ├─ cloud-config.js ──► Supabase（Auth + Postgres + RLS + Realtime）
  │                        └─ 表：profiles / user_progress / user_favorites
  │                              user_mistakes / user_quiz_stats / sr_cards
  │                              feedback / admins
  └─ workerUrl ─────────► Supabase Edge Function（AI 助教，首选）
                          Cloudflare Worker（备用，需自定义域名）
```

---

## 0. 你需要准备的 5 样东西

| # | 凭据 | 从哪里拿 | 是否可公开 |
|---|---|---|---|
| 1 | Supabase **Project URL** | Dashboard → Project Settings → API | 可公开 |
| 2 | Supabase **anon public key** | 同上 | 可公开（受 RLS 约束） |
| 3 | Supabase **Access Token**（`sbp_...`） | Dashboard → Account → Access Tokens | 私有，只给 CLI（配 Secrets / 部署函数） |
| 4 | GitHub 仓库（空仓即可） | github.com/new | — |
| 5 | Vercel 账号 | vercel.com（GitHub 登录） | — |
| 6 | （可选）Cloudflare Account ID + Token | Workers AI 控制台 | 私有，仅备用路由需要 |

> **永远不要**把 Supabase `service_role` key 写进任何前端文件或本仓库。
> 本项目不需要它；前端只使用 anon key。

---

## 1. Supabase：建项目 + 建表（约 8 分钟）

1. 打开 <https://supabase.com/dashboard> → **New project**
   - Name：`neurobase`
   - Database Password：点 **Generate** 并保存到密码管理器
   - Region：`Southeast Asia (Singapore)` 或 `Northeast Asia (Tokyo)`
   - Plan：Free
2. 等 1–2 分钟初始化完成。
3. 左侧 **SQL Editor** → **New query** → 整段粘贴 [`supabase/schema.sql`](./supabase/schema.sql) → **Run**。
   - 期望：`Success. No rows returned`
   - 该脚本**幂等**，改坏了重跑即可，不会清数据。
4. 左侧 **Table Editor**，确认 8 张表都在：
   `profiles`、`user_progress`、`user_favorites`、`user_mistakes`、
   `user_quiz_stats`、`sr_cards`、`feedback`、`admins`。
5. **把管理员邮箱改成你自己的**（SQL Editor 执行，幂等）：
   ```sql
   insert into public.admins (email) values ('你的邮箱@example.com')
   on conflict (email) do nothing;
   select * from public.admins;   -- 只应有你的邮箱
   ```
6. **创建管理员账号**：Authentication → Users → **Add user**
   - Email 必须与上一步 `admins` 表里的邮箱**完全一致**
   - 勾选 **Auto Confirm User**
7. **注册开关**（二选一，建议 A）：
   - A. 允许公开注册：Authentication → Sign In / Providers → Email → 保持
     `Allow new users to sign up` **开启**（Phase 6 验收要求「可注册/登录」）
   - B. 邀请制：关闭公开注册，只由你在 Users 里手工建号
8. 拿 **Project URL** 与 **anon public key**：Project Settings → API。

> **已有库的增量补丁（v1.23.7 起需要）**：AI 浮球位置要跟随账号跨设备记忆，
> `profiles` 新增 `prefs` 列。老库在 SQL Editor 跑这一条即可（幂等，不清数据）：
> ```sql
> alter table public.profiles add column if not exists prefs jsonb not null default '{}'::jsonb;
> ```
> 不跑也能用：浮球位置退回「本浏览器记忆」，其余功能不受影响。

> **账号名唯一性（v1.24.3 起需要）**：`profiles.display_name` 唯一索引 + `account_set_name()` RPC，
> 并把旧版 `prefs.displayName` 迁移到 `display_name`。老库在 SQL Editor 执行
> [`supabase/schema.sql`](./supabase/schema.sql) 的 §19（或整段重跑，幂等，不清数据）。
> 未执行时：登录 / 进度同步不受影响，但账号设置保存会提示「服务端尚未升级」，
> 论坛也拿不到唯一性校验；执行后再改一次账号名即可。

> 免费项目 7 天无活动会自动暂停，登录 Dashboard 点 **Restore** 即可恢复。

---

## 2. 前端：填 `cloud-config.js`

打开 [`../outputs/neurobase/assets/js/cloud-config.js`](../outputs/neurobase/assets/js/cloud-config.js)：

```js
window.NB_CLOUD = {
  enabled: true,
  url: 'https://<你的项目ref>.supabase.co',
  anonKey: '<anon public key>',
  workerUrl: '',          // 第 3 步完成后填
  realtime: true
};
```

保存后直接双击 `outputs/neurobase/index.html`：

- 顶部工具栏出现 **登录** 入口（此前显示「离线」）
- 未登录时所有功能照常，数据只存本机
- 登录后进度 / 收藏 / 错题 / 测验统计会双向同步

> `file://` 与 `http://` 都可用；Supabase 已允许跨域。

---

## 3. AI 助教后端：Supabase Edge Function（首选，约 5 分钟）

源码在 [`../supabase/functions/ai-tutor/index.ts`](../supabase/functions/ai-tutor/index.ts)，
OpenAI 兼容协议（DeepSeek / 通义 / Moonshot 均可），密钥只存在服务端 Secrets。

**① 部署函数**（控制台也可以：Edge Functions → Deploy a new function → 粘贴源码，关闭 Verify JWT）

```powershell
$env:SUPABASE_ACCESS_TOKEN = 'sbp_...'   # Account → Access Tokens
npx supabase functions deploy ai-tutor --project-ref <项目ref> --no-verify-jwt
```

> 端点 slug 以部署结果为准，**生成后不可改**。本项目实际 slug 是 `hyper-worker`
> （控制台显示名可改成 `ai-tutor`，但 URL 仍是 `.../functions/v1/hyper-worker`）。

**② 配置 Secrets**（控制台：Project Settings → Edge Functions → Edge Function Secrets）

```powershell
npx supabase secrets set --project-ref <项目ref> --yes `
  AI_API_KEY=sk-... `
  AI_BASE_URL=https://api.deepseek.com/v1 `
  AI_MODEL=deepseek-chat
```

缺 `AI_API_KEY` 时函数返回 `501 {"error":{"code":"not_configured"}}`，这是**预期**的探针信号。

**③ 写入前端**

```js
// outputs/neurobase/assets/js/cloud-config.js
workerUrl: 'https://<ref>.supabase.co/functions/v1/<slug>'
```

**④ 验收**

```powershell
Invoke-WebRequest -Uri 'https://<ref>.supabase.co/functions/v1/<slug>' -Method POST `
  -Headers @{ apikey='<publishable key>'; 'Content-Type'='application/json' } `
  -Body '{"question":"一句话说明突触是什么","locale":"zh"}' -UseBasicParsing
```

期望 `200` + `answer` / `model` / `disclaimer` 三个字段。

### 备用：Cloudflare Worker（`*.workers.dev` 在国内被 DNS 污染，需自定义域名才可用）

Worker 代码在 [`../workers/ai-tutor/`](../workers/ai-tutor/)，详见其 README。

```powershell
npx wrangler deploy --config workers/ai-tutor/wrangler.toml
```

部署后 `workerUrl` 填 `https://<worker>.workers.dev`（前端会自动拼 `/api/tutor`；
填 `.../functions/v1/...` 则按 Edge Function 原样调用）。
`file://` 页面的 Origin 是 `null`，本地双击调试时请保持 `ALLOWED_ORIGINS = "*"`。

---

## 4. GitHub：建仓并推送

```powershell
cd C:\Users\WT\Desktop\神经与认知科学基础知识学习app
git init
git add .
git commit -m "chore: NeuroBase Phase 6 全栈接入"
git branch -M main
git remote add origin https://github.com/<你的账号>/neurobase.git
git push -u origin main
```

`.gitignore` 已排除 `node_modules`、过程文件、归档与大图。
仓库体积主要由 `outputs/neurobase/assets/vendor/three/*`（约 2.5 MB）构成，正常。

---

## 5. Vercel：导入并部署

1. <https://vercel.com/new> → 选择刚推的仓库 → **Import**
2. Framework Preset：**Other**
3. Root Directory：**保持仓库根**（不要选 `outputs/neurobase`）
   - 仓库根的 [`../vercel.json`](../vercel.json) 已把 `outputs/neurobase` 映射为站点根
4. Build Command / Output Directory：**留空**（纯静态，无构建）
5. **Deploy** → 得到 `https://<项目名>.vercel.app`

> 备选方案：把 Root Directory 设为 `outputs/neurobase` 并删除 `vercel.json` 的
> `builds/routes` 两段。两种方案不要同时用。

部署后回到 `cloud-config.js`：
- 若 Worker 设了 `ALLOWED_ORIGINS`，把 Vercel 域名加进去并重新 `wrangler deploy`

---

## 6. 验收清单（对照 PLAN §5 Phase 6）

| 验收项 | 怎么验 | 期望 |
|---|---|---|
| Supabase 表创建成功 | Dashboard → Table Editor | 8 张表可见 |
| RLS 生效 | 用两个账号交叉查询对方 `user_progress` | 返回 0 行 |
| 仓库与预览部署连通 | 打开 Vercel 域名 | 首页正常、控制台无报错 |
| 可注册 / 登录 | 工具栏「登录」→ 注册 → 邮箱确认 → 登录 | 状态变「已同步」 |
| 未登录本地降级 | 清空 `cloud-config.js` 后双击首页 | 一切照常，无报错 |
| 换设备进度恢复 | A 设备登录看 3 条词条 → B 设备登录 | 进度条与「继续学习」一致 |
| AI 助教可答且带免责 | 问「树突和轴突的区别」 | 有回答 + 免责句 |
| 反馈箱落库可查 | 提交反馈 → 打开「我的提问记录」 | 记录出现在列表中（状态「待处理」） |
| 后台状态流转 | admin.html 管理员登录 → 回复 | 状态变「已回复」，前台凭码可见 |
| `service_role` 不在前端 | 全仓搜索 `service_role` | 只出现在文档警告里，无真实 key |

自动校验：

```powershell
node .deepworks\tmp\checks\verify-native.mjs   # 期望：通过 817 项，失败 0 项
node .deepworks\tmp\checks\cloud-check.mjs     # 期望：通过 43 项，失败 0 项
```

---

## 7. 自动更新：CI 回写（推荐，无需云端开通）与来源巡检 Worker（可选）

站点是纯静态页面，任何「自动更新」都要有人定时跑构建。两条路线互不依赖：

| 路线 | 需要什么 | 自动到什么程度 | 适用 |
| --- | --- | --- | --- |
| A · GitHub Actions 回写 + Vercel 自动部署 | GitHub 仓库 + Vercel 项目（免费额度够） | 每周核对 → 重建数据 → 提交 → Vercel 自动部署 | **默认推荐**，不需要 Supabase / Cloudflare |
| B · 来源巡检 Worker | Cloudflare Workers + Supabase 表 | 额外做链接 HEAD 巡检、写线上待审队列 | 需要后台审阅队列时再加 |

### 7.1 路线 A：GitHub Actions 回写 + Vercel 自动部署

1. 把仓库推到 GitHub（若还不是 git 仓库：`git init`、`git add .`、`git commit`、`git remote add origin ...`、`git push -u origin main`）。
2. Vercel → Add New → Project → 选择该仓库 → Framework 选 Other，Root Directory 保持仓库根（`vercel.json` 已把 `outputs/neurobase` 映射为站点）→ Deploy。
3. GitHub 仓库 → Settings → Actions → General → Workflow permissions → 选 **Read and write permissions** → Save。
4. Actions → `source-sync` → Run workflow 手动触发一次，确认四步通过；若有数据变化，bot 会提交一条 `chore(source-sync): ...`，Vercel 在 1~2 分钟内自动重新部署。
5. 之后每周一 03:17 UTC 自动执行；无变化时不产生提交。

要点：
- 只用仓库自带的 `GITHUB_TOKEN`，**不需要任何 Supabase / Cloudflare 密钥**。
- 自动提交范围是记录型数据：`data/sources.json`、`data/update-log.json`、`data/sync-state.json`、`outputs/neurobase/assets/js/data/*`，以及 bump 后的 HTML 指纹；词条正文（`data/terms*.json`）不由 CI 自动改写。
- 指纹由 `scripts/build-site.mjs` 自动 +1，避免 Vercel 的 7 天资源缓存导致「页面新、逻辑旧」。
- 分支保护禁止 bot 直接 push 时，改用 PR 模式：把 `git push` 换成 `gh pr create`（需 `pull-requests: write`），人工合并后部署。

### 7.2 路线 B：来源巡检 Worker（可选，需 Cloudflare + Supabase）

作用：每周一 03:17 UTC 巡检 `sources.url` 可达性与 180 天复核时效，把失败项写入 `update_queue`，并在 `sync_runs` 留一条运行记录。未部署时不影响站点离线使用与路线 A。

1. 把最新 `docs/supabase/schema.sql` 整段重跑（幂等），确认 §12 的 5 张表与 `review_update()` 已存在。
2. 写入密钥并部署：

```bash
cd workers/source-sync
npm install
npx wrangler secret put SUPABASE_URL           # https://<ref>.supabase.co
npx wrangler secret put SUPABASE_SERVICE_KEY   # service_role，仅存于 Cloudflare Secrets
npx wrangler secret put SYNC_TOKEN             # 手动触发令牌
npx wrangler deploy
```

3. 手动验证：

```bash
curl -X POST https://hyper-source-sync.<account>.workers.dev/run -H "x-sync-token: <SYNC_TOKEN>"
```

4. 人工抽检与发布：`select * from public.update_queue where status = 'pending' order by detected_at desc;` 再用 `select public.review_update('<queue-id>', 'approved');` 标记。发布动作保持人工：确认后修改 `data/` 源文件并重新构建。

5. 密钥红线：`SUPABASE_SERVICE_KEY` 与 `SYNC_TOKEN` 只写 `wrangler secret` / 平台 Secrets，禁止写进 `wrangler.toml`、`cloud-config.js` 或任何公开文件；前端只使用 publishable key。

## 8. 安全红线（务必逐条确认）

1. **前端只有 anon key**。anon 能不能读写完全由 `schema.sql` 的 RLS 决定。
2. **`feedback` 没有 anon 表级策略**，匿名只能通过两个 SECURITY DEFINER RPC 通信。
3. **管理端身份 = Auth 登录 + `public.admins` 白名单**，双重校验；口令门只服务纯离线场景。
4. **公网部署必须配置 Supabase**。若坚持不配，请删除 `admin.html`，或在源码中更换管理口令摘要
   （`core.js` 的 `ADMIN_HASH` 为加盐 SHA-256，源码只存摘要、不存明文；纯前端校验仍是软限制，
   口令门不构成安全边界）。
5. 社区升级为多人实时：在 Supabase SQL Editor 执行 `docs/supabase/community-v2.sql`
   （建表 / RLS / Realtime / `community_admin` 管理 RPC）。未执行时社区页自动回退「本机模式」，
   数据只存当前浏览器，不影响其它功能。
   **2026-11-20 已在项目 `neurobase`（ref `flayytlvrbhuainebzjd`）执行完成**：6 张 `community_*`
   表、管理 RPC 与 4 张 Realtime 表均就绪，社区页默认连云端，未登录访客只读公开内容。
   重跑若报 `42883: function digest(text, unknown) does not exist`，是 `pgcrypto` 位于
   `extensions` schema：脚本顶部与三个函数定义内都已写 `set search_path = public, extensions;`，
   不要只改会话级设置（函数内的 `set search_path` 会覆盖它）。
6. Worker 不记录用户问题全文，只 `console.warn` 记录失败原因。
7. 换号或退学前可用 `select public.delete_my_data();` 自助清空个人学习数据。

---

## 9. 排障

| 现象 | 原因 | 处理 |
|---|---|---|
| 工具栏一直显示「离线」 | `cloud-config.js` 未填或 URL 非法 | 检查 `url` 是否以 `https://` 开头、`anonKey` 长度 |
| 登录报 `Invalid login credentials` | 账号未创建 / 未确认 / 密码错 | Dashboard → Users 检查并 Auto Confirm |
| 登录成功但进度不恢复 | RLS 拦截或 `user_id` 不匹配 | SQL Editor 执行 `select * from user_progress;` 看是否有行 |
| 「我的提问记录」看不到回复 | 项目被暂停 / 未联网 / 匿名换设备 | Dashboard Restore；登录后按账号同步；匿名仅本机记录 |
| AI 助教 403 | `ALLOWED_ORIGINS` 未含当前域名 | 加域名后重新 deploy |
| AI 助教 429 | 同一 IP 60 秒超 10 次 | 等待 1 分钟 |
| Vercel 404 | Root Directory 选错 | 保持仓库根，或改选 `outputs/neurobase` 并删 `vercel.json` 路由 |
| 执行 `community-v2.sql` 报 `42883 digest` 不存在 | `pgcrypto` 在 `extensions` schema，且函数内 `set search_path` 覆盖会话设置 | 确认脚本顶部与 `community_*` 函数定义处均为 `set search_path = public, extensions;` |
| 社区页仍显示「本机模式」 | 云端表未建 / `cloud-config.js` 未配 / 拉取失败 | 用公开 key 请求 `/rest/v1/community_posts?limit=1`，返回 404 说明未建表 |

---

## 10. Phase 9 上线（静态站点）

> 目标：把 `outputs/neurobase/` 发布为可公开访问的静态站点。**V5.0.0 起默认走 GitHub Pages**（`.github/workflows/pages.yml`，推送到 `main` 自动发布）；Vercel 仍不作为交付前提，本地 `file://` 仍是完整交付形态。

### 10.1 已就绪的产物

| 产物 | 说明 |
| --- | --- |
| `outputs/neurobase/` | 27 个 HTML 页面 + `assets/`（CSS / JS / 字体 / three.js 本地化），`file://` 双击可离线使用 |
| `outputs/neurobase-site.zip` | 上述目录打包（1.68MB / 85 文件），可直接拖到 Netlify Drop |
| `.github/workflows/pages.yml` | GitHub Actions：构建数据 → 上传 `outputs/neurobase` → `deploy-pages` |
| `vercel.json` | 历史配置：`/assets/*` → `max-age=31536000, immutable`；`*.html` → `max-age=0, must-revalidate` |
| `.vercelignore` | 排除 `.deepworks/`（约 681MB）、旧 Vue 工程、`uploads/`、`docs/`、`data/`、`scripts/` |

### 10.2 四条上线路径（任选其一）

**A. GitHub Pages（V5.0.0 默认，仓库已配置）**

1. 推送 `main` 后在仓库 **Settings → Pages → Build and deployment → Source** 选择 **GitHub Actions**；
2. 等待 `Deploy NeuroBase to GitHub Pages` workflow 完成；
3. 访问 `https://cuprum0214.github.io/neurobase.github.io/`。
4. 验收：

```powershell
node .deepworks/tmp/checks/phase9-live-check.mjs https://cuprum0214.github.io/neurobase.github.io/
```

**B. Vercel CLI（历史备选，网络可达 + 已登录）**
```powershell
npx.cmd vercel --prod
```
构建输出目录选 `outputs/neurobase`（或在项目根放置上面的 `vercel.json`，Vercel 会按 `outputDirectory` 读取；若未配置 `outputDirectory`，请在 Vercel 项目设置里把 Output Directory 设为 `outputs/neurobase`）。

**C. Vercel 网页导入**
在 vercel.com 新建项目并连接本仓库，Output Directory 填 `outputs/neurobase`，其余默认。

**D. Netlify Drop（最快，不需要登录命令行）**
打开 app.netlify.com/drop，把 `outputs/neurobase-site.zip` 拖进去，得到 `https://<随机名>.netlify.app`。

### 10.3 上线后验收

```powershell
node .deepworks/tmp/checks/phase9-live-check.mjs https://<你的域名>
```

脚本检查：首页 / 检索 / 词条 / 学习中心 / 实验室 / 指南页可访问；CSS / JS / 字体返回 200；站内链接无 404。缓存头检查（`/assets/*` immutable、HTML must-revalidate）只适用于 Vercel / Netlify；**GitHub Pages 不支持自定义响应头**，资源失效依赖 URL 上的 `?v=` 指纹。人工再补：手机走一遍「检索 → 词条 → 测验 → 进度」。

### 10.4 云端能力（可选，不阻塞上线）

站点在云端未开通时会自动降级为本机模式（社区显示「本机模式 · 云端未启用」）。若要启用登录 / 云同步 / 社区：

1. Supabase SQL Editor 依次执行 `docs/supabase/schema.sql`、`docs/supabase/community-v2.sql`；
2. 确认 `outputs/neurobase/assets/js/cloud-config.js` 的 `url` / `anonKey` 为生产项目值，且 `enabled: true`；
3. 跑 `node .deepworks/tmp/checks/cloud-check.mjs`。

当前生产库业务表 (`terms` / `profiles` / `community_posts`) 均为 404，说明第 1 步尚未执行。

### 10.5 本轮实测记录

- `npx.cmd vercel@latest whoami` → `Logged out`；
- `vercel deploy --temporary --yes` → `Temporary deployments aren't available for this attempt` + `Error: fetch failed`；
- 网络探测：`vercel.com` / `api.vercel.com` 超时；npm registry、GitHub、Netlify API 可达。
