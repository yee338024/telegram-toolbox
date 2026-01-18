<script setup lang="ts">
import type { BasicGroupFullInfo, chat, SupergroupFullInfo } from '@/tdlib-types.ts'
import { computed, defineProps, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useTDStore } from '@/stores/useTDStore.ts'
import SuperGroupItem from '@/views/chat/SuperGroupItem.vue'

const props = defineProps<{ chat: chat }>()
const tdStore = useTDStore()
const { t } = useI18n()
const isGroup = computed(() => {
  return props.chat.type._ == 'chatTypeBasicGroup' || props.chat.type._ == 'chatTypeSupergroup'
})

const superGroup = ref<SupergroupFullInfo>()
const group = ref<BasicGroupFullInfo>()

const hasViewMemberPermission = computed(() => {
  if (superGroup.value) {
    return !superGroup.value.has_hidden_members && !superGroup.value.can_get_members
  }
  else if (group.value && group.value.members) {
    return true
  }
  return false
})
</script>

<template>
  <SuperGroupItem v-if="chat.type._ == 'chatTypeSupergroup'" :chat="chat" />
  <el-card v-else body-style="padding: 12px 16px" shadow="hover">
    <div class="flex items-center w-full">
      <div class="flex-1">
        <div class="font-bold">
          {{ props.chat.title }}
        </div>
        <div class="text-sm text-gray-500">
          {{ t('chat.idLabel') }} {{ props.chat.id }}
        </div>
      </div>
      <div class="ml-auto" />
    </div>
  </el-card>
</template>

<style scoped>
</style>
