<template>
  <div class="base-input-wrapper" :class="wrapperClasses">
    <label v-if="label" :for="inputId" class="input-label">
      {{ label }}
      <span v-if="required" class="required-mark">*</span>
    </label>
    
    <div class="input-container">
      <span v-if="prefixIcon" class="input-prefix-icon">{{ prefixIcon }}</span>
      
      <input
        :id="inputId"
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :maxlength="maxlength"
        :class="inputClasses"
        @input="handleInput"
        @blur="handleBlur"
        @focus="handleFocus"
        @keyup.enter="$emit('enter')"
      />
      
      <span v-if="suffixIcon" class="input-suffix-icon">{{ suffixIcon }}</span>
      
      <button
        v-if="clearable && modelValue && !disabled && !readonly"
        class="input-clear-btn"
        type="button"
        @click="handleClear"
        title="清空"
      >
        ✕
      </button>
    </div>
    
    <div v-if="hint || error" class="input-hint" :class="{ 'error': error }">
      {{ error || hint }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

interface Props {
  // v-model 绑定值
  modelValue?: string | number
  // 输入框类型
  type?: string
  // 标签文本
  label?: string
  // 占位符
  placeholder?: string
  // 尺寸
  size?: 'sm' | 'md' | 'lg'
  // 禁用
  disabled?: boolean
  // 只读
  readonly?: boolean
  // 必填标记
  required?: boolean
  // 可清空
  clearable?: boolean
  // 最大长度
  maxlength?: number
  // 前缀图标
  prefixIcon?: string
  // 后缀图标
  suffixIcon?: string
  // 提示文本
  hint?: string
  // 错误信息
  error?: string
  // 输入框ID
  inputId?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  type: 'text',
  label: '',
  placeholder: '',
  size: 'md',
  disabled: false,
  readonly: false,
  required: false,
  clearable: false,
  maxlength: undefined,
  prefixIcon: '',
  suffixIcon: '',
  hint: '',
  error: '',
  inputId: `input-${Math.random().toString(36).substr(2, 9)}`
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
  'blur': []
  'focus': []
  'enter': []
  'clear': []
}>()

const isFocused = ref(false)

const wrapperClasses = computed(() => ({
  'has-error': !!props.error,
  'is-disabled': props.disabled,
  'is-focused': isFocused.value
}))

const inputClasses = computed(() => [
  'base-input',
  `input-${props.size}`,
  {
    'has-prefix': !!props.prefixIcon,
    'has-suffix': !!props.suffixIcon || (props.clearable && props.modelValue),
    'is-error': !!props.error
  }
])

function handleInput(event: Event) {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.value)
}

function handleBlur() {
  isFocused.value = false
  emit('blur')
}

function handleFocus() {
  isFocused.value = true
  emit('focus')
}

function handleClear() {
  emit('update:modelValue', '')
  emit('clear')
}
</script>

<style scoped lang="scss">
/* ========== 输入框包装器 ========== */
.base-input-wrapper {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  width: 100%;
}

/* ========== 标签 ========== */
.input-label {
  display: block;
  font-size: 0.9rem;
  font-weight: var(--font-weight-medium);
  color: var(--text-secondary);
  margin-bottom: var(--spacing-xs);

  .required-mark {
    color: var(--danger-color);
    margin-left: 2px;
  }
}

/* ========== 输入容器 ========== */
.input-container {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
}

/* ========== 输入框基础样式 ========== */
.base-input {
  flex: 1;
  width: 100%;
  background: var(--bg-input);
  border: var(--border-width) solid var(--border-color);
  color: var(--text-primary);
  font-family: inherit;
  font-size: 1rem;
  transition: all 0.3s ease;
  box-sizing: border-box;

  &::placeholder {
    color: var(--text-muted);
    opacity: 0.7;
  }

  &:hover:not(:disabled):not(:readonly) {
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

  &:readonly {
    background: var(--bg-card);
    cursor: default;
  }
}

/* ========== 尺寸变体 ========== */
.input-sm {
  padding: var(--spacing-xs) var(--spacing-md);
  font-size: 0.875rem;
  border-radius: var(--radius-sm);

  &.has-prefix {
    padding-left: var(--spacing-3xl);
  }

  &.has-suffix {
    padding-right: var(--spacing-3xl);
  }
}

.input-md {
  padding: var(--spacing-sm) var(--spacing-md);
  font-size: 1rem;
  border-radius: var(--radius-md);

  &.has-prefix {
    padding-left: calc(var(--spacing-3xl) + var(--spacing-sm));
  }

  &.has-suffix {
    padding-right: calc(var(--spacing-3xl) + var(--spacing-sm));
  }
}

.input-lg {
  padding: var(--spacing-md) var(--spacing-lg);
  font-size: 1.125rem;
  border-radius: var(--radius-lg);

  &.has-prefix {
    padding-left: calc(var(--spacing-3xl) + var(--spacing-md));
  }

  &.has-suffix {
    padding-right: calc(var(--spacing-3xl) + var(--spacing-md));
  }
}

/* ========== 错误状态 ========== */
.is-error {
  border-color: var(--danger-color) !important;

  &:focus {
    box-shadow: 0 0 0 3px rgba(var(--danger-color), 0.1);
  }
}

/* ========== 前缀/后缀图标 ========== */
.input-prefix-icon,
.input-suffix-icon {
  position: absolute;
  display: flex;
  align-items: center;
  color: var(--text-muted);
  font-size: 1.2em;
  pointer-events: none;
}

.input-prefix-icon {
  left: var(--spacing-md);
}

.input-suffix-icon {
  right: var(--spacing-md);
}

/* ========== 清空按钮 ========== */
.input-clear-btn {
  position: absolute;
  right: var(--spacing-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border: none;
  background: var(--bg-hover);
  color: var(--text-secondary);
  border-radius: var(--radius-full);
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s ease;

  &:hover {
    background: var(--danger-color);
    color: var(--text-white);
  }
}

/* ========== 提示文本 ========== */
.input-hint {
  font-size: 0.85rem;
  color: var(--text-muted);
  margin-top: var(--spacing-xs);

  &.error {
    color: var(--danger-color);
  }
}
</style>

