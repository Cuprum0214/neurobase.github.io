/**
 * Phase 7 · 来源定时同步
 *
 * 职责：从权威源核对条目元数据 → 与上次快照比对 → 变更进入待审队列 → 写同步记录。
 *
 * 模式：
 *   node scripts/sync-sources.mjs               离线：只比对本地 data/frontier.json 与快照
 *   node scripts/sync-sources.mjs --online      在线：逐条请求 Crossref（api.crossref.org），失败自动降级离线
 *   node scripts/sync-sources.mjs --check-links 额外校验 data/sources.json 中 url 的 HTTP 可达性（在线）
 *   node scripts/sync-sources.mjs --simulate    注入一条演示变更（仅用于验收「异常进入待审队列」，不写脏数据时请勿使用）
 *
 * 产物：
 *   data/sync-state.json   上次核对快照（DOI → 标题/日期/期刊）
 *   data/update-log.json   runs[] 同步记录 + queue[] 待审队列
 *
 * 退出码：0 正常；1 网络/数据错误（已降级或失败）
 */
import fs from 'node:fs';
import path from 'node:path';

const WS = process.cwd();
const DATA = path.join(WS, 'data');
const FRONTIER = path.join(DATA, 'frontier.json');
const SOURCES = path.join(DATA, 'sources.json');
const STATE = path.join(DATA, 'sync-state.json');
const LOG = path.join(DATA, 'update-log.json');

const args = new Set(process.argv.slice(2));
const ONLINE = args.has('--online');
const CHECK_LINKS = args.has('--check-links');
const SIMULATE = args.has('--simulate');

const now = new Date();
const iso = now.toISOString();
const readJson = (p, fallback) => {
  if (!fs.existsSync(p)) return fallback;
  return JSON.parse(fs.readFileSync(p, 'utf8'));
};
const writeJson = (p, o) => fs.writeFileSync(p, JSON.stringify(o, null, 2) + '\n', 'utf8');
const short = (s, n = 120) => (String(s || '').length > n ? String(s).slice(0, n) + '…' : String(s || ''));

const frontier = readJson(FRONTIER, null);
if (!frontier || !Array.isArray(frontier.items)) throw new Error('缺少 data/frontier.json 或 items 非数组');
const sourcesDoc = readJson(SOURCES, null);

const state = readJson(STATE, { meta: {}, dois: {}, urls: {} });
const log = readJson(LOG, {
  meta: { version: 1, updated_at: iso.slice(0, 10), note: '同步记录与待审队列；仅追加，不覆盖历史。' },
  runs: [],
  queue: []
});

const run = {
  id: 'run-' + iso.replace(/[-:TZ.]/g, '').slice(0, 17),
  started_at: iso,
  finished_at: '',
  trigger: 'manual',
  mode: ONLINE ? 'online' : 'offline',
  checked: 0,
  changed: 0,
  queued: 0,
  links_checked: 0,
  links_failed: 0,
  status: 'running',
  note: ''
};

const pushChange = (kind, targetId, field, oldValue, newValue, extra) => {
  const dup = log.queue.some(
    (q) => q.status === 'pending' && q.kind === kind && q.target_id === targetId && q.field === field && q.new_value === newValue
  );
  if (dup) return false;
  log.queue.push({
    id: 'q-' + iso.replace(/[-:TZ.]/g, '').slice(0, 17) + '-' + String(log.queue.length + 1).padStart(3, '0'),
    kind,
    target_id: targetId,
    field,
    old_value: oldValue == null ? '' : String(oldValue),
    new_value: newValue == null ? '' : String(newValue),
    status: 'pending',
    detected_at: iso,
    reviewed_at: '',
    reviewer: '',
    note: extra || ''
  });
  return true;
};

const fetchCrossref = async (doi) => {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 8000);
  try {
    const res = await fetch('https://api.crossref.org/works/' + encodeURIComponent(doi), {
      signal: ctrl.signal,
      headers: { 'User-Agent': 'NeuroBase/1.0 (source-sync; contact: local)' }
    });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const body = await res.json();
    const m = body && body.message;
    if (!m) throw new Error('Crossref 响应缺少 message');
    const date = (m.published && m.published['date-parts'] && m.published['date-parts'][0]) || [];
    return {
      title: short((m.title && m.title[0]) || '', 300),
      date: date.length ? (String(date[0]) + '-' + String(date[1] || 1).padStart(2, '0') + '-' + String(date[2] || 1).padStart(2, '0')) : '',
      precision: date.length,
      journal: short((m['container-title'] && m['container-title'][0]) || '', 160)
    };
  } finally {
    clearTimeout(timer);
  }
};

const checkLink = async (url) => {
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
};

let degraded = '';
for (const item of frontier.items) {
  run.checked++;
  const doi = String(item.doi || '');
  if (!/^10\.\d{4,9}\//.test(doi)) {
    pushChange('frontier', item.id, 'doi', doi, '', 'DOI 格式非法，需人工核对');
    run.changed++;
    run.queued++;
    continue;
  }
  const prev = state.dois[doi] || null;
  let meta = null;
  if (ONLINE) {
    try {
      meta = await fetchCrossref(doi);
    } catch (e) {
      degraded = 'Crossref 请求失败，已降级为本地核对：' + String(e && e.message ? e.message : e);
      meta = null;
    }
  }
  if (!meta) {
    meta = { title: item.title_en || '', date: item.date || '', journal: item.journal || '', local: true };
  }
  if (prev) {
    for (const field of ['title', 'date', 'journal']) {
      var same = prev[field] && meta[field] && prev[field] === meta[field];
      if (field === 'date' && prev[field] && meta.date && meta.precision === 2 && String(prev.date).slice(0, 7) === String(meta.date).slice(0, 7)) same = true;
      if (!same && prev[field] && meta[field]) {
        if (pushChange('frontier', item.id, field, prev[field], meta[field], short(item.title_zh))) {
          run.changed++;
          run.queued++;
        }
      }
    }
  }
  state.dois[doi] = { title: meta.title, date: meta.date, precision: meta.precision || 3, journal: meta.journal, term_ids: item.term_ids || [], local: !!meta.local };
}

if (CHECK_LINKS && sourcesDoc && Array.isArray(sourcesDoc.sources)) {
  for (const s of sourcesDoc.sources) {
    run.links_checked++;
    const okLink = await checkLink(s.url);
    state.urls[s.id] = { url: s.url, ok: okLink, checked_at: iso };
    if (!okLink) {
      run.links_failed++;
      pushChange('source-link', s.id, 'url', s.url, s.url, '链接不可达，待人工替换：' + short(s.title));
      run.changed++;
      run.queued++;
    }
  }
}

if (SIMULATE) {
  const first = frontier.items[0];
  if (pushChange('frontier', first.id, 'date', first.date, first.date, '演示：模拟检测到日期差异，等待人工抽检')) {
    run.changed++;
    run.queued++;
    run.note = '包含 1 条 --simulate 演示变更';
  }
}

run.finished_at = new Date().toISOString();
run.status = degraded ? 'degraded' : 'ok';
if (degraded) run.note = [run.note, degraded].filter(Boolean).join('；');

log.runs.unshift(run);
log.runs = log.runs.slice(0, 50);
log.queue = log.queue.slice(-200);
log.meta.updated_at = iso.slice(0, 10);
log.meta.last_run = run.id;
log.meta.last_status = run.status;

state.meta = { updated_at: iso.slice(0, 10), last_run: run.id, dois: Object.keys(state.dois).length, mode: run.mode };
writeJson(STATE, state);
writeJson(LOG, log);

console.log('✅ 同步完成 ' + run.id + '（' + run.mode + '）');
console.log('   核对 ' + run.checked + ' 条；变更 ' + run.changed + '；待审 ' + run.queued + '；状态 ' + run.status);
if (run.links_checked) console.log('   链接 ' + run.links_checked + ' 个，失败 ' + run.links_failed);
if (degraded) console.log('   ⚠️ ' + degraded);


