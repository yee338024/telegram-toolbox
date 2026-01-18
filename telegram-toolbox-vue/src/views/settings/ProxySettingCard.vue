<script setup lang="ts">
import type { ProxySettings } from '@/api/TelegramApi.ts'
import { Setting } from '@icon-park/vue-next'
import consola from 'consola'
import { ElMessage } from 'element-plus'
import { onMounted, ref, toRaw } from 'vue'
import { useI18n } from 'vue-i18n'
import { TelegramApi } from '@/api/TelegramApi.ts'
import { useTDStore } from '@/stores/useTDStore.ts'

const tdStore = useTDStore()
const { t } = useI18n()

// 代理类型选项
const proxyTypes = [
  { label: 'SOCKS5', value: 'proxyTypeSocks5' },
  { label: 'HTTP', value: 'proxyTypeHttp' },
  { label: 'MTProto', value: 'proxyTypeMtproto' },
]
const form = ref<ProxySettings>({
  type: 'proxyTypeSocks5',
  server: '',
  port: '',
  username: '',
  password: '',
  secret: '',
  http_only: false,
})

// 表单数据
const visible = defineModel<boolean>() // 控制对话框显示
const isEdit = ref(false) // 是否编辑模式

onMounted(() => {
  TelegramApi.getProxy().then((proxy) => {
    if (proxy) {
      form.value = proxy
    }
  }).catch((e) => {
    consola.error('getProxy error', e)
    ElMessage({
      message: e.message,
      type: 'error',
    })
  })
})
function handleClose() {
  visible.value = false
}

async function onSave() {
  TelegramApi.setProxy(toRaw(form.value)).catch((e) => {
    ElMessage({
      message: e.message,
      type: 'error',
    })
  }).finally(() => {
    visible.value = false
  })
}
</script>

<template>
  <el-card shadow="hover">
    <el-form :model="form" label-width="100px" status-icon>
      <el-form-item :label="t('proxy.type')" prop="type">
        <el-select v-model="form.type" :placeholder="t('proxy.selectType')">
          <el-option v-for="item in proxyTypes" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item :label="t('proxy.server')" prop="server">
        <el-input v-model="form.server" :clearable="false" :placeholder="t('proxy.serverPlaceholder')" />
      </el-form-item>
      <el-form-item :label="t('proxy.port')" prop="port">
        <el-input v-model="form.port" :placeholder="t('proxy.port')" type="number" />
      </el-form-item>
      <template v-if="form.type === 'proxyTypeSocks5' || form.type === 'proxyTypeHttp'">
        <el-form-item :label="t('proxy.username')">
          <el-input v-model="form.username" :placeholder="t('proxy.username')" />
        </el-form-item>
        <el-form-item :label="t('proxy.password')">
          <el-input v-model="form.password" :placeholder="t('proxy.password')" type="password" />
        </el-form-item>
      </template>
      <template v-if="form.type === 'proxyTypeHttp'">
        <el-form-item :label="t('proxy.httpOnly')">
          <el-switch v-model="form.http_only" />
        </el-form-item>
      </template>
      <template v-if="form.type === 'proxyTypeMtproto'">
        <el-form-item :label="t('proxy.secret')">
          <el-input v-model="form.secret" :placeholder="t('proxy.secret')" />
        </el-form-item>
      </template>
      <el-button type="primary" @click="onSave">
 {{ t('proxy.save') }}
      </el-button>
    </el-form>
  </el-card>
</template>

<style scoped>

</style>
