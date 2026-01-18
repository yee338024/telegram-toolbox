import type { Message, textEntity } from '../tdlib-types'

export class MessageUtils {
  static getContentTextWithDefault(msg: Message) {
    if (msg.content._ == 'messageText') {
      return msg.content.text.text
    }
    else if (msg.content._ == 'messagePhoto') {
      return msg.content.caption.text
    }
    else if (msg.content._ == 'messageVideo') {
      return msg.content.caption.text
    }
    else if (msg.content._ == 'messageChatAddMembers') {
      return `New user joined group`
    }
    else if (msg.content._ == 'messageChatChangeTitle') {
      return `Unsupported message`
    }
    return undefined
  }

  static getContentText(msg: Message): string | undefined {
    if (msg.content._ == 'messageText') {
      return msg.content.text.text
    }
    else if (msg.content._ == 'messagePhoto') {
      return msg.content.caption.text
    }
    else if (msg.content._ == 'messageVideo') {
      return msg.content.caption.text
    }
    return undefined
  }

  static getSenderId(msg: Message): number {
    if (msg.sender_id._ === 'messageSenderUser') {
      return msg.sender_id.user_id
    }
    return -1
  }

  static getLinkFromMessage(msg: Message): string[] {
    if (msg.content._ == 'messageText') {
      return this.getLinksFromEntities(msg.content.text.entities)
    }
    else if (msg.content._ == 'messagePhoto') {
      return this.getLinksFromEntities(msg.content.caption.entities)
    }
    else if (msg.content._ == 'messageVideo') {
      return this.getLinksFromEntities(msg.content.caption.entities)
    }
    else if (msg.content._ == 'messageDocument') {
      return this.getLinksFromEntities(msg.content.caption.entities)
    }
    return []
  }

  private static getLinksFromEntities(entities: Array<textEntity>): string[] {
    const urlArr: string[] = []
    for (const entity of entities) {
      if (entity.type._ == 'textEntityTypeTextUrl') {
        if (!urlArr.includes(entity.type.url)) {
          urlArr.push(entity.type.url)
        }
      }
    }
    return urlArr
  }
}
