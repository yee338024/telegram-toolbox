import path from 'node:path'
import vue from '@vitejs/plugin-vue'
import consola from 'consola'
import UnoCSS from 'unocss/vite'
import AutoImport from 'unplugin-auto-import/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import Components from 'unplugin-vue-components/vite'
import { defineConfig } from 'vite'

// https://vitejs.dev/config/

export default defineConfig((config) => {
  const mode = config.mode
  consola.info('Vite mode=', mode)
  let base = '/telectron'
  if (mode == 'offline') {
    base = './'
  }
  return {
    base,
    build: {
      target: 'es6',
    },
    plugins: [
      vue({
        template: {
          compilerOptions: {
            isCustomElement: tag => ['webview'].includes(tag),
          },
        },
      }),
      UnoCSS(),
      AutoImport({
        resolvers: [ElementPlusResolver()],
      }),
      Components({
        resolvers: [ElementPlusResolver()],
      }),
    ],
    resolve: {
      alias: [{ find: '@', replacement: path.resolve(__dirname, 'src') }],
    },
  }
})
