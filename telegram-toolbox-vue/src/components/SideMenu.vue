<script setup lang="ts">
import type { RouteRecord } from 'vue-router'
import { Logout } from '@icon-park/vue-next'
import { BrowserWindowApi } from '@widget-js/core'
import { storeToRefs } from 'pinia'
import { reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import FeatherIcon from '@/components/FeatherIcon.vue'
import { useSettingsStore } from '@/stores/useSettingsStore.ts'
import { useTDStore } from '@/stores/useTDStore.ts'

const active = ref(0)
const router = useRouter()
const route = useRoute()
const tdStore = useTDStore()
const { t } = useI18n()
interface MenuTab { icon: string, title: string, name: string, route: RouteRecord }
const tabs = reactive<MenuTab[]>([])
for (const routeItem of router.getRoutes().filter(it => it.meta.tab)) {
  tabs.push({
    icon: routeItem.meta.icon as string,
    title: routeItem.meta.title as string,
    name: routeItem.name as string,
    route: routeItem,
  })
}

function onMenuClick(tab: MenuTab) {
  router.push({
    name: tab.route.name,
  })
}
const logouting = ref(false)
function logout() {
  logouting.value = true
  tdStore.logout().finally(() => {
    logouting.value = false
  })
}

function showGroup() {
  BrowserWindowApi.openUrl('https://t.me/tg_tool_box', { external: true })
}

const settingsStore = useSettingsStore()
const { showDrawer } = storeToRefs(settingsStore)
</script>

<template>
  <div class="side-menu flex flex-col items-center p-2 gap-3">
    <div class="menu-group">
      <div
        v-for="(tab, index) in tabs" :key="index"
        :class="{ active: route.name == tab.route.name }"
        :title="t(tab.route.meta.title)" class="menu-item flex gap-2 cursor-pointer" @click="onMenuClick(tab)"
      >
        <FeatherIcon :name="tab.icon" :size="18" />
        {{ t(tab.route.meta.title) }}
      </div>
      <div
        class="menu-item flex gap-2 cursor-pointer" @click="showDrawer = true"
      >
        <FeatherIcon name="settings" :size="18" />
        {{ t('settings.title') }}
      </div>
    </div>
    <span class="mt-auto" />
    <div class="flex flex-col gap-2 w-full">
      <div>
        <el-button class="w-full" @click="showGroup">
          <template #icon>
            <img style="width:18px" src="@/assets/telegram.png">
          </template> {{ t('common.joinGroup') }}
        </el-button>
      </div>
      <div>
        <el-button v-loading="logouting" class="w-full" @click="logout">
          <template #icon>
            <Logout />
          </template> {{ t('common.logout') }}
        </el-button>
      </div>
    </div>
    <el-text>V 1.0.5</el-text>
  </div>
</template>

<style scoped>
.side-menu{
  width: 180px;
  border-right: #d2d2d2 1px solid;
}
.menu-group{
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: 100%;
}
.menu-item {
  padding: 8px 12px;
  justify-items: center;
  align-items: center;
  box-sizing: border-box;
  border-radius: 4px;
  width: 100%;

  &.active{
   background-color: #419fff;
    color: white;
  }

  &:not(.active):hover {
    background-color: aliceblue;
  }
}
</style>
