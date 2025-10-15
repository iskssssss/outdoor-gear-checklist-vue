<template>
  <BaseDropdown 
    :trigger="trigger" 
    :placement="placement"
    :disabled="disabled"
    ref="dropdownRef"
  >
    <template #trigger>
      <BaseButton 
        :variant="variant"
        :size="size"
        :icon="icon"
        :disabled="disabled"
      >
        {{ text }}
      </BaseButton>
    </template>
    <slot></slot>
  </BaseDropdown>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import BaseDropdown from './BaseDropdown.vue'
import BaseButton from '../form/BaseButton.vue'

interface Props {
  // 按钮文本
  text: string
  // 按钮图标
  icon?: string
  // 按钮变体
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'secondary' | 'outline' | 'text'
  // 按钮尺寸
  size?: 'sm' | 'md' | 'lg'
  // 触发方式 (默认hover更友好)
  trigger?: 'click' | 'hover'
  // 下拉位置 (智能默认：左侧primary用bottom-start，右侧用bottom-end)
  placement?: 'bottom' | 'bottom-start' | 'bottom-end' | 'top' | 'top-start' | 'top-end'
  // 禁用
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  trigger: 'hover',  // 默认hover，更友好
  placement: 'bottom-start',
  disabled: false
})

const dropdownRef = ref()

// 暴露下拉框方法
defineExpose({
  open: () => dropdownRef.value?.open(),
  close: () => dropdownRef.value?.close(),
  toggle: () => dropdownRef.value?.toggle()
})
</script>

<style scoped>
/* 此组件只是组合，不需要额外样式 */
</style>

