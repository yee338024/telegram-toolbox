import { ref, watch } from 'vue'
import { TelegramApi } from '@/api/TelegramApi.ts'

/**
 * 仿照vueuse useStorage实现的加密存储
 * @param key
 * @param defaultValue
 */
export function useSafeStorage<T extends (string | number | boolean)>(key: string, defaultValue: T) {
  const data = ref<T>(defaultValue)

  // 初始化时尝试解密
  async function load() {
    const encrypted = localStorage.getItem(key)
    if (encrypted) {
      try {
        const value = await TelegramApi.decryptString(encrypted)
        if (typeof defaultValue == 'boolean') {
          data.value = Boolean(value) as T
        }
        else if (typeof defaultValue == 'number') {
          data.value = Number(value) as T
        }
        else if (typeof defaultValue == 'string') {
          data.value = value
        }
      }
      catch {
        data.value = defaultValue
      }
    }
    else {
      data.value = defaultValue
    }
  }

  // 监听data变化，自动加密存储
  watch(data, async (val) => {
    if (val === undefined) {
      localStorage.removeItem(key)
    }
    else {
      const encrypted = await TelegramApi.encryptString(val.toString())
      localStorage.setItem(key, encrypted)
    }
  }, { deep: true })

  // 初始化
  load()

  return data
}
