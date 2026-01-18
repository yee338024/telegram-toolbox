import { delay } from '@widget-js/core'
import { AesUtils } from '@/utils/AesUtils'

export class KeyConfig {
  static A = 'Gv1nQHjlB3bU'
  static B = 'PzVqRj5kD0ZG'
  static C = 'lxyhR5tJl9cM'
  static D = 'nT2z3hSk1sWa'
  static E = 'YeH4hFpL3M29'
  static F = 'Q9Km4a7P2bTb'
  static G = 'Z3oLjg1F9eRk'
  static H = 'a9Wcv4QXt8U6'
  static I = 'y8SkLe3R5xJz'
  static J = 'B7Vk9dOq6HpF'
  static K = 'pAoH9Rz5VjK0'
  static L = 'yXjqF8l1W9Nz'
  static M = 'Qk7u6dOjoX2F'
  static N = 'R3vPoT5K8w4m'
  static O = 'qDh9bIjA7mLz'
  static P = 'c2XqV1Jy8nPz'
  static Q = 'ZoMw4Rt5U2V6'
  static R = 'bW7P8r6HgTtB'
  static S = 'Lk9Xe8oT1I2u'
  static T = 'V5Yg3wMnzF8S'
  static U = 'rTkq1Js9CnF3'
  static V = 'o3X8m9wYtZB7'
  static W = 'A4tL2jQGx8Mc'
  static X = 'dWn9Y2V6L4Tp'
  static Y = 'M1O2k3V7wJ0r'
  static Z = 'UvW6g7kR9hQz'
  static a = 'H7pWnF3g5XtY'

  static b = 'zQ8K1Ls9cY5F'
  static c = 'M0D8Wx3g6RbL'
  static d = 'U5j3cT2s7FwZ'
  static e = 'dYb4sJt3xH2v'
  static f = 'V6g0c7TmM1wZ'
  static g = 'F3rX9d0bKwH7'
  static h = 'J4c8Xr5T9B6q'
  static i = 'fV3d7xH5n0Mw'
  static j = '7ZsV2K1hY4Xl'
  static k = 'Q0jY8B4pV1m2'
  static l = 'y7tL2pQz8xRo'
  static m = 'O9JwF6m3b5qR'
  static n = 'P0i7T2VhL4sJ'
  static o = 'R1c9m4wD6J7F'
  static p = 't0C4oL6W9y1g'
  static q = 'X1B0sJ9k5hD3'
  static r = 'U8Zg2d0W7pQ9'
  static s = 'b9q4I8rV5T6F'
  static t = 'D1x7T3vN4y5g'
  static u = 'oM3rJ2lF5nY7'
  static v = 'f8zP0T7dW3Xn'
  static w = 'tR9fL2oG1vP6'
  static x = 'c0wM3gV1oL2z'
  static y = 'F7q3pL1o8YzW'
  static z = '7Xv6tR9aP3Wf'
}

/**
 * 向localStorage生成100个随机 12位字符串key（包含大小写字母和数字）
 */
async function injectLocalStorage() {
  if (localStorage.getItem(KeyConfig.K)) {
    return
  }
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  function randomStr(len: number) {
    let str = ''
    for (let i = 0; i < len; i++) {
      str += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return str
  }
  for (let i = 0; i < 100; i++) {
    const key = randomStr(12)
    await delay(10)
    localStorage.setItem(key, AesUtils.generateKey())
  }
}
injectLocalStorage()
