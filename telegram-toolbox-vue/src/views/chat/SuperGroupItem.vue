<script setup lang="ts">
import type {
  chat,
  chatMembers,
  chatTypeSupergroup,
  supergroupFullInfo,
  User,
} from '@/tdlib-types.ts'
import { IdCard, PreviewCloseOne, User as UserIcon } from '@icon-park/vue-next'
import { useWindowSize } from '@vueuse/core'
import consola from 'consola'
import { ElMessage } from 'element-plus'
import { defineProps, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import * as XLSX from 'xlsx'
import { useTDStore } from '@/stores/useTDStore.ts'
import { TelegramUtils } from '@/utils/TelegramUtils.ts'

const props = defineProps<{ chat: chat }>()
const group = ref<supergroupFullInfo>()
const tdStore = useTDStore()
const { t } = useI18n()

const chatType = props.chat.type as chatTypeSupergroup
const showDrawer = ref(false)
const page = ref(1)
const loadingMembers = ref(false)
const members = ref<User[]>([])
async function loadMembers() {
  if (loadingMembers.value) {
    return
  }
  consola.info('loadMembers', page.value)
  loadingMembers.value = true
  try {
    const result = await tdStore.invoke<chatMembers>({
      _: 'getSupergroupMembers',
      supergroup_id: chatType.supergroup_id,
      limit: 30,
      offset: (page.value - 1) * 30,
    })
    if (result.members) {
      for (const member of result.members) {
        const memberId = member.member_id
        if (memberId._ == 'messageSenderUser') {
          const userId = memberId.user_id
          if (members.value.find(it => userId == it.id)) {
            continue
          }
          const user = await tdStore.getUser(userId)
          if (user) {
            members.value.push(user)
          }
        }
      }
    }
  }
  catch (e) {

  }
  page.value = page.value + 1
  loadingMembers.value = false
}
let superGroupId = -1
if (props.chat.type._ == 'chatTypeSupergroup') {
  superGroupId = props.chat.type.supergroup_id
  tdStore.getSuperGroupInfo(superGroupId).then((res) => {
    group.value = res
  })
  loadMembers()
}

function copyUserName(member: User) {
  const userName = `@${TelegramUtils.getUserName(member)}`
  navigator.clipboard.writeText(userName ?? '').then(() => {
    ElMessage({
      message: `已复制：${userName}`,
      type: 'success',
    })
  }).catch(() => {
    // 复制失败
  })
}

const exporting = ref(false)
async function exportExcel() {
  if (exporting.value) {
    return
  }
  exporting.value = true
  try {
    const users = await TelegramUtils.getAllSuperGroupMembers(superGroupId, group.value!.member_count)
    // 把已删除的用户排在最后面
    users.sort((a, b) => {
      if (a.type._ == 'userTypeDeleted' && b.type._ != 'userTypeDeleted') {
        return 1
      }
      else if (a.type._ != 'userTypeDeleted' && b.type._ == 'userTypeDeleted') {
        return -1
      }
      return 0
    })
    const excelData = []
    const fileName = props.chat.title
    for (const user of users) {
      let typeStr = t('superGroup.userType.normal')
      if (user.type._ == 'userTypeBot') {
        typeStr = t('superGroup.userType.bot')
      }
      else if (user.type._ == 'userTypeDeleted') {
        typeStr = t('superGroup.userType.deleted')
      }
      else if (user.type._ == 'userTypeUnknown') {
        typeStr = t('superGroup.userType.unknown')
      }
      let onlineStr = t('superGroup.onlineStatus.unknown')
      if (user.status._ == 'userStatusOnline') {
        onlineStr = t('superGroup.onlineStatus.online')
      }
      else if (user.status._ == 'userStatusOffline') {
        onlineStr = t('superGroup.onlineStatus.offline')
      }
      const premiumStr = user.is_premium ? t('superGroup.premium.yes') : t('superGroup.premium.no')
      excelData.push({
        [t('superGroup.exportHeaders.nickname')]: `${user.first_name} ${user.last_name}`,
        [t('superGroup.exportHeaders.id')]: user.id,
        [t('superGroup.exportHeaders.username')]: TelegramUtils.getUserName(user, true),
        [t('superGroup.exportHeaders.userType')]: typeStr,
        [t('superGroup.exportHeaders.onlineStatus')]: onlineStr,
        [t('superGroup.exportHeaders.premium')]: premiumStr,
      })
    }
    // 生成 worksheet
    const ws = XLSX.utils.json_to_sheet(excelData)
    ws['!cols'] = [{ wpx: 150 }, { wpx: 100 }, { wpx: 100 }, { wpx: 100 }, { wpx: 100 }, { wpx: 100 }]
    // 生成 workbook
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, t('superGroup.memberList'))
    // 导出
    XLSX.writeFile(wb, `${fileName}.xlsx`)
  }
  catch (e) {
    ElMessage({
      message: t('superGroup.exportFailed', { error: e }),
      type: 'error',
    })
    consola.error(e)
  }
  exporting.value = false
}

const { height: windowHeight } = useWindowSize()
</script>

<template>
  <el-card v-if="group" body-style="padding: 12px 16px" shadow="hover">
    <div class="flex items-center w-full">
      <div class="flex-1">
        <div class="font-bold">
          {{ props.chat.title }}
        </div>
        <div class="flex gap-4">
          <el-text class="text-sm text-gray-500">
            <IdCard />
            {{ props.chat.id }}
          </el-text>
          <el-text>
            <UserIcon />
            {{ group.member_count }}
          </el-text>
          <el-text v-if="group.has_hidden_members">
            <PreviewCloseOne />{{ t('superGroup.hiddenMembers') }}
          </el-text>
        </div>
      </div>
      <div class="ml-auto">
        <el-button v-if="group.can_get_members" @click="showDrawer = true">
          {{ t('superGroup.viewMembers') }}
        </el-button>
        <el-button v-if="group.can_get_members" v-loading="exporting" @click="exportExcel">
          {{ t('superGroup.exportExcel') }}
        </el-button>
      </div>
    </div>
    <el-drawer v-if="group.can_get_members" v-model="showDrawer" :title="t('superGroup.memberList')" :size="400">
      <div v-infinite-scroll="loadMembers" style="padding: 0;margin: 0" :style="{ height: `calc(${windowHeight}px - 120px)`, overflow: 'auto' }">
        <div class="flex flex-col gap-2">
          <el-card
            v-for="member in members" :key="member.id" body-style="padding: 12px 16px;"
            shadow="hover"
          >
            <div class="flex flex-col">
              <div> {{ member.first_name }} {{ member.last_name }}</div>
              <div class="flex gap-4">
                <el-text>     <IdCard />  {{ member.id }}</el-text>
                <el-text v-if="TelegramUtils.getUserName(member)" class="cursor-pointer" @click="copyUserName(member)">
                  @{{ TelegramUtils.getUserName(member) }}
                </el-text>
              </div>
            </div>
          </el-card>
        </div>
      </div>
    </el-drawer>
  </el-card>
</template>

<style scoped>

</style>
