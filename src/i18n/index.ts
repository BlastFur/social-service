/* eslint-disable @typescript-eslint/no-floating-promises */
import i18next from 'i18next'
import en from './resources/en'
import zh from './resources/zh'

i18next.init({
  lng: 'en',
  fallbackLng: 'en',
  resources: {
    en,
    zh,
  },
})

const enI18n = i18next.cloneInstance()

const zhI18n = i18next.cloneInstance()
zhI18n.changeLanguage('zh')

const i18n = {
  en: enI18n,
  zh: zhI18n,
}

export default i18n
