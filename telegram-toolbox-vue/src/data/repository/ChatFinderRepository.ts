import type { Table } from 'dexie'
import type { ChatFinder } from '@/data/ChatFinder.ts'
// 假设 chat 类型定义在 tdlib-types.ts
import Dexie from 'dexie'

class ChatFinderDatabase extends Dexie {
  chats!: Table<ChatFinder, number>

  constructor() {
    super('ChatFinderDatabase')
    this.version(1).stores({
      chats: 'id, title, type, url, userName,createTime', // id 为主键
    })
  }
}

const db = new ChatFinderDatabase()

export class ChatFinderRepository {
  static findById(id: number): Promise<ChatFinder | undefined> {
    return db.chats.get(id)
  }

  static save(chat: ChatFinder) {
    return db.chats.put(chat)
  }

  static remove(id: number) {
    return db.chats.delete(id)
  }

  static searchByTitle(title: string): Promise<ChatFinder[]> {
    return db.chats.where('title').startsWithIgnoreCase(title).toArray()
  }

  static findByUrl(url: string): Promise<ChatFinder | undefined> {
    return db.chats.where('url').equals(url).first()
  }

  static findByUserName(userName: string): Promise<ChatFinder | undefined> {
    return db.chats.where('userName').equals(userName).first()
  }

  static findByUrlOrUserName(url: string, userName: string): Promise<ChatFinder | undefined> {
    return db.chats.where('url').equals(url).or('userName').equals(userName).first()
  }

  static all(): Promise<ChatFinder[]> {
    return db.chats.toArray()
  }

  static async paginate(options?: SearchChatFinderOptions): Promise<{ data: ChatFinder[], total: number }> {
    let keyword = ''
    let page = 1
    let pageSize = 10
    if (options?.keyword) {
      keyword = options.keyword
    }
    if (options?.page && options.page > 0) {
      page = options.page
    }
    if (options?.pageSize && options.pageSize > 0) {
      pageSize = options.pageSize
    }
    if (keyword && keyword.trim() !== '') {
      // Dexie 不支持直接 where('keyword').contains(keyword)，需先全部取出再过滤
      const all = await db.chats.toArray()
      const filtered = all.filter((chat) => {
        return chat.title && chat.title.toLowerCase().includes(keyword.toLowerCase())
      })
      const total = filtered.length
      const data = filtered
        .sort((a, b) => b.createTime - a.createTime)
        .slice((page - 1) * pageSize, page * pageSize)
      return { data, total }
    }
    else {
      const collection = db.chats.orderBy('createTime').reverse()
      const total = await db.chats.count()
      const data = await collection.offset((page - 1) * pageSize).limit(pageSize).toArray()
      return { data, total }
    }
  }
}

export interface SearchChatFinderOptions {
  keyword?: string
  page?: number
  pageSize?: number
}
