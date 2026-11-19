// NeuroBase AI 助教 · Supabase Edge Function（Deno）
// 与 workers/ai-tutor 保持同一接口契约：POST {question, locale, context, history}
//   → 200 {answer, model, disclaimer, cached}
// 失败统一 {error: {code, message}}
//
// 环境变量（Supabase Dashboard → Edge Functions → Secrets）：
//   AI_API_KEY   必填  服务商密钥
//   AI_BASE_URL  选填  OpenAI 兼容端点，默认 https://api.deepseek.com/v1
//   AI_MODEL     选填  默认 deepseek-chat
//   ALLOWED_ORIGINS 选填 逗号分隔，默认 *
//
// 说明：Edge Function 是无状态容器，限流用「单实例内存滑窗」做尽力而为的保护，
// 不是全局精确限流；真正的额度控制靠服务商侧。

const MAX_QUESTION = 600;
const MAX_CONTEXT = 2000;
const MAX_HISTORY_ITEMS = 6;
const MAX_HISTORY_CONTENT = 800;
const MAX_ANSWER = 1200;
const RATE_LIMIT = 10;
const RATE_WINDOW_MS = 60_000;

const DEFAULT_BASE_URL = "https://api.deepseek.com/v1";
const DEFAULT_MODEL = "deepseek-chat";

const DISCLAIMERS: Record<string, string> = {
  zh: "以上内容由 AI 生成，仅供学习参考，不能替代教材与专业意见。",
  en: "AI-generated content for study reference only; not a substitute for textbooks or professional advice.",
};

const SYSTEM_PROMPTS: Record<string, string> = {
  zh: [
    "你是 NeuroBase 学习站的 AI 助教，服务对象是学习神经科学与认知科学的用户。",
    "必须遵守以下规则：",
    "1. 只回答神经科学、认知科学、脑机接口、学习方法相关的问题；问题超出这些范围时，礼貌说明你只能回答这些领域，并可提示对方查阅站内词条。",
    "2. 不确定就明确说「不确定」，不要猜测或含糊其辞。",
    "3. 严禁编造文献、作者、DOI、年份或研究结论；无法确认出处时不要给出具体引用。",
    "4. 不提供医学诊断、治疗方案或用药建议；涉及症状或疾病时，建议对方咨询专业医生。",
    "5. 回答控制在 300 字以内，结构清晰，可用简短要点。",
    "6. 使用简体中文回答。",
  ].join("\n"),
  en: [
    "You are the AI tutor of NeuroBase, a study site for neuroscience and cognitive science.",
    "Follow these rules:",
    "1. Only answer questions about neuroscience, cognitive science, brain-computer interfaces, and study methods. If a question is outside these areas, politely say you can only cover them and suggest consulting the site glossary.",
    '2. If you are not sure, say "I am not sure" explicitly; never guess.',
    "3. Never fabricate references, authors, DOIs, years, or research findings. If you cannot verify a source, do not cite one.",
    "4. Do not give medical diagnoses, treatment plans, or medication advice. For symptoms or disorders, suggest consulting a qualified clinician.",
    "5. Keep the answer under 300 words, well structured, using short bullet points when helpful.",
    "6. Answer in English.",
  ].join("\n"),
};

const CONTEXT_LABELS: Record<string, [string, string]> = {
  zh: [
    "站内词条参考（可能不完整，仅供术语对齐）：",
    "若参考与你的知识冲突，以参考为准，但不要据此编造文献、作者、DOI 或年份。",
  ],
  en: [
    "Site glossary reference (may be incomplete; for terminology alignment only):",
    "If the reference conflicts with your own knowledge, follow the reference, but do not invent references, authors, DOIs, or years based on it.",
  ],
};

const ERROR_MESSAGES: Record<string, string> = {
  bad_method: "Only POST is allowed for this endpoint.",
  bad_origin: "Origin is not allowed.",
  bad_json: "Request body must be valid JSON.",
  bad_question: "Question must be a string of 1-600 characters.",
  rate_limited: "Too many requests. Please retry after a minute.",
  not_configured: "AI service is not configured.",
  ai_unavailable: "AI service is temporarily unavailable.",
  internal: "Unexpected server error.",
};

const STATUS_BY_CODE: Record<string, number> = {
  bad_method: 405,
  bad_origin: 403,
  bad_json: 400,
  bad_question: 400,
  rate_limited: 429,
  not_configured: 501,
  ai_unavailable: 503,
  internal: 500,
};

type Msg = { role: "system" | "user" | "assistant"; content: string };

function resolveCors(req: Request): { ok: boolean; headers: Record<string, string> } {
  const origin = req.headers.get("Origin") || "";
  const raw = Deno.env.get("ALLOWED_ORIGINS");
  const list = String(raw == null || raw === "" ? "*" : raw)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const allowAll = list.includes("*");
  // file:// 页面请求不带 Origin（或为 null），视为本地使用
  const isLocalFile = origin === "" || origin === "null";
  const ok = allowAll || isLocalFile || list.includes(origin);

  const headers: Record<string, string> = {
    "access-control-allow-origin": allowAll ? (origin || "*") : ok ? origin : "null",
    "access-control-allow-methods": "POST, OPTIONS",
    "access-control-allow-headers": "authorization, apikey, content-type",
    "access-control-max-age": "86400",
    vary: "Origin",
  };
  return { ok, headers };
}

function json(status: number, payload: unknown, headers: Record<string, string>): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", ...headers },
  });
}

function fail(code: string, headers: Record<string, string>): Response {
  return json(STATUS_BY_CODE[code] || 500, { error: { code, message: ERROR_MESSAGES[code] } }, headers);
}

/* ---------- 尽力而为的限流（单实例内存滑窗） ---------- */
const hits = new Map<string, number[]>();

function clientKey(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("cf-connecting-ip") || "unknown";
}

function rateLimited(req: Request): boolean {
  const key = clientKey(req);
  const now = Date.now();
  const arr = (hits.get(key) || []).filter((t) => now - t < RATE_WINDOW_MS);
  if (arr.length >= RATE_LIMIT) {
    hits.set(key, arr);
    return true;
  }
  arr.push(now);
  hits.set(key, arr);
  if (hits.size > 5000) hits.clear(); // 防止内存无界增长
  return false;
}

/* ---------- 入参整理 ---------- */
function normalizeLocale(v: unknown): "zh" | "en" {
  return String(v || "").toLowerCase().startsWith("en") ? "en" : "zh";
}

function normalizeHistory(v: unknown): Msg[] {
  if (!Array.isArray(v)) return [];
  const out: Msg[] = [];
  for (const item of v) {
    if (!item || typeof item !== "object") continue;
    const role = (item as { role?: unknown }).role;
    const content = (item as { content?: unknown }).content;
    if (role !== "user" && role !== "assistant") continue;
    if (typeof content !== "string" || !content.trim()) continue;
    out.push({ role, content: content.slice(0, MAX_HISTORY_CONTENT) });
  }
  return out.slice(-MAX_HISTORY_ITEMS);
}

function parseBody(body: unknown) {
  if (!body || typeof body !== "object" || Array.isArray(body)) return null;
  const b = body as Record<string, unknown>;
  const question = typeof b.question === "string" ? b.question.trim() : "";
  if (question.length < 1 || question.length > MAX_QUESTION) return null;

  const context = typeof b.context === "string" ? b.context.slice(0, MAX_CONTEXT).trim() : "";
  return {
    question,
    locale: normalizeLocale(b.locale),
    context,
    history: normalizeHistory(b.history),
  };
}

function buildMessages(input: { question: string; locale: "zh" | "en"; context: string; history: Msg[] }): Msg[] {
  const sys = [SYSTEM_PROMPTS[input.locale]];
  if (input.context) {
    const [before, after] = CONTEXT_LABELS[input.locale];
    sys.push(`${before}\n"""\n${input.context}\n"""\n${after}`);
  }
  return [
    { role: "system", content: sys.join("\n\n") },
    ...input.history,
    { role: "user", content: input.question },
  ];
}

function truncateAnswer(text: string): string {
  const t = String(text || "").trim();
  if (t.length <= MAX_ANSWER) return t;
  return t.slice(0, MAX_ANSWER - 1) + "…";
}

/* ---------- 调用 OpenAI 兼容端点 ---------- */
async function callModel(messages: Msg[], model: string): Promise<string> {
  const key = Deno.env.get("AI_API_KEY");
  if (!key) throw new Error("missing_key");

  const base = (Deno.env.get("AI_BASE_URL") || DEFAULT_BASE_URL).replace(/\/+$/, "");
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 45_000);

  try {
    const res = await fetch(`${base}/chat/completions`, {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${key}` },
      body: JSON.stringify({ model, messages, temperature: 0.35, max_tokens: 700, stream: false }),
      signal: ctrl.signal,
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      console.warn("upstream_status", res.status, detail.slice(0, 200));
      throw new Error("upstream_status");
    }

    const data = await res.json();
    const content = data?.choices?.[0]?.message?.content;
    return typeof content === "string" ? content : "";
  } finally {
    clearTimeout(timer);
  }
}

Deno.serve(async (req: Request) => {
  const cors = resolveCors(req);
  if (!cors.ok) return fail("bad_origin", cors.headers);
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors.headers });
  if (req.method !== "POST") return fail("bad_method", cors.headers);

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return fail("bad_json", cors.headers);
  }

  const input = parseBody(raw);
  if (!input) return fail("bad_question", cors.headers);
  if (rateLimited(req)) return fail("rate_limited", cors.headers);
  if (!Deno.env.get("AI_API_KEY")) return fail("not_configured", cors.headers);

  const model = Deno.env.get("AI_MODEL") || DEFAULT_MODEL;
  let answer = "";
  try {
    answer = await callModel(buildMessages(input), model);
  } catch (err) {
    console.warn("ai_call_failed", String((err as Error)?.message || err));
    return fail("ai_unavailable", cors.headers);
  }

  answer = truncateAnswer(answer);
  if (!answer) return fail("ai_unavailable", cors.headers);

  return json(
    200,
    { answer, model, disclaimer: DISCLAIMERS[input.locale], cached: false },
    cors.headers,
  );
});
