import type { LanguageCode } from '@widget-js/core'
import type { SupportedLocale } from '@/i18n'
import { useStorage } from '@vueuse/core'
import { AppApi } from '@widget-js/core'
import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { TelegramApi } from '@/api/TelegramApi.ts'
import { i18n } from '@/i18n'

export const useSettingsStore = defineStore('settings-store', () => {
  const showDrawer = ref(false)
  // Persisted application language (used by UI)
  const language = useStorage<'en' | 'zh'>('language', (i18n.global.locale as unknown as SupportedLocale) || 'en')

  // Other persisted settings
  const groupDailyFetchCount = useStorage<number>('group-daily-fetch-count', 100)
  const apiId = useStorage<number>('apiId', '')
  const apiHash = useStorage<number>('apiHash', '')

  TelegramApi.getApi().then((config) => {
    if (config) {
      apiId.value = config.apiId
      apiHash.value = config.apiHash
    }
  })
  // Keep global i18n and host App API in sync whenever language changes
  watch(language, (val: SupportedLocale) => {
    try {
      i18n.global.locale = val
      AppApi.setLanguageCode(val as LanguageCode)
    }
    catch (e) {
      // no-op: best-effort sync
      console.error('Failed to sync language:', e)
    }
  }, { immediate: true })

  function setLanguage(val: 'en' | 'zh') {
    language.value = val
  }

  function setGroupDailyFetchCount(n: number) {
    groupDailyFetchCount.value = n
  }

  return {
    language,
    apiId,
    apiHash,
    groupDailyFetchCount,
    showDrawer,
    setLanguage,
    setGroupDailyFetchCount,
  }
})
