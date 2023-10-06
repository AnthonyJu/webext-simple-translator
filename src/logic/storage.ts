import { useStorageLocal } from '~/composables/useStorageLocal'

export const appid = useStorageLocal('webext-simple-translat-appid', '')
export const key = useStorageLocal('webext-simple-translat-key', '')
export const copyType = useStorageLocal('webext-simple-translat-copy', '自动复制')
export const readType = useStorageLocal('webext-simple-translat-audio', '百度API')

export const themeIsDark = useStorageLocal('webext-simple-translat-theme', false)
