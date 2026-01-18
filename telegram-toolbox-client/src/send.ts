export function send<T>(ws: WebSocket, command: ProtocolCommand): Promise<ProtocolResponse<T>> {
  const id = command.id ?? Number.parseInt((Date.now() / 1000).toString())
  ws.send(JSON.stringify({
    ...command,
    id,
  }))
  return new Promise<ProtocolResponse<T>>((resolve) => {
    ws.addEventListener('message', function (text) {
      const response = JSON.parse(text.data) as ProtocolResponse<T>
      if (response.id === id) {
        // @ts-ignore
        ws.removeEventListener('message', this, false)
        resolve(response)
      }
    })
  })
}

export interface ProtocolCommand {
  id?: number
  method: string
  sessionId?: string
  params?: Record<string, any>
}

export interface ProtocolResponse<T> {
  id: number
  result?: T
}
