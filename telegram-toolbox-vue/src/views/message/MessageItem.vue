<script setup lang="ts">
import type { BasicGroupFullInfo, Chat, Message, SupergroupFullInfo, User } from '@/tdlib-types.ts'
import { Copy, Delete } from '@icon-park/vue-next'
import { useWindowSize } from '@vueuse/core'
import { BrowserWindowApi, ClipboardApi } from '@widget-js/core'
import { computed, ref, watchEffect } from 'vue'
import { useI18n } from 'vue-i18n'
import { useMessageStore } from '@/stores/useMessageStore.ts'
import { useTDStore } from '@/stores/useTDStore.ts'
import { MessageUtils } from '@/utils/MessageUtils.ts'

const props = defineProps<{
  msg: Message
}>()

const tdStore = useTDStore()
const chat = ref<Chat>()
const groupTitle = ref('')
const groupInfo = ref<BasicGroupFullInfo>()
const { width } = useWindowSize()
const superGroupInfo = ref<SupergroupFullInfo>()
const sender = ref<User>()
const msgStore = useMessageStore()
const { t } = useI18n()
function copyText(msg: Message) {
  ClipboardApi.writeText(text.value ?? '')
}

tdStore.getChat(props.msg.chat_id).then((c) => {
  chat.value = c
})
const isGroup = computed(() => {
  if (chat.value) {
    const type = chat.value.type
    if (chat.value) {
      return type._ == 'chatTypeBasicGroup' || type._ == 'chatTypeSupergroup'
    }
  }
  return false
})

if (props.msg.sender_id._ == 'messageSenderChat') {
}
else if (props.msg.sender_id._ == 'messageSenderUser') {
  tdStore.getUser(props.msg.sender_id.user_id).then((u) => {
    sender.value = u
  })
}

watchEffect(() => {
  if (chat.value) {
    const type = chat.value.type
    if (type._ == 'chatTypeBasicGroup') {
      tdStore.getBasicGroupInfo(type.basic_group_id).then((res) => {
        groupInfo.value = res
      })
    }
    else if (type._ == 'chatTypeSupergroup') {
      tdStore.getSuperGroupInfo(type.supergroup_id).then((res) => {
        superGroupInfo.value = res
      })
    }
  }
})

const text = computed(() => {
  return MessageUtils.getContentTextWithDefault(props.msg)
})

const nickName = computed(() => {
  if (sender.value) {
    return `${sender.value.first_name} ${sender.value.last_name}`
  }
  return ''
})

function clickNickName() {
  if (sender.value) {
    const usernames = sender.value.usernames
    if (usernames) {
      const username = usernames.active_usernames[0]
      BrowserWindowApi.openUrl(`https://t.me/${username}`, { external: true })
    }
  }
}

function deleteMsg(msg: Message) {
  msgStore.removeMsg(msg)
}
</script>

<template>
  <div class="flex w-full">
    <div class="text flex gap-1 flex-1 flex-wrap">
      <el-tag v-if="isGroup" type="warning" size="small">
        {{ t('groupTag') }}
      </el-tag>
      <el-tag v-if="isGroup" size="small">
        {{ chat.title }}
      </el-tag>
      <el-tag v-if="nickName" type="info" size="small" class="cursor-pointer" @click="clickNickName">
        @{{ nickName }}
      </el-tag>
      <div style="white-space: pre-wrap;overflow: auto" :style="{ 'max-width': `${width - 300}px` }">
        {{ text }}
      </div>
    </div>
    <span class="ml-auto" />
    <el-button size="small" @click="deleteMsg(msg)">
      <Delete />
    </el-button>
    <el-button size="small" @click="copyText(msg)">
      <Copy />
    </el-button>
  </div>
</template>

<style scoped>

</style>
