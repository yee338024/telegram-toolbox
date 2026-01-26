import type { Table } from 'dexie'
import type { Sticker } from '@/tdlib-types.ts'
// 假设 chat 类型定义在 tdlib-types.ts
import Dexie from 'dexie'

class StickerDatabase extends Dexie {
  stickers!: Table<Sticker, string | number>

  constructor() {
    super('StickerDatabase')
    this.version(1).stores({
      stickers: 'id, set_id, file_id, name, createTime',
    })
  }
}

const db = new StickerDatabase()

export class StickerRepository {
  findById(id: string | number): Promise<Sticker | undefined> {
    return db.stickers.get(id)
  }

  save(sticker: Sticker) {
    return db.stickers.put(sticker)
  }

  remove(id: string | number) {
    return db.stickers.delete(id)
  }

  all(): Promise<Sticker[]> {
    return db.stickers.toArray()
  }

  async addMany(stickers: Sticker[]): Promise<void> {
    return db.transaction('rw', db.stickers, async () => {
      await db.stickers.bulkPut(stickers)
    })
  }

  async deleteMany(ids: (string | number)[]): Promise<void> {
    return db.transaction('rw', db.stickers, async () => {
      for (const id of ids) {
        // delete one by one to keep compatibility across key types
        // (Dexie supports bulkDelete in newer versions; this is explicit)

        await db.stickers.delete(id)
      }
    })
  }

  findBySetId(setId: string): Promise<Sticker[]> {
    return db.stickers.where('set_id').equals(setId).toArray()
  }

  findByFileId(fileId: string): Promise<Sticker | undefined> {
    return db.stickers.where('file_id').equals(fileId).first()
  }

  searchByName(name: string): Promise<Sticker[]> {
    if (!name || name.trim() === '') { return Promise.resolve([]) }
    return db.stickers.where('name').startsWithIgnoreCase(name).toArray()
  }

  async count(): Promise<number> {
    return db.stickers.count()
  }

  async clear(): Promise<void> {
    await db.stickers.clear()
  }

  static async paginate(options?: { keyword?: string, page?: number, pageSize?: number }): Promise<{ data: Sticker[], total: number }> {
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
      // Dexie 对复杂 contains 不稳定，先取出再过滤
      const all = await db.stickers.toArray()
      const filtered = all.filter((s) => {
        return (s as any).name && (s as any).name.toLowerCase().includes(keyword.toLowerCase())
      })
      const total = filtered.length
      const data = filtered
        .sort((a, b) => ((b as any).createTime || 0) - ((a as any).createTime || 0))
        .slice((page - 1) * pageSize, page * pageSize)
      return { data, total }
    }
    else {
      const collection = db.stickers.orderBy('createTime').reverse()
      const total = await db.stickers.count()
      const data = await collection.offset((page - 1) * pageSize).limit(pageSize).toArray()
      return { data, total }
    }
  }
}

export const stickerRepository = new StickerRepository()
