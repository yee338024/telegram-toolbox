<script setup lang="ts">
import {nextTick, onMounted} from "vue";
import feather from 'feather-icons'
const props = defineProps<{
  name?: string
  size?: number
}>()

onMounted(async ()=>{
  await nextTick()
  feather.replace({
    width: props.size,
    height:props.size,
  })
})
</script>

<template>
 <div class="feather-icon flex items-center">
   <i :data-feather="name" />
 </div>
</template>

<style scoped>

</style>
