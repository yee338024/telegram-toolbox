import { BaseApi } from '@widget-js/core'

export interface ProxySettings {
  type: string
  server: string
  port: string
  username?: string
  password?: string
  secret?: string
  http_only?: boolean
  enable?: boolean
}
interface ITelegramApi {
  getMachineId: () => Promise<string>
  decryptString: (str: string) => Promise<string>
  encryptString: (str: string) => Promise<string>
  getTDPort: () => Promise<number>
  setApi: (config: TelegramApiConfig) => Promise<void>
  getApi: () => Promise<TelegramApiConfig>
  /**
   * 是否client已经登录
   */
  isLogin: () => Promise<boolean>
  setProxy: (proxy: ProxySettings | undefined) => Promise<boolean>
  getProxy: () => Promise<ProxySettings | undefined>
  isWebSocketServerStarted: () => Promise<boolean>
}

export interface TelegramApiConfig {
  apiId: number
  apiHash: string
}

type ITelegramApiMethods = keyof ITelegramApi

class TelectronApiImpl extends BaseApi<ITelegramApiMethods> implements ITelegramApi {
  getMachineId(): Promise<string> {
    return this.invokeMethod('getMachineId')
  }

  getChannel(): string {
    return 'telegram-ipc'
  }

  decryptString(str: string): Promise<string> {
    return this.invokeMethod('decryptString', str)
  }

  encryptString(str: string): Promise<string> {
    return this.invokeMethod('encryptString', str)
  }

  setProxy(proxy: ProxySettings | undefined): Promise<boolean> {
    return this.invokeMethod('setProxy', proxy)
  }

  getProxy(): Promise<ProxySettings | undefined> {
    return this.invokeMethod('getProxy')
  }

  isWebSocketServerStarted(): Promise<boolean> {
    return this.invokeMethod('isWebSocketServerStarted')
  }

  getTDPort(): Promise<number> {
    return this.invokeMethod('getTDPort')
  }

  getApi(): Promise<{ apiId: number, apiHash: string }> {
    return this.invokeMethod('getApi')
  }

  setApi(config: TelegramApiConfig): Promise<void> {
    return this.invokeMethod('setApi', config)
  }

  isLogin(): Promise<boolean> {
    return this.invokeMethod('isLogin')
  }
}

const TelegramApi: ITelegramApi = new TelectronApiImpl()

export { TelegramApi }
