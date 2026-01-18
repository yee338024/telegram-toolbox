<script setup lang="ts">
import type { MessageListen } from '@/data/MessageListen'
import { defineEmits, defineProps, ref, watch } from 'vue'
import {useI18n} from "vue-i18n";
import ChatSelector from "@/components/ChatSelector.vue";

const props = defineProps<{
  modelValue: boolean
  listen?: MessageListen
}>()
const emit = defineEmits(['update:modelValue', 'update:listenForm', 'confirm'])
const  {t} = useI18n()
watch(() => props.listen, () => {
  if (props.listen) {
    localForm.value = {
      ...props.listen,
    }
  }
}, { deep: true })
const localVisible = ref(props.modelValue)
const localForm = ref<MessageListen>(props.listen
  ? { ...props.listen }
  : {
      id: Date.now(),
      type: 'exact',
      pattern: '',
      description: '',
    })

watch(() => props.modelValue, v => localVisible.value = v)
watch(localVisible, v => emit('update:modelValue', v))
watch(localForm, v => emit('update:listenForm', v), { deep: true })

function handleConfirm() {
  emit('confirm', { ...localForm.value })
  localVisible.value = false
}
function handleCancel() {
  localVisible.value = false
}
</script>

<template>
  <el-dialog v-model="localVisible" :title="t('message.listenDialog.title')" width="400px" @close="handleCancel">
    <el-form :model="localForm" label-width="60">
      <el-form-item :label="t('message.listenDialog.type')" prop="type">
        <el-select v-model="localForm.type" style="width: 100%">
          <el-option :label="t('message.listenDialog.regex')" value="regex" />
          <el-option :label="t('message.listenDialog.exact')" value="exact" />
          <el-option :label="t('message.listenDialog.fuzzy')" value="fuzzy" />
        </el-select>
      </el-form-item>
      <el-form-item :label="t('message.listenDialog.pattern')" prop="pattern">
        <el-input v-model="localForm.pattern" :placeholder="t('message.listenDialog.patternPlaceholder')" />
      </el-form-item>
      <el-form-item :label="t('message.listenDialog.exclude')" prop="pattern">
        <el-switch v-model="localForm.exclude" />
      </el-form-item>
      <el-form-item :label="t('message.listenDialog.notify')" prop="pattern" v-show="!localForm.exclude">
        <el-switch v-model="localForm.notify" />
      </el-form-item>
      <el-form-item :label="t('message.listenDialog.forward')" prop="pattern" v-show="!localForm.exclude">
        <chat-selector v-model="localForm.forwardToChats" has-permission />
      </el-form-item>
      <!--      <el-form-item label="描述" prop="description"> -->
      <!--        <el-input v-model="localForm.description" placeholder="可选，描述用途" /> -->
      <!--      </el-form-item> -->
    </el-form>
    <template #footer>
      <el-button @click="handleCancel">
        {{ t('message.listenDialog.cancel') }}
      </el-button>
      <el-button type="primary" @click="handleConfirm">
        {{ t('message.listenDialog.confirm') }}
      </el-button>
    </template>
  </el-dialog>
</template>

<style scoped>

</style>
