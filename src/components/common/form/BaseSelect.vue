<template>
  <div class="base-select-wrapper" :class="wrapperClasses">
    <label v-if="label" :for="selectId" class="select-label">
      {{ label }}
      <span v-if="required" class="required-mark">*</span>
    </label>
    
    <div class="select-container">
      <select
        :id="selectId"
        :value="modelValue"
        :disabled="disabled"
        :multiple="multiple"
        :class="selectClasses"
        @change="handleChange"
        @blur="$emit('blur')"
        @focus="$emit('focus')"
      >
        <option v-if="placeholder && !multiple" value="" disabled selected>{{ placeholder }}</option>
        <option
          v-for="option in options"
          :key="option.value"
          :value="option.value"
          :disabled="option.disabled"
        >
          {{ option.label }}
        </option>
      </select>
      
      <button
        v-if="clearable && ((!multiple && modelValue !== '' && modelValue !== null) || (multiple && modelValue && (modelValue as any[]).length > 0)) && !disabled"
        class="select-clear-btn"
        type="button"
        @click.stop="handleClear"
        title="清空"
      >
        ✕
      </button>

      <span class="select-arrow">▼</span>
    </div>
    
    <div v-if="hint || props.status === 'error' || props.status === 'warning'" class="select-hint" :class="{ 'error': props.status === 'error', 'warning': props.status === 'warning' }">
      <span v-if="props.status === 'error'">⚠️</span>
      <span v-else-if="props.status === 'warning'">⚠️</span>
      {{ props.hint }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface SelectOption {
  /**
   * 选项的显示文本。
   */
  label: string
  /**
   * 选项的值。
   */
  value: any
  /**
   * 选项是否禁用。
   * @default false
   */
  disabled?: boolean
  /**
   * 选项的描述文本，可在自定义渲染时使用。
   */
  description?: string
}

interface Props {
  /**
   * v-model 绑定的值。单选时为 `string | number`，多选时为 `any[]`。
   */
  modelValue?: string | number | any[]
  /**
   * 选项列表。
   */
  options: SelectOption[]
  /**
   * 选择框的标签文本。
   */
  label?: string
  /**
   * 占位符文本，当未选择任何项时显示。
   */
  placeholder?: string
  /**
   * 选择框的尺寸。
   * @values 'sm' | 'md' | 'lg'
   * @default 'md'
   */
  size?: 'sm' | 'md' | 'lg'
  /**
   * 是否禁用选择框。
   * @default false
   */
  disabled?: boolean
  /**
   * 是否显示必填标记。
   * @default false
   */
  required?: boolean
  /**
   * 是否可清空已选值。
   * @default false
   */
  clearable?: boolean
  /**
   * 是否支持多选。
   * @default false
   */
  multiple?: boolean
  /**
   * 提示文本。
   */
  hint?: string
  /**
   * 选择框的当前状态。
   * @values 'normal' | 'error' | 'success' | 'warning'
   * @default 'normal'
   */
  status?: 'normal' | 'error' | 'success' | 'warning'
  /**
   * 选择框的唯一 ID。
   * @default 随机生成的 ID
   */
  selectId?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  options: () => [],
  label: '',
  placeholder: '',
  size: 'md',
  disabled: false,
  required: false,
  clearable: false,
  multiple: false,
  hint: '',
  status: 'normal',
  selectId: `select-${Math.random().toString(36).substr(2, 9)}`
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number | any[]]
  'blur': []
  'focus': []
  'change': [value: string | number | any[]]
}>()

const wrapperClasses = computed(() => ({
  'has-error': props.status === 'error',
  'is-disabled': props.disabled
}))

const selectClasses = computed(() => [
  'base-select',
  `select-${props.size}`,
  {
    'is-error': props.status === 'error',
    'has-clear-btn': props.clearable && ((!props.multiple && props.modelValue !== '' && props.modelValue !== null) || (props.multiple && props.modelValue && (props.modelValue as any[]).length > 0)) && !props.disabled
  }
])

function handleChange(event: Event) {
  const target = event.target as HTMLSelectElement
  let value: string | number | any[]

  if (props.multiple) {
    value = Array.from(target.options)
      .filter(option => option.selected)
      .map(option => option.value)
  } else {
    value = target.value
  }

  emit('update:modelValue', value)
  emit('change', value)
}

function handleClear() {
  const newValue = props.multiple ? [] : ''
  emit('update:modelValue', newValue)
  emit('change', newValue)
  // 清空时不触发 blur 或 focus，但如果需要可以额外 emit
}
</script>

<style scoped lang="scss">
/* ========== 下拉框包装器 ========== */
.base-select-wrapper {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  width: 100%;
}

/* ========== 标签 ========== */
.select-label {
  display: block;
  font-size: 0.9rem;
  font-weight: var(--font-weight-medium);
  color: var(--text-secondary);
  margin-bottom: var(--spacing-xs); /* 使用语义化变量 */

  .required-mark {
    color: var(--danger-color);
    margin-left: 2px;
  }
}

/* ========== 下拉容器 ========== */
.select-container {
  position: relative;
  display: flex;
  align-items: center;
}

/* ========== 下拉框基础样式 ========== */
.base-select {
  width: 100%;
  background: var(--bg-input);
  border: var(--border-width) solid var(--border-color);
  color: var(--text-primary);
  font-family: inherit;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  appearance: none;
  box-sizing: border-box;

  &:hover:not(:disabled) {
    border-color: var(--color-gray-400);
  }

  &:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: var(--shadow-sm-primary); /* 使用语义化变量 */
  }

  &:disabled {
    background: var(--bg-hover);
    cursor: not-allowed;
    opacity: 0.6;
  }

  option {
    background: var(--bg-card);
    color: var(--text-primary);
    padding: var(--spacing-sm);

    &:disabled {
      color: var(--text-muted);
    }
  }
}

/* ========== 尺寸变体 ========== */
.select-sm {
  padding: var(--spacing-xs) var(--spacing-xl) var(--spacing-xs) var(--spacing-md);
  font-size: 0.875rem;
  border-radius: var(--radius-sm);
}

.select-md {
  padding: var(--spacing-sm) var(--spacing-2xl) var(--spacing-sm) var(--spacing-md);
  font-size: 1rem;
  border-radius: var(--radius-md);
}

.select-lg {
  padding: var(--spacing-md) var(--spacing-2xl) var(--spacing-md) var(--spacing-lg);
  font-size: 1.125rem;
  border-radius: var(--radius-lg);
}

/* ========== 箭头图标 ========== */
.select-arrow {
  position: absolute;
  right: var(--spacing-md);
  pointer-events: none;
  color: var(--text-muted);
  font-size: 0.7rem;
  transition: transform var(--transition-duration-normal) var(--transition-ease-out); /* 使用语义化变量 */
}

.base-select:focus ~ .select-arrow {
  transform: rotate(180deg);
  color: var(--primary-color);
}

/* 清空按钮 */
.select-clear-btn {
  position: absolute;
  right: var(--spacing-xl);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border: none;
  background: var(--bg-button-secondary); /* 使用语义化变量 */
  color: var(--text-button-secondary); /* 使用语义化变量 */
  border-radius: var(--radius-full);
  cursor: pointer;
  font-size: 0.9rem;
  transition: all var(--transition-duration-normal) var(--transition-ease-out); /* 使用语义化变量 */
  z-index: 2;

  &:hover {
    background: var(--bg-danger); /* 使用语义化变量 */
    color: var(--text-on-danger); /* 使用语义化变量 */
  }
}

/* 如果有清空按钮，调整箭头位置 */
.has-clear-btn .select-arrow {
  right: calc(var(--spacing-xl) + 20px + var(--spacing-xs));
}
/* ========== 错误状态 ========== */
.is-error {
  border-color: var(--danger-color) !important;

  &:focus {
    box-shadow: var(--shadow-sm-danger); /* 使用语义化变量 */
  }
}

/* ========== 提示文本 ========== */
.select-hint {
  font-size: 0.85rem;
  color: var(--text-muted);

  &.error {
    color: var(--danger-color);
  }
}
</style>

