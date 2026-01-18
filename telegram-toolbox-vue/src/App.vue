<script setup lang="ts">
import type { SupportedLocale } from '@/i18n'
import { useAppLanguage } from '@widget-js/vue3'
import { storeToRefs } from 'pinia'
import { i18n } from '@/i18n'
import { useSettingsStore } from '@/stores/useSettingsStore.ts'
import SettingDrawer from '@/views/settings/SettingDrawer.vue'

const settingsStore = useSettingsStore()
const { showDrawer } = storeToRefs(settingsStore)
function updateLang(lang: SupportedLocale) {
  i18n.global.locale = lang
}
useAppLanguage({
  onLoad: (lang: SupportedLocale) => {
    updateLang(lang)
  },
  onChange: (lang: SupportedLocale) => {
    updateLang(lang)
  },
})
</script>

<template>
  <div>
    <router-view />
    <SettingDrawer v-model="showDrawer" />
  </div>
</template>

<style scoped>

</style>
