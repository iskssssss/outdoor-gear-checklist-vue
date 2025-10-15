<template>
  <div class="base-tabs">
    <div class="tabs-header" :class="[`size-${size}`, `type-${type}`]">
      <button
        v-for="tab in tabs"
        :key="tab.value"
        class="tab-btn"
        :class="{ active: modelValue === tab.value, disabled: tab.disabled }"
        :disabled="tab.disabled"
        @click="handleTabClick(tab)"
      >
        <span v-if="tab.icon" class="tab-icon">{{ tab.icon }}</span>
        <span class="tab-label">{{ tab.label }}</span>
        <span v-if="tab.badge" class="tab-badge">{{ tab.badge }}</span>
      </button>
    </div>
    <div class="tabs-content">
      <slot></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue'

interface Tab {
  label: string
  value: string | number
  icon?: string
  badge?: string | number
  disabled?: boolean
}

interface Props {
  modelValue: string | number
  tabs: Tab[]
  size?: 'sm' | 'md' | 'lg'
  type?: 'default' | 'card' | 'button'
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  type: 'default'
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | number): void
  (e: 'change', value: string | number): void
}>()

function handleTabClick(tab: Tab) {
  if (tab.disabled) return
  emit('update:modelValue', tab.value)
  emit('change', tab.value)
}
</script>

<style scoped lang="scss">
.base-tabs {
  width: 100%;
}

.tabs-header {
  display: flex;
  gap: var(--spacing-xs);
  border-bottom: 2px solid var(--border-color);
  margin-bottom: var(--spacing-lg);

  &.type-card {
    border-bottom: none;
    background: var(--bg-input);
    padding: var(--spacing-xs);
    border-radius: var(--radius-lg);
  }

  &.type-button {
    border-bottom: none;
  }
}

.tab-btn {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-md) var(--spacing-lg);
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  color: var(--text-secondary);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;

  &:hover:not(.disabled) {
    color: var(--text-primary);
    background: var(--bg-hover);
  }

  &.active {
    color: var(--primary-color);
    border-bottom-color: var(--primary-color);
  }

  &.disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .tabs-header.type-card & {
    border-radius: var(--radius-md);
    border-bottom: none;

    &.active {
      background: var(--bg-card);
      box-shadow: var(--shadow-sm);
    }
  }

  .tabs-header.type-button & {
    border: 1px solid var(--border-color);
    border-radius: var(--radius-md);

    &.active {
      background: var(--primary-color);
      color: var(--btn-primary-text, white);
      border-color: var(--primary-color);
    }
  }
}

.tab-icon {
  font-size: 1.2em;
}

.tab-label {
  white-space: nowrap;
}

.tab-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  background: var(--danger-color);
  color: white;
  font-size: 12px;
  font-weight: 600;
  border-radius: var(--radius-full);
}

/* 尺寸变体 */
.tabs-header.size-sm .tab-btn {
  padding: var(--spacing-sm) var(--spacing-md);
  font-size: 13px;
}

.tabs-header.size-lg .tab-btn {
  padding: var(--spacing-lg) var(--spacing-xl);
  font-size: 16px;
}

.tabs-content {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 响应式 */
@media (max-width: 768px) {
  .tabs-header {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;

    &::-webkit-scrollbar {
      height: 2px;
    }
  }

  .tab-btn {
    padding: var(--spacing-sm) var(--spacing-md);
    font-size: 13px;
  }
}
</style>

