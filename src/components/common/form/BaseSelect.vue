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
        :class="selectClasses"
        @change="handleChange"
        @blur="$emit('blur')"
        @focus="$emit('focus')"
      >
        <option v-if="placeholder" value="" disabled selected>{{ placeholder }}</option>
        <option
          v-for="option in options"
          :key="option.value"
          :value="option.value"
          :disabled="option.disabled"
        >
          {{ option.label }}
        </option>
      </select>
      
      <span class="select-arrow">▼</span>
    </div>
    
    <div v-if="hint || error" class="select-hint" :class="{ 'error': error }">
      {{ error || hint }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface SelectOption {
  label: string
  value: string | number
  disabled?: boolean
}

interface Props {
  // v-model 绑定值
  modelValue?: string | number
  // 选项列表
  options: SelectOption[]
  // 标签文本
  label?: string
  // 占位符
  placeholder?: string
  // 尺寸
  size?: 'sm' | 'md' | 'lg'
  // 禁用
  disabled?: boolean
  // 必填标记
  required?: boolean
  // 提示文本
  hint?: string
  // 错误信息
  error?: string
  // 选择框ID
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
  hint: '',
  error: '',
  selectId: `select-${Math.random().toString(36).substr(2, 9)}`
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
  'blur': []
  'focus': []
  'change': [value: string | number]
}>()

const wrapperClasses = computed(() => ({
  'has-error': !!props.error,
  'is-disabled': props.disabled
}))

const selectClasses = computed(() => [
  'base-select',
  `select-${props.size}`,
  {
    'is-error': !!props.error
  }
])

function handleChange(event: Event) {
  const target = event.target as HTMLSelectElement
  const value = target.value
  emit('update:modelValue', value)
  emit('change', value)
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
    box-shadow: 0 0 0 3px rgba(var(--primary-color), 0.1);
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
  transition: transform 0.3s ease;
}

.base-select:focus ~ .select-arrow {
  transform: rotate(180deg);
  color: var(--primary-color);
}

/* ========== 错误状态 ========== */
.is-error {
  border-color: var(--danger-color) !important;

  &:focus {
    box-shadow: 0 0 0 3px rgba(var(--danger-color), 0.1);
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

