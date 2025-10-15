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
      <BaseInput
        v-if="field.type === 'text' || field.type === 'email' || field.type === 'password' || field.type === 'number'"
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
        :error="errors[field.name]"
        :hint="field.hint"
      />
      
      <!-- Textarea -->
      <BaseTextarea
        v-else-if="field.type === 'textarea'"
        :id="field.name"
        v-model="formData[field.name]"
        :placeholder="field.placeholder"
        :disabled="field.disabled"
        :readonly="field.readonly"
        :maxlength="field.maxlength"
        :rows="field.rows"
        :showCount="field.showCount"
        :error="errors[field.name]"
        :hint="field.hint"
      />
      
      <!-- Select -->
      <BaseSelect
        v-else-if="field.type === 'select'"
        :id="field.name"
        v-model="formData[field.name]"
        :options="field.options || []"
        :placeholder="field.placeholder"
        :disabled="field.disabled"
        :error="errors[field.name]"
        :hint="field.hint"
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
      <div v-if="errors[field.name]" class="field-error">
        {{ errors[field.name] }}
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

export interface FormField {
  // 字段名称（用作 v-model 的 key）
  name: string
  // 字段类型
  type: 'text' | 'email' | 'password' | 'number' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'switch'
  // 字段标签
  label?: string
  // 占位符
  placeholder?: string
  // 是否必填
  required?: boolean
  // 是否禁用
  disabled?: boolean
  // 是否只读
  readonly?: boolean
  // 最大长度
  maxlength?: number
  // 是否可清空
  clearable?: boolean
  // 前缀图标
  prefixIcon?: string
  // 后缀图标
  suffixIcon?: string
  // 提示文本
  hint?: string
  // 行数（textarea）
  rows?: number
  // 显示计数（textarea）
  showCount?: boolean
  // 选项（select/radio）
  options?: Array<{ value: any; label: string; disabled?: boolean }>
  // Checkbox 标签
  checkboxLabel?: string
  // Switch 标签
  switchLabel?: string
  // 校验规则
  rules?: Array<(value: any) => string | true>
}

interface Props {
  // 表单字段配置（数据驱动）
  fields: FormField[]
  // 表单数据
  modelValue: Record<string, any>
  // 表单布局
  layout?: 'vertical' | 'horizontal' | 'inline'
  // 是否显示操作按钮
  showActions?: boolean
  // 操作按钮配置
  actions?: ButtonConfig[]
  // 操作按钮对齐方式
  actionsAlign?: 'start' | 'center' | 'end' | 'between'
}

const props = withDefaults(defineProps<Props>(), {
  layout: 'vertical',
  showActions: true,
  actionsAlign: 'end'
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
const errors = ref<Record<string, string>>({})

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
 * 校验表单
 */
function validate(): boolean {
  errors.value = {}
  let isValid = true
  
  props.fields.forEach(field => {
    // 必填校验
    if (field.required && !formData.value[field.name]) {
      errors.value[field.name] = `${field.label || field.name}不能为空`
      isValid = false
      return
    }
    
    // 自定义校验规则
    if (field.rules) {
      for (const rule of field.rules) {
        const result = rule(formData.value[field.name])
        if (result !== true) {
          errors.value[field.name] = result
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
      margin-bottom: 16px;
    }
  }
  
  &.form-horizontal {
    .form-field {
      display: grid;
      grid-template-columns: 120px 1fr;
      gap: 12px;
      align-items: start;
      margin-bottom: 16px;
      
      .field-label {
        text-align: right;
        padding-top: 8px;
      }
    }
  }
  
  &.form-inline {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    
    .form-field {
      display: flex;
      align-items: center;
      gap: 8px;
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
  margin-top: 4px;
}

.form-actions {
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid var(--border-color);
}
</style>

