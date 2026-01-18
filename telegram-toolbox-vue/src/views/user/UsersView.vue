<script setup lang="ts">
import { ref } from 'vue'
import UserInfo from '@/views/user/UserInfo.vue'

const friends = ref([])
function getFriendList() {
}

function sendMsg(user: any) {
}
</script>

<template>
  <div class="users-view">
    <div class="user-list p-4">
      <div v-if="friends.length === 0" class="empty-tip">
        <el-empty description="暂无好友信息" />
      </div>
      <UserInfo v-for="user in friends" :key="user.accountId" :user="user" @send="sendMsg(user)" />
    </div>
    <el-button class="btn-export" type="info" @click="getFriendList">
      获取好友
    </el-button>
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
  box-sizing: border-box;
  overflow: auto;
}

.user-list{
  overflow: auto;
}

.empty-tip{
  width: 100%;
}
</style>
