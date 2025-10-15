/// <reference types="vue/macros-global" />
<template>
  <form :class="['base-form', `form-${layout}`]" @submit.prevent="handleSubmit">
    <div
      v-for="field in fields"
      :key="field.name"
      :class="['form-field', { 'is-required': field.required }]"
    >
      <!-- Label -->
      <label v-if="field.label" :for="field.name" class="field-label">
        {{ field.label }}
        <span v-if="field.required" class="required-mark">*</span>
      </label>
      
      <!-- Input -->
      <component
        :is="field.component || getComponent(field.type)"
        v-if="field.type !== 'radio' && field.type !== 'checkbox' && field.type !== 'switch'"
        :id="field.name"
        :type="field.type"
        v-model="formData[field.name]"
        :placeholder="field.placeholder"
        :disabled="field.disabled"
        :readonly="field.readonly"
        :maxlength="field.maxlength"
        :clearable="field.clearable"
        :prefixIcon="field.prefixIcon"
        :suffixIcon="field.suffixIcon"
        :status="errors[field.name]?.status || field.status || 'normal'"
        :hint="errors[field.name]?.message || field.hint"
        :rows="field.type === 'textarea' ? field.rows : undefined"
        :showCount="field.type === 'textarea' ? field.showCount : undefined"
        :options="field.type === 'select' ? (field.options || []) : undefined"
      />
      
      <!-- Checkbox -->
      <BaseCheckbox
        v-else-if="field.type === 'checkbox'"
        :id="field.name"
        v-model="formData[field.name]"
        :label="field.checkboxLabel"
        :disabled="field.disabled"
      />
      
      <!-- Radio Group -->
      <div v-else-if="field.type === 'radio'" class="radio-group">
        <BaseRadio
          v-for="option in field.options"
          :key="option.value"
          v-model="formData[field.name]"
          :value="option.value"
          :label="option.label"
          :disabled="field.disabled || option.disabled"
        />
      </div>
      
      <!-- Switch -->
      <BaseSwitch
        v-else-if="field.type === 'switch'"
        :id="field.name"
        v-model="formData[field.name]"
        :label="field.switchLabel"
        :disabled="field.disabled"
      />
      
      <!-- Error Message -->
      <div v-if="errors[field.name]?.message" class="field-error">
        {{ errors[field.name]?.message }}
      </div>
    </div>
    
    <!-- Actions -->
    <div v-if="showActions" class="form-actions">
      <BaseButtonGroup
        :buttons="actionButtons"
        :justify="actionsAlign"
        @click="handleActionClick"
      />
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import BaseInput from './BaseInput.vue'
import BaseTextarea from './BaseTextarea.vue'
import BaseSelect from './BaseSelect.vue'
import BaseCheckbox from './BaseCheckbox.vue'
import BaseRadio from './BaseRadio.vue'
import BaseSwitch from './BaseSwitch.vue'
import BaseButtonGroup from './BaseButtonGroup.vue'
import type { ButtonConfig } from './BaseButtonGroup.vue'
import type { PropType } from 'vue'

export interface FormField {
  /**
   * 字段名称（用作 v-model 的 key）。
   */
  name: string
  /**
   * 字段类型。
   * @values 'text' | 'email' | 'password' | 'number' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'switch' | 'custom'
   */
  type: 'text' | 'email' | 'password' | 'number' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'switch' | 'custom'
  /**
   * 字段标签。
   */
  label?: string
  /**
   * 占位符文本。
   */
  placeholder?: string
  /**
   * 是否必填。
   * @default false
   */
  required?: boolean
  /**
   * 字段是否禁用。
   * @default false
   */
  disabled?: boolean
  /**
   * 字段是否只读。
   * @default false
   */
  readonly?: boolean
  /**
   * 字段允许的最大长度。
   */
  maxlength?: number
  /**
   * 是否显示清空按钮（仅对 BaseInput 有效）。
   * @default true
   */
  clearable?: boolean
  /**
   * 前缀图标（仅对 BaseInput 有效）。
   */
  prefixIcon?: string
  /**
   * 后缀图标（仅对 BaseInput 有效）。
   */
  suffixIcon?: string
  /**
   * 提示文本。
   */
  hint?: string
  /**
   * 字段的当前状态，会影响样式和错误信息显示。
   * @values 'normal' | 'error' | 'success' | 'warning'
   * @default 'normal'
   */
  status?: 'normal' | 'error' | 'success' | 'warning'
  /**
   * Textarea 的行数（仅对 BaseTextarea 有效）。
   * @default 3
   */
  rows?: number
  /**
   * Textarea 是否显示字数计数（仅对 BaseTextarea 有效）。
   * @default false
   */
  showCount?: boolean
  /**
   * Select 或 Radio 组的选项数组。
   */
  options?: Array<{ value: any; label: string; disabled?: boolean }>
  /**
   * Checkbox 的标签文本（仅对 BaseCheckbox 有效）。
   */
  checkboxLabel?: string
  /**
   * Switch 的标签文本（仅对 BaseSwitch 有效）。
   */
  switchLabel?: string
  /**
   * 字段的校验规则数组，每个规则函数接收当前值并返回 `true`（通过）或错误信息字符串（失败）。
   */
  rules?: Array<(value: any) => string | boolean>
  /**
   * 自定义组件，当 `type` 为 'custom' 时使用。
   */
  component?: any
}

interface Props {
  /**
   * 表单字段配置数组，用于数据驱动生成表单。
   */
  fields: FormField[]
  /**
   * 表单数据对象，使用 v-model 绑定。
   */
  modelValue: Record<string, any>
  /**
   * 表单的布局方式。
   * @values 'vertical' | 'horizontal' | 'inline'
   * @default 'vertical'
   */
  layout?: 'vertical' | 'horizontal' | 'inline'
  /**
   * 是否显示底部操作按钮区域。
   * @default true
   */
  showActions?: boolean
  /**
   * 自定义操作按钮配置数组。
   */
  actions?: ButtonConfig[]
  /**
   * 操作按钮的对齐方式。
   * @values 'start' | 'center' | 'end' | 'between'
   * @default 'end'
   */
  actionsAlign?: 'start' | 'center' | 'end' | 'between'
  /**
   * 表单的标题，显示在表单上方。
   */
  title?: string
}

const props = withDefaults(defineProps<Props>(), {
  layout: 'vertical',
  showActions: true,
  actionsAlign: 'end',
  title: '',
})

const emit = defineEmits<{
  'update:modelValue': [value: Record<string, any>]
  'submit': [value: Record<string, any>]
  'action': [button: ButtonConfig]
}>()

// 表单数据（响应式）
const formData = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

// 错误信息
const errors = ref<Record<string, { message: string; status: 'error' | 'warning' } | undefined>>({})

// 默认操作按钮
const defaultActions: ButtonConfig[] = [
  {
    value: 'cancel',
    label: '取消',
    variant: 'secondary',
    handler: () => emit('action', { value: 'cancel', label: '取消' })
  },
  {
    value: 'submit',
    label: '提交',
    variant: 'primary',
    type: 'submit'
  }
]

// 操作按钮
const actionButtons = computed(() => props.actions || defaultActions)

/**
 * 根据字段类型获取对应的组件。
 * @param type 字段类型
 * @returns 对应的 Vue 组件
 */
function getComponent(type: FormField['type']) {
  switch (type) {
    case 'text':
    case 'email':
    case 'password':
    case 'number':
      return BaseInput;
    case 'textarea':
      return BaseTextarea;
    case 'select':
      return BaseSelect;
    case 'checkbox':
      return BaseCheckbox;
    case 'radio':
      return BaseRadio;
    case 'switch':
      return BaseSwitch;
    case 'custom':
      return undefined; // Custom components are passed directly via field.component
    default:
      return BaseInput;
  }
}

/**
 * 校验表单
 */
function validate(): boolean {
  errors.value = {}
  let isValid = true

  props.fields.forEach((field: FormField) => {
    const value = formData.value[field.name]
    // 必填校验
    if (field.required && (value === null || value === undefined || value === '')) {
      errors.value[field.name] = { message: `${field.label || field.name}不能为空`, status: 'error' }
      isValid = false
      // return // 不直接return，继续执行后续校验
    }
    
    // 自定义校验规则
    if (field.rules) {
      for (const rule of field.rules) {
        const result = rule(value as any) // 显式转换为 any
        if (result !== true) {
          errors.value[field.name] = { message: typeof result === 'string' ? result : '输入格式不正确', status: 'error' }
          isValid = false
          break
        }
      }
    }
  })

  return isValid
}

/**
 * 处理表单提交
 */
function handleSubmit() {
  if (validate()) {
    emit('submit', formData.value)
  }
}

/**
 * 处理操作按钮点击
 */
function handleActionClick(button: ButtonConfig) {
  emit('action', button)
}

// 暴露方法
defineExpose({
  validate,
  resetErrors: () => { errors.value = {} }
})
</script>

<style scoped lang="scss">
.base-form {
  width: 100%;
  
  &.form-vertical {
    .form-field {
      margin-bottom: var(--spacing-lg);
    }
  }
  
  &.form-horizontal {
    .form-field {
      display: grid;
      grid-template-columns: 120px 1fr;
      gap: var(--spacing-md); /* 使用语义化变量 */
      align-items: start;
      margin-bottom: var(--spacing-lg); /* 使用语义化变量 */
      
      .field-label {
        text-align: right;
        padding-top: var(--spacing-sm);
      }
    }
  }
  
  &.form-inline {
    display: flex;
    flex-wrap: wrap;
    gap: var(--spacing-lg); /* 使用语义化变量 */
    
    .form-field {
      display: flex;
      align-items: center;
      gap: var(--spacing-md); /* 使用语义化变量 */
    }
  }
}

.form-field {
  &.is-required {
    .field-label {
      &::before {
        content: '* ';
        color: var(--danger-color);
      }
    }
  }
}

.field-label {
  display: block;
  margin-bottom: 6px;
  font-weight: 500;
  color: var(--text-primary);
  font-size: 0.95rem;
}

.required-mark {
  color: var(--danger-color);
  margin-left: 2px;
}

.radio-group {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.field-error {
  color: var(--danger-color);
  font-size: 0.85rem;
  margin-top: var(--spacing-xs);
}

.form-actions {
  margin-top: var(--spacing-xl); /* 使用语义化变量 */
  padding-top: var(--spacing-lg); /* 使用语义化变量 */
  border-top: 1px solid var(--border-color);
}
</style>

