/**
 * 11 个知识模块（冻结，来源：PLAN.md §2.2）
 * 该列表为前端导航与词条分类的唯一来源，改动须同步 PLAN.md。
 */
export const MODULES = [
  { id: 'neuron', code: 'M1', name_zh: '神经元与神经信号', name_en: 'Neurons & Neural Signals', target: 30, icon: '⚡' },
  { id: 'synapse', code: 'M2', name_zh: '突触与神经递质', name_en: 'Synapses & Neurotransmitters', target: 28, icon: '🔗' },
  { id: 'anatomy', code: 'M3', name_zh: '脑解剖分区', name_en: 'Brain Anatomy', target: 30, icon: '🧠' },
  { id: 'sensory', code: 'M4', name_zh: '感觉与知觉', name_en: 'Sensation & Perception', target: 28, icon: '👁️' },
  { id: 'motor', code: 'M5', name_zh: '运动控制', name_en: 'Motor Control', target: 26, icon: '🏃' },
  { id: 'attention', code: 'M6', name_zh: '注意', name_en: 'Attention', target: 24, icon: '🎯' },
  { id: 'memory', code: 'M7', name_zh: '记忆', name_en: 'Memory', target: 26, icon: '💾' },
  { id: 'language', code: 'M8', name_zh: '语言', name_en: 'Language', target: 22, icon: '💬' },
  { id: 'emotion', code: 'M9', name_zh: '情绪', name_en: 'Emotion', target: 24, icon: '❤️' },
  { id: 'methods', code: 'M10', name_zh: '认知神经科学方法', name_en: 'Methods in Cognitive Neuroscience', target: 26, icon: '🔬' },
  { id: 'bci', code: 'M11', name_zh: 'BCI 基础', name_en: 'BCI Fundamentals', target: 36, icon: '🖥️' }
]

export const TOTAL_TARGET = MODULES.reduce((sum, m) => sum + m.target, 0) // ≥ 300

export function getModule(id) {
  return MODULES.find((m) => m.id === id) || null
}
