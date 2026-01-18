<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useMessageStore } from '@/stores/useMessageStore.ts'
import { useTDStore } from '@/stores/useTDStore.ts'
import ListenDrawer from '@/views/message/ListenDrawer.vue'
import MessageItem from '@/views/message/MessageItem.vue'

const tdStore = useTDStore()
const {} = storeToRefs(tdStore)
const messageStore = useMessageStore()
const { messages, listenList, listenMessage } = storeToRefs(messageStore)
const showDrawer = ref(false)
const { t } = useI18n()

function clearMsg() {
  messageStore.clear()
}

const msgList = computed(() => {
  return listenList.value.length > 0 ? listenMessage.value : messages.value
})
</script>

<template>
  <div class="robot-view">
    <div class="flex">
      <h3 style="margin: 0.5rem">
        {{ t('message.title') }}
      </h3>
      <span class="ml-auto" />
      <div class="flex gap-2">
        <el-button type="primary" @click="clearMsg">
          {{ t('message.clear') }}
        </el-button>
        <el-button type="primary" @click="showDrawer = true">
          {{ t('message.manage') }}
        </el-button>
      </div>
    </div>
    <el-card v-for="(msg, index) in msgList" :key="msg.id" shadow="hover">
      <template #default>
        <MessageItem :msg="msg" />
      </template>
    </el-card>
    <ListenDrawer v-model="showDrawer" />
  </div>
</template>

<style scoped>
.robot-view{
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  position: relative;
}

.mask{
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: calc(100vh - 50px);
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}
</style>
