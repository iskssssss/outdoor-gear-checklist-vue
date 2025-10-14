<template>
  <button
    :class="buttonClasses"
    :type="type"
    :disabled="disabled || loading"
    @click="handleClick"
  >
    <span v-if="loading" class="btn-loading">
      <span class="spinner"></span>
    </span>
    <span v-if="icon && iconPosition === 'left'" class="btn-icon" :class="`icon-${iconSize}`">{{ icon }}</span>
    <span class="btn-content"><slot></slot></span>
    <span v-if="icon && iconPosition === 'right'" class="btn-icon" :class="`icon-${iconSize}`">{{ icon }}</span>
    <span v-if="$slots.badge" class="btn-badge">
      <slot name="badge"></slot>
    </span>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  // 按钮类型
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'secondary' | 'outline' | 'text' | 'dashed'
  // 按钮尺寸
  size?: 'sm' | 'md' | 'lg'
  // 原生type属性
  type?: 'button' | 'submit' | 'reset'
  // 禁用状态
  disabled?: boolean
  // 加载状态
  loading?: boolean
  // 图标
  icon?: string
  // 图标位置
  iconPosition?: 'left' | 'right'
  // 图标大小
  iconSize?: 'sm' | 'md' | 'lg'
  // 块级按钮（占满宽度）
  block?: boolean
  // 圆角按钮
  rounded?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  type: 'button',
  disabled: false,
  loading: false,
  icon: '',
  iconPosition: 'left',
  iconSize: 'md',
  block: false,
  rounded: false
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const buttonClasses = computed(() => [
  'base-btn',
  `btn-${props.variant}`,
  `btn-${props.size}`,
  {
    'btn-block': props.block,
    'btn-rounded': props.rounded,
    'btn-loading': props.loading
  }
])

function handleClick(event: MouseEvent) {
  if (!props.disabled && !props.loading) {
    emit('click', event)
  }
}
</script>

<style scoped lang="scss">
/* ========== 基础按钮样式 ========== */
.base-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  font-family: inherit;
  font-weight: var(--font-weight-medium);
  text-align: center;
  white-space: nowrap;
  vertical-align: middle;
  user-select: none;
  border: var(--border-width) solid transparent;
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
  overflow: hidden;

  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(var(--primary-color), 0.2);
  }

  &:disabled,
  &.btn-loading {
    opacity: 0.6;
    cursor: not-allowed;
    pointer-events: none;
  }
}

/* ========== 按钮尺寸 ========== */
.btn-sm {
  padding: var(--spacing-xs) var(--spacing-md);
  font-size: 0.875rem;
  border-radius: var(--radius-sm);
}

.btn-md {
  padding: var(--spacing-sm) var(--spacing-lg);
  font-size: 1rem;
  border-radius: var(--radius-md);
}

.btn-lg {
  padding: var(--spacing-md) var(--spacing-xl);
  font-size: 1.125rem;
  border-radius: var(--radius-lg);
}

/* ========== 按钮变体 ========== */
.btn-primary {
  background: var(--primary-color);
  color: var(--btn-primary-text);
  border-color: var(--primary-color);

  &:hover:not(:disabled) {
    background: var(--primary-dark);
    border-color: var(--primary-dark);
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }
}

.btn-success {
  background: var(--success-color);
  color: var(--btn-success-text);
  border-color: var(--success-color);

  &:hover:not(:disabled) {
    background: var(--color-success-600);
    border-color: var(--color-success-600);
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
  }
}

.btn-warning {
  background: var(--warning-color);
  color: var(--color-warning-900);
  border-color: var(--warning-color);

  &:hover:not(:disabled) {
    background: var(--color-warning-600);
    border-color: var(--color-warning-600);
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
  }
}

.btn-danger {
  background: var(--danger-color);
  color: var(--btn-danger-text);
  border-color: var(--danger-color);

  &:hover:not(:disabled) {
    background: var(--color-danger-700);
    border-color: var(--color-danger-700);
    transform: translateY(-2px);
    box-shadow: var(--danger-shadow);
  }
}

.btn-info {
  background: var(--info-color);
  color: var(--btn-primary-text);
  border-color: var(--info-color);

  &:hover:not(:disabled) {
    background: var(--color-info-600);
    border-color: var(--color-info-600);
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
  }
}

.btn-secondary {
  background: var(--bg-button-group);
  color: var(--text-primary);
  border-color: var(--border-color);

  &:hover:not(:disabled) {
    background: var(--bg-hover);
    border-color: var(--color-gray-400);
    transform: translateY(-2px);
    box-shadow: var(--shadow-sm);
  }
}

.btn-outline {
  background: transparent;
  color: var(--primary-color);
  border-color: var(--primary-color);

  &:hover:not(:disabled) {
    background: var(--primary-color);
    color: var(--btn-primary-text);
  }
}

.btn-text {
  background: transparent;
  color: var(--primary-color);
  border-color: transparent;

  &:hover:not(:disabled) {
    background: var(--bg-hover);
  }
}

.btn-dashed {
  background: transparent;
  color: var(--primary-color);
  border: var(--border-width) dashed var(--primary-color);

  &:hover:not(:disabled) {
    background: var(--bg-hover);
    border-color: var(--primary-dark);
  }
}

/* ========== 按钮修饰符 ========== */
.btn-block {
  display: flex;
  width: 100%;
}

.btn-rounded {
  border-radius: var(--radius-full);
}

/* ========== 加载状态 ========== */
.btn-loading {
  .spinner {
    display: inline-block;
    width: 14px;
    height: 14px;
    border: 2px solid currentColor;
    border-top-color: transparent;
    border-radius: var(--radius-full);
    animation: spin 0.6s linear infinite;
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* ========== 图标样式 ========== */
.btn-icon {
  display: inline-flex;
  font-size: 1.2em;
  line-height: 1;

  &.icon-sm {
    font-size: 1rem;
  }

  &.icon-md {
    font-size: 1.2em;
  }

  &.icon-lg {
    font-size: 1.5em;
  }
}

.btn-content {
  display: inline-flex;
  align-items: center;
}

/* ========== Badge 样式 ========== */
.btn-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  background: var(--bg-mask);
  border-radius: 9px;
  font-size: 0.7rem;
  font-weight: 700;
  margin-left: 4px;
  line-height: 1;
}
</style>

