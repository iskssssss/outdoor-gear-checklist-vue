<template>
  <Teleport to="body">
    <Transition name="toast-list">
      <div v-if="toasts.length > 0" class="toast-container">
        <TransitionGroup name="toast-item">
          <div
            v-for="toast in toasts"
            :key="toast.id"
            class="toast"
            :class="[`toast-${toast.type}`]"
            @click="removeToast(toast.id)"
          >
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
  top: 80px;
  right: 20px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 12px;
  pointer-events: none;
}

.toast {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 300px;
  max-width: 400px;
  padding: 14px 16px;
  background: var(--bg-card);
  border-radius: 10px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  pointer-events: auto;
  cursor: pointer;
  transition: all 0.3s ease;
  border-left: 4px solid;
  
  &:hover {
    transform: translateX(-4px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
  }
}

.toast-success {
  border-left-color: var(--success-color, #28a745);
  
  .toast-icon {
    color: var(--success-color, #28a745);
    background: rgba(40, 167, 69, 0.1);
  }
}

.toast-error {
  border-left-color: var(--danger-color, #dc3545);
  
  .toast-icon {
    color: var(--danger-color, #dc3545);
    background: rgba(220, 53, 69, 0.1);
  }
}

.toast-warning {
  border-left-color: #ffc107;
  
  .toast-icon {
    color: #ffc107;
    background: rgba(255, 193, 7, 0.1);
  }
}

.toast-info {
  border-left-color: var(--primary-color, #667eea);
  
  .toast-icon {
    color: var(--primary-color, #667eea);
    background: rgba(102, 126, 234, 0.1);
  }
}

.toast-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  font-size: 1.2rem;
  font-weight: bold;
  flex-shrink: 0;
}

.toast-content {
  flex: 1;
  min-width: 0;
}

.toast-message {
  color: var(--text-primary);
  font-size: 0.95rem;
  font-weight: 500;
  line-height: 1.4;
  word-break: break-word;
}

.toast-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 1.1rem;
  flex-shrink: 0;
  
  &:hover {
    background: var(--bg-hover, rgba(0, 0, 0, 0.05));
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
  transform: translateX(100px);
}

.toast-item-leave-to {
  opacity: 0;
  transform: translateX(100px) scale(0.8);
}

.toast-item-move {
  transition: transform 0.3s ease;
}

// 响应式
@media (max-width: 768px) {
  .toast-container {
    top: 70px;
    right: 10px;
    left: 10px;
  }
  
  .toast {
    min-width: auto;
    max-width: none;
  }
}
</style>

