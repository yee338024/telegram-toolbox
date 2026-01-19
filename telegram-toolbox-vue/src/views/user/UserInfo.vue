<script setup lang="ts">
import type { PropType } from 'vue'
import { Copy, User } from '@icon-park/vue-next'
import { computed } from 'vue'

const props = defineProps({
  user: {
    type: Object as PropType<object>,
    required: true,
  },
})
const emits = defineEmits(['send'])

const avatar = computed(() => {
  if (props.user?.avatar && props.user?.avatar != '0') {
    return `https://wsimages.tlhycz.com/assets/${props.user?.avatar}`
  }
  else {
    return ''
  }
})
</script>

<template>
  <el-card shadow="hover">
    <div class="flex gap-2 w-full items-center">
      <el-avatar>
        <img v-if="avatar" :src="avatar" alt="User Avatar">
        <User v-else size="24" />
      </el-avatar>
      <div class="flex flex-col w-full ">
        <div>{{ user.nickName }}</div>
        <div class="flex items-center gap-1 cursor-pointer">
          ID: {{ user.accountId }} <Copy />
        </div>
      </div>
      <!--      <nut-button size="small" type="primary" @click="emits('send', user)"> -->
      <!--        发送测试消息 -->
      <!--      </nut-button> -->
    </div>
  </el-card>
</template>

<style scoped>
</style>
