import type { TelegramApiConfig } from './ipc/TelegramIpcHandler'
import process from 'node:process'
import {
  BroadcastChannelHandler,
  BrowserWindowChannelHandler,
  ClipboardChannelHandler,
  ShortcutChannelHandler,
  store,
  SystemChannelHandler,
} from '@widget-js/electron-common'
import consola from 'consola'
import { app, Menu } from 'electron'
import { appContext } from './app'
import { MyAppChannelHandler } from './ipc/MyAppChannelHandler'
import { TelegramIpcHandler } from './ipc/TelegramIpcHandler'
import { MainWindow } from './MainWindow'
import { defaultTDWebsocket } from './TDWebsocket'
import TrayManager from './TrayManager'

app.commandLine.appendSwitch('no-sandbox')
Menu.setApplicationMenu(null)

const lock = app.requestSingleInstanceLock()
if (!lock) {
  console.info('Single instance lock')
  app.quit()
}
else {
  app.on('ready', async () => {
    const apiConfig = store.get('apiConfig') as TelegramApiConfig
    consola.info('Telegram config info', apiConfig)
    if (apiConfig && apiConfig.apiId && apiConfig.apiHash) {
      await defaultTDWebsocket.setApiConfig(apiConfig)
      await defaultTDWebsocket.startWSS()
    }

    new BrowserWindowChannelHandler(appContext)
    new BroadcastChannelHandler(appContext)
    new TelegramIpcHandler(appContext)
    new ShortcutChannelHandler(appContext)
    new SystemChannelHandler(appContext)
    new MyAppChannelHandler(appContext)
    new ClipboardChannelHandler(appContext)
    TrayManager.init(appContext)
    MainWindow.getInstance().show()
  })

  app.on('before-quit', async () => {
    console.log('before-quit')
    app.exit()
  })

  process.on('message', (data) => {
    if (data === 'graceful-exit') {
      app.quit()
    }
  })
}
