<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'
import { useSettingsStore } from '@/stores/useSettingsStore.ts'
import ProxySettingCard from '@/views/settings/ProxySettingCard.vue'

const { t } = useI18n()
const model = defineModel<boolean>()

const settingsStore = useSettingsStore()
const { language, groupDailyFetchCount } = storeToRefs(settingsStore)

function onLanguageChange(val: 'en' | 'zh') {
  settingsStore.setLanguage(val)
}
</script>

<template>
  <el-drawer v-model="model" size="500" :title="t('settings.title')">
    <div class="flex flex-col gap-4">
      <div class="font-bold">
        {{ t('proxy.title') }}
      </div>
      <ProxySettingCard />
      <div class="font-bold">
        {{ t('settings.otherTitle') }}
      </div>
      <el-card shadow="hover">
        <el-form label-width="130" label-position="top">
          <el-form-item :label="t('settings.language')">
            <el-select v-model="language" style="width: 120px" @change="onLanguageChange">
              <el-option :label="t('settings.languageZh')" value="zh" />
              <el-option :label="t('settings.languageEn')" value="en" />
            </el-select>
          </el-form-item>
          <el-form-item :label="t('settings.groupDailyFetchCount')">
            <el-input-number v-model="groupDailyFetchCount" :min="0" :max="1000" />
          </el-form-item>
        </el-form>
      </el-card>
    </div>
  </el-drawer>
</template>

<style scoped>

</style>
