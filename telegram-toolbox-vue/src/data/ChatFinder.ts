import type { chat } from '@/tdlib-types.ts'

export interface ChatFinder extends chat {
  url: string
  userName: string
  /**
   * 创建时间戳
   */
  createTime?: number
}
