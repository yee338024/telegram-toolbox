import type { IAppConfig } from '@widget-js/electron-common'
import path from 'node:path'
import process from 'node:process'
import { IAppContext } from '@widget-js/electron-common'
import consola from 'consola'

export class AppContext extends IAppContext {
  constructor(config: IAppConfig) {
    super(config)
    AppContext._instance = this
  }

  private static _instance: AppContext | undefined

  static getInstance(): AppContext {
    if (!this._instance) {
      // Read mode from cross-env (MODE) or fallback to NODE_ENV. Default to 'production'.
      const mode = process.env.MODE ?? process.env.NODE_ENV ?? 'production'
      consola.info('AppContext mode=', mode)
      const isDev = mode === 'development'
      this._instance = new AppContext({
        webHashHistory: true,
        chineseName: 'Telegram Toolbox',
        name: 'name',
        title: 'Telegram Toolbox',
        version: '0.0.1',
        protocol: 'tg-toolbox',
        copyright: 'Copyright @jenkins_pro LLC all rights reserved',
        homepage: '',
        isDevMode: isDev,
        checkVersionUrl: '',
      })

      if (isDev) {
        this._instance.config.devUrl = 'http://localhost:5173/telectron'
      }
      else {
        const indexPath = path.join(this._instance.file.getAppPath(), 'web', 'index.html')
        console.log(indexPath)
        this._instance.config.localUrl = indexPath
      }
    }
    return this._instance
  }
}

export const appContext = AppContext.getInstance()
