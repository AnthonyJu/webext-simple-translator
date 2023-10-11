<template>
  <main class="w-268px px-4 text-center">
    <Setting v-if="showSetting || !appid || !key" v-model="showSetting" />
    <div v-else>
      <h2 class="text-16px my-3 flex items-center justify-center">
        <img class="w-22px mr-6px" src="../assets/icon-512.png">
        简单翻译
      </h2>
      <ElInput
        v-model="query"
        maxlength="600"
        placeholder="Please enter the text to be translated"
        show-word-limit
        type="textarea"
        autofocus
        rows="3"
        resize="none"
        @input="translateFn"
      />
      <div class="flex items-center my-15px gap-20px">
        <ElSelect v-model="from">
          <ElOption label="自动检测" value="auto" @click="translateText()" />
          <ElOption label="中文" value="zh" @click="translateText()" />
          <ElOption label="英文" value="en" @click="translateText()" />
        </ElSelect>
        <div v-if="!langdetect.isFetching.value && !translate.isFetching.value" class="text-32px rotate-90" i-carbon-mac-shift />
        <div v-else class="text-32px animate-spin" i-mingcute-loading-fill />
        <ElSelect v-model="to">
          <ElOption label="中文" value="zh" @click="translateText()" />
          <ElOption label="英文" value="en" @click="translateText()" />
        </ElSelect>
      </div>
      <ElInput
        v-model="result"
        placeholder="请输入要翻译的文本"
        type="textarea"
        rows="3"
        resize="none"
        readonly
      />
      <div class="flex items-center justify-between text-16px my-2.5">
        <ElButton v-if="showRetry" type="primary" size="small" @click="translateText">
          <div mr-1 i-carbon-reset /> 重试
        </ElButton>
        <div class="flex items-center justify-end flex-1">
          <ElDropdown placement="top" @command="handleCommand">
            <div
              i-carbon-code
              class="cursor-pointer mr-3.3 !text-16px text-dark dark:text-light"
              hover="opacity-90"
              title="译文命名"
            />
            <template #dropdown>
              <ElDropdownMenu>
                <ElDropdownItem
                  v-for="item in nameTypes.slice(0, 7)"
                  :key="item.split('：')[0]"
                  :command="item.split('：')[0]"
                >
                  {{ item.split('：')[0] }}
                </ElDropdownItem>
              </ElDropdownMenu>
            </template>
          </ElDropdown>
          <div
            i-carbon-copy
            class="cursor-pointer mr-3.3"
            hover="opacity-90"
            title="复制译文"
            @click="copyFn"
          />
          <div
            i-carbon-volume-up
            class="cursor-pointer mr-3.3"
            hover="opacity-90"
            title="朗读译文"
            @click="readResult"
          />
          <div
            i-carbon-settings
            class="cursor-pointer"
            hover="opacity-90 animate-spin"
            title="翻译设置"
            @click="showSetting = !showSetting"
          />
          <div class="toggle-box">
            <div class="toggleWrapper">
              <input id="dn" type="checkbox" class="dn" :checked="themeIsDark" @change="themeIsDark = !themeIsDark">
              <label for="dn" class="toggle" title="主题切换">
                <span class="toggle__handler">
                  <span class="crater crater--1" />
                  <span class="crater crater--2" />
                  <span class="crater crater--3" />
                </span>
                <span class="star star--1" />
                <span class="star star--2" />
                <span class="star star--3" />
                <span class="star star--4" />
                <span class="star star--5" />
                <span class="star star--6" />
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { useClipboard, useDebounceFn, useFetch } from '@vueuse/core'
import { ElButton, ElDropdown, ElDropdownItem, ElDropdownMenu, ElInput, ElMessage, ElOption, ElSelect } from 'element-plus'
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'

import { MD5 } from '~/logic/md5'
import { appid, copyType, key, nameType, nameTypes, readType, themeIsDark } from '~/logic'
import Setting from '~/components/Setting.vue'

watchEffect(() => {
  document.documentElement.className = themeIsDark.value ? 'dark' : 'light'
})

const Langdetect_Url = 'https://fanyi.baidu.com/langdetect'
const TRANSLATE_URL = 'https://fanyi-api.baidu.com/api/trans/vip/translate'
const Read_Url = 'https://fanyi.baidu.com/gettts'
const salt = (new Date()).getTime()

const showSetting = ref(false)

const query = ref('')
const from = ref('auto')
const to = ref('zh')
const sign = computed(() => MD5(appid.value + query.value + salt + key.value))

const langdetectUrl = computed(() => `${Langdetect_Url}?query=${encodeURI(query.value)}`)
const langdetect = useFetch(langdetectUrl, { immediate: false }).json()

const translateUrl = computed(() => `${TRANSLATE_URL}?from=${from.value}&to=${to.value}&q=${encodeURI(query.value)}&appid=${appid.value}&salt=${salt}&sign=${sign.value}`)
const translate = useFetch(translateUrl, { immediate: false }).json()

// 朗读译文
const readText = computed(() => {
  const trans_result = translate.data.value?.trans_result
  if (trans_result)
    return trans_result.map((v: any) => v.dst).join('\n')
  else return ''
})

// 译文
const result = ref()

watch(readText, () => {
  if (readText.value)
    setResult(nameType.value)
})

function handleCommand(name: string) {
  if (readText.value) {
    setResult(name)
  }
  else {
    ElMessage.warning({
      message: '译文为空',
      duration: 1500,
    })
  }
}

function setResult(type: string) {
  if (type === '默认' || to.value !== 'en')
    result.value = readText.value

  const lowercase = readText.value.toLowerCase().trim()

  if (type === '小写')
    result.value = lowercase

  else if (type === '大写')
    result.value = lowercase.toUpperCase()

  else if (type === '常量')
    result.value = lowercase.toUpperCase().replace(/ /g, '_')

  else if (type === '首字母大写')
    result.value = lowercase.replace(/(\s|^)[a-z]/g, (L: string) => L.toUpperCase())

  else if (type === '小驼峰')
    result.value = lowercase.replace(/(\s|^)[a-z]/g, (L: string) => L.toUpperCase()).replace(/ /g, '').replace(/(\s|^)[A-Z]/g, (L: string) => L.toLowerCase())

  else if (type === '大驼峰')
    result.value = lowercase.replace(/(\s|^)[a-z]/g, (L: string) => L.toUpperCase()).replace(/ /g, '')

  else if (type === '下划线')
    result.value = lowercase.replace(/ /g, '_')

  else if (type === '大写下划线')
    result.value = lowercase.replace(/(\s|^)[a-z]/g, (L: string) => L.toUpperCase()).replace(/ /g, '_')

  else if (type === '中划线')
    result.value = lowercase.replace(/ /g, '-')

  else if (type === '大写中划线')
    result.value = lowercase.replace(/(\s|^)[a-z]/g, (L: string) => L.toUpperCase()).replace(/ /g, '-')
}

// 复制
const { copy } = useClipboard()
watchEffect(() => {
  if (copyType.value === '自动复制' && from.value === 'zh' && to.value === 'en' && result.value)
    copyFn()
})
function copyFn() {
  if (result.value) {
    copy(result.value).then(() => [
      ElMessage.success({
        message: '译文已复制',
        duration: 1500,
      }),
    ])
  }
  else {
    ElMessage.warning({
      message: '译文为空',
      duration: 1500,
    })
  }
}

// 朗读
function readResult() {
  if (!readText.value) {
    ElMessage.warning({
      message: '译文为空',
      duration: 1500,
    })
    return
  }

  if (readType.value === '浏览器API') {
    const utterance = new SpeechSynthesisUtterance(readText.value)
    utterance.rate = 0.6
    speechSynthesis.speak(utterance)
    return
  }

  const audio = new Audio()
  audio.src = `${Read_Url}?lan=${to.value}&text=${encodeURI(readText.value)}&spd=3&source=web`
  audio.play()

  audio.addEventListener('ended', () => {
    audio.remove()
  })

  audio.addEventListener('error', () => {
    audio.remove()

    // 使用 js api 阅读
    const utterance = new SpeechSynthesisUtterance(readText.value)
    utterance.rate = 0.5
    speechSynthesis.speak(utterance)
  })
}

const showRetry = ref(false)
// 防抖
const translateFn = useDebounceFn(() => {
  if (!query.value) {
    result.value = ''
    showRetry.value = false
    return
  }
  langdetect.execute().then(() => {
    if (langdetect.data.value.error === 0) {
      from.value = langdetect.data.value.lan
      if (from.value === 'zh')
        to.value = 'en'
      else
        to.value = 'zh'
    }
    else {
      from.value = 'auto'
    }
  }).catch(() => {
    from.value = 'auto'
  }).finally(() => {
    translateText()
  })
}, 1000)

// 翻译
function translateText() {
  if (!query.value) {
    result.value = ''
    showRetry.value = false
    return
  }

  translate.execute()
    .then(() => {
      const code = Number(translate.data.value.error_code)

      let msg = ''
      if (code === 52003)
        msg = '未授权用户'
      else if (code === 54003)
        msg = '访问频率受限'
      else if (code === 54004)
        msg = '账户余额不足'
      else if (code === 54005)
        msg = '翻译过长请求频繁'
      else if (code === 58000)
        msg = '客户端IP非法'
      else if (code === 58001)
        msg = '译文语言方向不支持'
      else if (code === 58002)
        msg = '服务当前已关闭'
      else if (code === 90107)
        msg = '认证未通过或未生效'

      if (msg) {
        showRetry.value = true
        ElMessage.error(msg)
      }
      else {
        showRetry.value = false
      }
    })
    .catch(() => {
      showRetry.value = true
      ElMessage.error('翻译失败')
    })
}
</script>

<style>
html.dark {
  background-color: #222;
}

.el-message{
  bottom: 9px !important;
  top: auto!important;
  left: 15px!important;
  padding: 6px 8px;
  transform: none;
}

.toggle-box {
  overflow: hidden;
  width: 44px;
  height: 24px;
}

.toggle-box .toggleWrapper{
  transform: scale(0.32) translate(-6px,-42px);
}

.toggle-box .toggleWrapper input {
  display: none;
}

.toggle-box .toggle {
  cursor: pointer;
  display: inline-block;
  position: relative;
  width: 90px;
  height: 50px;
  background-color: #83d8ff;
  border-radius: 84px;
  transition: background-color 200ms cubic-bezier(0.445, 0.05, 0.55, 0.95);
}

.toggle-box .toggle__handler {
  display: inline-block;
  position: relative;
  z-index: 1;
  top: 3px;
  left: 3px;
  width: 44px;
  height: 44px;
  background-color: #ffcf96;
  border-radius: 50px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, .3);
  transition: all 400ms cubic-bezier(0.68, -0.55, 0.265, 1.55);
  transform: translate(-22px, 0);
}

.toggle__handler .crater {
  position: absolute;
  background-color: #e8cda5;
  opacity: 0;
  transition: opacity 200ms ease-in-out;
  border-radius: 100%;
}

.toggle-box .toggle__handler .crater--1 {
  top: 18px;
  left: 10px;
  width: 4px;
  height: 4px;
}

.toggle-box .toggle__handler .crater--2 {
  top: 28px;
  left: 22px;
  width: 6px;
  height: 6px;
}

.toggle-box .toggle__handler .crater--3 {
  top: 10px;
  left: 25px;
  width: 8px;
  height: 8px;
}

.toggle-box .star {
  position: absolute;
  background-color: #fff;
  transition: all 300ms cubic-bezier(0.445, 0.05, 0.55, 0.95);
  border-radius: 50%;
}

.toggle-box .star--1 {
  top: 10px;
  left: 35px;
  z-index: 0;
  width: 30px;
  height: 3px;
}

.toggle-box .star--2 {
  top: 18px;
  left: 28px;
  z-index: 1;
  width: 30px;
  height: 3px;
}

.toggle-box .star--3 {
  top: 27px;
  left: 40px;
  z-index: 0;
  width: 30px;
  height: 3px;
}

.toggle-box .star--4, .star--5, .star--6 {
  opacity: 0;
  transition: all 300ms 0 cubic-bezier(0.445, 0.05, 0.55, 0.95);
}

.toggle-box .star--4 {
  top: 16px;
  left: 11px;
  z-index: 0;
  width: 2px;
  height: 2px;
  transform: translate3d(3px, 0, 0);
}

.toggle-box .star--5 {
  top: 32px;
  left: 17px;
  z-index: 0;
  width: 3px;
  height: 3px;
  transform: translate3d(3px, 0, 0);
}

.toggle-box .star--6 {
  top: 36px;
  left: 28px;
  z-index: 0;
  width: 2px;
  height: 2px;
  transform: translate3d(3px, 0, 0);
}

.toggle-box input:checked + .toggle {
  background-color: #749dd6;
}

.toggle-box input:checked + .toggle:before {
  color: #749ed7;
}

.toggle-box input:checked + .toggle:after {
  color: #fff;
}

.toggle-box input:checked + .toggle .toggle__handler {
  background-color: #ffe5b5;
  transform: translate3d(18px, 0, 0) rotate(0);
}

.toggle-box input:checked + .toggle .toggle__handler .crater {
  opacity: 1;
}

.toggle-box input:checked + .toggle .star--1 {
  width: 2px;
  height: 2px;
}

.toggle-box input:checked + .toggle .star--2 {
  width: 4px;
  height: 4px;
  transform: translate3d(-5px, 0, 0);
}

.toggle-box input:checked + .toggle .star--3 {
  width: 2px;
  height: 2px;
  transform: translate3d(-7px, 0, 0);
}

.toggle-box input:checked + .toggle .star--4, input:checked + .toggle .star--5, input:checked + .toggle .star--6 {
  opacity: 1;
  transform: translate3d(0, 0, 0);
}

.toggle-box input:checked + .toggle .star--4 {
  transition: all 300ms 200ms cubic-bezier(0.445, 0.05, 0.55, 0.95);
}

.toggle-box input:checked + .toggle .star--5 {
  transition: all 300ms 300ms cubic-bezier(0.445, 0.05, 0.55, 0.95);
}

.toggle-box input:checked + .toggle .star--6 {
  transition: all 300ms 400ms cubic-bezier(0.445, 0.05, 0.55, 0.95);
}
</style>
