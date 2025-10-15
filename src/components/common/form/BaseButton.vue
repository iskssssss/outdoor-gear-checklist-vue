<template>
  <button
    :class="buttonClasses"
    :style="buttonStyle"
    :type="nativeType"
    :disabled="disabled || loading"
    @click="handleClick"
  >
    <span v-if="loading" class="btn-loading">
      <span class="spinner"></span>
    </span>
    <span v-if="icon && iconPosition === 'left'" class="btn-icon" :class="`icon-${iconSize}`">{{ icon }}</span>
    <span v-if="icon && iconPosition === 'only'" class="btn-icon" :class="`icon-${iconSize}`">{{ icon }}</span>
    <span v-if="iconPosition !== 'only'" class="btn-content"><slot></slot></span>
    <span v-if="icon && iconPosition === 'right'" class="btn-icon" :class="`icon-${iconSize}`">{{ icon }}</span>
    <span v-if="$slots.badge" class="btn-badge">
      <slot name="badge"></slot>
    </span>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  /**
   * 按钮的风格变体。
   * @values 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'secondary' | 'outline' | 'text' | 'dashed' | 'link' | 'ghost'
   * @default 'primary'
   */
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'secondary' | 'outline' | 'text' | 'dashed' | 'link' | 'ghost'
  /**
   * 按钮的尺寸。
   * @values 'xs' | 'sm' | 'md' | 'lg' | 'xl'
   * @default 'md'
   */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  /**
   * 原生 button 元素的 type 属性。
   * @values 'button' | 'submit' | 'reset'
   * @default 'button'
   */
  nativeType?: 'button' | 'submit' | 'reset'
  /**
   * 按钮是否禁用。
   * @default false
   */
  disabled?: boolean
  /**
   * 按钮是否处于加载状态。
   * @default false
   */
  loading?: boolean
  /**
   * 按钮的图标。通常是一个字体图标类名或 SVG 名称。
   */
  icon?: string
  /**
   * 图标在按钮中的位置。
   * @values 'left' | 'right' | 'only'
   * @default 'left'
   */
  iconPosition?: 'left' | 'right' | 'only'
  /**
   * 图标的尺寸。
   * @values 'xs' | 'sm' | 'md' | 'lg' | 'xl'
   * @default 'md'
   */
  iconSize?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  /**
   * 按钮是否为块级元素，宽度占满其父元素。
   * @default false
   */
  block?: boolean
  /**
   * 按钮是否为完全圆角。
   * @default false
   */
  rounded?: boolean
  /**
   * 按钮的形状。
   * @values 'default' | 'circle' | 'round'
   * @default 'default'
   */
  shape?: 'default' | 'circle' | 'round'
  /**
   * 按钮是否为危险/错误状态。
   * @default false
   */
  danger?: boolean
  /**
   * 按钮在按钮组中的位置。
   * @values 'first' | 'middle' | 'last' | 'only'
   * @default 'only'
   */
  groupPosition?: 'first' | 'middle' | 'last' | 'only'
  /**
   * 按钮的最小宽度。可以是一个数字 (px) 或 CSS 字符串。
   */
  minWidth?: string | number
  /**
   * 按钮的最大宽度。可以是一个数字 (px) 或 CSS 字符串。
   */
  maxWidth?: string | number
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  nativeType: 'button', // Changed from 'type' to 'nativeType'
  disabled: false,
  loading: false,
  icon: '',
  iconPosition: 'left',
  iconSize: 'md',
  block: false,
  rounded: false,
  shape: 'default',
  danger: false,
  groupPosition: 'only',
  minWidth: undefined,
  maxWidth: undefined
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const buttonClasses = computed(() => [
  'base-btn',
  `btn-${props.variant}`,
  `btn-${props.size}`,
  `btn-shape-${props.shape}`,
  {
    'btn-block': props.block,
    'btn-rounded': props.rounded,
    'btn-loading': props.loading,
    'btn-danger': props.danger,
    'btn-group-first': props.groupPosition === 'first',
    'btn-group-middle': props.groupPosition === 'middle',
    'btn-group-last': props.groupPosition === 'last',
    'btn-icon-only': props.iconPosition === 'only'
  }
])

const buttonStyle = computed(() => ({
  minWidth: props.minWidth ? (typeof props.minWidth === 'number' ? `${props.minWidth}px` : props.minWidth) : undefined,
  maxWidth: props.maxWidth ? (typeof props.maxWidth === 'number' ? `${props.maxWidth}px` : props.maxWidth) : undefined
}))

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
.btn-xs {
  padding: var(--spacing-xs) var(--spacing-sm);
  font-size: 0.75rem;
  min-height: 24px;
  border-radius: var(--radius-sm);
}

.btn-sm {
  padding: var(--spacing-xs) var(--spacing-md);
  font-size: 0.875rem;
  min-height: 28px;
  border-radius: var(--radius-sm);
}

.btn-md {
  padding: var(--spacing-sm) var(--spacing-lg);
  font-size: 1rem;
  min-height: 32px;
  border-radius: var(--radius-md);
}

.btn-lg {
  padding: var(--spacing-md) var(--spacing-xl);
  font-size: 1.125rem;
  min-height: 40px;
  border-radius: var(--radius-lg);
}

.btn-xl {
  padding: var(--spacing-lg) var(--spacing-2xl);
  font-size: 1.25rem;
  min-height: 48px;
  border-radius: var(--radius-xl);
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
    background: var(--success-dark);
    border-color: var(--success-dark);
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
  }
}

.btn-warning {
  background: var(--warning-color);
  color: var(--btn-warning-text);
  border-color: var(--warning-color);

  &:hover:not(:disabled) {
    background: var(--warning-dark);
    border-color: var(--warning-dark);
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
  }
}

.btn-danger {
  background: var(--danger-color);
  color: var(--btn-danger-text);
  border-color: var(--danger-color);

  &:hover:not(:disabled) {
    background: var(--danger-dark);
    border-color: var(--danger-dark);
    transform: translateY(-2px);
    box-shadow: var(--danger-shadow);
  }
}

.btn-info {
  background: var(--info-color);
  color: var(--btn-info-text);
  border-color: var(--info-color);

  &:hover:not(:disabled) {
    background: var(--info-dark);
    border-color: var(--info-dark);
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

.btn-link {
  background: transparent;
  color: var(--primary-color);
  border: none;
  text-decoration: underline;
  padding: 0;

  &:hover:not(:disabled) {
    color: var(--primary-dark);
    text-decoration: none;
  }
}

.btn-ghost {
  background: transparent;
  color: var(--primary-color);
  border: var(--border-width) solid var(--primary-color);

  &:hover:not(:disabled) {
    background: var(--primary-color);
    color: var(--btn-primary-text);
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

/* ========== 按钮形状变体 ========== */
.btn-shape-circle {
  border-radius: var(--radius-full);
  width: 32px;
  height: 32px;
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  
  &.btn-xs {
    width: 24px;
    height: 24px;
  }
  
  &.btn-sm {
    width: 28px;
    height: 28px;
  }
  
  &.btn-md {
    width: 32px;
    height: 32px;
  }
  
  &.btn-lg {
    width: 40px;
    height: 40px;
  }
  
  &.btn-xl {
    width: 48px;
    height: 48px;
  }
}

.btn-shape-round {
  border-radius: var(--radius-full);
  padding-left: var(--spacing-lg);
  padding-right: var(--spacing-lg);
}

/* ========== 危险状态 ========== */
.btn-danger {
  &.btn-primary {
    background: var(--danger-color);
    border-color: var(--danger-color);
    color: var(--btn-danger-text);

    &:hover:not(:disabled) {
      background: var(--danger-dark);
      border-color: var(--danger-dark);
    }
  }

  &.btn-outline {
    color: var(--danger-color);
    border-color: var(--danger-color);

    &:hover:not(:disabled) {
      background: var(--danger-color);
      color: var(--btn-danger-text);
    }
  }

  &.btn-text {
    color: var(--danger-color);

    &:hover:not(:disabled) {
      background: var(--danger-light);
    }
  }

  &.btn-ghost {
    color: var(--danger-color);
    border-color: var(--danger-color);

    &:hover:not(:disabled) {
      background: var(--danger-color);
      color: var(--btn-danger-text);
    }
  }
}

/* ========== 按钮组样式 ========== */
.btn-group-first {
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
  border-right: none;
}

.btn-group-middle {
  border-radius: 0;
  border-right: none;
}

.btn-group-last {
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
}

.btn-group-first:not(:last-child) {
  border-right: none;
}

.btn-group-middle:not(:last-child) {
  border-right: none;
}

/* ========== 图标按钮 ========== */
.btn-icon-only {
  padding: 0;
  width: auto;
  min-width: auto;

  &.btn-xs {
    width: 24px;
    height: 24px;
  }

  &.btn-sm {
    width: 28px;
    height: 28px;
  }

  &.btn-md {
    width: 32px;
    height: 32px;
  }

  &.btn-lg {
    width: 40px;
    height: 40px;
  }

  &.btn-xl {
    width: 48px;
    height: 48px;
  }
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

  &.icon-xs {
    font-size: 0.875rem;
  }

  &.icon-sm {
    font-size: 1rem;
  }

  &.icon-md {
    font-size: 1.2em;
  }

  &.icon-lg {
    font-size: 1.5em;
  }

  &.icon-xl {
    font-size: 1.75em;
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

