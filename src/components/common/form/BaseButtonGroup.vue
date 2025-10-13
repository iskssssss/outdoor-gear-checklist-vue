<template>
  <div :class="['base-button-group', `group-${layout}`, `justify-${justify}`, `gap-${gap}`]">
    <BaseButton
      v-for="button in buttons"
      :key="button.value || button.label"
      :variant="button.variant || 'secondary'"
      :size="button.size || size"
      :icon="button.icon"
      :iconPosition="button.iconPosition"
      :loading="button.loading"
      :disabled="button.disabled"
      :type="button.type || 'button'"
      :block="button.block"
      :rounded="button.rounded"
      @click="handleClick(button)"
      :title="button.title"
    >
      {{ button.label }}
    </BaseButton>
  </div>
</template>

<script setup lang="ts">
import BaseButton from './BaseButton.vue'

export interface ButtonConfig {
  // 按钮标识
  value?: string | number
  // 按钮文本
  label: string
  // 按钮变体
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'secondary' | 'outline' | 'text'
  // 按钮尺寸
  size?: 'sm' | 'md' | 'lg'
  // 图标
  icon?: string
  // 图标位置
  iconPosition?: 'left' | 'right'
  // 是否加载中
  loading?: boolean
  // 是否禁用
  disabled?: boolean
  // 按钮类型
  type?: 'button' | 'submit' | 'reset'
  // 是否块级
  block?: boolean
  // 是否圆角
  rounded?: boolean
  // 提示文本
  title?: string
  // 点击处理函数
  handler?: () => void
}

interface Props {
  // 按钮配置列表（数据驱动）
  buttons: ButtonConfig[]
  // 全局尺寸（可被单个按钮的 size 覆盖）
  size?: 'sm' | 'md' | 'lg'
  // 布局方式
  layout?: 'horizontal' | 'vertical'
  // 对齐方式
  justify?: 'start' | 'center' | 'end' | 'between' | 'around'
  // 间距大小
  gap?: 'sm' | 'md' | 'lg'
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  layout: 'horizontal',
  justify: 'start',
  gap: 'md'
})

const emit = defineEmits<{
  'click': [button: ButtonConfig]
}>()

/**
 * 处理按钮点击
 */
function handleClick(button: ButtonConfig) {
  // 如果有自定义处理函数，优先执行
  if (button.handler) {
    button.handler()
  }
  
  // 触发 click 事件
  emit('click', button)
}

// 暴露方法
defineExpose({
  // 可以暴露一些方法，比如设置某个按钮的 loading 状态
})
</script>

<style scoped lang="scss">
.base-button-group {
  display: flex;
  
  // 布局方式
  &.group-horizontal {
    flex-direction: row;
    flex-wrap: wrap;
  }
  
  &.group-vertical {
    flex-direction: column;
  }
  
  // 对齐方式
  &.justify-start {
    justify-content: flex-start;
  }
  
  &.justify-center {
    justify-content: center;
  }
  
  &.justify-end {
    justify-content: flex-end;
  }
  
  &.justify-between {
    justify-content: space-between;
  }
  
  &.justify-around {
    justify-content: space-around;
  }
  
  // 间距大小
  &.gap-sm {
    gap: 8px;
  }
  
  &.gap-md {
    gap: 12px;
  }
  
  &.gap-lg {
    gap: 16px;
  }
}
</style>

