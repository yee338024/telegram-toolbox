import type { IAppContext } from '@widget-js/electron-common'
import type { AppContext } from './app'
import { BaseWindow } from '@widget-js/electron-common'
import openAboutWindow from 'about-window'
import { app, Menu, MenuItem, Tray } from 'electron'
import { appContext } from './app'
import { i18n } from './i18n/i18n'
import { MainWindow } from './MainWindow'

class TrayManagerImpl {
  private tray?: Tray
  private context: IAppContext
  destroy() {
    this.tray?.destroy()
  }

  constructor() {}
  init(context: AppContext) {
    this.context = context
    const iconPath = appContext.file.getIconFile('icon_32.ico')
    this.tray = new Tray(iconPath)
    this.tray.on('click', () => {
      MainWindow.getInstance().show()
      MainWindow.getInstance().focus()
    })
    this.updateMenu()
  }

  updateMenu() {
    console.log(i18n.getLocale())
    const settingMenu = new MenuItem({
      label: i18n.t('tray.setting'),
      click: () => {
        const win = new BaseWindow(this.context, {
          customId: 'settings',
          width: 700,
          titleBarStyle: 'hidden',
          partition: 'persist:cn.widgetjs.widgets.ai.assistant',
          height: 500,
        })
        win.loadURL('widget/config/chatgpt?frame=true&transparent=false')
      },
    })
    const languageMenu = new MenuItem({
      label: i18n.t('tray.language.title'),
      submenu: [
        {
          type: 'checkbox',
          label: i18n.t('tray.language.zh'),
          click: () => {
            this.context.setLocale('zh')
            this.updateMenu()
          },
          checked: this.context.config.locale == 'zh',
        },
        {
          type: 'checkbox',
          label: i18n.t('tray.language.en'),
          click: () => {
            this.context.setLocale('en')
            this.updateMenu()
          },
          checked: this.context.config.locale == 'en',
        },
      ],
    })
    const exitMenu = new MenuItem({
      label: i18n.t('tray.exit'),
      click: () => {
        app.exit(0)
        process.exit(0)
      },
    })
    const startupMenu = new MenuItem({
      label: i18n.t('tray.startup'),
      type: 'checkbox',
      checked: false,

    })
    const aboutMenu = new MenuItem({
      label: i18n.t('tray.about'),
      click: () => {
        openAboutWindow({
          icon_path: appContext.file.getIconFile('icon.png'),
          product_name: appContext.config.title,
          description: '',
          copyright: appContext.config.copyright,
          homepage: appContext.config.homepage,
          use_version_info: [
            ['app', app.getVersion()],
            ['electron', process.versions.electron],
            ['chrome', process.versions.chrome],
            ['node', process.versions.node],
            ['v8', process.versions.v8],
          ],
        })
      },
    })
    const contextMenu = Menu.buildFromTemplate([
      languageMenu,
      settingMenu,
      startupMenu,
      { type: 'separator' },
      aboutMenu,
      exitMenu,
    ])
    // if (config.isDev) {
    //     contextMenu.append(demoMenu)
    // }
    this.tray.setContextMenu(contextMenu)
  }
}

const TrayManager = new TrayManagerImpl()
export default TrayManager
