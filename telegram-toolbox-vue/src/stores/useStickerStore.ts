import type { Sticker, Stickers, StickerSet } from '@/tdlib-types.ts'
import { delay } from '@widget-js/core'
import consola from 'consola'
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { stickerRepository } from '@/data/repository/StickerRepository.ts'
import { stickerSetRepository } from '@/data/repository/StickerSetRepository.ts'
import { useTDStore } from '@/stores/useTDStore.ts'

export const useStickerStore = defineStore('sticker-store', () => {
  const tdStore = useTDStore()
  const stickerSets = ref<StickerSet[]>([])
  async function addStickerByEmojiId(emojiId: string[]) {
    const stickers = await tdStore.invoke<Stickers>({
      _: 'getCustomEmojiStickers',
      custom_emoji_ids: emojiId,
    })
    for (const sticker of stickers.stickers) {
      await addSticker(sticker)
    }
  }

  async function addSticker(sticker: Sticker) {
    const set = await tdStore.invoke<StickerSet>({
      _: 'getStickerSet',
      set_id: sticker.set_id,
    })
    consola.info('Adding sticker set', set.title)
    await stickerSetRepository.save(set)
    let needRefresh = false
    for (const sticker of set.stickers) {
      await stickerRepository.save(sticker)
      if (!sticker.thumbnail.file.local.is_downloading_completed) {
        needRefresh = true
        await tdStore.invoke({
          _: 'downloadFile',
          file_id: sticker.thumbnail.file.id,
          priority: 1,
        })
      }
    }
    await delay(1000)
    if (needRefresh) {
      const refreshedSet = await tdStore.invoke<StickerSet>({
        _: 'getStickerSet',
        set_id: sticker.set_id,
      })
      await stickerSetRepository.save(refreshedSet)
      for (const sticker of set.stickers) {
        await stickerRepository.save(sticker)
      }
    }
    await loadStickerSets()
  }

  async function loadStickerSets() {
    stickerSets.value = await stickerSetRepository.getAll()
  }

  loadStickerSets()
  return { addSticker, addStickerByEmojiId, stickerSets }
})
