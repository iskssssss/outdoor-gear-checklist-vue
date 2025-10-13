<template>
  <div class="base-textarea-wrapper" :class="wrapperClasses">
    <label v-if="label" :for="textareaId" class="textarea-label">
      {{ label }}
      <span v-if="required" class="required-mark">*</span>
    </label>
    
    <div class="textarea-container">
      <textarea
        :id="textareaId"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :maxlength="maxlength"
        :rows="rows"
        :class="textareaClasses"
        @input="handleInput"
        @blur="$emit('blur')"
        @focus="$emit('focus')"
      ></textarea>
      
      <div v-if="showCount && maxlength" class="char-count">
        {{ charCount }} / {{ maxlength }}
      </div>
    </div>
    
    <div v-if="hint || error" class="textarea-hint" :class="{ 'error': error }">
      {{ error || hint }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  // v-model 绑定值
  modelValue?: string
  // 标签文本
  label?: string
  // 占位符
  placeholder?: string
  // 尺寸
  size?: 'sm' | 'md' | 'lg'
  // 行数
  rows?: number
  // 禁用
  disabled?: boolean
  // 只读
  readonly?: boolean
  // 必填标记
  required?: boolean
  // 最大长度
  maxlength?: number
  // 显示字符计数
  showCount?: boolean
  // 提示文本
  hint?: string
  // 错误信息
  error?: string
  // 文本域ID
  textareaId?: string
  // 自动调整高度
  autosize?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  label: '',
  placeholder: '',
  size: 'md',
  rows: 4,
  disabled: false,
  readonly: false,
  required: false,
  maxlength: undefined,
  showCount: true,  // 默认显示字符计数，用户体验更好
  hint: '',
  error: '',
  textareaId: `textarea-${Math.random().toString(36).substr(2, 9)}`,
  autosize: false
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'blur': []
  'focus': []
}>()

const wrapperClasses = computed(() => ({
  'has-error': !!props.error,
  'is-disabled': props.disabled
}))

const textareaClasses = computed(() => [
  'base-textarea',
  `textarea-${props.size}`,
  {
    'is-error': !!props.error,
    'has-count': props.showCount && props.maxlength
  }
])

const charCount = computed(() => {
  return props.modelValue?.length || 0
})

function handleInput(event: Event) {
  const target = event.target as HTMLTextAreaElement
  emit('update:modelValue', target.value)
}
</script>

<style scoped lang="scss">
/* ========== 文本域包装器 ========== */
.base-textarea-wrapper {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  width: 100%;
}

/* ========== 标签 ========== */
.textarea-label {
  display: block;
  font-size: 0.9rem;
  font-weight: var(--font-weight-medium);
  color: var(--text-secondary);

  .required-mark {
    color: var(--danger-color);
    margin-left: 2px;
  }
}

/* ========== 文本域容器 ========== */
.textarea-container {
  position: relative;
  width: 100%;
}

/* ========== 文本域基础样式 ========== */
.base-textarea {
  width: 100%;
  background: var(--bg-input);
  border: var(--border-width) solid var(--border-color);
  color: var(--text-primary);
  font-family: inherit;
  line-height: 1.5;
  resize: vertical;
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
    resize: none;
  }

  &:readonly {
    background: var(--bg-card);
    cursor: default;
  }

  &.has-count {
    padding-bottom: var(--spacing-xl);
  }
}

/* ========== 尺寸变体 ========== */
.textarea-sm {
  padding: var(--spacing-xs) var(--spacing-md);
  font-size: 0.875rem;
  border-radius: var(--radius-sm);
}

.textarea-md {
  padding: var(--spacing-sm) var(--spacing-md);
  font-size: 1rem;
  border-radius: var(--radius-md);
}

.textarea-lg {
  padding: var(--spacing-md) var(--spacing-lg);
  font-size: 1.125rem;
  border-radius: var(--radius-lg);
}

/* ========== 错误状态 ========== */
.is-error {
  border-color: var(--danger-color) !important;

  &:focus {
    box-shadow: 0 0 0 3px rgba(var(--danger-color), 0.1);
  }
}

/* ========== 字符计数 ========== */
.char-count {
  position: absolute;
  bottom: var(--spacing-sm);
  right: var(--spacing-md);
  font-size: 0.75rem;
  color: var(--text-muted);
  pointer-events: none;
}

/* ========== 提示文本 ========== */
.textarea-hint {
  font-size: 0.85rem;
  color: var(--text-muted);

  &.error {
    color: var(--danger-color);
  }
}
</style>

