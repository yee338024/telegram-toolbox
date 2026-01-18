export class StringUtils {
  /**
   * 将字符串中间转为星号
   */
  static mask(str: string, maskChar: string = '*'): string {
    if (str.length <= 4) {
      return str
    }
    const maskLength = str.length - 4
    return str.substring(0, 2) + maskChar.repeat(maskLength) + str.substring(str.length - 2)
  }
}
