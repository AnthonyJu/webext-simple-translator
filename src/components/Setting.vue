<template>
  <ElPageHeader class="mt-3 mb-5" title="返回" @back="handleBack">
    <template #content>
      <span class="text-14px flex items-center">
        百度翻译 APPID、密钥
        <ElTooltip
          content="<div class='flex flex-col'><a class='text-#409eff' href='https://fanyi-api.baidu.com/'>点击前往百度翻译注册服务获取APPID和密钥</a><a class='text-#409eff' href='https://blog.jupeng.top/blog/2023/08/20_my-web-extensions'>点击前往查看更详细的注册与使用步骤</a></div>"
          raw-content
        >
          <div class="ml-2 color-#409eff cursor-pointer" i-carbon-information />
        </ElTooltip>
      </span>
    </template>
  </ElPageHeader>
  <ElForm ref="formRef" :model="form" :rules="rules" class="mt-3" label-width="68px" :inline="false">
    <ElFormItem label="命名" required>
      <ElSelect v-model="nameType" class="!w-full" popper-class="popper-nameType">
        <ElOption value="默认" />
        <ElOption v-for="item in nameTypes" :key="item" :value="item.split('：')[0]">
          <span class="float-left">{{ item.split('：')[0] }}</span>
          <span class="float-right text-$el-text-color-secondary text-10px">
            {{ item.split('：')[1] }}
          </span>
        </ElOption>
      </ElSelect>
    </ElFormItem>
    <ElFormItem label="复制" required>
      <ElSelect v-model="copyType" class="!w-full">
        <ElOption value="自动复制">
          <span class="float-left">自动复制</span>
          <span class="float-right text-$el-text-color-secondary text-10px">
            仅限中到英
          </span>
        </ElOption>
        <ElOption value="手动复制">
          <span class="float-left">仅手动复制</span>
          <span class="float-right text-$el-text-color-secondary text-10px">
            默认可用
          </span>
        </ElOption>
      </ElSelect>
    </ElFormItem>
    <ElFormItem label="朗读" required>
      <ElSelect v-model="readType" class="!w-full">
        <ElOption value="百度API" />
        <ElOption value="浏览器API" />
      </ElSelect>
    </ElFormItem>
    <ElFormItem label="APPID" prop="appid">
      <ElInput v-model="form.appid" type="password" show-password />
    </ElFormItem>
    <ElFormItem label="密钥" prop="key">
      <ElInput v-model="form.key" type="password" show-password />
    </ElFormItem>
  </ElForm>
  <div class="flex justify-center mb-4">
    <a
      href="https://github.com/AnthonyJu/webext-simple-translate"
      target="_blank"
      class="flex text-14px items-center color-#409eff"
    >
      <span>Check more in GitHub</span>
      <carbon-logo-github class="ml-3px" />
    </a>
  </div>
</template>

<script setup lang="ts">
import { ElForm, ElFormItem, ElInput, ElOption, ElPageHeader, ElSelect, ElTooltip } from 'element-plus'
import type { FormInstance } from 'element-plus'
import { appid, copyType, key, nameType, nameTypes, readType } from '~/logic'
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'

const emit = defineEmits(['update:modelValue'])

const formRef = ref<FormInstance>()
const form = ref({ appid: appid.value, key: key.value })
const rules = {
  appid: [{ required: true, message: '请输入百度翻译服务APPID', trigger: 'change' }],
  key: [{ required: true, message: '请输入百度翻译服务密钥', trigger: 'change' }],
}
watchEffect(() => {
  appid.value = form.value.appid
  key.value = form.value.key
})

function handleBack() {
  formRef.value?.validate((valid) => {
    if (valid)
      emit('update:modelValue', false)
  })
}
</script>

<style>
.el-page-header__left{
  margin-right: 0;
}
.popper-nameType{
  height: 218px;
}
</style>
