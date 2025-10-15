<template>
  <div class="base-alert" :class="[`alert-${type}`, `size-${size}`, { closable }]">
    <div class="alert-icon" v-if="showIcon">
      <slot name="icon">
        <span>{{ iconMap[type] }}</span>
      </slot>
    </div>
    <div class="alert-content">
      <div v-if="title || $slots.title" class="alert-title">
        <slot name="title">
          <strong>{{ title }}</strong>
        </slot>
      </div>
      <div class="alert-message">
        <slot>{{ message }}</slot>
      </div>
    </div>
    <button v-if="closable" class="alert-close" @click="$emit('close')" type="button">
      ✕
    </button>
  </div>
</template>

<script setup lang="ts">
interface Props {
  // 警告类型
  type?: 'info' | 'success' | 'warning' | 'error'
  // 标题
  title?: string
  // 消息内容
  message?: string
  // 是否显示图标
  showIcon?: boolean
  // 是否可关闭
  closable?: boolean
  // 尺寸
  size?: 'sm' | 'md' | 'lg'
}

const props = withDefaults(defineProps<Props>(), {
  type: 'info',
  title: '',
  message: '',
  showIcon: true,
  closable: false,
  size: 'md'
})

defineEmits<{
  (e: 'close'): void
}>()

const iconMap = {
  info: 'ℹ️',
  success: '✅',
  warning: '⚠️',
  error: '❌'
}
</script>

<style scoped lang="scss">
.base-alert {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-md);
  padding: var(--spacing-md) var(--spacing-lg);
  border-radius: var(--radius-md);
  border-left: 4px solid;
  transition: all 0.3s ease;
  position: relative;
}

/* 类型变体 */
.alert-info {
  background: var(--info-bg, rgba(23, 162, 184, 0.1));
  border-left-color: var(--info-color, #17a2b8);
  color: var(--info-text, var(--text-primary));
}

.alert-success {
  background: var(--success-bg, rgba(40, 167, 69, 0.1));
  border-left-color: var(--success-color, #28a745);
  color: var(--success-text, var(--text-primary));
}

.alert-warning {
  background: var(--warning-bg, rgba(255, 193, 7, 0.1));
  border-left-color: var(--warning-color, #ffc107);
  color: var(--warning-text, var(--text-primary));
}

.alert-error {
  background: var(--danger-bg, rgba(220, 53, 69, 0.1));
  border-left-color: var(--danger-color, #dc3545);
  color: var(--danger-text, var(--text-primary));
}

/* 图标 */
.alert-icon {
  font-size: 1.5em;
  line-height: 1;
  flex-shrink: 0;
}

/* 内容 */
.alert-content {
  flex: 1;
  line-height: 1.6;
}

.alert-title {
  margin-bottom: var(--spacing-xs);
  font-weight: var(--font-weight-bold);
}

.alert-message {
  font-size: 0.95em;
}

/* 关闭按钮 */
.alert-close {
  background: none;
  border: none;
  color: currentColor;
  cursor: pointer;
  font-size: 1.2em;
  padding: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  opacity: 0.6;
  transition: all 0.2s ease;
  flex-shrink: 0;

  &:hover {
    opacity: 1;
    background: rgba(0, 0, 0, 0.1);
  }
}

/* 尺寸变体 */
.alert-sm {
  padding: var(--spacing-sm) var(--spacing-md);
  font-size: 0.875rem;

  .alert-icon {
    font-size: 1.2em;
  }
}

.alert-lg {
  padding: var(--spacing-lg) var(--spacing-xl);
  font-size: 1.125rem;

  .alert-icon {
    font-size: 2em;
  }
}
</style>

