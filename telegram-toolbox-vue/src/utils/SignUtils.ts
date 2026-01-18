/**
 * 浏览器环境
 *
 * 所有REST私有请求头都必须包含以下内容：
 *
 * OK-ACCESS-KEY字符串类型的APIKey。
 *
 * OK-ACCESS-SIGN使用HMAC SHA256哈希函数获得哈希值，再使用Base-64编码（请参阅签名）。
 *
 * OK-ACCESS-TIMESTAMP发起请求的时间（UTC），如：2020-12-08T09:08:57.715Z
 *
 * OK-ACCESS-PASSPHRASE您在创建API密钥时指定的Passphrase。
 *
 * 所有请求都应该含有application/json类型内容，并且是有效的JSON。
 *
 * 签名
 * 生成签名
 *
 * OK-ACCESS-SIGN的请求头是对timestamp + method + requestPath + body字符串（+表示字符串连接），以及SecretKey，使用HMAC SHA256方法加密，通过Base-64编码输出而得到的。
 *  这里使用浏览器Crypto模块的createHmac方法生成HMAC SHA256签名。
 * 如：sign=base64(HmacSHA256(timestamp + 'GET' + '/api/v5/account/balance?ccy=BTC', SecretKey))
 *
 * 其中，timestamp的值与OK-ACCESS-TIMESTAMP请求头相同，为ISO格式，如2020-12-08T09:08:57.715Z。
 *
 * method是请求方法，字母全部大写：GET/POST。
 *
 * requestPath是请求接口路径。如：/api/v5/account/balance
 *
 * body是指请求主体的字符串，如果请求没有主体（通常为GET请求）则body可省略。如：{"instId":"BTC-USDT","lever":"5","mgnMode":"isolated"}
 */
export class SignUtils {
  /**
   * 生成签名
   * @param method 请求方法（小写）
   * @param requestPath 请求路径
   * @param body 请求体对象（无body时传{}）
   * @param secretKey 密钥
   * @param timestamp 时间戳（ISO字符串）
   */
  static async sign(
    method: 'get' | 'post' | 'delete' | 'put',
    requestPath: string,
    body: Record<string, any>,
    secretKey: string,
    timestamp: string,
  ): Promise<string> {
    const lowerMethod = method.toLowerCase()
    const bodyStr = (body && Object.keys(body).length > 0) ? JSON.stringify(body) : ''
    const signStr = `${timestamp}+${lowerMethod}+${requestPath}+${bodyStr}`
    const encoder = new TextEncoder()
    const keyData = encoder.encode(secretKey)
    const signData = encoder.encode(signStr)
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign'],
    )
    const signature = await crypto.subtle.sign('HMAC', cryptoKey, signData)
    // base64编码
    return btoa(String.fromCharCode(...new Uint8Array(signature)))
  }

  /**
   * 验证签名
   * @param method 请求方法（小写）
   * @param requestPath 请求路径
   * @param body 请求体对象
   * @param secretKey 密钥
   * @param timestamp 时间戳
   * @param sign 待验证签名
   */
  static async verifySign(
    method: 'get' | 'post' | 'delete' | 'put',
    requestPath: string,
    body: Record<string, any>,
    secretKey: string,
    timestamp: string,
    sign: string,
  ): Promise<boolean> {
    const genSign = await this.sign(method, requestPath, body, secretKey, timestamp)
    return genSign === sign
  }
}
