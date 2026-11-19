const DEFAULT_MODEL = "@cf/meta/llama-3.1-8b-instruct";
const MAX_QUESTION = 600;
const MAX_CONTEXT = 2000;
const MAX_HISTORY_ITEMS = 6;
const MAX_HISTORY_CONTENT = 800;
const MAX_ANSWER = 1200;
const RATE_LIMIT = 10;
const RATE_WINDOW_SECONDS = 60;
const PREFLIGHT_MAX_AGE = 86400;

const DISCLAIMERS = {
  zh: "以上内容由 AI 生成，仅供学习参考，不能替代教材与专业意见。",
  en: "AI-generated content for study reference only; not a substitute for textbooks or professional advice."
};

const SYSTEM_PROMPTS = {
  zh: [
    "你是 NeuroBase 学习站的 AI 助教，服务对象是学习神经科学与认知科学的用户。",
    "必须遵守以下规则：",
    "1. 只回答神经科学、认知科学、脑机接口、学习方法相关的问题；问题超出这些范围时，礼貌说明你只能回答这些领域，并可提示对方查阅站内词条。",
    "2. 不确定就明确说「不确定」，不要猜测或含糊其辞。",
    "3. 严禁编造文献、作者、DOI、年份或研究结论；无法确认出处时不要给出具体引用。",
    "4. 不提供医学诊断、治疗方案或用药建议；涉及症状或疾病时，建议对方咨询专业医生。",
    "5. 回答控制在 300 字以内，结构清晰，可用简短要点。",
    "6. 使用简体中文回答。"
  ].join("\n"),
  en: [
    "You are the AI tutor of NeuroBase, a study site for neuroscience and cognitive science.",
    "Follow these rules:",
    "1. Only answer questions about neuroscience, cognitive science, brain-computer interfaces, and study methods. If a question is outside these areas, politely say you can only cover them and suggest consulting the site glossary.",
    "2. If you are not sure, say \"I am not sure\" explicitly; never guess.",
    "3. Never fabricate references, authors, DOIs, years, or research findings. If you cannot verify a source, do not cite one.",
    "4. Do not give medical diagnoses, treatment plans, or medication advice. For symptoms or disorders, suggest consulting a qualified clinician.",
    "5. Keep the answer under 300 words, well structured, using short bullet points when helpful.",
    "6. Answer in English."
  ].join("\n")
};

const CONTEXT_LABELS = {
  zh: [
    "站内词条参考（可能不完整，仅供术语对齐）：",
    "若参考与你的知识冲突，以参考为准，但不要据此编造文献、作者、DOI 或年份。"
  ],
  en: [
    "Site glossary reference (may be incomplete; for terminology alignment only):",
    "If the reference conflicts with your own knowledge, follow the reference, but do not invent references, authors, DOIs, or years based on it."
  ]
};

const ERROR_MESSAGES = {
  bad_method: "Only POST is allowed for this endpoint.",
  not_found: "Route not found.",
  bad_origin: "Origin is not allowed.",
  bad_json: "Request body must be valid JSON.",
  bad_question: "Question must be a string of 1-600 characters.",
  rate_limited: "Too many requests. Please retry after a minute.",
  ai_unavailable: "AI service is temporarily unavailable.",
  internal: "Unexpected server error."
};

const STATUS_BY_CODE = {
  bad_method: 405,
  not_found: 404,
  bad_origin: 403,
  bad_json: 400,
  bad_question: 400,
  rate_limited: 429,
  ai_unavailable: 503,
  internal: 500
};

function json(status, payload, corsHeaders) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      ...corsHeaders
    }
  });
}

function fail(code, corsHeaders, detail) {
  const message = detail || ERROR_MESSAGES[code] || ERROR_MESSAGES.internal;
  return json(STATUS_BY_CODE[code] || 500, { error: { code, message } }, corsHeaders);
}

function parseOrigins(value) {
  return String(value === undefined || value === null || value === "" ? "*" : value)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function resolveCors(request, env) {
  const origin = request.headers.get("Origin");
  const allowed = parseOrigins(env.ALLOWED_ORIGINS);

  if (allowed.includes("*")) {
    return { ok: true, headers: { "access-control-allow-origin": "*" } };
  }

  if (origin && allowed.includes(origin)) {
    return {
      ok: true,
      headers: {
        "access-control-allow-origin": origin,
        "access-control-allow-credentials": "false",
        vary: "Origin"
      }
    };
  }

  return { ok: false, headers: { vary: "Origin" } };
}

function preflight(corsHeaders) {
  return new Response(null, {
    status: 204,
    headers: {
      ...corsHeaders,
      "access-control-allow-methods": "POST, OPTIONS",
      "access-control-allow-headers": "content-type, authorization",
      "access-control-max-age": String(PREFLIGHT_MAX_AGE)
    }
  });
}

function clientIp(request) {
  const direct = request.headers.get("CF-Connecting-IP");
  if (direct && direct.trim()) return direct.trim();

  const forwarded = request.headers.get("X-Forwarded-For");
  if (forwarded) {
    const first = forwarded.split(",")[0].trim();
    if (first) return first;
  }

  return "unknown";
}

async function isRateLimited(request, env) {
  const kv = env.RATE;
  if (!kv || typeof kv.get !== "function" || typeof kv.put !== "function") return false;

  const bucket = Math.floor(Date.now() / (RATE_WINDOW_SECONDS * 1000));
  const key = "rl:" + clientIp(request) + ":" + bucket;

  try {
    const raw = await kv.get(key);
    const used = Number.parseInt(raw || "0", 10);
    const count = Number.isFinite(used) && used > 0 ? used : 0;

    if (count >= RATE_LIMIT) return true;

    await kv.put(key, String(count + 1), {
      expirationTtl: RATE_WINDOW_SECONDS * 2
    });
    return false;
  } catch (err) {
    console.warn("rate_limit_kv_skipped");
    return false;
  }
}

function normalizeLocale(value) {
  return value === "en" ? "en" : "zh";
}

function normalizeHistory(history) {
  if (!Array.isArray(history)) return [];

  const cleaned = [];
  for (const item of history) {
    if (!item || typeof item !== "object") continue;
    const role = item.role;
    const content = item.content;
    if (role !== "user" && role !== "assistant") continue;
    if (typeof content !== "string" || !content.trim()) continue;
    cleaned.push({ role, content: content.slice(0, MAX_HISTORY_CONTENT) });
  }

  return cleaned.slice(-MAX_HISTORY_ITEMS);
}

function buildMessages(question, locale, context, history) {
  const systemParts = [SYSTEM_PROMPTS[locale]];

  if (context) {
    const labels = CONTEXT_LABELS[locale];
    systemParts.push(labels[0] + "\n\"\"\"\n" + context + "\n\"\"\"\n" + labels[1]);
  }

  return [
    { role: "system", content: systemParts.join("\n\n") },
    ...history,
    { role: "user", content: question }
  ];
}

function truncateAnswer(text) {
  const trimmed = text.trim();
  if (trimmed.length <= MAX_ANSWER) return trimmed;
  return trimmed.slice(0, MAX_ANSWER - 1) + "…";
}

function parseBody(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) return null;

  const question = typeof body.question === "string" ? body.question.trim() : "";
  if (question.length < 1 || question.length > MAX_QUESTION) return null;

  const locale = normalizeLocale(body.locale);

  let context = "";
  if (typeof body.context === "string") {
    context = body.context.slice(0, MAX_CONTEXT).trim();
  }

  return {
    question,
    locale,
    context,
    history: normalizeHistory(body.history)
  };
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const cors = resolveCors(request, env);

    if (!cors.ok) {
      return fail("bad_origin", cors.headers);
    }

    if (request.method === "OPTIONS") {
      return preflight(cors.headers);
    }

    if (url.pathname !== "/api/tutor") {
      return fail("not_found", cors.headers);
    }

    if (request.method !== "POST") {
      return fail("bad_method", cors.headers);
    }

    let raw;
    try {
      raw = await request.json();
    } catch (err) {
      return fail("bad_json", cors.headers);
    }

    const input = parseBody(raw);
    if (!input) {
      return fail("bad_question", cors.headers);
    }

    try {
      if (await isRateLimited(request, env)) {
        return fail("rate_limited", cors.headers);
      }
    } catch (err) {
      console.warn("rate_limit_failed");
    }

    const model = env.MODEL || DEFAULT_MODEL;
    const messages = buildMessages(input.question, input.locale, input.context, input.history);

    let answer = "";
    try {
      const res = await env.AI.run(model, {
        messages,
        max_tokens: 700,
        temperature: 0.35
      });

      if (res && typeof res.response === "string") {
        answer = res.response;
      }
    } catch (err) {
      console.warn("ai_run_failed");
      return fail("ai_unavailable", cors.headers);
    }

    answer = truncateAnswer(answer);
    if (!answer) {
      console.warn("ai_empty_response");
      return fail("ai_unavailable", cors.headers);
    }

    return json(
      200,
      {
        answer,
        model,
        disclaimer: DISCLAIMERS[input.locale],
        cached: false
      },
      cors.headers
    );
  }
};
