import { describe, expect, it } from 'vitest'
import { ServerUtils } from '../src/utils/ServerUtils'

describe('serverUtils', () => {
  it('getHost should return https://facai365.vip', () => {
    expect(ServerUtils.getHost()).toBe('https://facai365.vip')
  })
})
