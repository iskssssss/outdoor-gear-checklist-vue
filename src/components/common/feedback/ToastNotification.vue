<template>
  <Teleport to="body">
    <Transition name="toast-list">
      <div v-if="toasts.length > 0" class="toast-container">
        <TransitionGroup name="toast-item">
          <div v-for="toast in toasts" :key="toast.id" class="toast" :class="[`toast-${toast.type}`]"
            @click="removeToast(toast.id)">
            <div class="toast-icon">
              {{ getIcon(toast.type) }}
            </div>
            <div class="toast-content">
              <div class="toast-message">{{ toast.message }}</div>
            </div>
            <button class="toast-close" @click.stop="removeToast(toast.id)">
              ✕
            </button>
          </div>
        </TransitionGroup>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref } from 'vue'

const toasts = ref([])
let toastId = 0

/**
 * 显示通知
 */
function show(message, type = 'success', duration = 3000) {
  const id = ++toastId
  const toast = {
    id,
    message,
    type
  }

  toasts.value.push(toast)

  // 自动移除
  if (duration > 0) {
    setTimeout(() => {
      removeToast(id)
    }, duration)
  }

  return id
}

/**
 * 移除通知
 */
function removeToast(id) {
  const index = toasts.value.findIndex(t => t.id === id)
  if (index > -1) {
    toasts.value.splice(index, 1)
  }
}

/**
 * 获取图标
 */
function getIcon(type) {
  const icons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ'
  }
  return icons[type] || icons.info
}

// 暴露方法供外部调用
defineExpose({
  show,
  success: (message, duration) => show(message, 'success', duration),
  error: (message, duration) => show(message, 'error', duration),
  warning: (message, duration) => show(message, 'warning', duration),
  info: (message, duration) => show(message, 'info', duration),
  removeToast
})
</script>

<style scoped lang="scss">
.toast-container {
  position: fixed;
  top: 80px;  /* 固定位置避开Header，不使用token */
  right: var(--spacing-lg);  /* 右侧边距 */
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);  /* Toast之间的间距 */
  pointer-events: none;
}

.toast {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);  /* 图标与内容间距 */
  min-width: 300px;
  max-width: 400px;
  padding: var(--spacing-md) var(--spacing-md);  /* Toast内边距 */
  background: var(--bg-card);
  border-radius: var(--radius-lg);  /* 使用大圆角 */
  box-shadow: var(--shadow-lg);
  pointer-events: auto;
  cursor: pointer;
  transition: all 0.3s ease;
  border-left: 6px solid;  /* 功能色强调边框，保持固定宽度 */

  &:hover {
    transform: translateX(-4px);  /* 悬浮动画距离固定 */
    box-shadow: var(--shadow-xl);
  }
}

.toast-success {
  border-left-color: var(--success-color, #28a745);

  .toast-icon {
    color: var(--success-color, #28a745);
    background: var(--success-light, rgba(40, 167, 69, 0.1));
  }
}

.toast-error {
  border-left-color: var(--danger-color, #dc3545);

  .toast-icon {
    color: var(--danger-color, #dc3545);
    background: var(--danger-light, rgba(220, 53, 69, 0.1));
  }
}

.toast-warning {
  border-left-color: var(--warning-color, #ffc107);

  .toast-icon {
    color: var(--warning-color, #ffc107);
    background: var(--warning-light, rgba(255, 193, 7, 0.1));
  }
}

.toast-info {
  border-left-color: var(--info-color, #17a2b8);

  .toast-icon {
    color: var(--info-color, #17a2b8);
    background: var(--info-light, rgba(102, 126, 234, 0.1));
  }
}

.toast-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;  /* 图标容器固定尺寸 */
  height: 32px;
  border-radius: var(--radius-full);  /* 圆形图标 */
  font-size: 1.2rem;
  font-weight: var(--font-weight-bold);
  flex-shrink: 0;
}

.toast-content {
  flex: 1;
  min-width: 0;
}

.toast-message {
  color: var(--text-primary);
  font-size: 0.95rem;
  font-weight: var(--font-weight-medium);
  line-height: 1.4;
  word-break: break-word;
}

.toast-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;  /* 关闭按钮固定尺寸 */
  height: 24px;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  border-radius: var(--radius-full);  /* 圆形按钮 */
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 1.1rem;
  flex-shrink: 0;

  &:hover {
    background: var(--bg-hover);
    color: var(--text-primary);
  }
}

// 列表动画
.toast-list-enter-active,
.toast-list-leave-active {
  transition: all 0.3s ease;
}

.toast-list-enter-from,
.toast-list-leave-to {
  opacity: 0;
}

// 单项动画
.toast-item-enter-active {
  transition: all 0.3s ease;
}

.toast-item-leave-active {
  transition: all 0.3s ease;
  position: absolute;
}

.toast-item-enter-from {
  opacity: 0;
  transform: translateX(100px);  /* 动画距离保持固定 */
}

.toast-item-leave-to {
  opacity: 0;
  transform: translateX(100px) scale(0.8);  /* 动画效果保持固定 */
}

.toast-item-move {
  transition: transform 0.3s ease;
}

// 响应式 - 移动端调整位置
@media (max-width: 768px) {
  .toast-container {
    top: 70px;  /* 移动端Header高度，保持固定 */
    right: var(--spacing-sm);  /* 移动端右边距 */
    left: var(--spacing-sm);   /* 移动端左边距，使Toast居中 */
  }

  .toast {
    min-width: auto;
    max-width: none;
  }
}
</style>
