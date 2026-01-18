export class AesUtils {
  static DEFAULT_KEY = 'Shoo4quohJiek4eghaeweemeil9ohth7' // 32 bytes
  static DEFAULT_IV = 'thaij3ahzeXizaiY'
  /**
   * 将iv处理为16字节Uint8Array
   */
  private static normalizeIv(iv: string): Uint8Array {
    // 尝试base64解码
    try {
      const arr = AesUtils.base64ToArrayBuffer(iv)
      if (arr.byteLength === 16) { return new Uint8Array(arr) }
    }
    catch {
      // 不是base64，继续处理
    }
    // 普通字符串，转为utf8字节
    const enc = new TextEncoder()
    let ivBuffer = enc.encode(iv)
    if (ivBuffer.length > 16) {
      ivBuffer = ivBuffer.slice(0, 16)
    }
    else if (ivBuffer.length < 16) {
      // 补0
      const tmp = new Uint8Array(16)
      tmp.set(ivBuffer)
      ivBuffer = tmp
    }
    return ivBuffer
  }

  /**
   * AES加密（浏览器环境，返回base64字符串）
   * @param plaintext 明文
   * @param key 密钥（16/24/32字节，utf8字符串）
   * @param iv 初始向量（16字节，utf8字符串或base64字符串）
   */
  static async encrypt(plaintext: string, key: string, iv: string): Promise<string> {
    const enc = new TextEncoder()
    const keyBuffer = enc.encode(key)
    const ivBuffer = AesUtils.normalizeIv(iv)
    if (ivBuffer.length !== 16) { throw new Error('IV must be 16 bytes') }

    const cryptoKey = await window.crypto.subtle.importKey(
      'raw',
      keyBuffer,
      { name: 'AES-CBC' },
      false,
      ['encrypt'],
    )
    const encrypted = await window.crypto.subtle.encrypt(
      { name: 'AES-CBC', iv: ivBuffer },
      cryptoKey,
      enc.encode(plaintext),
    )
    return AesUtils.arrayBufferToBase64(encrypted)
  }

  /**
   * AES解密（浏览器环境，输入base64字符串）
   * @param ciphertext 密文（base64）
   * @param key 密钥（16/24/32字节，utf8字符串）
   * @param iv 初始向量（16字节，utf8字符串或base64字符串）
   */
  static async decrypt(ciphertext: string, key: string, iv: string): Promise<string> {
    const enc = new TextEncoder()
    const keyBuffer = enc.encode(key)
    const ivBuffer = AesUtils.normalizeIv(iv)
    if (ivBuffer.length !== 16) { throw new Error('IV must be 16 bytes') }

    const cryptoKey = await window.crypto.subtle.importKey(
      'raw',
      keyBuffer,
      { name: 'AES-CBC' },
      false,
      ['decrypt'],
    )
    const decrypted = await window.crypto.subtle.decrypt(
      { name: 'AES-CBC', iv: ivBuffer },
      cryptoKey,
      AesUtils.base64ToArrayBuffer(ciphertext),
    )
    return new TextDecoder().decode(decrypted)
  }

  /**
   * 生成指定长度的AES密钥（返回base64字符串）
   * @param length 密钥长度（字节数，16/24/32）
   */
  static generateKey(length: 16 | 24 | 32 = 24): string {
    const key = window.crypto.getRandomValues(new Uint8Array(length))
    let binary = ''
    for (let i = 0; i < key.length; i++) {
      binary += String.fromCharCode(key[i])
    }
    return window.btoa(binary)
  }

  /**
   * 生成16字节的IV（返回base64字符串）
   */
  static generateIv(): string {
    const iv = window.crypto.getRandomValues(new Uint8Array(16))
    let binary = ''
    for (let i = 0; i < 16; i++) {
      binary += String.fromCharCode(iv[i])
    }
    return window.btoa(binary)
  }

  // 辅助方法：ArrayBuffer转base64
  static arrayBufferToBase64(buffer: ArrayBuffer): string {
    let binary = ''
    const bytes = new Uint8Array(buffer)
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i])
    }
    return window.btoa(binary)
  }

  // 辅助方法：base64转ArrayBuffer
  static base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binary = window.atob(base64)
    const len = binary.length
    const bytes = new Uint8Array(len)
    for (let i = 0; i < len; i++) {
      bytes[i] = binary.charCodeAt(i)
    }
    return bytes.buffer
  }
}
