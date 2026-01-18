import type { Message } from '../tdlib-types'
import type { MessageListen } from '@/data/MessageListen.ts'
import { useStorage } from '@vueuse/core'
import consola from 'consola'
import dayjs from 'dayjs'
import { ElMessage } from 'element-plus'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import Alert from '@/assets/alert.wav'
import { matchListens } from '@/data/MessageListen.ts'
import { useChatFinderStore } from '@/stores/useChatFinderStore.ts'
import { useTDStore } from '@/stores/useTDStore.ts'
import { MessageUtils } from '@/utils/MessageUtils.ts'
import { TelegramUtils } from '@/utils/TelegramUtils.ts'

const maxMessages = 1000
/**
 * 存储消息信息，消息最多存储500条，超过500条后删除最早的消息。
 */
export const useMessageStore = defineStore('message-store', () => {
  const alertMessageId: number[] = []
  const messages = ref<Message[]>([])
  const excludeChats = useStorage<number[]>('exclude-chat-id', [])
  const listenList = useStorage<MessageListen[]>('listen', [])
  const excludeListenList = computed(() => {
    return listenList.value.filter(listen => listen.exclude)
  })
  const tdStore = useTDStore()
  const chatFinderStore = useChatFinderStore()
  const { t } = useI18n()
  const listenMessage = computed(() => {
    return messages.value.filter((msg) => {
      const a = !!matchListens(msg, listenList.value)
      return a
    })
  })

  function playAlertSound() {
    const audio = new Audio(Alert)
    audio.play()
  }

  function notifyListen(msg: Message, listen: MessageListen) {
    if (window.Notification && Notification.permission === 'granted') {
      const title = listen.description || listen.pattern
      const text = MessageUtils.getContentTextWithDefault(msg)
      const notification = new Notification(`${t('message.alertNotifyTitle')}: ${title}`, {
        body: text,
        silent: true,
      })
    }
    playAlertSound()
  }

  async function alertNewMsg(msg: Message, listenRes: MessageListen, forwardChatId: number) {
    try {
      if (msg.chat_id == forwardChatId) {
        consola.info('新消息与转发聊天相同，跳过转发', msg.chat_id, forwardChatId)
        return
      }
      const cloneMsg = JSON.parse(JSON.stringify(msg)) as Message
      // @ts-ignore
      cloneMsg.content._ = cloneMsg.content._.replace('message', 'inputMessage')
      const user = await tdStore.getUser(MessageUtils.getSenderId(msg))
      const chat = await tdStore.getChat(cloneMsg.chat_id)
      const userName = TelegramUtils.getUserName(user)
      const textArr: string[] = []
      textArr.push(`🎯${t('message.alertKeyword')}: ${listenRes.pattern}`)
      textArr.push(`📲${t('message.alertFromChat')}: ${chat.title}`)
      textArr.push(`👤${t('message.alertSender')}: @${userName}`)
      const isGroup = chat.type._ == 'chatTypeSupergroup' || chat.type._ == 'chatTypeBasicGroup'
      if (isGroup) {
        if (chat.type._ == 'chatTypeSupergroup') {
          const superGroup = await tdStore.invoke({
            _: 'getSupergroup',
            supergroup_id: chat.type.supergroup_id,
          })
          const groupUserName = TelegramUtils.getGroupUserName(superGroup)
          if (groupUserName) {
            textArr.push(`🔗${t('message.alertGroupLink')}: https://t.me/${groupUserName}`)
          }
        }
        else if (chat.type._ == 'chatTypeBasicGroup') {
          const link = await tdStore.invoke({
            _: 'getBasicGroup',
            basic_group_id: chat.type.basic_group_id,
          })
        }
      }
      textArr.push(`⏰${t('message.alertTime')}: ${dayjs().format('YYYY-MM-DD HH:mm:ss')}`)
      const contentText = MessageUtils.getContentTextWithDefault(msg)
      textArr.push(`\n💬${t('message.alertOriginalMsg')}: ${contentText}`)
      const alertMsg = await tdStore.invoke<Message>({
        _: 'sendMessage',
        chat_id: forwardChatId,
        reply_to: {
          _: 'inputMessageReplyToExternalMessage',
          chat_id: cloneMsg.chat_id,
          message_id: cloneMsg.id,
        },
        input_message_content: {
          _: 'inputMessageText',
          text: {
            _: 'formattedText',
            text: textArr.join('\n'),
          },
        },
      })
      if (alertMsg) {
        alertMessageId.push(alertMsg.id)
      }
      consola.info('已转发')
    }
    catch (e) {
      consola.error(`转发消息到聊天 ${forwardChatId} 失败`, e)
    }
  }

  async function add(msg: Message) {
    if (alertMessageId.includes(msg.id)) {
      return
    }
    chatFinderStore.parseFromMessage(msg).catch()
    const chatId = msg.chat_id
    if (excludeChats.value.includes(chatId)) {
      consola.info(`排除聊天消息：${chatId}`, msg)
      return
    }
    let senderUserId = -1
    if (msg.sender_id._ == 'messageSenderUser') {
      senderUserId = msg.sender_id.user_id
      if (senderUserId === tdStore.userId) {
        consola.info(`排除自己的消息：${msg.sender_id.user_id}`, msg)
        return
      }
    }
    if (listenList.value.length > 0) {
      const listenRes = matchListens(msg, listenList.value)
      if (listenRes && typeof listenRes != 'boolean') {
        messages.value.splice(0, 0, msg)
        if (!listenRes.exclude) {
          if (listenRes.notify) {
            notifyListen(msg, listenRes)
          }
          if (listenRes.forwardToChats && listenRes.forwardToChats.length > 0) {
            for (const chatId of listenRes.forwardToChats) {
              await alertNewMsg(msg, listenRes, chatId)
            }
          }
        }
      }
    }
    else {
      messages.value.splice(0, 0, msg)
      if (messages.value.length >= maxMessages) {
        messages.value.pop()
      }
    }
  }

  function clear() {
    messages.value = []
  }

  function addListen(listen: MessageListen) {
    if (!listen.id) {
      listen.id = Date.now()
    }
    const oldIndex = listenList.value.findIndex(item => item.id === listen.id)
    if (oldIndex > -1) {
      listenList.value[oldIndex] = listen
    }
    else {
      listenList.value.push(listen)
    }
  }

  function removeListen(id: number) {
    const index = listenList.value.findIndex(item => item.id == id)
    consola.info(`Removing listen with id: ${id}`, index)
    if (index !== -1) {
      listenList.value.splice(index, 1)
    }
  }

  function removeMsg(msg: Message) {
    const index = messages.value.findIndex(item => item.id == msg.id)
    if (index !== -1) {
      messages.value.splice(index, 1)
    }
  }

  return { messages, listenList, add, clear, removeMsg, excludeChats, addListen, removeListen, listenMessage }
})
