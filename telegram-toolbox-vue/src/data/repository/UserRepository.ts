import type { Table } from 'dexie'
import type { user } from '@/tdlib-types.ts'
import Dexie from 'dexie'

class UserDatabase extends Dexie {
  users!: Table<user, number>
  constructor() {
    super('UserDatabase')
    this.version(1).stores({
      users: 'id,first_name,last_name,phone_number',
    })
  }
}

const db = new UserDatabase()

export class UserRepository {
  static async addUser(u: user): Promise<number> {
    return db.users.put(u)
  }

  static async getUser(id: number): Promise<user | undefined> {
    return db.users.get(id)
  }

  static async updateUser(u: user): Promise<number> {
    return db.users.put(u)
  }

  static async deleteUser(id: number): Promise<void> {
    await db.users.delete(id)
  }

  static async getAllUsers(): Promise<user[]> {
    return db.users.toArray()
  }
}
