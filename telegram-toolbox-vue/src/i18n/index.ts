import { createI18n } from 'vue-i18n'
import en from './en.json'
import zh from './zh.json'

export type SupportedLocale = 'en' | 'zh'
export const i18n = createI18n({
  locale: 'en',
  datetimeFormats: {
    en: {
      short: { year: 'numeric', month: 'short', day: 'numeric' },
      yearMonth: { year: 'numeric', month: 'short' },
      long: { year: 'numeric', month: 'short', day: 'numeric', weekday: 'short', hour: 'numeric', minute: 'numeric' },
    },
    zh: {
      yearMonth: { year: 'numeric', month: 'short' },
      short: { year: 'numeric', month: 'short', day: 'numeric' },
      long: { year: 'numeric', month: 'short', day: 'numeric', weekday: 'short', hour: 'numeric', minute: 'numeric' },
    },
  },
  messages: {
    zh,
    en,
  },
})
