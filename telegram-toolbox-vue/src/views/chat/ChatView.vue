<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useTDStore } from '@/stores/useTDStore.ts'
import ChatItem from './ChatItem.vue'

const tdStore = useTDStore()
const { t } = useI18n()
const chatType = ref('all')
const chatTypeOptions = [
  { label: t('chatTypePrivate'), value: 'chatTypePrivate' },
  { label: t('chatTypeBasicGroup'), value: 'chatTypeBasicGroup' },
  { label: t('chatTypeSupergroup'), value: 'chatTypeSupergroup' },
  { label: t('chatTypeSecret'), value: 'chatTypeSecret' },
]
const filteredChats = computed(() => {
  if (chatType.value === 'all') {
    return tdStore.chats
  }
  return tdStore.chats.filter(chat => chat.type._ === chatType.value)
})
</script>

<template>
  <div class="users-view">
    <el-form-item :label="t('chat.type')" style="width: 200px">
      <el-select v-model="chatType">
        <el-option :label="t('chat.all')" value="all" />
        <el-option v-for="opt in chatTypeOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
      </el-select>
    </el-form-item>
    <div v-if="filteredChats.length === 0" class="empty-tip">
      <el-empty :description="t('chat.empty')" />
    </div>
    <template v-else>
      <div class="flex flex-col gap-2">
        <ChatItem v-for="chat in filteredChats" :key="chat.id" :chat="chat" :t="t" />
      </div>
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
  box-sizing: border-box;
}

.empty-tip{
  width: 100%;
}
</style>
