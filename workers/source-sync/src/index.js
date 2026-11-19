/**
 * NeuroBase · 来源巡检 Worker（Phase 7）
 *
 * 触发：
 *   · Cron（wrangler.toml 中每周一 03:17 UTC）
 *   · 手动：POST /run，Header `x-sync-token: <SYNC_TOKEN>`
 *
 * 职责：
 *   1) 从 Supabase `sources` 读取来源登记
 *   2) HEAD 校验 url 可达性（每次最多 MAX_LINKS 条，避免超时）
 *   3) 标记超过 STALE_DAYS 未复核的来源
 *   4) 失败/过期项写入 `update_queue`（pending，等待管理员 review_update）
 *   5) 每次运行写一条 `sync_runs`
 *
 * 环境变量（密钥只走 wrangler secret，不写进仓库）：
 *   SUPABASE_URL           https://<ref>.supabase.co
 *   SUPABASE_SERVICE_KEY   service_role key（secret）
 *   SYNC_TOKEN             手动触发令牌（secret）
 *   STALE_DAYS             默认 180
 *   MAX_LINKS              默认 25
 */

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' }
  });

const sb = (env, path, init = {}) =>
  fetch(env.SUPABASE_URL.replace(/\/$/, '') + '/rest/v1/' + path, {
    ...init,
    headers: {
      apikey: env.SUPABASE_SERVICE_KEY,
      authorization: 'Bearer ' + env.SUPABASE_SERVICE_KEY,
      'content-type': 'application/json',
      prefer: 'return=representation',
      ...(init.headers || {})
    }
  });

const runId = () => 'run-' + new Date().toISOString().replace(/[-:TZ.]/g, '').slice(0, 17);
const dayMs = 86400000;
const daysAgo = (d) => Math.floor((Date.now() - new Date(d + 'T00:00:00Z').getTime()) / dayMs);

async function checkLink(url) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 8000);
  try {
    const res = await fetch(url, { method: 'HEAD', redirect: 'follow', signal: ctrl.signal });
    return res.ok || res.status === 405;
  } catch {
    return false;
  } finally {
    clearTimeout(timer);
  }
}

async function runSync(env, trigger) {
  const id = runId();
  const started = new Date().toISOString();
  const staleDays = Number(env.STALE_DAYS || 180);
  const maxLinks = Number(env.MAX_LINKS || 25);
  const run = {
    id,
    started_at: started,
    trigger,
    mode: 'online',
    checked: 0,
    changed: 0,
    queued: 0,
    links_checked: 0,
    links_failed: 0,
    status: 'running',
    note: ''
  };

  try {
    const res = await sb(env, 'sources?select=id,title,url,verified_at&order=verified_at.asc');
    if (!res.ok) throw new Error('读取 sources 失败: HTTP ' + res.status);
    const sources = await res.json();
    run.checked = sources.length;

    const queue = [];
    const checkedAt = new Date().toISOString();

    for (const s of sources) {
      if (run.links_checked >= maxLinks) break;
      run.links_checked++;
      const alive = await checkLink(s.url);
      if (!alive) {
        run.links_failed++;
        queue.push({
          id: 'q-' + checkedAt.replace(/[-:TZ.]/g, '').slice(0, 17) + '-l' + run.links_checked,
          kind: 'source-link',
          target_id: s.id,
          field: 'url',
          old_value: s.url,
          new_value: s.url,
          status: 'pending',
          detected_at: checkedAt,
          note: '链接不可达，待人工替换：' + String(s.title || '').slice(0, 80)
        });
      }
      if (daysAgo(String(s.verified_at)) > staleDays) {
        queue.push({
          id: 'q-' + checkedAt.replace(/[-:TZ.]/g, '').slice(0, 17) + '-d' + run.links_checked,
          kind: 'reference',
          target_id: s.id,
          field: 'verified_at',
          old_value: String(s.verified_at),
          new_value: checkedAt.slice(0, 10),
          status: 'pending',
          detected_at: checkedAt,
          note: '超过 ' + staleDays + ' 天未复核：' + String(s.title || '').slice(0, 80)
        });
      }
    }

    if (queue.length) {
      const ins = await sb(env, 'update_queue', { method: 'POST', body: JSON.stringify(queue) });
      if (!ins.ok) throw new Error('写入 update_queue 失败: HTTP ' + ins.status);
      run.queued = queue.length;
      run.changed = queue.length;
    }
    run.status = 'ok';
  } catch (e) {
    run.status = 'failed';
    run.note = String(e && e.message ? e.message : e).slice(0, 300);
  }

  run.finished_at = new Date().toISOString();
  try {
    await sb(env, 'sync_runs', { method: 'POST', body: JSON.stringify(run) });
  } catch {
    /* 记录失败不改变主流程结果 */
  }
  return run;
}

export default {
  async scheduled(event, env, ctx) {
    ctx.waitUntil(runSync(env, 'cron'));
  },

  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname !== '/run') return json({ ok: false, error: 'not_found' }, 404);
    if (request.method !== 'POST') return json({ ok: false, error: 'method_not_allowed' }, 405);
    if (!env.SYNC_TOKEN || request.headers.get('x-sync-token') !== env.SYNC_TOKEN) {
      return json({ ok: false, error: 'unauthorized' }, 401);
    }
    const run = await runSync(env, 'manual');
    return json({ ok: run.status === 'ok', run }, run.status === 'ok' ? 200 : 500);
  }
};
