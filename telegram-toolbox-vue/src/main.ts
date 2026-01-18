import { WidgetJsPlugin } from '@widget-js/vue3'
import { createPinia } from 'pinia'
import { createApp } from 'vue'
import { i18n } from '@/i18n'
import App from './App.vue'
import router from './router'
import './assets/main.css'

import '@widget-js/vue3/dist/style.css'
import 'element-plus/dist/index.css'
import '@icon-park/vue-next/styles/index.css'
import '@nutui/touch-emulator'
import 'virtual:uno.css'

const app = createApp(App)

app.use(createPinia())
app.use(createPinia())
app.use(router)
  .use(WidgetJsPlugin)
app.use(i18n)

app.mount('#app')
