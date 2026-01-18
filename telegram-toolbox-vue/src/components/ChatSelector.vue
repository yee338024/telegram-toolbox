<script setup lang="ts">
import {useTDStore} from "@/stores/useTDStore.ts";
import { useI18n } from 'vue-i18n'
import {Chat} from "@/tdlib-types";
const props = defineProps({
  hasPermission:{
    type:Boolean,
    default:false
  }
})
const model = defineModel<number[]>()
const tdStore = useTDStore()
const { t } = useI18n()

function isDisabled(chat:Chat):boolean {
  if (props.hasPermission) {
    if (chat.permissions.can_send_basic_messages == false) {
      return true
    }
  }
  return false
}

function onclick(){
  if(tdStore.chats.length === 0) {
    tdStore.loadChats()
  }
}
</script>

<template>
  <el-select
    v-model="model"
    :placeholder="t('message.selectChat')"
    multiple
    @click="onclick"
    filterable
    style="width: 300px"
  >
    <el-option
      v-for="chat in tdStore.chats"
      :key="chat.id"
      :disabled="isDisabled(chat)"
      :label="chat.title"
      :value="chat.id"
    />
  </el-select>
</template>

<style scoped>

</style>
