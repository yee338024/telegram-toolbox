import type { ChatFinder } from '@/data/ChatFinder.ts'
import type {
  SearchChatFinderOptions,
} from '@/data/repository/ChatFinderRepository.ts'
import type { chat, Message } from '@/tdlib-types.ts'
import { useIntervalFn, useStorage, useTimeoutPoll } from '@vueuse/core'
import { delay } from '@widget-js/core'
import consola from 'consola'
import { defineStore, storeToRefs } from 'pinia'
import { ref } from 'vue'
import {
  ChatFinderRepository,
} from '@/data/repository/ChatFinderRepository.ts'
import { useSettingsStore } from '@/stores/useSettingsStore.ts'
import { useTDStore } from '@/stores/useTDStore.ts'
import { MessageUtils } from '@/utils/MessageUtils.ts'
import { TelegramUtils } from '@/utils/TelegramUtils.ts'

export const useChatFinderStore = defineStore('chat-finder', () => {
  const chats = ref<ChatFinder[]>([])
  const tdStore = useTDStore()
  const total = ref(0)
  const blockTime = useStorage('block_time', 0)
  const blockUntil = useStorage('block_until', 0)
  const enable = useStorage('Aj4xievopoox', false)

  const settingsStore = useSettingsStore()
  const { groupDailyFetchCount } = storeToRefs(settingsStore)

  // persist daily fetch counters so the app remembers how many groups were fetched today
  const dailyFetchCount = useStorage<number>('group_daily_fetch_count', 0)
  const dailyFetchDay = useStorage<string>('group_daily_fetch_day', '')

  function getTodayStr() {
    return new Date().toISOString().slice(0, 10)
  }

  function resetDailyIfNeeded() {
    const today = getTodayStr()
    if (dailyFetchDay.value !== today) {
      dailyFetchDay.value = today
      dailyFetchCount.value = 0
    }
  }

  async function load(options?: SearchChatFinderOptions) {
    const result = await ChatFinderRepository.paginate(options)
    total.value = result.total
    chats.value = result.data
  }

  // ensure daily counter is valid on startup
  resetDailyIfNeeded()
  load()
  async function getChatFromLink(url: string): Promise<ChatFinder | undefined> {
    if (blockTime.value > 0) {
      return undefined
    }
    const userName = TelegramUtils.getUserNameFromLink(url)
    if (userName) {
      consola.info('userName', userName)
      const dbData = await ChatFinderRepository.findByUrlOrUserName(url, userName)
      if (dbData) {
        return dbData
      }
      try {
        let chatRes: chat
        if (userName.startsWith('+')) {
          chatRes = await tdStore.invoke<chat>({
            _: 'checkChatInviteLink',
            invite_link: url,
          })
        }
        else {
          chatRes = await tdStore.invoke<chat>({
            _: 'searchPublicChat',
            username: userName,
          })
        }
        consola.info('群组信息', chatRes)
        if (chatRes) {
          const chat = {
            ...chatRes,
            url,
            userName,
            createTime: Date.now(),
          }
          if (!chat.id) {
            // some TDLib responses may include `chat_id` — access defensively to avoid TS errors
            chat.id = (chatRes as any).chat_id
          }
          // attempt to add - add will enforce daily limit
          await add(chat)
        }
      }
      catch (e) {
        consola.error(`解析群组失败:${url}  ${userName}`, e)
        if (e.message.includes('retry after')) {
          // 取出 Too Many Requests: retry after 31258 中的数字
          const match = e.message.match(/retry after (\d+)/)
          if (match && match[1]) {
            const seconds = Number.parseInt(match[1])
            blockTime.value = Date.now()
            blockUntil.value = blockTime.value + seconds * 1000
            consola.warn(`触发频率限制，${seconds} 秒后解除`)
          }
        }
      }
    }
    return undefined
  }

  const blockSeconds = ref(0)
  useIntervalFn(() => {
    if (blockTime.value > 0) {
      blockSeconds.value = Math.round((blockUntil.value - Date.now()) / 1000)
      if (blockSeconds.value <= 0) {
        blockTime.value = 0
        blockUntil.value = 0
      }
    }
  }, 1000)

  const msgQueue: Message[] = []
  async function parseFromMessage(msg: Message) {
    if (enable.value) {
      msgQueue.push(msg)
    }
  }

  useTimeoutPoll(async () => {
    if (msgQueue.length == 0) {
      return
    }
    const msg = msgQueue.pop()
    const urls = MessageUtils.getLinkFromMessage(msg)
    consola.info(urls)
    for (const url of urls) {
      try {
        const chat = await getChatFromLink(url)
        if (chat && chats.value.findIndex(it => it.id == chat.id) == -1) {
          chats.value.unshift(chat)
        }
        await delay(3000)
      }
      catch (e) {
        console.error('解析链接失败', e)
      }
    }
  }, 3000)

  async function add(chat: ChatFinder) {
    // reset daily counter if date has rolled
    resetDailyIfNeeded()

    // if groupDailyFetchCount is > 0, enforce the daily limit
    if (groupDailyFetchCount.value > 0 && dailyFetchCount.value >= groupDailyFetchCount.value) {
      consola.warn(`达到每日群组采集上限: ${dailyFetchCount.value}/${groupDailyFetchCount.value}`)
      return
    }

    await ChatFinderRepository.save(chat)

    // increment daily counter after successful save
    dailyFetchCount.value = (dailyFetchCount.value || 0) + 1

    // reload list
    load()
  }

  const remainingToday = () => {
    resetDailyIfNeeded()
    if (groupDailyFetchCount.value <= 0) {
      return Infinity
    }

    return Math.max(0, groupDailyFetchCount.value - (dailyFetchCount.value || 0))
  }

  return { chats, add, total, enable, load, blockSeconds, parseFromMessage, dailyFetchCount, dailyFetchDay, remainingToday }
})
