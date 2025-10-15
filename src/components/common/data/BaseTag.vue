<template>
  <span :class="tagClasses" :style="tagStyle" @click="handleClick">
    <!-- 图标 -->
    <span v-if="icon" class="tag-icon">{{ icon }}</span>
    
    <!-- 文本内容 -->
    <span v-if="$slots.default || text" class="tag-text">
      <slot>{{ text }}</slot>
    </span>
    
    <!-- 关闭按钮 -->
    <button
      v-if="closable"
      class="tag-close"
      type="button"
      @click.stop="handleClose"
      :title="closeTitle"
    >
      ✕
    </button>
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  // 标签文本
  text?: string
  // 标签类型/颜色
  type?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'secondary' | 'default'
  // 尺寸
  size?: 'xs' | 'sm' | 'md' | 'lg'
  // 形状
  shape?: 'default' | 'round' | 'mark'
  // 图标
  icon?: string
  // 是否可关闭
  closable?: boolean
  // 是否禁用
  disabled?: boolean
  // 是否可点击
  clickable?: boolean
  // 是否选中状态
  checked?: boolean
  // 背景色
  color?: string
  // 文字颜色
  textColor?: string
  // 边框颜色
  borderColor?: string
  // 最大宽度
  maxWidth?: string | number
  // 关闭按钮提示文本
  closeTitle?: string
}

const props = withDefaults(defineProps<Props>(), {
  text: '',
  type: 'default',
  size: 'md',
  shape: 'default',
  icon: '',
  closable: false,
  disabled: false,
  clickable: false,
  checked: false,
  color: '',
  textColor: '',
  borderColor: '',
  maxWidth: undefined,
  closeTitle: '关闭'
})

const emit = defineEmits<{
  click: [event: MouseEvent]
  close: [event: MouseEvent]
}>()

// 计算属性
const tagClasses = computed(() => [
  'base-tag',
  `tag-${props.type}`,
  `tag-${props.size}`,
  `tag-shape-${props.shape}`,
  {
    'tag-closable': props.closable,
    'tag-disabled': props.disabled,
    'tag-clickable': props.clickable && !props.disabled,
    'tag-checked': props.checked,
    'tag-has-icon': !!props.icon
  }
])

const tagStyle = computed(() => {
  const style: Record<string, string> = {}
  
  if (props.color) {
    style.backgroundColor = props.color
    style.borderColor = props.color
  }
  
  if (props.textColor) {
    style.color = props.textColor
  }
  
  if (props.borderColor) {
    style.borderColor = props.borderColor
  }
  
  if (props.maxWidth) {
    style.maxWidth = typeof props.maxWidth === 'number' ? `${props.maxWidth}px` : props.maxWidth
  }
  
  return style
})

// 事件处理
function handleClick(event: MouseEvent) {
  if (props.clickable && !props.disabled) {
    emit('click', event)
  }
}

function handleClose(event: MouseEvent) {
  if (!props.disabled) {
    emit('close', event)
  }
}
</script>

<style scoped lang="scss">
/* ========== 基础标签样式 ========== */
.base-tag {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-xs) var(--spacing-sm);
  font-size: 0.875rem;
  font-weight: var(--font-weight-medium);
  line-height: 1;
  border: var(--border-width) solid transparent;
  border-radius: var(--radius-sm);
  transition: all 0.2s ease;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  vertical-align: middle;
}

/* ========== 尺寸变体 ========== */
.tag-xs {
  padding: 2px var(--spacing-xs);
  font-size: 0.75rem;
  gap: 2px;
}

.tag-sm {
  padding: var(--spacing-xs) var(--spacing-sm);
  font-size: 0.8125rem;
}

.tag-md {
  padding: var(--spacing-xs) var(--spacing-sm);
  font-size: 0.875rem;
}

.tag-lg {
  padding: var(--spacing-sm) var(--spacing-md);
  font-size: 0.9375rem;
}

/* ========== 形状变体 ========== */
.tag-shape-default {
  border-radius: var(--radius-sm);
}

.tag-shape-round {
  border-radius: var(--radius-full);
  padding-left: var(--spacing-md);
  padding-right: var(--spacing-md);
}

.tag-shape-mark {
  border-radius: 0 var(--radius-md) var(--radius-md) 0;
  padding-left: var(--spacing-md);
  margin-left: var(--spacing-sm);
  
  &::before {
    content: '';
    position: absolute;
    left: calc(-1 * var(--spacing-sm));
    top: 0;
    bottom: 0;
    width: var(--spacing-sm);
    background: inherit;
    border-radius: var(--radius-md) 0 0 var(--radius-md);
  }
}

/* ========== 类型变体 ========== */
.tag-default {
  background: var(--bg-hover);
  color: var(--text-secondary);
  border-color: var(--border-color);
}

.tag-primary {
  background: var(--color-primary-50);
  color: var(--color-primary-700);
  border-color: var(--color-primary-200);
}

.tag-success {
  background: var(--color-success-50);
  color: var(--color-success-700);
  border-color: var(--color-success-200);
}

.tag-warning {
  background: var(--color-warning-50);
  color: var(--color-warning-700);
  border-color: var(--color-warning-200);
}

.tag-danger {
  background: var(--color-danger-50);
  color: var(--color-danger-700);
  border-color: var(--color-danger-200);
}

.tag-info {
  background: var(--color-info-50);
  color: var(--color-info-700);
  border-color: var(--color-info-200);
}

.tag-secondary {
  background: var(--color-gray-100);
  color: var(--color-gray-700);
  border-color: var(--color-gray-300);
}

/* ========== 状态样式 ========== */
.tag-clickable {
  cursor: pointer;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: var(--shadow-sm);
  }
  
  &:active {
    transform: translateY(0);
  }
}

.tag-disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}

.tag-checked {
  position: relative;
  
  &::after {
    content: '✓';
    position: absolute;
    top: -4px;
    right: -4px;
    width: 16px;
    height: 16px;
    background: var(--success-color);
    color: var(--text-white);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.7rem;
    font-weight: bold;
  }
}

/* ========== 标签内容 ========== */
.tag-icon {
  font-size: 1em;
  line-height: 1;
  flex-shrink: 0;
}

.tag-text {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* ========== 关闭按钮 ========== */
.tag-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  border: none;
  background: transparent;
  color: inherit;
  cursor: pointer;
  border-radius: 50%;
  font-size: 0.75rem;
  line-height: 1;
  transition: all 0.2s ease;
  flex-shrink: 0;
  opacity: 0.7;
  
  &:hover {
    background: rgba(0, 0, 0, 0.1);
    opacity: 1;
  }
  
  &:active {
    transform: scale(0.9);
  }
}

.tag-closable {
  padding-right: var(--spacing-xs);
}

/* ========== 主题集成 ========== */
.base-tag {
  /* 高山晨光主题 */
  body.theme-mountain-sunrise & {
    &.tag-primary {
      background: linear-gradient(135deg, #FFD5A3, #FFE0B2);
      color: #E65100;
      border-color: #FFB74D;
    }
  }

  /* 森林探险主题 */
  body.theme-forest-trek & {
    &.tag-success {
      background: linear-gradient(135deg, #C8E6C9, #A5D6A7);
      color: #1B5E20;
      border-color: #66BB6A;
    }
  }

  /* 雪峰极光主题 */
  body.theme-snowpeak-aurora & {
    &.tag-info {
      background: linear-gradient(135deg, #B3E5FC, #81D4FA);
      color: #01579B;
      border-color: #4FC3F7;
    }
  }

  /* 手绘风格主题 */
  body.theme-paper & {
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    border-style: dashed;
  }
}

/* ========== 响应式设计 ========== */
@media (max-width: 768px) {
  .base-tag {
    font-size: 0.8125rem;
  }
  
  .tag-xs {
    font-size: 0.7rem;
  }
  
  .tag-sm {
    font-size: 0.75rem;
  }
}
</style>
