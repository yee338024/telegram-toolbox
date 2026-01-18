import consola from 'consola'
import {Message} from "../tdlib-types";
import {MessageUtils} from "@/utils/MessageUtils.ts";

export interface MessageListen {
  id: number
  /** 匹配类型：正则、全文、模糊 */
  type: 'regex' | 'exact' | 'fuzzy'
  /** 匹配内容（字符串或正则表达式） */
  pattern: string
  /** 可选，用户对该监听的描述 */
  description?: string
  /**
   * 可选，是否排除该监听，默认 false，即包含监听
   */
  exclude?: boolean
  /**
   * 转发到哪些聊天
   */
  forwardToChats?: number[]
  /**
   * 提醒
   */
  notify?: boolean
}

export function matchListens(msg: Message, listen: MessageListen[]): MessageListen | boolean | undefined {
  const excludeListens = listen.filter(it => it.exclude)
  for (const listen of excludeListens) {
    const res = matchListen(msg, listen)
    if (res) {
      if( msg.content._ == 'messageText') {
        consola.info('匹配到排除监听:', listen, msg.content.text.text)
      }
      return undefined
    }
  }
  const includeListens = listen.filter(it => !it.exclude)
  for (const listen of includeListens) {
    const res = matchListen(msg, listen)
    if (res) {
      return res
    }
  }
  if (includeListens.length == 0) {
    return true
  }
  return undefined
}

export function matchListen(msg: Message, listen: MessageListen): MessageListen | undefined {
  const content = MessageUtils.getContentText(msg)
  if (content) {
    switch (listen.type) {
      case 'regex':
        try {
          const regExp = new RegExp(listen.pattern)
          if (regExp.test(content)) {
            return listen
          }
        }
        catch (e) {
          return undefined
        }
        break
      case 'exact':
        if (content === listen.pattern) {
          return listen
        }
        break
      case 'fuzzy':
        if (content.includes(listen.pattern)) {
          return listen
        }
        break
    }
  }

  return undefined
}
