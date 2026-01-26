<script setup lang="ts">
import type { Stickers, StickerSet } from '@/tdlib-types.ts'
import { useStorage } from '@vueuse/core'
import { ref } from 'vue'
import ChatSelector from '@/components/ChatSelector.vue'
import FeatherIcon from '@/components/FeatherIcon.vue'
import { useMessageStore } from '@/stores/useMessageStore.ts'
import { useTDStore } from '@/stores/useTDStore.ts'
import TelegramMarkdownEditor from '@/views/editor/TelegramMarkdownEditor.vue'

const chat = useStorage('test-chat-editor-view', [] as number[])
const messageStore = useMessageStore()
const text = ref('')
const isBold = ref(false)
function sendText() {
  messageStore.sendTextMessage(text.value, chat.value[0], true)
}

const tdStore = useTDStore()

</script>

<template>
  <div class="editor-view">
    <el-form label-position="top">
      <el-form-item label="封面（视频/图片）">
        <el-upload
          drag
          class="w-full"
          action="https://run.mocky.io/v3/9d059bf9-4660-45f2-925d-ce80ad6c4d15"
          multiple
        >
          <div class="flex items-center justify-center w-full">
            <FeatherIcon name="upload" :size="32" />
          </div>
          <div class="el-upload__text">
            拖动文件到此处 或 <em>点击上传</em>
          </div>
        </el-upload>
      </el-form-item>
      <TelegramMarkdownEditor v-model="text" />
      <el-form-item label="测试聊天">
        <div class="flex gap-2 w-full">
          <ChatSelector v-model="chat" has-permission />
          <el-checkbox v-model="isBold">
            粗体
          </el-checkbox>
          <el-button type="primary" @click="sendText">
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
</style>
