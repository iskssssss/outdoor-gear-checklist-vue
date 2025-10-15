<template>
  <div 
    class="base-stat-card" 
    :class="[
      `variant-${variant}`,
      `size-${size}`,
      { 
        'is-clickable': clickable,
        'is-loading': loading 
      }
    ]"
    @click="handleClick"
    :title="title"
  >
    <!-- 加载遮罩 -->
    <div v-if="loading" class="stat-loading">
      <span class="loading-spinner">⟳</span>
    </div>

    <!-- 图标 -->
    <div v-if="icon" class="stat-icon">
      {{ icon }}
    </div>

    <!-- 内容 -->
    <div class="stat-content">
      <!-- 数字 -->
      <div class="stat-number">
        <slot name="number">{{ number }}</slot>
      </div>

      <!-- 标签 -->
      <div class="stat-label">
        <slot name="label">{{ label }}</slot>
      </div>

      <!-- 额外信息 -->
      <div v-if="$slots.extra || extra" class="stat-extra">
        <slot name="extra">{{ extra }}</slot>
      </div>
    </div>

    <!-- 徽章 -->
    <div v-if="badge" class="stat-badge" :class="`badge-${badgeVariant}`">
      {{ badge }}
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  // 数字值
  number?: string | number
  // 标签文本
  label?: string
  // 额外信息
  extra?: string
  // 图标
  icon?: string
  // 徽章文本
  badge?: string
  // 徽章变体
  badgeVariant?: 'primary' | 'success' | 'warning' | 'danger' | 'info'
  // 变体样式
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info'
  // 尺寸
  size?: 'sm' | 'md' | 'lg'
  // 是否可点击
  clickable?: boolean
  // 是否加载中
  loading?: boolean
  // 标题提示
  title?: string
}

withDefaults(defineProps<Props>(), {
  badgeVariant: 'primary',
  variant: 'default',
  size: 'md',
  clickable: false,
  loading: false
})

const emit = defineEmits<{
  'click': []
}>()

/**
 * 处理点击事件
 */
function handleClick() {
  emit('click')
}
</script>

<style scoped lang="scss">
.base-stat-card {
  position: relative;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 18px;
  border-radius: var(--border-radius-lg);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: var(--bg-input);
  border: var(--border-width) solid transparent;
  overflow: hidden;
  box-shadow: var(--shadow-xs, 0 1px 2px rgba(0, 0, 0, 0.05));

  // 确保内容在交互效果之上
  > * {
    position: relative;
    z-index: 1;
  }

  // 闪光效果
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: var(--shimmer-gradient-light, linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent));
    transition: left 0.5s;
    z-index: 0;
  }

  &:hover::before {
    left: 100%;
  }

  // 可点击样式
  &.is-clickable {
    cursor: pointer;

    &:hover {
      transform: translateY(-3px);
      box-shadow: var(--shadow-md);
      background: var(--bg-hover, var(--bg-input));
      border-color: var(--border-color);
    }

    &:active {
      transform: translateY(-1px);
    }
  }

  // 加载状态
  &.is-loading {
    pointer-events: none;
    opacity: 0.7;
  }
}

.stat-loading {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-card);
  opacity: 0.9;
  z-index: 10;
}

.loading-spinner {
  font-size: 1.5rem;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.stat-icon {
  font-size: 2rem;
  flex-shrink: 0;
  transition: transform 0.3s ease;

  .base-stat-card:hover & {
    transform: scale(1.1);
  }
}

.stat-content {
  flex: 1;
  text-align: left;
  min-width: 0; // 防止溢出
}

.stat-number {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 4px;
  color: var(--text-primary);
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.stat-label {
  font-size: 0.8rem;
  color: var(--text-secondary);
  font-weight: 500;
  opacity: 0.85;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.stat-extra {
  font-size: 0.7rem;
  color: var(--text-secondary);
  margin-top: 4px;
  opacity: 0.7;
  font-weight: 400;
}

.stat-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  padding: 4px 8px;
  border-radius: var(--border-radius-pill);
  font-size: 0.7rem;
  font-weight: 600;
  color: var(--text-white);
  box-shadow: var(--shadow-sm);
  z-index: 2;

  &.badge-primary {
    background: var(--primary-color);
  }

  &.badge-success {
    background: var(--success-color);
  }

  &.badge-warning {
    background: var(--warning-color);
  }

  &.badge-danger {
    background: var(--danger-color);
  }

  &.badge-info {
    background: var(--info-color);
  }
}

// 变体样式
.variant-primary {
  background: var(--primary-light);
  border-color: var(--primary-color);

  .stat-number {
    color: var(--primary-color);
  }
}

.variant-success {
  background: var(--success-light);
  border-color: var(--success-color);

  .stat-number {
    color: var(--success-color);
  }
}

.variant-warning {
  background: var(--warning-light);
  border-color: var(--warning-color);

  .stat-number {
    color: var(--warning-color);
  }
}

.variant-danger {
  background: var(--danger-light);
  border-color: var(--danger-color);

  .stat-number {
    color: var(--danger-color);
  }
}

.variant-info {
  background: var(--info-light);
  border-color: var(--info-color);

  .stat-number {
    color: var(--info-color);
  }
}

// 尺寸变体
.size-sm {
  padding: 14px;
  gap: 10px;

  .stat-icon {
    font-size: 1.5rem;
  }

  .stat-number {
    font-size: 1.2rem;
  }

  .stat-label {
    font-size: 0.75rem;
  }

  .stat-extra {
    font-size: 0.65rem;
  }
}

.size-lg {
  padding: 24px;
  gap: 18px;

  .stat-icon {
    font-size: 2.5rem;
  }

  .stat-number {
    font-size: 2rem;
  }

  .stat-label {
    font-size: 0.9rem;
  }

  .stat-extra {
    font-size: 0.75rem;
  }
}

// 响应式
@media (max-width: 768px) {
  .base-stat-card {
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 12px;
    padding: 16px;
  }

  .stat-content {
    text-align: center;
  }

  .stat-icon {
    font-size: 1.8rem;
  }

  .stat-number {
    font-size: 1.3rem;
  }

  .stat-label {
    font-size: 0.8rem;
  }

  .stat-extra {
    font-size: 0.7rem;
  }
}
</style>

