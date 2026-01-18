import type { chatMembers, User } from '@/tdlib-types.ts'
import consola from 'consola'
import { useTDStore } from '@/stores/useTDStore.ts'

export class TelegramUtils {
  static getUserName(user: any, addAt: boolean = false): string {
    const usernames = user.usernames
    if (usernames) {
      if (addAt) {
        return `@${usernames.active_usernames[0]}`
      }
      return usernames.active_usernames[0]
    }
    return ''
  }

  static getGroupUserName(group: any): string {
    if (group.usernames) {
      const usernames = group.usernames
      if (usernames) {
        return usernames.active_usernames[0]
      }
    }
    return ''
  }

  /**
   * 从链接中提取用户名
   * https://t.me/su7xtjzy  -> 'su7xtjzy'
   * https://t.me/yh962yh?ad=link2288  -> 'yh962yh'
   * https://t.me/+Ha9GJe8HMy0wYWU1 -> '+Ha9GJe8HMy0wYWU1'
   * https://t.me/jianlai_TRJ/566 -> 'jianlai_TRJ'
   * 这种是添加贴纸包的链接，不是用户名
   * https://t.me/addstickers/emojjj2 -> ''
   */
  static getUserNameFromLink(url: string): string {
    try {
      const parsedUrl = new URL(url)
      if (parsedUrl.hostname == 't.me') {
        const pathname = parsedUrl.pathname
        const arr = pathname.split('/').filter(part => part.length > 0)
        if (arr.length == 1) {
          return arr[0]
        }
        else if (arr.length == 2) {
          if (Number.isInteger(Number.parseInt(arr[1]))) {
            return arr[0]
          }
        }
      }
    }
    // eslint-disable-next-line unused-imports/no-unused-vars
    catch (e) {

    }
    // 匹配 https://t.me/xxx 或 https://t.me/+xxx 或 https://t.me/xxx?xxx
    const match = url.match(/^https:\/\/t\.me\/(?!addstickers\/)([\w+-]+)(?:\?.*)?$/)
    if (match) {
      return match[1]
    }
    return ''
  }

  /**
   * 获取所有超级群成员
   */
  static async getAllSuperGroupMembers(superGroupId: number, total: number): Promise<User[]> {
    let page = 1
    const limit = 200
    const tdStore = useTDStore()
    const users: User[] = []
    let offset = (page - 1) * limit
    while (offset + limit < total) {
      offset = (page - 1) * limit
      consola.info(`Fetching supergroup members, page ${page}, offset ${offset}`)
      const result = await tdStore.invoke<chatMembers>({
        _: 'getSupergroupMembers',
        supergroup_id: superGroupId,
        limit,
        offset,
      })
      if (result.members) {
        page++
        for (const member of result.members) {
          const memberId = member.member_id
          if (memberId._ == 'messageSenderUser') {
            const userId = memberId.user_id
            if (users.find(it => userId == it.id)) {
              continue
            }
            const user = await tdStore.getUser(userId)
            if (user) {
              users.push(user)
            }
          }
        }
      }
    }
    return users
  }

  // async static getChatMembers(chat: Chat) {
  //   const tdStore = useTDStore()
  //   if (chat.type._ == 'chatTypeBasicGroup') {
  //     const info = await tdStore.getBasicGroupInfo()
  //     if (info) {
  //       return info.members
  //     }
  //   }
  //   else if (chat.type._ == 'chatTypeSupergroup') {
  //     const supergroupId = chat.type.supergroup_id
  //     const info = await tdStore.getSuperGroupInfo(supergroupId)
  //     if (info) {
  //       const members = await tdStore.invoke({
  //         _: 'getSupergroupMembers',
  //         supergroup_id: supergroupId,
  //         limit: 200,
  //       })
  //     }
  //   }
  //   return []
  // }
}
