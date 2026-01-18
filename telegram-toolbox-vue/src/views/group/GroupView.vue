<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useTDStore } from '@/stores/useTDStore.ts'

const { t } = useI18n()
const tdStore = useTDStore()
const groups = []
function getGroups() {
}

function sendGroupMsg(group: any) {
}
</script>

<template>
  <div class="users-view">
    <div v-if="tdStore.basicGroups.length === 0 && tdStore.superGroups.length == 0" class="empty-tip">
      <nut-empty :description="t('group.empty')" />
    </div>
    <template v-else>
      <h3>{{ t('group.basic') }}</h3>
      <nut-cell v-for="group in tdStore.basicGroups" :key="group.id">
        <div class="flex items-center w-full">
          <div class="flex-1">
            <div class="text-lg">
              {{ group }}
            </div>
            <div class="text-sm text-gray-500">
              ID: {{ group.id }}
            </div>
          </div>
          <nut-button class="ml-auto" size="small" type="primary" @click="sendGroupMsg(group)">
            {{ t('group.sendTest') }}
          </nut-button>
        </div>
      </nut-cell>
      <h3>{{ t('group.super') }}</h3>
    </template>
  </div>
</template>

<style scoped>
.btn-export{
  position: fixed;
  bottom: 72px;
  right: 20px;
  z-index: 1000;
}
.users-view{
  width: 100%;
  padding: 1rem;
  box-sizing: border-box;
}

.empty-tip{
  width: 100%;
}
</style>
