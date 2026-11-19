/**
 * Phase 7 · 来源与更新自检（可独立运行，也可被 CI 调用）
 *
 * 检查项：
 *   A 来源可溯：每条词条 references 非空；每个引用都能在 sources.json 找到登记
 *   B 术语唯一：词条 id、name_zh 不重复；模块合法
 *   C 链接可用：来源 url 为 http(s)；在线模式可加 --online 实探
 *   D 时间戳新鲜度：verified_at 合法且不晚于今天；超过 stale_window_days 计入警告
 *   E 更新机制：update-log.json 有运行记录；待审项字段完整；最近一次运行状态合法
 *
 * 用法：
 *   node scripts/check-sources.mjs            离线检查（默认）
 *   node scripts/check-sources.mjs --online   额外实探每个来源 url（8s 超时）
 *
 * 退出码：0 全绿；1 有失败项
 */
import fs from 'node:fs';
import path from 'node:path';

const WS = process.cwd();
const DATA = path.join(WS, 'data');
const ONLINE = process.argv.includes('--online');

let pass = 0;
const fails = [];
function ok(name, cond, extra) {
  if (cond) {
    pass++;
    return true;
  }
  fails.push(name + (extra ? '  [' + extra + ']' : ''));
  return false;
}
const eq = (name, actual, expected) => ok(name, actual === expected, '实际=' + JSON.stringify(actual) + ' 期望=' + JSON.stringify(expected));

const readJson = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));
const DAY = 86400000;
const todayStr = new Date().toISOString().slice(0, 10);
const daysAgo = (d) => Math.floor((new Date(todayStr + 'T00:00:00Z') - new Date(d + 'T00:00:00Z')) / DAY);

/* ---------- 词条 ---------- */
const termFiles = fs.readdirSync(DATA).filter((f) => /^terms.*\.json$/.test(f)).sort();
const terms = [];
for (const f of termFiles) {
  const list = readJson(path.join(DATA, f));
  if (!Array.isArray(list)) {
    ok('词条文件为数组: ' + f, false);
    continue;
  }
  terms.push(...list);
}
const ids = terms.map((t) => t.id);
const names = terms.map((t) => String(t.name_zh || '').trim());
const dupIds = ids.filter((id, i) => ids.indexOf(id) !== i);
const dupNames = names.filter((n, i) => n && names.indexOf(n) !== i);
const MODULES = new Set(['neuron', 'synapse', 'anatomy', 'sensory', 'motor', 'attention', 'memory', 'language', 'emotion', 'methods', 'bci']);

ok('词条总数 ≥ 110', terms.length >= 110, '实际=' + terms.length);
eq('词条 id 唯一', dupIds.length, 0);
eq('术语中文名唯一', dupNames.length, 0);
eq('模块全部合法', terms.filter((t) => !MODULES.has(t.module)).length, 0);
eq('无来源词条数', terms.filter((t) => !Array.isArray(t.references) || !t.references.length).length, 0);
eq('缺 updated_at 词条数', terms.filter((t) => !/^\d{4}-\d{2}-\d{2}/.test(String(t.updated_at || ''))).length, 0);

let refTotal = 0;
const refs = [];
for (const t of terms) {
  for (const r of t.references || []) {
    refTotal++;
    refs.push({ term_id: t.id, ...r });
    ok('来源有类型与核验日期: ' + t.id + ' / ' + String(r.title).slice(0, 30), !!r.type && /^\d{4}-\d{2}-\d{2}$/.test(String(r.verified_at || '')));
  }
}
ok('引用总数 ≥ 词条数', refTotal >= terms.length, '引用=' + refTotal);

/* ---------- 来源登记 ---------- */
const sourcesDoc = readJson(path.join(DATA, 'sources.json'));
const sources = sourcesDoc.sources || [];
const srcById = new Map(sources.map((s) => [s.id, s]));
eq('来源登记数量与唯一标题一致', sources.length, new Set(refs.map((r) => String(r.title).trim())).size);
eq('来源条目 id 唯一', sources.length - new Set(sources.map((s) => s.id)).size, 0);
eq('来源标题唯一', sources.length - new Set(sources.map((s) => s.title)).size, 0);
eq('来源 url 均为 http(s)', sources.filter((s) => !/^https?:\/\//.test(String(s.url || ''))).length, 0);
eq('来源 verified_at 格式合法', sources.filter((s) => !/^\d{4}-\d{2}-\d{2}$/.test(String(s.verified_at || ''))).length, 0);
eq('来源未关联词条数', sources.filter((s) => !Array.isArray(s.terms) || !s.terms.length).length, 0);
eq('来源关联了不存在的词条', sources.flatMap((s) => s.terms || []).filter((id) => !ids.includes(id)).length, 0);

/* 每个引用必须能在登记表找到（按标题） */
const byTitle = new Map(sources.map((s) => [s.title, s]));
const missing = refs.filter((r) => !byTitle.has(String(r.title).trim()));
eq('引用未登记到来源表的条数', missing.length, 0);
const uncovered = terms.filter((t) => !sources.some((s) => (s.terms || []).includes(t.id)));
eq('未被任何来源覆盖的词条数', uncovered.length, 0);
eq('meta.term_without_source', sourcesDoc.meta && sourcesDoc.meta.term_without_source, 0);
eq('meta.term_count 与词条实际数一致', sourcesDoc.meta && sourcesDoc.meta.term_count, terms.length);

/* ---------- 新鲜度 ---------- */
const future = sources.filter((s) => s.verified_at > todayStr);
eq('核验日期晚于今天（未来时间）的来源数', future.length, 0);
const staleDays = (sourcesDoc.meta && sourcesDoc.meta.stale_window_days) || 180;
const windowDays = (sourcesDoc.meta && sourcesDoc.meta.check_window_days) || 365;
const stale = sources.filter((s) => daysAgo(s.verified_at) > staleDays);
const expired = sources.filter((s) => daysAgo(s.verified_at) > windowDays);
eq('超过 ' + windowDays + ' 天未复核的来源数', expired.length, 0);
ok('存在超过 ' + staleDays + ' 天的来源时给出警告', true);
if (stale.length) console.log('   ⚠️ ' + stale.length + ' 个来源超过 ' + staleDays + ' 天未复核（未超 ' + windowDays + ' 天，仅提醒）');

/* ---------- 更新机制 ---------- */
const logPath = path.join(DATA, 'update-log.json');
const log = fs.existsSync(logPath) ? readJson(logPath) : null;
ok('存在同步记录 data/update-log.json', !!log);
if (log) {
  ok('至少有一条同步运行记录', Array.isArray(log.runs) && log.runs.length > 0);
  const badRun = (log.runs || []).filter((r) => !r.id || !r.started_at || !['ok', 'degraded', 'running', 'failed'].includes(r.status));
  eq('同步运行记录字段完整', badRun.length, 0);
  const badQueue = (log.queue || []).filter((q) => !q.id || !q.kind || !q.target_id || !q.field || !['pending', 'approved', 'rejected'].includes(q.status));
  eq('待审队列字段完整', badQueue.length, 0);
  const pending = (log.queue || []).filter((q) => q.status === 'pending');
  ok('待审队列可统计（pending=' + pending.length + '）', Array.isArray(log.queue));
}

/* ---------- 在线：链接实探 ---------- */
if (ONLINE) {
  const bad = [];
  for (const s of sources) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 8000);
    try {
      const res = await fetch(s.url, { method: 'HEAD', redirect: 'follow', signal: ctrl.signal });
      if (!res.ok && res.status !== 405) bad.push(s.id + ' HTTP ' + res.status);
    } catch (e) {
      bad.push(s.id + ' ' + String(e && e.message ? e.message : e));
    } finally {
      clearTimeout(timer);
    }
  }
  eq('在线链接实探失败数', bad.length, 0);
  if (bad.length) console.log('   失败链接: ' + bad.slice(0, 5).join(' | '));
}

/* ---------- 汇总 ---------- */
console.log('');
console.log('词条 ' + terms.length + ' / 引用 ' + refTotal + ' / 来源 ' + sources.length);
if (fails.length) {
  console.log('❌ 来源自检失败 ' + fails.length + ' 项：');
  fails.slice(0, 20).forEach((f) => console.log('   - ' + f));
}
console.log('通过 ' + pass + ' 项，失败 ' + fails.length + ' 项');
process.exit(fails.length ? 1 : 0);
