import { createI18n } from 'vue-i18n'
import zh from './zh.json'
import en from './en.json'

function initialLocale() {
  const saved = localStorage.getItem('nb-locale')
  if (saved === 'zh' || saved === 'en') return saved
  return navigator.language && navigator.language.toLowerCase().startsWith('en') ? 'en' : 'zh'
}

const i18n = createI18n({
  legacy: false,
  globalInjection: true,
  locale: initialLocale(),
  fallbackLocale: 'zh',
  messages: { zh, en }
})

export default i18n
