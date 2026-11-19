# NeuroBase AI 助教 Worker

NeuroBase（`outputs/neurobase`，纯静态站点）的 AI 助教后端。基于 Cloudflare Workers + Workers AI，ES module 单文件、零依赖、无构建步骤。

## 1. 目录结构

```
workers/ai-tutor/
├─ src/index.js      # Worker 主体，export default { fetch }
├─ wrangler.toml     # AI 绑定、变量、可选 KV 限流
├─ package.json      # type: module，dev/deploy 脚本
└─ README.md
```

## 2. 开通 Workers AI

1. 注册 / 登录 Cloudflare：<https://dash.cloudflare.com/>
2. 进入 **Workers & Pages → AI**，按提示同意 Workers AI 条款并开通。
3. 免费额度（以官方页面为准）：每天约 10,000 Neurons，超出后按量计费。
4. 若账号未开通，调用 `env.AI.run` 会失败，Worker 返回 `503 ai_unavailable`。

## 3. 登录与部署

需要 Node.js 18+。`wrangler` 通过 `npx` 临时调用，不必写进依赖：

```bash
cd workers/ai-tutor

# 登录（浏览器授权）
npx wrangler login

# 本地调试（默认 http://127.0.0.1:8787）
npm run dev
# 等价于 npx wrangler dev

# 部署到 Cloudflare
npm run deploy
# 等价于 npx wrangler deploy
```

部署成功后会得到形如
`https://neurobase-ai-tutor.<你的子域>.workers.dev` 的地址，接口为
`https://neurobase-ai-tutor.<你的子域>.workers.dev/api/tutor`。

Windows PowerShell 若提示「禁止运行脚本」，把 `npx` 换成 `npx.cmd`，或先执行
`Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`。

## 4. 密钥与变量

本 Worker **不需要也不应写入任何 API Key / Token / Account ID**：Workers AI 通过
`[ai] binding = "AI"` 由平台鉴权，部署时自动注入到 `env.AI`。

可配置项都在 `wrangler.toml`：

| 名称 | 位置 | 说明 |
| --- | --- | --- |
| `MODEL` | `[vars]` | 模型名，默认 `@cf/meta/llama-3.1-8b-instruct` |
| `ALLOWED_ORIGINS` | `[vars]` | 允许的前端来源，逗号分隔，`*` 表示不限制 |
| `RATE` | KV 绑定（可选） | 启用 IP 限流 |

需要保密的值用 `npx wrangler secret put <NAME>` 写入，不要提交到仓库。

修改 `[vars]` 后需重新 `npm run deploy` 才生效。

## 5. 前端如何填 workerUrl

前端配置项 `workerUrl` 填 **完整端点地址**：

```
https://neurobase-ai-tutor.<你的子域>.workers.dev/api/tutor
```

本地联调则填 `http://127.0.0.1:8787/api/tutor`（`npm run dev` 运行期间）。

请求示例：

```js
const res = await fetch(workerUrl, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    question: "长时程增强（LTP）是什么？",
    locale: "zh",
    context: "LTP：突触可塑性的一种，被认为是学习与记忆的细胞机制。",
    history: [{ role: "user", content: "先解释一下突触可塑性" }]
  })
});
const data = await res.json();
// 成功：{ answer, model, disclaimer, cached }
// 失败：{ error: { code, message } }
```

注意：站点以 `file://` 打开时 `Origin` 为 `null`。若 `ALLOWED_ORIGINS` 不是 `*`，
浏览器直连会被判为 `403 bad_origin`，因此本阶段默认配置为 `*`。

## 6. CORS 说明

- 默认 `ALLOWED_ORIGINS = "*"`：返回 `Access-Control-Allow-Origin: *`。
- 配置为具体来源（如 `https://example.com,https://www.example.com`）时：
  - `Origin` 命中 → 回显该 `Origin` 并带 `Vary: Origin`；
  - 未命中或没有 `Origin` 头 → `403 bad_origin`（curl 调试时需自行加 `-H "Origin: ..."`）。
- 预检 `OPTIONS` 返回 `204`，允许 `POST, OPTIONS`，允许头 `content-type, authorization`，
  `Access-Control-Max-Age: 86400`。

## 7. 限流（可选）

未绑定 KV 时静默跳过，不影响功能；绑定后按 `IP + 分钟桶` 计数，
同一 IP 每 60 秒最多 10 次，超出返回 `429 rate_limited`。

启用：

```bash
cd workers/ai-tutor
npx wrangler kv namespace create RATE
# 把输出里的 id 填入 wrangler.toml 的 [[kv_namespaces]]，并取消注释
npm run deploy
```

IP 取值顺序：`CF-Connecting-IP` → `X-Forwarded-For` 首段 → `unknown`。
KV 读写异常时记录 `console.warn` 并放行，不阻断正常问答。

## 8. 成本与配额

- Workers 免费套餐：每天 100,000 次请求（以官方为准）。
- Workers AI：按 Neurons 计费，免费额度每日刷新；`max_tokens: 700` 已限制单次输出，
  但长 `history` / `context` 会增加输入 token。
- 用 `ALLOWED_ORIGINS` 限制来源、启用 KV 限流，可避免额度被滥用。
- 查看用量：Cloudflare Dashboard → Workers & Pages → 对应 Worker → Metrics。

## 9. 接口契约速查

- 路由：仅 `POST /api/tutor`。
- 入参：`question`（trim 后 1–600 字符，必填）、`locale`（`zh` / `en`，缺省 `zh`）、
  `context`（≤ 2000 字符）、`history`（最多 6 条，每条 ≤ 800 字符）。
- 出参：`{ answer, model, disclaimer, cached }`，`answer` ≤ 1200 字，超长截断加 `…`；
  `cached` 当前恒为 `false`。
- 错误码：

| code | HTTP | 触发条件 |
| --- | --- | --- |
| `bad_method` | 405 | `/api/tutor` 使用非 POST 方法 |
| `not_found` | 404 | 路径不是 `/api/tutor` |
| `bad_origin` | 403 | 限定来源模式下 Origin 未命中 |
| `bad_json` | 400 | 请求体不是合法 JSON |
| `bad_question` | 400 | 缺少 `question` 或 trim 后长度不在 1–600 |
| `rate_limited` | 429 | 同一 IP 60 秒内超过 10 次 |
| `ai_unavailable` | 503 | `env.AI.run` 抛错或返回空 `response` |
| `internal` | 500 | 其他未预期异常 |

## 10. 排障

| 现象 | 排查 |
| --- | --- |
| `503 ai_unavailable` | 账号未开通 Workers AI；模型名拼错；当日额度耗尽 |
| `403 bad_origin` | `ALLOWED_ORIGINS` 不含请求来源；`file://` 下 Origin 为 `null` |
| `404 not_found` | 路径写错，需以 `/api/tutor` 结尾 |
| `405 bad_method` | 用了 GET；浏览器地址栏直接打开也会 405 |
| `429 rate_limited` | 触发限流，等 1 分钟；或检查是否共用出口 IP |
| `400 bad_json` | 缺少 `Content-Type: application/json` 或 body 不是 JSON |
| 部署后仍是旧逻辑 | `[vars]` 改动需重新 deploy；浏览器缓存请强刷 |
| `wrangler` 报未登录 | 重新 `npx wrangler login` |
| 本地能跑、线上 503 | 线上未开通 AI 或 `[ai]` 绑定缺失 |

本地冒烟（PowerShell）：

```powershell
curl.exe -i -X POST "http://127.0.0.1:8787/api/tutor" `
  -H "Content-Type: application/json" `
  -H "Origin: http://127.0.0.1:8787" `
  -d '{\"question\":\"什么是工作记忆？\",\"locale\":\"zh\"}'
```
