<script setup lang="ts">
import { Setting } from '@icon-park/vue-next'
import { watchDebounced } from '@vueuse/core'
import { BrowserWindowApi } from '@widget-js/core'
import consola from 'consola'
import {
  ElButton,
  ElForm,
  ElFormItem,
  ElInput,
  ElMessage,
} from 'element-plus'
import { storeToRefs } from 'pinia'
import { nextTick, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { TelegramApi } from '@/api/TelegramApi.ts'
import { i18n } from '@/i18n'
import { useSettingsStore } from '@/stores/useSettingsStore.ts'
import { useTDStore } from '@/stores/useTDStore.ts'

const { t } = useI18n()
const router = useRouter()
const loading = ref(false)
const settingsStore = useSettingsStore()
const { showDrawer } = storeToRefs(settingsStore)
const tdStore = useTDStore()
const { apiId, apiHash, phone } = storeToRefs(tdStore)
const code = ref('')
const showCode = ref(false)
watchDebounced(apiId, () => {
  if (apiId.value && apiHash.value) {
    TelegramApi.setApi({
      apiHash: apiHash.value,
      apiId: apiId.value,
    })
  }
}, {
  debounce: 1000,
})

watchDebounced(apiHash, () => {
  if (apiId.value && apiHash.value) {
    TelegramApi.setApi({
      apiHash: apiHash.value,
      apiId: apiId.value,
    })
  }
}, {
  debounce: 1000,
})

async function onSubmit() {
  if (!apiId.value) {
    ElMessage({
      message: t('login.apiIdEmpty'),
      type: 'warning',
    })
    return
  }
  if (!apiHash.value) {
    ElMessage({
      message: t('login.apiHashEmpty'),
      type: 'warning',
    })
    return
  }
  if (!phone.value) {
    ElMessage({
      message: t('login.phoneEmpty'),
      type: 'warning',
    })
    return
  }
  // 移除phone.value所有空格
  phone.value = phone.value.replace(/\s+/g, '')
  loading.value = true
  try {
    await tdStore.login({ phone: phone.value, code: code.value })
  }
  catch (e) {
    if (e.code == 530) {
      showCode.value = true
      ElMessage({
        message: t('login.codeTip'),
        type: 'success',
      })
    }
    else {
      ElMessage({
        message: e.message || t('login.loginFailed'),
        type: 'error',
      })
    }
  }
  finally {
    loading.value = false
  }
}

onMounted(async () => {
  await nextTick()
  const loggedIn = await TelegramApi.isLogin()
  consola.info('LoginView onMounted isLogin', loggedIn)
  if (loggedIn) {
    router.push({ name: 'ChatFinder' })
  }
})

function viewTutorial() {
  const locale = i18n.global.locale
  if (locale == 'en') {
    BrowserWindowApi.openUrl('https://facai365.vip/hunter/guide.html', { external: true })
  }
  else {
    BrowserWindowApi.openUrl(`https://facai365.vip/hunter/${locale}/guide.html`, { external: true })
  }
}

function clickTitle() {
  tdStore.invoke({ _: 'logOut' })
}

async function resendCode() {
  loading.value = true
  try {
    await tdStore.login({ phone: phone.value, code: '' })
  }
  catch (e) {
    if (e.code == 530) {
      showCode.value = true
      ElMessage({
        message: t('login.codeTip'),
        type: 'success',
      })
    }
    else {
      ElMessage({
        message: e.message || t('login.loginFailed'),
        type: 'error',
      })
    }
  }
  finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="login-container flex flex-col items-center justify-center min-h-screen">
    <el-card>
      <div class="flex flex-col items-center">
        <div class="flex w-full items-center text-center">
          <h2 class="w-full" @click="clickTitle">
            {{ t('login.title') }}
          </h2>
        </div>
        <ElForm
          label-width="100px"
          class="login-form"
        >
          <ElFormItem :label="t('login.apiId')">
            <ElInput v-model="apiId" :placeholder="t('login.apiIdPlaceholder')">
              <template #append>
                <ElButton @click="viewTutorial">
                  {{ t('login.guideBtn') }}
                </ElButton>
              </template>
            </ElInput>
          </ElFormItem>
          <ElFormItem :label="t('login.apiHash')">
            <ElInput v-model="apiHash" :placeholder="t('login.apiHashPlaceholder')" type="password" show-password />
          </ElFormItem>
          <ElFormItem :label="t('login.phone')">
            <ElInput v-model="phone" :placeholder="t('login.phonePlaceholder')" />
          </ElFormItem>
          <ElFormItem :label="t('login.code')">
            <ElInput v-model="code" :placeholder="t('login.codePlaceholder')">
              <template #append>
                <ElButton v-loading="loading" @click="resendCode">
                  {{ t('login.sendBtn') }}
                </ElButton>
              </template>
            </ElInput>
          </ElFormItem>

          <!--        <el-form-item> -->
          <!--          <el-checkbox v-model="autoLogin">自动登录</el-checkbox> -->
          <!--        </el-form-item> -->
          <ElFormItem>
            <ElButton v-loading="loading" type="primary" class="w-full" @click="onSubmit">
              {{ t('login.loginBtn') }}
            </ElButton>
          </ElFormItem>
        </ElForm>
        <el-text class="cursor-pointer text-center" @click="showDrawer = true">
          <Setting />  {{ t('settings.title') }}
        </el-text>
      </div>
    </el-card>
  </div>
</template>

<style scoped>
.login-container {
  background: #f5f7fa;
}

.login-form {
  width: 450px;
  padding: 32px 24px;
  border-radius: 8px;
}
</style>
