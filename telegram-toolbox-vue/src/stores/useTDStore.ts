import type { $Function, BasicGroup, BasicGroupFullInfo, Chat, Chats, Supergroup, SupergroupFullInfo, Update, User } from '../tdlib-types'
import { useStorage, useWebSocket } from '@vueuse/core'
import consola from 'consola'
import { nanoid } from 'nanoid'
import { defineStore } from 'pinia'
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { TelegramApi } from '@/api/TelegramApi.ts'
import { UserRepository } from '@/data/repository/UserRepository.ts'
import { useMessageStore } from '@/stores/useMessageStore.ts'
import { useStickerStore } from '@/stores/useStickerStore.ts'

export interface TDWebSocketEvent {
  event: 'update' | 'stop' | 'login'
  data: Update | any
}

export interface TDRequest {
  id?: string
  method: 'login' | 'logout' | 'invoke' | 'loginAsBot' | 'getVersion'
  params?: $Function | Record<string, any>
}

export interface TDResponse<T = any> extends TDRequest {
  result?: T
  error?: {
    code: number
    message: string
  }
}

export class TDError extends Error {
  code: number
  constructor(code: number, message: string) {
    super(message)
    this.code = code
  }
}

export const useTDStore = defineStore('td-store', () => {
  const apiId = useStorage('apiId', '')
  const phone = useStorage('phone', '')
  const apiHash = useStorage('apiHash', '')
  const botToken = useStorage('botToken', '')
  const autoLogin = useStorage('autoLogin', false)
  const url = ref(`ws://localhost:6001`)
  const me = ref<User>()
  const userId = useStorage('Iaqu4tooj0fa', -1)
  const chats = reactive<Chat[]>([])
  const basicGroups = reactive<BasicGroup[]>([])
  const superGroups = reactive<Supergroup[]>([])
  const messageStore = useMessageStore()
  const stickerStore = useStickerStore()

  const router = useRouter()
  TelegramApi.getTDPort().then((port) => {
    const p = port == -1 ? 6001 : port
    url.value = `ws://localhost:${p}`
  })

  async function getChat(id: number): Promise<Chat | undefined> {
    const chat = await invoke<Chat>({
      _: 'getChat',
      chat_id: id,
    })
    const chatIndex = chats.findIndex(it => it.id == chat.id)
    if (chatIndex > -1) {
      chats.splice(chatIndex, 1)
    }
    return chat
  }

  async function getBasicGroupInfo(id: number): Promise<BasicGroupFullInfo | undefined> {
    return await invoke<BasicGroupFullInfo>({
      _: 'getBasicGroupFullInfo',
      basic_group_id: id,
    })
  }

  async function getSuperGroupInfo(id: number): Promise<SupergroupFullInfo | undefined> {
    return await invoke<SupergroupFullInfo>({
      _: 'getSupergroupFullInfo',
      supergroup_id: id,
    })
  }

  async function getUser(id: number): Promise<User | undefined> {
    const dbUser = await UserRepository.getUser(id)
    if (dbUser) {
      return dbUser
    }
    const user = await invoke<User>({
      _: 'getUser',
      user_id: id,
    })
    if (user) {
      await UserRepository.addUser(user)
    }
    return user
  }

  function loadChats() {
    invoke<Chats>({ _: 'getChats', limit: 500 }).then(async (res) => {
      consola.info('Fetched chats:', res)
      for (const chatId of res.chat_ids) {
        const chat = await getChat(chatId)
        if (!chat) {
          continue
        }
        chats.push(chat)
        if (chat.type._ === 'chatTypeBasicGroup') {
          const group = await invoke<BasicGroup>({
            _: 'getBasicGroup',
            basic_group_id: chat.type.basic_group_id,
          })
          if (group) {
            const index = basicGroups.findIndex(it => it.id == group.id)
            if (index > -1) {
              basicGroups.splice(index, 1)
            }
            basicGroups.push(group)
          }
        }
        else if (chat.type._ == 'chatTypeSupergroup') {
          const group = await invoke<Supergroup>({
            _: 'getSupergroup',
            supergroup_id: chat.type.supergroup_id,
          })
          if (group) {
            const index = superGroups.findIndex(it => it.id == group.id)
            if (index > -1) {
              superGroups.splice(index, 1)
            }
            superGroups.push(group)
          }
        }
      }
    })
  }
  function getBasicInfo() {
    invoke<User>({ _: 'getMe' }).then((res) => {
      if (res) {
        me.value = res
        userId.value = me.value.id
        consola.info('Current user:', me.value)
      }
    })
    loadChats()
  }

  const { send, ws } = useWebSocket(url, {
    onConnected: async () => {
      TelegramApi.isLogin().then((res) => {
        if (res) {
          getBasicInfo()
        }
      })
    },
    onMessage: async (ws, event) => {
      const message = JSON.parse(event.data.toString())
      if (message.data) {
        if (message.event == 'stop') {
          me.value = undefined
        }
        else if (message.event == 'login') {
          getBasicInfo()
        }
        else if (message.event == 'update') {
          const data = message.data as Update
          if (data._ == 'updateNewMessage') {
            const msg = data.message
            if (msg.content._ == 'messageAnimatedEmoji') {
              stickerStore.addSticker(msg.content.animated_emoji.sticker).catch()
            }
            else if (msg.content._ == 'messageText') {
              for (const entity of msg.content.text.entities) {
                if (entity.type._ == 'textEntityTypeCustomEmoji') {
                  stickerStore.addStickerByEmojiId([entity.type.custom_emoji_id]).catch()
                }
              }
            }
            else if (msg.content._ == 'messageVideo' || msg.content._ == 'messagePhoto') {
              for (const entity of msg.content.caption.entities) {
                if (entity.type._ == 'textEntityTypeCustomEmoji') {
                  stickerStore.addStickerByEmojiId([entity.type.custom_emoji_id]).catch()
                }
              }
            }
            messageStore.add(data.message)
          }
        }
      }
      else if (message.id && message.method) { /* empty */ }
    },
    autoReconnect: {
      retries: 30,
      delay: 1000,
    },
  })

  function invoke<T>(func: $Function): Promise<T | undefined> {
    return sendRequest({
      method: 'invoke',
      params: func,
    })
  }

  function sendRequest<T>(req: TDRequest): Promise<T | undefined> {
    return new Promise((resolve, reject) => {
      if (!req.id) {
        req.id = nanoid()
      }
      const timeout = setTimeout(() => {
        reject(new Error(`Request timeout: ${req.id}`))
      }, 15000)

      function listener(msg: MessageEvent) {
        const message = JSON.parse(msg.data.toString())
        if (message.id == req.id) {
          ws.value?.removeEventListener('message', this)
          clearTimeout(timeout)
          const msg = message as TDResponse<T>
          if (msg.error) {
            reject(new TDError(msg.error.code, msg.error.message))
          }
          else {
            if (msg.result) {
              resolve(msg.result)
            }
            else {
              resolve(undefined)
            }
          }
        }
      }

      ws.value?.addEventListener('message', listener)
      send(JSON.stringify(req))
    })
  }

  async function login(params: { phone?: string, code?: string }) {
    await sendRequest({
      method: 'login',
      params,
    })
    if (params.code) {
      router.push({ name: 'ChatFinder' })
    }
  }

  async function logout() {
    await sendRequest({
      method: 'logout',
    })
    router.push({ name: 'login' })
  }

  function loginAsBot(token: string) {
    return sendRequest({
      method: 'loginAsBot',
      params: { token },
    })
  }

  return {
    invoke,
    login,
    logout,
    me,
    apiId,
    phone,
    apiHash,
    chats,
    basicGroups,
    superGroups,
    getChat,
    getUser,
    loadChats,
    userId,
    getBasicGroupInfo,
    getSuperGroupInfo,
    botToken,
    loginAsBot,
    autoLogin,
  }
})
