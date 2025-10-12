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
import { ref } from 'vue'
import { debounce } from '../../utils/debounce';

const props = defineProps({
  width: { type: String, default: '400px' },
  maxHeight: { type: String, default: '80vh' }
})

const isVisible = ref(false)
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
  cancel()
}

const debouncedConfirm = debounce(confirm, 300);
const debouncedCancel = debounce(cancel, 300);

defineExpose({
  show
})
</script>

<style scoped lang="scss">
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: var(--bg-overlay, rgba(0, 0, 0, 0.5));
  display: flex;
  justify-content: center;
  align-items: center;
  // 确保在 BaseModal (z-index: 1000) 之上
  z-index: 2000;
}

.modal-container {
  background: var(--bg-card);
  border-radius: 12px;
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
  padding: 18px 20px;
  border-bottom: 1px solid var(--border-color);
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
  padding: 20px;
  flex-grow: 1;
  overflow-y: auto;
}

.confirm-message {
  font-size: 1rem;
  color: var(--text-primary);
  line-height: 1.5;
  margin-bottom: 15px;
  // Support newlines
  white-space: pre-wrap;
}

.danger-warning {
  background: var(--danger-light, #fdeded);
  border-left: 4px solid var(--danger-color, #dc3545);
  padding: 10px 15px;
  border-radius: 6px;
  margin-top: 15px;

  p {
    color: var(--danger-color, #dc3545);
    font-weight: 500;
    margin: 0;
  }
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  padding: 15px 20px;
  border-top: 1px solid var(--border-color);
  gap: 10px;
}

.btn {
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.95rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

.btn-danger {
  background: var(--danger-color, #dc3545);
  color: var(--btn-danger-text, white);
  border: none;

  &:hover {
    background: var(--danger-dark, #c82333);
    transform: translateY(-1px);
    box-shadow: 0 2px 8px var(--danger-shadow, rgba(220, 53, 69, 0.3));
  }
}

.btn-secondary {
  background: var(--bg-input);
  color: var(--text-primary);
  border: 1px solid var(--border-color);

  &:hover {
    background: var(--bg-hover);
    border-color: var(--primary-color);
    transform: translateY(-1px);
    box-shadow: var(--shadow-sm);
  }
}

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
    margin: 0 10px;
  }

  .modal-footer {
    flex-direction: column;
    gap: 8px;
  }

  .btn {
    width: 100%;
  }
}
</style>
