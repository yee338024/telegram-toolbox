import type { Table } from 'dexie'
import type { StickerSet } from '@/tdlib-types.ts'
// 假设 chat 类型定义在 tdlib-types.ts
import Dexie from 'dexie'

class StickerSetDatabase extends Dexie {
  stickerSets!: Table<StickerSet, string>

  constructor() {
    super('StickerSetDatabase')
    this.version(1).stores({
      // 修复表名以匹配类中的属性名
      stickerSets: 'id, name, title',
    })
  }
}

const db = new StickerSetDatabase()

export class StickerSetRepository {
  // Add a new sticker set. Returns the id (primary key) on success.
  async save(stickerSet: StickerSet): Promise<string> {
    try {
      return await db.stickerSets.put(stickerSet)
    }
    catch (err) {
      // bubble up error with context
      throw new Error(`Failed to add sticker set: ${(err as Error).message}`)
    }
  }

  // Upsert (put) a sticker set. Returns the id.
  async upsert(stickerSet: StickerSet): Promise<string> {
    try {
      await db.stickerSets.put(stickerSet)
      return stickerSet.id as unknown as string
    }
    catch (err) {
      throw new Error(`Failed to upsert sticker set: ${(err as Error).message}`)
    }
  }

  // Get a sticker set by id
  async getById(id: string): Promise<StickerSet | undefined> {
    try {
      return await db.stickerSets.get(id)
    }
    catch (err) {
      throw new Error(`Failed to get sticker set by id: ${(err as Error).message}`)
    }
  }

  // Get all sticker sets
  async getAll(): Promise<StickerSet[]> {
    return db.stickerSets.toArray()
  }

  // Find sticker sets by name (partial match)
  async findByName(name: string): Promise<StickerSet[]> {
    try {
      // Use case-insensitive partial match on `name` and `title` if available
      const lower = name.toLowerCase()
      return await db.stickerSets.filter((ss) => {
        const n = (ss.name || '').toString().toLowerCase()
        const t = (ss.title || '').toString().toLowerCase()
        return n.includes(lower) || t.includes(lower)
      }).toArray()
    }
    catch (err) {
      throw new Error(`Failed to find sticker sets by name: ${(err as Error).message}`)
    }
  }

  // Remove a sticker set by id
  async removeById(id: string): Promise<number> {
    try {
      await db.stickerSets.delete(id)
      return 1
    }
    catch (err) {
      throw new Error(`Failed to remove sticker set: ${(err as Error).message}`)
    }
  }

  // Clear all sticker sets
  async clearAll(): Promise<void> {
    try {
      await db.stickerSets.clear()
    }
    catch (err) {
      throw new Error(`Failed to clear sticker sets: ${(err as Error).message}`)
    }
  }
}

// 导出一个默认的单例实例，方便在项目中直接使用
export const stickerSetRepository = new StickerSetRepository()
