/**
 * 词条数据层（Phase 1）
 * 自动聚合 src/data/terms*.json —— 以后新增分模块文件（如 terms.memory.json）会被自动纳入，
 * 无需改动本文件；校验见 scripts/validate-terms.mjs（同样按 terms*.json 扫描）。
 */
import { MODULES } from './modules'

const files = import.meta.glob('./terms*.json', { eager: true, import: 'default' })

const moduleOrder = new Map(MODULES.map((m, i) => [m.id, i]))

/** 全量词条：先按模块顺序、再按 id 排序，保证导航与“每日一词”稳定可复现 */
export const TERMS = Object.values(files)
  .flat()
  .sort((a, b) => {
    const ma = moduleOrder.has(a.module) ? moduleOrder.get(a.module) : 99
    const mb = moduleOrder.has(b.module) ? moduleOrder.get(b.module) : 99
    if (ma !== mb) return ma - mb
    return String(a.id).localeCompare(String(b.id))
  })

const byId = new Map(TERMS.map((t) => [t.id, t]))

export function getTerm(id) {
  return byId.get(id) || null
}

export function getTermsByModule(moduleId) {
  return TERMS.filter((t) => t.module === moduleId)
}

/** 该词条指向的相关词条（已解析为对象，过滤死链） */
export function resolveRelated(term) {
  if (!term) return []
  return (term.related || []).map(getTerm).filter(Boolean)
}

/** 反向引用：其它词条在 related 中引用了本词条 */
export function getBacklinks(term) {
  if (!term) return []
  return TERMS.filter((t) => t.id !== term.id && (t.related || []).includes(term.id))
}

/** 同模块内的上一个 / 下一个（用于详情页底部导航） */
export function getAdjacent(term) {
  const i = TERMS.findIndex((t) => t.id === (term && term.id))
  if (i < 0) return { prev: null, next: null }
  return {
    prev: i > 0 ? TERMS[i - 1] : null,
    next: i < TERMS.length - 1 ? TERMS[i + 1] : null
  }
}

/** 每日一词：按本地日期做确定性挑选（同一天所有人/多次打开一致） */
export function getDailyTerm(now = new Date()) {
  if (!TERMS.length) return null
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
  const day = Math.floor(local.getTime() / 86400000)
  return TERMS[((day % TERMS.length) + TERMS.length) % TERMS.length]
}
