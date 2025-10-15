<template>
  <div class="base-input-wrapper" :class="wrapperClasses">
    <label v-if="label" :for="inputId" class="input-label">
      {{ label }}
      <span v-if="required" class="required-mark">*</span>
    </label>
    
    <div class="input-container">
      <!-- 前缀图标 -->
      <span v-if="prefixIcon" class="input-prefix-icon">{{ prefixIcon }}</span>
      
      <!-- 前缀文本 -->
      <span v-if="prefixText" class="input-prefix-text">{{ prefixText }}</span>
      
      <!-- 输入框 -->
      <input
        ref="inputRef"
        :id="inputId"
        :type="currentInputType"
        :value="displayValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :maxlength="maxlength"
        :minlength="minlength"
        :autocomplete="autocomplete"
        :autofocus="autofocus"
        :class="inputClasses"
        @input="handleInput"
        @blur="handleBlur"
        @focus="handleFocus"
        @keyup.enter="$emit('enter')"
      />
      
      <!-- 后缀文本 -->
      <span v-if="suffixText" class="input-suffix-text">{{ suffixText }}</span>
      
      <!-- 后缀图标 -->
      <span v-if="suffixIcon" class="input-suffix-icon">{{ suffixIcon }}</span>
      
      <!-- 密码显示切换按钮 -->
      <button
        v-if="showPassword && type === 'password'"
        class="input-password-toggle"
        type="button"
        @click="togglePasswordVisibility"
        :title="showPasswordText ? '隐藏密码' : '显示密码'"
      >
        {{ showPasswordText ? '👁️' : '👁️‍🗨️' }}
      </button>
      
      <!-- 清空按钮 -->
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
    
    <div v-if="hint || hasError || hasSuccess || hasWarning" class="input-hint" :class="hintClasses">
      <span v-if="hasError">⚠️</span>
      <span v-else-if="hasSuccess">✅</span>
      <span v-else-if="hasWarning">⚠️</span>
      {{ hasError ? (validationError || props.hint) : props.hint }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'

const inputRef = ref<HTMLInputElement | null>(null)
const showPasswordText = ref(false)
const validationError = ref('')

interface Props {
  /**
   * v-model 绑定的值。
   * @default ''
   */
  modelValue?: string | number
  /**
   * 输入框的原生类型。
   * @values 'text' | 'password' | 'email' | 'url' | 'tel' | 'number' | 'search' | 'date' | 'time' | 'datetime-local'
   * @default 'text'
   */
  type?: 'text' | 'password' | 'email' | 'url' | 'tel' | 'number' | 'search' | 'date' | 'time' | 'datetime-local'
  /**
   * 输入框的标签文本。
   */
  label?: string
  /**
   * 输入框的占位符文本。
   */
  placeholder?: string
  /**
   * 输入框的尺寸。
   * @values 'xs' | 'sm' | 'md' | 'lg' | 'xl'
   * @default 'md'
   */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  /**
   * 是否禁用输入框。
   * @default false
   */
  disabled?: boolean
  /**
   * 是否将输入框设置为只读。
   * @default false
   */
  readonly?: boolean
  /**
   * 是否显示必填标记。
   * @default false
   */
  required?: boolean
  /**
   * 是否显示清空按钮。
   * @default true
   */
  clearable?: boolean
  /**
   * 是否显示密码切换按钮（仅当 type 为 'password' 时有效）。
   * @default false
   */
  showPassword?: boolean
  /**
   * 输入框允许的最大长度。
   */
  maxlength?: number
  /**
   * 输入框允许的最小长度。
   */
  minlength?: number
  /**
   * 输入框前缀图标。
   */
  prefixIcon?: string
  /**
   * 输入框后缀图标。
   */
  suffixIcon?: string
  /**
   * 输入框前缀文本。
   */
  prefixText?: string
  /**
   * 输入框后缀文本。
   */
  suffixText?: string
  /**
   * 输入框下方的提示文本。
   */
  hint?: string
  /**
   * 输入框的当前状态。
   * @values 'normal' | 'error' | 'success' | 'warning'
   * @default 'normal'
   */
  status?: 'normal' | 'error' | 'success' | 'warning'
  /**
   * 输入框的唯一 ID。
   * @default 随机生成的 ID
   */
  inputId?: string
  /**
   * 原生 input 元素的 autocomplete 属性。
   */
  autocomplete?: string
  /**
   * 是否自动聚焦。
   * @default false
   */
  autofocus?: boolean
  /**
   * 输入验证规则数组，每个规则函数接收当前值并返回 true（通过）或错误信息字符串（失败）。
   */
  rules?: Array<(value: string) => string | boolean>
  /**
   * 格式化函数，用于显示值。接收原始值，返回格式化后的字符串。
   */
  formatter?: (value: string) => string
  /**
   * 解析函数，用于在 emit update:modelValue 之前解析输入值。接收格式化后的值，返回原始值。
   */
  parser?: (value: string) => string
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
  clearable: true,
  showPassword: false,
  maxlength: undefined,
  minlength: undefined,
  prefixIcon: '',
  suffixIcon: '',
  prefixText: '',
  suffixText: '',
  hint: '',
  status: 'normal', // Default status
  inputId: `input-${Math.random().toString(36).substr(2, 9)}`,
  autocomplete: '',
  autofocus: false,
  rules: () => [],
  formatter: undefined,
  parser: undefined
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
  'blur': []
  'focus': []
  'enter': []
  'clear': []
}>()

const isFocused = ref(false)

// 计算属性
const currentInputType = computed(() => {
  if (props.type === 'password' && showPasswordText.value) {
    return 'text'
  }
  return props.type
})

const displayValue = computed(() => {
  let value = String(props.modelValue || '')
  if (props.formatter && value) {
    value = props.formatter(value)
  }
  return value
})

const hasError = computed(() => props.status === 'error' || !!validationError.value)
const hasSuccess = computed(() => props.status === 'success')
const hasWarning = computed(() => props.status === 'warning')

const wrapperClasses = computed(() => ({
  'has-error': hasError.value,
  'has-success': hasSuccess.value,
  'has-warning': hasWarning.value,
  'is-disabled': props.disabled,
  'is-focused': isFocused.value,
  'has-prefix-text': !!props.prefixText,
  'has-suffix-text': !!props.suffixText
}))

const inputClasses = computed(() => [
  'base-input',
  `input-${props.size}`,
  {
    'has-prefix': !!props.prefixIcon,
    'has-suffix': !!props.suffixIcon || (props.clearable && props.modelValue) || props.showPassword,
    'is-error': hasError.value,
    'is-success': hasSuccess.value,
    'is-warning': hasWarning.value
  }
])

const hintClasses = computed(() => ({
  'error': hasError.value,
  'success': hasSuccess.value,
  'warning': hasWarning.value
}))

function handleInput(event: Event) {
  const target = event.target as HTMLInputElement
  let value = target.value
  
  // 应用解析函数
  if (props.parser) {
    value = props.parser(value)
  }
  
  // 验证输入
  validateInput(value)
  
  emit('update:modelValue', value)
}

function handleBlur() {
  isFocused.value = false
  // 失焦时进行最终验证
  if (props.rules && props.rules.length > 0) {
    validateInput(String(props.modelValue || ''))
  }
  emit('blur')
}

function handleFocus() {
  isFocused.value = true
  emit('focus')
}

function handleClear() {
  emit('update:modelValue', '')
  emit('clear')
  validationError.value = ''
}

function togglePasswordVisibility() {
  showPasswordText.value = !showPasswordText.value
}

function validateInput(value: string) {
  if (!props.rules || props.rules.length === 0) {
    validationError.value = ''
    return
  }
  
  for (const rule of props.rules) {
    const result = rule(value)
    if (result !== true) {
      validationError.value = typeof result === 'string' ? result : '输入格式不正确'
      return
    }
  }
  validationError.value = ''
}

// 暴露方法供父组件调用
function focus() {
  inputRef.value?.focus()
}

function blur() {
  inputRef.value?.blur()
}

function select() {
  inputRef.value?.select()
}

defineExpose({
  focus,
  blur,
  select
})
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
    box-shadow: var(--shadow-sm-primary); // 使用语义化变量
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
.input-xs {
  padding: var(--spacing-xs) var(--spacing-sm);
  font-size: 0.75rem;
  border-radius: var(--radius-sm);
  min-height: 24px;

  &.has-prefix {
    padding-left: var(--spacing-2xl);
  }

  &.has-suffix {
    padding-right: var(--spacing-2xl);
  }
}

.input-sm {
  padding: var(--spacing-xs) var(--spacing-md);
  font-size: 0.875rem;
  border-radius: var(--radius-sm);
  min-height: 28px;

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
  min-height: 32px;

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
  min-height: 40px;

  &.has-prefix {
    padding-left: calc(var(--spacing-3xl) + var(--spacing-md));
  }

  &.has-suffix {
    padding-right: calc(var(--spacing-3xl) + var(--spacing-md));
  }
}

.input-xl {
  padding: var(--spacing-lg) var(--spacing-xl);
  font-size: 1.25rem;
  border-radius: var(--radius-xl);
  min-height: 48px;

  &.has-prefix {
    padding-left: calc(var(--spacing-3xl) + var(--spacing-lg));
  }

  &.has-suffix {
    padding-right: calc(var(--spacing-3xl) + var(--spacing-lg));
  }
}

/* ========== 状态样式 ========== */
.is-error {
  border-color: var(--danger-color) !important;

  &:focus {
    box-shadow: var(--shadow-sm-danger); // 使用语义化变量
  }
}

.is-success {
  border-color: var(--success-color) !important;

  &:focus {
    box-shadow: var(--shadow-sm-success); // 使用语义化变量
  }
}

.is-warning {
  border-color: var(--warning-color) !important;

  &:focus {
    box-shadow: var(--shadow-sm-warning); // 使用语义化变量
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

/* ========== 前缀/后缀文本 ========== */
.input-prefix-text,
.input-suffix-text {
  position: absolute;
  display: flex;
  align-items: center;
  color: var(--text-muted);
  font-size: 0.9em;
  pointer-events: none;
  background: var(--bg-input);
  padding: 0 var(--spacing-sm);
  border-radius: var(--radius-sm);
}

.input-prefix-text {
  left: var(--spacing-sm);
  border-right: var(--border-width) solid var(--border-color);
}

.input-suffix-text {
  right: var(--spacing-sm);
  border-left: var(--border-width) solid var(--border-color);
}

/* ========== 密码切换按钮 ========== */
.input-password-toggle {
  position: absolute;
  right: var(--spacing-md);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border: none;
  background: transparent;
  color: var(--text-muted);
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.2s ease;
  border-radius: var(--radius-sm);

  &:hover {
    background: var(--bg-hover);
    color: var(--text-primary);
  }

  &:active {
    transform: scale(0.95);
  }
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
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);

  &.error {
    color: var(--danger-color);
  }

  &.success {
    color: var(--success-color);
  }

  &.warning {
    color: var(--warning-color);
  }
}
</style>

