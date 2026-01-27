<script setup lang="ts">
import { useStorage } from '@vueuse/core'
import { DialogApi } from '@widget-js/core'
import { ref } from 'vue'
import ChatSelector from '@/components/ChatSelector.vue'
import { useMessageStore } from '@/stores/useMessageStore.ts'
import { useTDStore } from '@/stores/useTDStore.ts'
import TelegramMarkdownEditor from '@/views/editor/TelegramMarkdownEditor.vue'

const chat = useStorage('test-chat-editor-view', [] as number[])
const messageStore = useMessageStore()
const text = ref('')
function send() {
  for (const chatId of chat.value) {
    if (filePath.value) {
      if (filePath.value.endsWith('.mp4') || filePath.value.endsWith('.mov') || filePath.value.endsWith('.avi')) {
        messageStore.sendVideoMessage(filePath.value, text.value, chatId)
      }
      else {
        messageStore.sendPhotoMessage(filePath.value, text.value, chatId)
      }
    }
    else {
      messageStore.sendTextMessage(text.value, chatId)
    }
  }
}

const file = ref<File>()
const filePath = ref('')
const tdStore = useTDStore()

async function pickFile() {
  const pickedFile = await DialogApi.pickFile(['png', 'jpg', 'gif', 'mp4', 'mov', 'avi'])
  if (pickedFile) {
    filePath.value = pickedFile
  }
}
</script>

<template>
  <div class="editor-view">
    <el-form label-position="top">
      <el-form-item label="封面（视频/图片）">
        <div class="drop-zone" @click="pickFile">
          <el-text v-if="!filePath">
            选取文件
          </el-text>
          <el-image v-if="filePath" :src="filePath" />
        </div>
      </el-form-item>
      <TelegramMarkdownEditor v-model="text" />
      <el-form-item label="测试聊天">
        <div class="flex gap-2 w-full">
          <ChatSelector v-model="chat" />
          <el-button type="primary" @click="send">
            发送
          </el-button>
        </div>
      </el-form-item>
    </el-form>
  </div>
</template>

<style scoped>
.editor-view{
    padding: 1rem;
    display: flex;
    width: 100%;
    box-sizing: border-box;
    gap: 0.5rem;
    flex-direction: column;
    position: relative;
}

.drop-zone {
  width: 200px;
  border-radius: 8px;
  display: flex;
  justify-items: center;
  cursor: pointer;
  justify-content: center;
  height: 200px;
  background-color: #fafafa;
  &.dropping{
    background-color: #f4f4f4;
  }
}
</style>
