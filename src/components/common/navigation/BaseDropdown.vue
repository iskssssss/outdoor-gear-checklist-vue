<template>
  <div 
    class="base-dropdown" 
    :class="[`size-${size}`, `placement-${placement}`, { disabled }]"
    @mouseenter="trigger === 'hover' && !disabled && open()"
    @mouseleave="trigger === 'hover' && !disabled && close()"
  >
    <div 
      ref="triggerRef"
      class="dropdown-trigger"
      @click="trigger === 'click' && !disabled && toggle()"
    >
      <slot name="trigger">
        <button class="dropdown-btn" :disabled="disabled">
          {{ triggerText }}
          <span class="dropdown-arrow" :class="{ open: isOpen }">▼</span>
        </button>
      </slot>
    </div>

    <transition name="dropdown-fade">
      <div 
        v-show="isOpen" 
        ref="dropdownRef"
        class="dropdown-menu"
        :class="[`placement-${placement}`, { 'with-arrow': showArrow }]"
      >
        <div v-if="title" class="dropdown-title">{{ title }}</div>
        <slot></slot>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

interface Props {
  triggerText?: string
  trigger?: 'click' | 'hover'
  placement?: 'bottom' | 'bottom-start' | 'bottom-end' | 'top' | 'top-start' | 'top-end'
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
  title?: string
  showArrow?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  triggerText: '更多',
  trigger: 'hover',  // 改为默认hover，更友好
  placement: 'bottom-start',  // 默认左下对齐
  disabled: false,
  size: 'md',
  showArrow: false
})

const emit = defineEmits<{
  (e: 'open'): void
  (e: 'close'): void
  (e: 'toggle', isOpen: boolean): void
}>()

const isOpen = ref(false)
const triggerRef = ref<HTMLElement>()
const dropdownRef = ref<HTMLElement>()

function open() {
  if (props.disabled) return
  isOpen.value = true
  emit('open')
  emit('toggle', true)
}

function close() {
  isOpen.value = false
  emit('close')
  emit('toggle', false)
}

function toggle() {
  if (props.disabled) return
  isOpen.value ? close() : open()
}

// 点击外部关闭
function handleClickOutside(event: MouseEvent) {
  if (!triggerRef.value || !dropdownRef.value) return
  
  const target = event.target as Node
  if (!triggerRef.value.contains(target) && !dropdownRef.value.contains(target)) {
    close()
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

defineExpose({
  open,
  close,
  toggle
})
</script>

<style scoped lang="scss">
.base-dropdown {
  position: relative;
  display: inline-block;

  &.disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

.dropdown-trigger {
  display: inline-flex;
}

.dropdown-btn {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--bg-input);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover:not(:disabled) {
    background: var(--bg-hover);
    border-color: var(--primary-color);
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }
}

.dropdown-arrow {
  font-size: 10px;
  transition: transform 0.3s ease;

  &.open {
    transform: rotate(180deg);
  }
}

.dropdown-menu {
  position: absolute;
  z-index: 1000;
  min-width: 150px;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  padding: var(--spacing-xs) 0;
  margin-top: var(--spacing-xs);

  // Placement variations
  &.placement-bottom,
  &.placement-bottom-start,
  &.placement-bottom-end {
    top: calc(100% + var(--spacing-xs));
  }

  &.placement-top,
  &.placement-top-start,
  &.placement-top-end {
    bottom: calc(100% + var(--spacing-xs));
  }

  &.placement-bottom,
  &.placement-top {
    left: 50%;
    transform: translateX(-50%);
  }

  &.placement-bottom-start,
  &.placement-top-start {
    left: 0;
  }

  &.placement-bottom-end,
  &.placement-top-end {
    right: 0;
  }

  // Arrow (optional)
  &.with-arrow::before {
    content: '';
    position: absolute;
    width: 0;
    height: 0;
    border-style: solid;
  }

  &.placement-bottom.with-arrow::before,
  &.placement-bottom-start.with-arrow::before,
  &.placement-bottom-end.with-arrow::before {
    top: -6px;
    border-width: 0 6px 6px 6px;
    border-color: transparent transparent var(--bg-card) transparent;
  }
}

.dropdown-title {
  padding: var(--spacing-sm) var(--spacing-md);
  font-size: 12px;
  font-weight: 600;
  color: var(--text-tertiary);
  border-bottom: 1px solid var(--border-color);
  margin-bottom: var(--spacing-xs);
}

/* 尺寸变体 */
.base-dropdown.size-sm .dropdown-btn {
  padding: var(--spacing-xs) var(--spacing-sm);
  font-size: 12px;
}

.base-dropdown.size-lg .dropdown-btn {
  padding: var(--spacing-md) var(--spacing-lg);
  font-size: 16px;
}

/* 过渡动画 */
.dropdown-fade-enter-active,
.dropdown-fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.dropdown-fade-enter-from {
  opacity: 0;
  transform: translateY(-8px);
}

.dropdown-fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>

