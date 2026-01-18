<script setup lang="ts">
import SideMenu from '@/components/SideMenu.vue'
</script>

<template>
  <div class="common-layout">
    <SideMenu />
    <div class="view-container">
      <router-view />
    </div>
  </div>
</template>

<style scoped>
.common-layout {
  height: 100vh;
  width: 100vw;
  display: flex;
}

.view-container{
  height: 100vh;
  flex: 1;
  overflow: auto;
}
</style>
