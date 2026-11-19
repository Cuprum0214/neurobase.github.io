# AGENTS · NeuroBase 项目常驻规则

本文件是本项目**每轮自动生效**的硬性约定。完整执行步骤与校验清单见
`.opencode/skills/version-changelog/SKILL.md`；本文件只保留不可违反的约束与入口。

## 第一硬性约定

**每一次版本迭代与错误修正，都必须同步更新相关 md 文档。**

不区分大小：新增功能、修复缺陷、数据或文档变更、自测扩充、修改 skill 或维护约定，全部算。
不允许「小改动不记」「攒几次一起记」「跨日期合并」「静默跳过」。

## 第二硬性约定 · 凭证与密钥

**任何 API Key、Token、Secret、服务端口令都不写入公开文件，也不写入仓库。**

- 真实密钥只允许存在于：运行环境变量、平台 Secrets（Supabase Edge Function Secrets / Cloudflare `wrangler secret` / Vercel Environment Variables）、本机未纳入版本管理的位置。
- 禁止写入：`outputs/**`（静态站点整目录会被 Vercel 公开部署）、`docs/**`、`data/**`、`*.js` / `*.ts` / `*.json` / `*.toml` / `*.md` 等任何会被提交或发布的内容。
- 需要示例时只写占位符（`YOUR_API_KEY`、`<ref>`、`sk-***`），不写真实值。
- 临时脚本与探测输出里的密钥属于违规残留：改用从环境变量读取，并在交付前清除。
- 前端可公开的 Supabase `anon` / `publishable` key 属设计允许的公开凭据，但**必须**确认它只受 RLS 约束；`service_role` 与 AI Provider key 一律视为机密。
- 已在 `.gitignore` 中拦截 `.env*`、`.dev.vars`、`*.pem`、`*.key`、`*token*.txt`、`supabase/.temp/`、`.deepworks/tmp/`。

## 每轮完成当天必须做的事（顺序不可颠倒）

1. 先跑基线 `node .deepworks\tmp\checks\verify-native.mjs`；有失败先修，**不带病记日志**。
2. `docs/CHANGELOG.md` 顶部新增版本记录：版本号递增，标题包含当日日期 `YYYY-MM-DD`，
   分类使用 Added / Changed / Fixed / Docs，无内容的分类不写。
3. `docs/DEV_LOG.md` 顶部新增当日条目（日期倒序），并在「阶段总览」表补一行。
4. 三档案同步判定，每轮都要明确回答一次：
   - 有选型、方案取舍或约定改变 → `docs/DECISIONS.md` 新增 `D-0xx`；
   - 有可复用教训 → `docs/ERROR_LOG.md` 新增 `E-0xx`（五问模板）；
   - 都没有 → 在 DEV_LOG 条目里写明「本轮无新增决策 / 无高价值错误」，不得静默跳过。
   - 两个索引表的行数必须与编号条目数一致。
5. `docs/PLAN.md`：文首版本行 + §10 变更记录表新增一行。
6. 涉及范围、交付物或验收变化 → `docs/PROJECT_SCOPE.md` 升版并在 §11 变更管理加条目。
7. 修改 `outputs/neurobase` 下任何 JS / CSS / HTML → **bump 全部 HTML 的 `?v=` 缓存指纹**，
   否则 `file://` 下会出现「页面是新的、逻辑是旧的」。
8. `docs/` 下文件增删 → 重跑 `node .deepworks\tmp\build-native\build-docs.mjs`，
   并同步 verifier 里写死的文档数断言。

## 交付前校验

- [ ] CHANGELOG 顶部有本轮记录，且含真实日期与版本号
- [ ] DEV_LOG 有当日条目 + 阶段总览行
- [ ] DECISIONS / ERROR_LOG 已写或已注明「无」
- [ ] PLAN 版本行与 §10 已同步
- [ ] PROJECT_SCOPE 按需同步
- [ ] 缓存指纹已 bump
- [ ] `verify-native.mjs` 全绿（`通过 N 项，失败 0 项`）
- [ ] 本轮改过的 `.js` 均通过 `node --check`

## 边界

- 不编造版本历史：日期、版本号、产出必须来自实际文件状态。
- 旧版本条目不改写，新记录一律追加在最前。
- 删除任何文件或目录必须先获得用户明确确认。
- 本文件只约束记录与交付，不改变产品功能决策。
