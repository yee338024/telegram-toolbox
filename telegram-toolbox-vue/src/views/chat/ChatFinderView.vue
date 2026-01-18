<script setup lang="ts">
import { IdCard, Link, Search } from '@icon-park/vue-next'
import { useStorage } from '@vueuse/core'
import { BrowserWindowApi } from '@widget-js/core'
import { ElMessage } from 'element-plus'
import { storeToRefs } from 'pinia'
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useChatFinderStore } from '@/stores/useChatFinderStore.ts'

const { t } = useI18n()
const chatFinderStore = useChatFinderStore()
const { chats, total, blockSeconds, enable } = storeToRefs(chatFinderStore)
const page = ref(1)
const pageSize = useStorage('pageSize', 10)
const keyword = ref('')
watch([keyword, page, pageSize], () => {
  chatFinderStore.load({
    page: page.value,
    pageSize: pageSize.value,
    keyword: keyword.value,
  })
})

function openUrl(url: string) {
  BrowserWindowApi.openUrl(url, { external: true })
}

function copyUrl(url: string) {
  navigator.clipboard.writeText(url).then(() => {
    ElMessage({
      message: t('chatFinder.copySuccess'),
      type: 'success',
    })
  }).catch(() => {
    // 复制失败
  })
}

const showAlert1 = useStorage('Bohv4Shuro8i', true)
const showAlert2 = useStorage('Bohv4Shuro82', true)
</script>

<template>
  <div class="users-view">
    <el-alert v-if="showAlert1" :title="t('chatFinder.alert1')" style="margin-bottom: 0.5rem" type="primary" @close="showAlert1 = false" />
    <el-alert v-if="showAlert2" :title="t('chatFinder.alert2')" style="margin-bottom: 0.5rem" type="error" @close="showAlert2 = false" />
    <el-alert v-if="blockSeconds > 0" :title="t('chatFinder.blockTip', { blockSeconds })" type="warning" show-icon style="margin-bottom: 1rem" :closable="false" />
    <el-form inline>
      <el-form-item>
        <el-input v-model.lazy="keyword" :placeholder="t('chatFinder.searchPlaceholder')">
          <template #prefix>
            <Search />
          </template>
        </el-input>
      </el-form-item>
      <el-form-item :label="t('chatFinder.enableCollect')">
        <el-switch v-model="enable" />
      </el-form-item>
    </el-form>
    <div v-if="chats.length === 0" class="empty-tip">
      <el-empty :description="t('group.empty')" />
    </div>
    <template v-else>
      <div class="flex flex-col gap-2">
        <el-card v-for="chat in chats" :key="chat.id" body-style="padding: 12px 16px;" shadow="hover">
          <div class="flex items-center w-full">
            <div class="flex-1">
              <div class="text-bold">
                {{ chat.title }}
              </div>
              <div class="flex gap-4">
                <el-text class="cursor-pointer" @click="openUrl(chat.url)">
                  <Link /> {{ chat.url }}
                </el-text>
                <div class="text-sm text-gray-500">
                  <IdCard /> {{ t('chat.idLabel') }} {{ chat.id }}
                </div>
              </div>
            </div>
            <el-button size="small" @click="copyUrl(chat.url)">
              {{ t('chatFinder.copyLink') }}
            </el-button>
          </div>
        </el-card>
      </div>
      <el-pagination
        v-model:current-page="page"
        v-model:page-size="pageSize"
        class="mt-4"
        :total="total"
        :page-sizes="[10, 30, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
      />
    </template>
  </div>
</template>

<style scoped>
.btn-export{
  position: fixed;
  bottom: 72px;
  right: 20px;
  z-index: 1000;
}
.users-view{
  width: 100%;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
}

.empty-tip{
  width: 100%;
}
</style>
