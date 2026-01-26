import type { Client } from 'tdl'
import type { ProxyType } from 'tdlib-types'
import type { WebSocket } from 'ws'
import type { ProxySettings, TelegramApiConfig } from './ipc/TelegramIpcHandler'
import { store } from '@widget-js/electron-common'
import { getPort } from 'get-port-please'
import { getTdjson } from 'prebuilt-tdlib'
import { TDLibError } from 'tdl'
import * as tdl from 'tdl'
import { WebSocketServer } from 'ws'

tdl.configure({ tdjson: getTdjson() })

export interface TDWebsocketOptions {
  apiId: number
  apiHash: string
}

export interface TDRequest {
  id: string
  method: 'login' | 'invoke' | 'loginAsBot' | 'getVersion' | 'stop' | 'logout'
  params?: Record<string, any>
}

interface LoginParams { phone?: string, mail?: string, code?: string }

export interface TDResponse<T = any> extends TDRequest {
  result?: T
  error?: {
    code: number
    message: string
  }
}
export class TDWebsocket {
  port: number = -1
  private _apiConfig?: TelegramApiConfig
  client: Client | undefined
  wss: WebSocketServer | undefined
  isLogin: boolean = false
  ws: WebSocket | undefined

  constructor() {
  }

  getPort() {
    return this.port
  }

  get apiConfig(): TelegramApiConfig {
    return this._apiConfig
  }

  async setApiConfig(value: TelegramApiConfig) {
    this._apiConfig = value
    await this.startTDClient()
  }

  async login(params: LoginParams) {
    if (!this.client) { throw new Error('Client not initialized') }
    return this.client.login({
      getPhoneNumber: () => {
        return Promise.resolve(params.phone || '')
      },
      getAuthCode: async (retry) => {
        if (retry) {
          throw new TDLibError(530, 'Invalidate code')
        }
        return params.code || ''
      },
    })
  }

  async invoke(params: any) {

    if (!this.client) { throw new Error('Client not initialized') }
    return this.client.invoke(params)
  }

  async startTDClient() {
    if (this.client) {
      await this.client.close()
    }
    this.logout()
    this.client = tdl.createClient({
      apiId: this.apiConfig.apiId,
      apiHash: this.apiConfig.apiHash,
    })
    this.client.on('update', (update) => {
      this.ws?.send(JSON.stringify({
        event: 'update',
        data: update,
      }))
    })
    try {
      await this.updateProxy()
    }
    catch (e) {
      console.error(e)
    }
    this.client.invoke({
      _: 'getMe',
    }).then((me) => {
      if (me) {
        console.info('Current user:', me.last_name, me.first_name, me.id)
      }
      this.isLogin = !!me
    })

    this.client.on('error', (e) => {
      console.error('client error', e)
    })
  }

  async updateProxy() {
    const proxies = await this.client?.invoke({
      _: 'getProxies',
    })
    for (const proxy of proxies.proxies) {
      await this.client?.invoke({ _: 'removeProxy', proxy_id: proxy.id })
    }
    const proxy = store.get('proxy') as (ProxySettings | undefined)
    if (proxy && proxy.port && proxy.server) {
      console.log('proxy', proxy)
      let type: ProxyType
      if (proxy.type == 'proxyTypeMtproto') {
        type = {
          _: 'proxyTypeMtproto',
          secret: proxy.secret,
        }
      }
      else if (proxy.type == 'proxyTypeSocks5') {
        type = {
          _: 'proxyTypeSocks5',
          username: proxy.username || '',
          password: proxy.password || '',
        }
      }
      else if (proxy.type == 'proxyTypeHttp') {
        type = {
          _: 'proxyTypeHttp',
          username: proxy.username || '',
          password: proxy.password || '',
          http_only: proxy.http_only,
        }
      }
      await this.client?.invoke({
        _: 'addProxy',
        server: proxy.server,
        port: proxy.port,
        enable: true,
        type,
      })
    }
  }

  async startWSS() {
    this.port = await getPort({
      portRange: [6000, 7000],
    })
    // 启动 WebSocket 服务器
    this.wss = new WebSocketServer({ port: this.port })
    this.wss.on('connection', (ws) => {
      this.ws = ws
      const afterLogin = async () => {
        this.isLogin = true
        this.ws?.send(JSON.stringify({
          event: 'login',
        }))
      }

      ws.on('message', async (data) => {
        let req: TDRequest
        try {
          req = JSON.parse(data.toString())
        }
        catch (e) {
          ws.send(JSON.stringify({ id: '', method: '', error: { code: 400, message: 'Invalid JSON' } }))
          return
        }
        const res: TDResponse = { ...req }
        try {
          if (req.method === 'login') {
            res.result = await this.login(req.params as LoginParams)
            afterLogin()
          }
          else if (req.method == 'logout') {
            await this.client?.invoke({ _: 'logOut' })
            await this.startTDClient()
          }
          else if (req.method === 'invoke') {
            res.result = await this.invoke(req.params)
          }
          else if (req.method === 'getVersion') {
            res.result = this.client?.getVersion()
          }
          else if (req.method === 'loginAsBot') {
            if (!req.params || !req.params.token) {
              res.error = { code: 400, message: 'Missing token parameter' }
              ws.send(JSON.stringify(res))
              return
            }
            await this.client!.loginAsBot(req.params.token)
            afterLogin()
          }
          else {
            res.error = { code: 404, message: 'Unknown method' }
          }
        }
        catch (err: any) {
          console.error(err)
          if (err instanceof TDLibError) {
            res.error = {
              code: err.code,
              message: err.message || String(err),
            }
            if (err.code == 400 && err.message.includes('Another authorization query has started')) {
              console.log('Another authorization query has started, logging out...')
              await this.client.invoke({ _: 'logOut' })
              await this.startTDClient()
            }
            else if (err.code == 401 && err.message.includes('Unauthorized')) {
              this.logout()
              await this.startTDClient()
            }
          }
          else {
            if (err.message) {
              if (err.message.includes('The client is closed') || err.message.includes('A closed client cannot be reused')) {
                console.log('Client is closed, restarting...')
                await this.startTDClient()
              }
            }
            res.error = { code: 500, message: err.message || String(err) }
          }
        }
        ws.send(JSON.stringify(res))
      })
    })
    console.log(`WebSocket server started on port ${this.port}`)
    this.startTDClient()
  }

  async stop() {
    await this.logout()
    this.wss?.close()
    this.wss = undefined
    this.ws = undefined
  }

  logout() {
    this.isLogin = false
    this.ws?.send(JSON.stringify({
      event: 'logout',
    }))
  }
}

export const defaultTDWebsocket = new TDWebsocket()
