import { BaseIpcHandler, store } from '@widget-js/electron-common'
import { machineId } from 'node-machine-id'
import { defaultTDWebsocket } from '../TDWebsocket'

export type TelectronIpcType = 'getMachineId' | 'getTDPort' | 'getApi' | 'isLogin' | 'setProxy' | 'getProxy' | 'setApi'
export interface TelegramApiConfig {
  apiId: number
  apiHash: string
}
export interface ProxySettings {
  type: string
  server: string
  port: number
  username?: string
  password?: string
  secret?: string
  http_only?: boolean
  enable?: boolean
}
export class TelegramIpcHandler extends BaseIpcHandler<TelectronIpcType> {
  getChannel(): string {
    return 'telegram-ipc'
  }

  async handle(event: Electron.IpcMainInvokeEvent, type: TelectronIpcType, ...args: any[]): Promise<any> {
    const arg0 = args[0]
    console.log(`TelegramIpcHandler handle type=${type}`, arg0)
    if (type == 'getMachineId') {
      return machineId()
    }
    else if (type == 'getTDPort') {
      return defaultTDWebsocket.getPort()
    }
    else if (type == 'isLogin') {
      return defaultTDWebsocket.isLogin
    }
    else if (type == 'getProxy') {
      return store.get('proxy')
    }
    else if (type == 'setProxy') {
      store.set('proxy', arg0)
      await defaultTDWebsocket.updateProxy()
    }
    else if (type == 'setApi') {
      const params = arg0 as TelegramApiConfig
      store.set('apiConfig', params)
      await defaultTDWebsocket.setApiConfig(params)
    }
    else if (type == 'getApi') {
      return store.get('apiConfig') as TelegramApiConfig
    }
    return Promise.resolve(undefined)
  }
}
