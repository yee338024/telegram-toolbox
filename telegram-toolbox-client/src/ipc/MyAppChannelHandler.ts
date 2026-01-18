import type { AppApiMethods } from '@widget-js/core'
import type { IAppContext } from '@widget-js/electron-common'
import type { IpcMainInvokeEvent } from 'electron'
import * as console from 'node:console'
import { AppChannelHandler } from '@widget-js/electron-common'
import trayManager from '../TrayManager'

export class MyAppChannelHandler extends AppChannelHandler {
  constructor(context: IAppContext) {
    super(context)
  }

  async handle(event: IpcMainInvokeEvent, method: AppApiMethods, ...args): Promise<any> {
    if (method == 'setLanguageCode') {
      console.log('setLanguageCode', args)
      const res = await super.handle(event, method, ...args)
      trayManager.updateMenu()
      return res
    }
    return super.handle(event, method, ...args)
  }
}
