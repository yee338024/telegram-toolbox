import consola from 'consola'
import { createRouter, createWebHistory } from 'vue-router'
import { TelegramApi } from '@/api/TelegramApi.ts'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/home',
      name: 'home',
      component: () => import('../components/HomeLayout.vue'),
      children: [
        {
          path: '/contacts',
          name: 'contacts',
          component: () => import('../views/user/UsersView.vue'),
          meta: {
            title: 'user.contacts',
            icon: 'user',
            tab: false,
          },
        },
        {
          path: '/chats',
          name: 'chats',
          component: () => import('../views/chat/ChatView.vue'),
          meta: {
            title: 'chat.title',
            icon: 'message-square',
            tab: true,
          },
        },

        {
          path: '/message',
          name: 'message',
          component: () => import('../views/message/MessageView.vue'),
          meta: {
            title: 'message.title',
            icon: 'filter',
            tab: true,
          },
        },
        {
          path: '/',
          name: 'ChatFinder',
          component: () => import('../views/chat/ChatFinderView.vue'),
          meta: {
            title: 'chatFinder.title',
            icon: 'users',
            tab: true,
          },
        },
        {
          path: '/sticker',
          name: 'Sticker',
          component: () => import('../views/sticker/StickerView.vue'),
          meta: {
            title: '表情采集',
            icon: 'smile',
            tab: true,
          },
        },
        {
          path: '/editor',
          name: 'Editor',
          component: () => import('../views/editor/EditorView.vue'),
          meta: {
            title: '消息编辑器',
            icon: 'edit',
            tab: true,
          },
        },
      ],
    },
    {
      path: '/',
      name: 'login',
      component: () => import('../views/login/LoginView.vue'),
      meta: {
        title: 'message.title',
        icon: 'message',
        tab: false,
      },
    },
  ],
})

router.beforeEach(async (to, from, next) => {
  consola.info(`Navigating to ${to.name} from ${from.name}`)
  if (to.name == undefined) {
    return next({ name: 'login' })
  }
  if (to.name === 'login') {
    return next()
  }
  // 判断是否登录
  const loggedIn = await TelegramApi.isLogin()
  if (!loggedIn) {
    // 未登录则跳转到 login 页面
    return next({ name: 'login' })
  }
  // 已登录则放行
  next()
})

export default router
