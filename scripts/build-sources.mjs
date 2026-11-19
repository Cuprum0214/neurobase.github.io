/**
 * Phase 7 · 来源登记表生成器
 *
 * 唯一数据源：data/terms*.json 中每个词条的 references[]。
 * 本脚本把 111 条引用聚合为唯一来源（按标题归并），生成 data/sources.json：
 *   · id / type / title / terms[] / verified_at / url / via
 *   · url 为「可核验检索入口」：论文/综述走 Crossref，教材/百科走 WorldCat
 *     （references 原文只有标题与核验日期，不编造原文链接）
 *   · 已存在的 data/sources.json 中人工补充的 url / note 会被保留
 *
 * 用法：node scripts/build-sources.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const WS = process.cwd();
const DATA = path.join(WS, 'data');
const OUT = path.join(DATA, 'sources.json');

const today = new Date().toISOString().slice(0, 10);
const sha1 = (s) => crypto.createHash('sha1').update(s, 'utf8').digest('hex').slice(0, 8);

const termFiles = fs.readdirSync(DATA).filter((f) => /^terms.*\.json$/.test(f)).sort();
const terms = [];
for (const f of termFiles) {
  const list = JSON.parse(fs.readFileSync(path.join(DATA, f), 'utf8'));
  if (!Array.isArray(list)) throw new Error(f + ' 不是数组');
  terms.push(...list);
}

const idSeen = new Set();
for (const t of terms) {
  if (!t.id) throw new Error('词条缺 id: ' + JSON.stringify(t.name_zh));
  if (idSeen.has(t.id)) throw new Error('词条 id 重复: ' + t.id);
  idSeen.add(t.id);
  if (!Array.isArray(t.references) || !t.references.length) {
    throw new Error('词条无来源: ' + t.id);
  }
}

/* 保留旧文件里的人工补充字段 */
let prev = { sources: [] };
if (fs.existsSync(OUT)) {
  try {
    prev = JSON.parse(fs.readFileSync(OUT, 'utf8'));
  } catch {
    prev = { sources: [] };
  }
}
const prevById = new Map((prev.sources || []).map((s) => [s.id, s]));
const prevByTitle = new Map((prev.sources || []).map((s) => [s.title, s]));

const groups = new Map();
let refCount = 0;
for (const t of terms) {
  for (const r of t.references) {
    refCount++;
    const title = String(r.title || '').trim();
    if (!title) throw new Error('词条来源缺标题: ' + t.id);
    if (!r.type) throw new Error('词条来源缺类型: ' + t.id + ' / ' + title);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(String(r.verified_at || ''))) {
      throw new Error('词条来源核验日期非法: ' + t.id + ' / ' + title);
    }
    let g = groups.get(title);
    if (!g) {
      g = { title, types: new Set(), verified: [], terms: new Set() };
      groups.set(title, g);
    }
    g.types.add(r.type);
    g.verified.push(String(r.verified_at));
    g.terms.add(t.id);
  }
}

const searchUrl = (type, title) => {
  const q = encodeURIComponent(title);
  if (type === 'paper' || type === 'review') return 'https://search.crossref.org/?q=' + q;
  return 'https://search.worldcat.org/search?q=' + q;
};

const sources = [...groups.entries()]
  .map(([title, g]) => {
    const id = 'src-' + sha1(title);
    const old = prevById.get(id) || prevByTitle.get(title) || {};
    const type = old.type && g.types.has(old.type) ? old.type : [...g.types][0];
    const verified = g.verified.slice().sort().pop();
    return {
      id,
      type,
      title,
      url: old.url || searchUrl(type, title),
      via: old.via || (type === 'paper' || type === 'review' ? 'crossref' : 'worldcat'),
      note: old.note || '',
      verified_at: verified,
      terms: [...g.terms].sort()
    };
  })
  .sort((a, b) => b.terms.length - a.terms.length || a.title.localeCompare(b.title, 'zh'));

const covered = new Set(sources.flatMap((s) => s.terms));
const uncovered = terms.filter((t) => !covered.has(t.id)).map((t) => t.id);
if (uncovered.length) throw new Error('有词条未被来源覆盖: ' + uncovered.join(', '));

const byType = {};
for (const s of sources) byType[s.type] = (byType[s.type] || 0) + 1;

const out = {
  meta: {
    version: 1,
    generated_at: today,
    updated_at: today,
    term_count: terms.length,
    reference_count: refCount,
    source_count: sources.length,
    term_without_source: 0,
    by_type: byType,
    check_window_days: 365,
    stale_window_days: 180,
    note_zh:
      '来源按词条 references 标题归并登记；url 为可核验检索入口（论文/综述→Crossref，教材/百科→WorldCat），不是原文链接，点击后可自行核对版本与页码。',
    note_en:
      'Sources are de-duplicated by reference title. The url is a verification entry point (Crossref for papers/reviews, WorldCat for textbooks), not the original full text.'
  },
  sources
};

fs.writeFileSync(OUT, JSON.stringify(out, null, 2) + '\n', 'utf8');
console.log('✅ data/sources.json 已生成');
console.log('   词条 ' + terms.length + ' / 引用 ' + refCount + ' / 唯一来源 ' + sources.length + '（无来源词条 0）');
console.log('   类型分布: ' + JSON.stringify(byType));
