import { describe, expect, it } from 'vitest'
import { TelegramUtils } from '../src/utils/TelegramUtils'

describe('telegramUtils.getUserNameFromLink', () => {
  it('should extract username from normal t.me link', () => {
    const url = new URL('https://t.me/asdf')
    expect(TelegramUtils.getUserNameFromLink('https://t.me/su7xtjzy')).toBe('su7xtjzy')
  })

  it('should extract username from t.me link with query', () => {
    expect(TelegramUtils.getUserNameFromLink('https://t.me/yh962yh?ad=link2288')).toBe('yh962yh')
  })

  it('should extract group invite code from t.me/+ link', () => {
    expect(TelegramUtils.getUserNameFromLink('https://t.me/+Ha9GJe8HMy0wYWU1')).toBe('+Ha9GJe8HMy0wYWU1')
  })

  it('should return empty string for addstickers link', () => {
    expect(TelegramUtils.getUserNameFromLink('https://t.me/addstickers/emojjj2')).toBe('')
  })

  it('should return empty string for non-t.me link', () => {
    expect(TelegramUtils.getUserNameFromLink('https://google.com/xxx')).toBe('')
  })

  it('should return empty string for t.me/addstickers only', () => {
    expect(TelegramUtils.getUserNameFromLink('https://t.me/addstickers/emojjj2')).toBe('')
  })

  it('should return empty string for empty string', () => {
    expect(TelegramUtils.getUserNameFromLink('')).toBe('')
  })

  it('should extract username from t.me/xxx/nnn link', () => {
    expect(TelegramUtils.getUserNameFromLink('https://t.me/jianlai_TRJ/566')).toBe('jianlai_TRJ')
  })
})
