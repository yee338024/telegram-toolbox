import { I18n } from '@widget-js/electron-common'
import { appContext } from '../app'
import messages from './message.json'

// @ts-ignore
export const i18n = new I18n(appContext, messages)
