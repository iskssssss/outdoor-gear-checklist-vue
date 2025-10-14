<template>
  <Transition name="modal-fade">
    <div v-if="isVisible" class="modal-overlay" @click.self="handleClickOutside">
      <div class="modal-container" :style="{ width: width, maxHeight: maxHeight }">
        <div class="modal-header">
          <h3 class="modal-title">{{ title }}</h3>
          <button class="modal-close-btn" @click="cancel">✕</button>
        </div>
        <div class="modal-body">
          <p class="confirm-message">{{ message }}</p>
          <div v-if="showDangerWarning" class="danger-warning">
            <p>此操作不可撤销，请谨慎操作！</p>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn confirm-btn" :class="{ 'danger': showDangerWarning }" @click="debouncedConfirm">
            {{ confirmButtonText }}
          </button>
          <button class="btn cancel-btn" @click="debouncedCancel">取消</button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref } from 'vue';
import { useDebounceFn } from '@vueuse/core';

const props = defineProps({
  width: { type: String, default: '400px' },
  maxHeight: { type: String, default: '80vh' },
});

const isVisible = ref(false);
const title = ref('确认')
const message = ref('')
const confirmButtonText = ref('确定')
const showDangerWarning = ref(false)

let resolvePromise = null

function show(options) {
  title.value = options.title || '确认'
  message.value = options.message || ''
  confirmButtonText.value = options.confirmButtonText || '确定'
  showDangerWarning.value = options.showDangerWarning || false

  isVisible.value = true
  return new Promise(resolve => {
    resolvePromise = resolve
  })
}

function confirm() {
  isVisible.value = false
  resolvePromise(true)
}

function cancel() {
  isVisible.value = false
  resolvePromise(false)
}

function handleClickOutside() {
  // 点击蒙层外部默认取消
  cancel();
}

const debouncedConfirm = useDebounceFn(confirm, 300);
const debouncedCancel = useDebounceFn(cancel, 300);

defineExpose({
  show,
});
</script>

<style scoped lang="scss">
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: var(--bg-overlay);
  display: flex;
  justify-content: center;
  align-items: center;
  // 确保在 BaseModal (z-index: 1000) 之上
  z-index: 2000;
}

.modal-container {
  background: var(--bg-card);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-xl);
  display: flex;
  flex-direction: column;
  overflow: hidden;

  transition: all 0.3s ease-out;
  transform: scale(1);
  opacity: 1;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-lg) var(--spacing-lg);
  border-bottom: var(--border-width) solid var(--border-color);
}

.modal-title {
  margin: 0;
  font-size: 1.25rem;
  color: var(--text-primary);
}

.modal-close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: var(--text-secondary);
  cursor: pointer;
  transition: color 0.2s ease;

  &:hover {
    color: var(--text-primary);
  }
}

.modal-body {
  padding: var(--spacing-lg);
  flex-grow: 1;
  overflow-y: auto;
}

.confirm-message {
  font-size: 1rem;
  color: var(--text-primary);
  line-height: 1.5;
  margin-bottom: var(--spacing-md);
  // Support newlines
  white-space: pre-wrap;
}

.danger-warning {
  background: var(--danger-light);
  border-left: 4px solid var(--danger-color);
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-sm);
  margin-top: var(--spacing-md);

  p {
    color: var(--danger-color);
    font-weight: var(--font-weight-medium);
    margin: 0;
  }
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  padding: var(--spacing-md) var(--spacing-lg);
  border-top: var(--border-width) solid var(--border-color);
  gap: var(--spacing-sm);
}

// BaseButton 已接管所有按钮样式

// Modal Transition
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: all 0.3s ease-out;

  .modal-container {
    transition: all 0.3s ease-out;
  }
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;

  .modal-container {
    transform: scale(0.9);
    opacity: 0;
  }
}

// Responsive
@media (max-width: 768px) {
  .modal-container {
    width: 90% !important;
    margin: 0 var(--spacing-sm);
  }

  .modal-footer {
    flex-direction: column;
    gap: var(--spacing-sm);
  }

  .btn {
    width: 100%;
  }
}
</style>
