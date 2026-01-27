<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { computed, ref } from 'vue'
import { useStickerStore } from '@/stores/useStickerStore.ts'

const stickerStore = useStickerStore()
const { stickerSets } = storeToRefs(stickerStore)

// pagination state
const page = ref(1)
const pageSize = ref(20)

const total = computed(() => (stickerSets?.value?.length ?? 0))

const pagedStickerSets = computed(() => {
  const sets = stickerSets?.value ?? []
  const start = (page.value - 1) * pageSize.value
  return sets.slice(start, start + pageSize.value)
})
</script>

<template>
  <div class="p-4">
    <div v-if="total === 0" class="text-gray-500">
      暂无表情包
    </div>

    <el-card v-for="stickerSet in pagedStickerSets" :key="stickerSet.id" body-style="padding:12px" shadow="hover" class="mb-4">
      <div class="text-lg font-bold">
        {{ stickerSet.title }}
      </div>
      <div class="flex flex-wrap gap-1">
        <div v-for="sticker in stickerSet.stickers" :key="sticker.id">
          <img v-if="sticker.thumbnail && sticker.thumbnail.file && sticker.thumbnail.file.local" :src="sticker.thumbnail.file.local.path" style="width: 20px;height: 20px">
        </div>
      </div>
    </el-card>

    <div v-if="total > 0" class="mt-4">
      <el-pagination
        v-model:current-page="page"
        v-model:page-size="pageSize"
        :total="total"
        :page-sizes="[5, 10, 20, 50]"
        layout="total, sizes, prev, pager, next, jumper"
      />
    </div>
  </div>
</template>

<style scoped>

</style>
