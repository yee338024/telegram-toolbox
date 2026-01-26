import path from 'node:path'
import vue from '@vitejs/plugin-vue'
import consola from 'consola'
import { presetIcons, presetUno } from 'unocss'
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
      UnoCSS({
        presets: [
          presetUno(),
          presetIcons({
            scale: 1.2,
            warn: true,
            extraProperties: {
              'display': 'inline-block',
              'vertical-align': 'middle',
              // ...
            },
          }),
        ],
      }),
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
