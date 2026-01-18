<script setup lang="ts">
import type { MessageListen } from '@/data/MessageListen.ts'
import { storeToRefs } from 'pinia'
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import ChatSelector from '@/components/ChatSelector.vue'
import { useMessageStore } from '@/stores/useMessageStore.ts'
import MessageListenDialog from '@/views/message/MessageListenDialog.vue'
import MessageListenTag from '@/views/message/MessageListenTag.vue'

const showDrawer = defineModel<boolean>()
const messageStore = useMessageStore()
const { listenList, excludeChats } = storeToRefs(messageStore)
const { t } = useI18n()

// 新增监听对话框相关
const dialogVisible = ref(false)

function openAddDialog() {
  dialogVisible.value = true
}
function closeDialog() {
  dialogVisible.value = false
}
function handleDialogConfirm(newListen: MessageListen) {
  newListen.id = Date.now()
  messageStore.addListen(newListen)
  dialogVisible.value = false
}
</script>

<template>
  <el-drawer v-model="showDrawer" :title="t('message.manage')" size="400">
    <div class="flex flex-col w-full h-full">
      <el-form-item :label="t('message.excludeChats')">
        <ChatSelector v-model="excludeChats" />
      </el-form-item>
      <el-form-item :label="t('message.listenCondition')">
        <div class="flex w-full gap-2 flex-wrap">
          <el-button type="primary" class="w-full" @click="dialogVisible = true">
            {{ t('message.add') }}
          </el-button>
          <MessageListenTag v-for="item in listenList" :key="item.id" :listen="item" />
        </div>
      </el-form-item>
    </div>
    <MessageListenDialog
      v-model="dialogVisible"
      @confirm="handleDialogConfirm"
    />
  </el-drawer>
</template>

<style scoped>

</style>
