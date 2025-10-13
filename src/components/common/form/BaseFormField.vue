<template>
  <component
    :is="componentType"
    v-bind="componentProps"
    :modelValue="modelValue"
    @update:modelValue="$emit('update:modelValue', $event)"
  >
    <slot></slot>
  </component>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import BaseInput from './BaseInput.vue'
import BaseTextarea from './BaseTextarea.vue'
import BaseSelect from './BaseSelect.vue'
import BaseCheckbox from './BaseCheckbox.vue'
import BaseRadio from './BaseRadio.vue'

interface Props {
  // v-model 绑定
  modelValue?: any
  // 字段类型（自动选择对应组件）
  type?: 'text' | 'number' | 'password' | 'email' | 'url' | 'textarea' | 'select' | 'checkbox' | 'radio'
  // 标签
  label?: string
  // 占位符
  placeholder?: string
  // 提示文本
  hint?: string
  // 错误信息
  error?: string
  // 前缀图标（智能推荐）
  icon?: string
  // 选项列表（用于select）
  options?: Array<{label: string, value: any}>
  // 是否必填
  required?: boolean
  // 是否禁用
  disabled?: boolean
  // 是否只读
  readonly?: boolean
  // 最大长度
  maxlength?: number
  // 是否显示字符计数
  showCount?: boolean
  // 是否可清空
  clearable?: boolean
  // 行数（textarea）
  rows?: number
  // 尺寸
  size?: 'sm' | 'md' | 'lg'
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  size: 'md',
  clearable: true,  // 默认可清空
  showCount: false,
  required: false,
  disabled: false,
  readonly: false
})

const emit = defineEmits<{
  'update:modelValue': [value: any]
}>()

// 智能图标推荐
const smartIcon = computed(() => {
  if (props.icon) return props.icon
  
  const iconMap: Record<string, string> = {
    'password': '🔑',
    'email': '📧',
    'url': '🔗',
    'number': '🔢',
  }
  
  // 根据label智能推荐
  if (props.label) {
    const labelLower = props.label.toLowerCase()
    if (labelLower.includes('name') || labelLower.includes('名称')) return '✏️'
    if (labelLower.includes('key') || labelLower.includes('密钥')) return '🔑'
    if (labelLower.includes('url') || labelLower.includes('地址')) return '🔗'
    if (labelLower.includes('model') || labelLower.includes('模型')) return '🤖'
    if (labelLower.includes('token')) return '📊'
    if (labelLower.includes('temp') || labelLower.includes('温度')) return '🌡️'
    if (labelLower.includes('path') || labelLower.includes('路径')) return '📍'
  }
  
  return iconMap[props.type] || ''
})

// 智能组件选择
const componentType = computed(() => {
  switch (props.type) {
    case 'textarea': return BaseTextarea
    case 'select': return BaseSelect
    case 'checkbox': return BaseCheckbox
    case 'radio': return BaseRadio
    default: return BaseInput
  }
})

// 组件属性
const componentProps = computed(() => {
  const base = {
    label: props.label,
    placeholder: props.placeholder,
    hint: props.hint,
    error: props.error,
    required: props.required,
    disabled: props.disabled,
    readonly: props.readonly,
    size: props.size
  }

  // Input/Textarea 特有
  if (['text', 'number', 'password', 'email', 'url', 'textarea'].includes(props.type)) {
    return {
      ...base,
      type: props.type === 'textarea' ? 'text' : props.type,
      prefixIcon: smartIcon.value,
      clearable: props.clearable,
      maxlength: props.maxlength,
      showCount: props.showCount,
      rows: props.rows
    }
  }

  // Select 特有
  if (props.type === 'select') {
    return {
      ...base,
      options: props.options || []
    }
  }

  return base
})
</script>

