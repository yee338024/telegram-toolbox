<script setup lang="ts">
import type { Chat } from '@/tdlib-types'
import { ref, watchEffect } from 'vue'
import { useI18n } from 'vue-i18n'
import { useTDStore } from '@/stores/useTDStore.ts'

const props = defineProps({
  hasPermission: {
    type: Boolean,
    default: false,
  },
})
const model = defineModel<number[]>()
const tdStore = useTDStore()
const { t } = useI18n()
const disabled = ref(false)
async function isDisabled(chat: Chat): boolean {
  if (props.hasPermission) {
    if (chat.permissions.can_send_basic_messages == false) {
      return true
    }
  }
  return false
}

function onclick() {
  if (tdStore.chats.length === 0) {
    tdStore.loadChats()
  }
}
watchEffect(() => {
  for (const chat of tdStore.chats) {
    isDisabled(chat)
  }
})
</script>

<template>
  <el-select
    v-model="model"
    :placeholder="t('message.selectChat')"
    multiple
    filterable
    style="width: 300px"
    @click="onclick"
  >
    <el-option
      v-for="chat in tdStore.chats"
      :key="chat.id"
      :disabled="disabled"
      :label="chat.title"
      :value="chat.id"
    />
  </el-select>
</template>

<style scoped>

</style>
