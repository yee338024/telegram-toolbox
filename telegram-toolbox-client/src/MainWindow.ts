import type { IAppContext } from '@widget-js/electron-common'
import type { MenuItemConstructorOptions } from 'electron'
import { delay } from '@widget-js/core'
import { BaseWindow } from '@widget-js/electron-common'
import contextMenu from 'electron-context-menu'
import { appContext } from './app'
import { i18n } from './i18n/i18n'

export class MainWindow extends BaseWindow {
  static instance: MainWindow

  static getInstance() {
    if (!this.instance || this.instance.isDestroyed()) {
      this.instance = new MainWindow(appContext)
    }
    return this.instance
  }

  protected onClose(e: Electron.Event) {
    e.preventDefault()
    this.hide()
  }

  constructor(context: IAppContext) {
    super(context, {
      width: 1000,
      customId: 'main',
      height: 700,
      minWidth: 800,
      minHeight: 600,
      frame: true,
      maximizeWindow: false,
    })
    this.loadURL('/')

    const dispose = contextMenu({
      labels: {
        copyLink: i18n.t('tray.copyLink'),
        copy: i18n.t('tray.copy'),
        saveImage: i18n.t('tray.saveImage'),
        copyImage: i18n.t('tray.copyImage'),
        paste: i18n.t('tray.paste'),
        cut: i18n.t('tray.cut'),
        inspect: i18n.t('tray.inspect'),
      },
      prepend: (defaultActions, params, browserWindow) => {
        const menus: MenuItemConstructorOptions[] = [
          {
            label: i18n.t('tray.reload'),
            role: 'reload',
          },
        ]
        return menus
      },
      showInspectElement: false,
      showSelectAll: false,
      window: this.window,
    })

    this.window.once('closed', () => {
      dispose()
    })

    this.window.webContents.on('will-navigate', (e) => {
      console.log('will-navigate to ', e.url)
    })

    this.window.webContents.on('did-fail-load', async (event: Event, errorCode: number, errorDescription: string, validatedURL: string, isMainFrame: boolean, frameProcessId: number, frameRoutingId: number) => {
      console.log(event, errorCode, validatedURL)
      //  Failed to load URL: file:/// with error: ERR_FILE_NOT_FOUND
      if (errorCode == -6) {
        await delay(500)
        this.loadURL('/')
      }
    })
  }
}
