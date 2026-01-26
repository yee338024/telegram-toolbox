<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useStickerStore } from '@/stores/useStickerStore.ts'

const stickerStore = useStickerStore()
const { stickerSets } = storeToRefs(stickerStore)
</script>

<template>
  <div class="p-4">
    <el-card body-style="padding:12px" v-for="stickerSet in stickerSets" :key="stickerSet.id" shadow="hover" class="mb-4">
      <div class="text-lg font-bold">{{stickerSet.title}}</div>
      <div class="flex flex-wrap gap-1">
        <div v-for="sticker in stickerSet.stickers" :key="sticker.id">
          <img :src="sticker.thumbnail.file.local.path" style="width: 20px;height: 20px">
        </div>
      </div>
    </el-card>
  </div>
</template>

<style scoped>

</style>
