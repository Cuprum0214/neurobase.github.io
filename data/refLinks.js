import reading from './reading_list.json'

/**
 * 词条「来源与核验」→「教材导读」跳转映射。
 *
 * 词条 reference.title 形如 "Principles of Neural Science (Kandel et al., 6th ed., 2021)"，
 * 教材导读中的书含 `title` / `title_zh`。这里做**归一化前缀匹配**：
 *   norm = 小写、非字母数字（含中英标点）→ 空格、压缩空白
 *   命中条件：ref 归一化文本 === 书名，或以「书名 + 空格」开头
 * 取**命中最长**的书名，避免 "Neuroscience" 误配 "Neuroscience: Exploring the Brain"。
 * 纯函数、无副作用；只覆盖教材导读中确实存在的书；论文/综述没有对应书则不返回（保留原有 url/doi 链接）。
 */
function norm(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fff]+/g, ' ')
    .trim()
}

const INDEX = reading.books.map((b) => ({
  id: b.id,
  keys: [b.title, b.title_zh].filter(Boolean).map(norm).filter(Boolean)
}))

/** 返回匹配到的教材 id，未命中返回 null */
export function resolveReadingBook(title) {
  const n = norm(title)
  if (!n) return null
  let best = null
  for (const b of INDEX) {
    for (const k of b.keys) {
      if (n === k || n.startsWith(k + ' ')) {
        if (!best || k.length > best.len) best = { id: b.id, len: k.length }
      }
    }
  }
  return best ? best.id : null
}
