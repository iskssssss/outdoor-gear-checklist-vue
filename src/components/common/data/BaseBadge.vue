<template>
  <span :class="badgeClasses">
    <span v-if="icon" class="badge-icon">{{ icon }}</span>
    <span class="badge-content"><slot></slot></span>
    <button
      v-if="closable"
      class="badge-close"
      type="button"
      @click.stop="$emit('close')"
      title="移除"
    >
      ✕
    </button>
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  // 徽章变体
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'secondary' | 'neutral'
  // 尺寸
  size?: 'sm' | 'md' | 'lg'
  // 是否可关闭
  closable?: boolean
  // 图标
  icon?: string
  // 是否为圆点样式
  dot?: boolean
  // 是否为圆形
  rounded?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  closable: false,
  icon: '',
  dot: false,
  rounded: false
})

defineEmits<{
  close: []
}>()

const badgeClasses = computed(() => [
  'base-badge',
  `badge-${props.variant}`,
  `badge-${props.size}`,
  {
    'badge-dot': props.dot,
    'badge-rounded': props.rounded,
    'badge-closable': props.closable
  }
])
</script>

<style scoped lang="scss">
/* ========== 基础徽章样式 ========== */
.base-badge {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-weight: var(--font-weight-medium);
  white-space: nowrap;
  vertical-align: middle;
  transition: all 0.3s ease;
}

/* ========== 尺寸变体 ========== */
.badge-sm {
  padding: 2px var(--spacing-xs);
  font-size: 0.75rem;
  border-radius: var(--radius-sm);
}

.badge-md {
  padding: var(--spacing-xs) var(--spacing-sm);
  font-size: 0.875rem;
  border-radius: var(--radius-md);
}

.badge-lg {
  padding: var(--spacing-sm) var(--spacing-md);
  font-size: 1rem;
  border-radius: var(--radius-lg);
}

/* ========== 颜色变体 ========== */
.badge-primary {
  background: var(--color-primary-100);
  color: var(--color-primary-800);
  border: var(--border-width) solid var(--color-primary-300);
}

.badge-success {
  background: var(--color-success-100);
  color: var(--color-success-800);
  border: var(--border-width) solid var(--color-success-300);
}

.badge-warning {
  background: var(--color-warning-100);
  color: var(--color-warning-800);
  border: var(--border-width) solid var(--color-warning-300);
}

.badge-danger {
  background: var(--color-danger-100);
  color: var(--color-danger-800);
  border: var(--border-width) solid var(--color-danger-300);
}

.badge-info {
  background: var(--color-info-100);
  color: var(--color-info-800);
  border: var(--border-width) solid var(--color-info-300);
}

.badge-secondary {
  background: var(--color-gray-100);
  color: var(--color-gray-800);
  border: var(--border-width) solid var(--color-gray-300);
}

.badge-neutral {
  background: var(--bg-input);
  color: var(--text-primary);
  border: var(--border-width) solid var(--border-color);
}

/* ========== 修饰符 ========== */
.badge-dot {
  padding: var(--spacing-xs);
  border-radius: var(--radius-full);
  
  .badge-content {
    display: none;
  }
}

.badge-rounded {
  border-radius: var(--radius-full);
}

/* ========== 图标 ========== */
.badge-icon {
  display: inline-flex;
  font-size: 1em;
}

/* ========== 关闭按钮 ========== */
.badge-close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 14px;
  height: 14px;
  border: none;
  background: transparent;
  color: currentColor;
  border-radius: var(--radius-full);
  cursor: pointer;
  font-size: 0.9em;
  opacity: 0.7;
  transition: all 0.2s ease;
  padding: 0;
  margin-left: var(--spacing-xs);

  &:hover {
    opacity: 1;
    background: rgba(0, 0, 0, 0.1);
  }
}
</style>

