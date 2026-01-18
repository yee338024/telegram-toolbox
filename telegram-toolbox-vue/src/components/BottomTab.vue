<script setup lang="ts">
import { IconPark } from '@icon-park/vue-next/es/all'
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'

const active = ref(0)
const router = useRouter()
const tabs = reactive<{ icon: string, title: string, name: string }[]>([])
for (const route of router.getRoutes().filter(it => it.meta.tab)) {
  tabs.push({
    icon: route.meta.icon as string,
    title: route.meta.title as string,
    name: route.name as string,
  })
}

const tabSwitch = (item: Record<string, unknown>, index: number) => {
  router.push({
    name: (tabs[index]).name as string,
  })
}
</script>

<template>
  <nut-tabbar v-model="active" class="bottom-tab" @tab-switch="tabSwitch">
    <nut-tabbar-item v-for="tab in tabs" :key="tab.title" :tab-title="tab.title">
      <template #icon>
        <IconPark theme="outline" :type="tab.icon" />
      </template>
    </nut-tabbar-item>
  </nut-tabbar>
</template>

<style scoped>
.bottom-tab{
  position: fixed;
  bottom: 0;
  width: 100vw;
}
</style>
