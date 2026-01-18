<script setup lang="ts">
import type { MessageListen } from '@/data/MessageListen.ts'
import { ref } from 'vue'
import { useMessageStore } from '@/stores/useMessageStore.ts'
import MessageListenDialog from '@/views/message/MessageListenDialog.vue'

const props = defineProps<{
  listen: MessageListen
}>()
const messageStore = useMessageStore()

function getTagType(item: MessageListen): 'success' | 'info' | 'warning' | 'danger' | 'primary' {
  if (item.exclude) {
    return 'danger'
  }
  else {
    return 'success'
  }
}
const showEditDialog = ref(false)
function handleDialogConfirm(newListen: MessageListen) {
  messageStore.addListen(newListen)
  showEditDialog.value = false
}
</script>

<template>
  <el-tag class="cursor-pointer" :type="getTagType(listen)" closable @click="showEditDialog = true" @close="messageStore.removeListen(listen.id)">
    {{ listen.pattern }}
  </el-tag>
  <MessageListenDialog
    v-model="showEditDialog"
    :listen="listen"
    @confirm="handleDialogConfirm"
  />
</template>

<style scoped>

</style>
