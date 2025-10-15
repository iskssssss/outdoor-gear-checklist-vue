<template>
  <div
    class="base-dropdown-item"
    :class="[
      { disabled, danger, active, divided },
      `align-${align}`
    ]"
    @click="handleClick"
  >
    <span v-if="icon" class="item-icon">{{ icon }}</span>
    <span class="item-content">
      <slot>{{ label }}</slot>
    </span>
    <span v-if="$slots.suffix || suffix" class="item-suffix">
      <slot name="suffix">{{ suffix }}</slot>
    </span>
  </div>
</template>

<script setup lang="ts">
interface Props {
  label?: string
  icon?: string
  suffix?: string
  disabled?: boolean
  danger?: boolean
  active?: boolean
  divided?: boolean
  align?: 'left' | 'center' | 'right'
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  danger: false,
  active: false,
  divided: false,
  align: 'left'
})

const emit = defineEmits<{
  (e: 'click', event: MouseEvent): void
}>()

function handleClick(event: MouseEvent) {
  if (props.disabled) {
    event.stopPropagation()
    return
  }
  emit('click', event)
}
</script>

<style scoped lang="scss">
.base-dropdown-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  color: var(--text-primary);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;

  &:hover:not(.disabled) {
    background: var(--bg-hover);
    color: var(--primary-color);
  }

  &.active {
    background: var(--bg-hover);
    color: var(--primary-color);
    font-weight: 600;
  }

  &.disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &.danger {
    color: var(--danger-color);

    &:hover:not(.disabled) {
      background: var(--danger-bg, rgba(255, 77, 79, 0.1));
      color: var(--danger-color);
    }
  }

  &.divided {
    border-top: 1px solid var(--border-color);
    margin-top: var(--spacing-xs);
    padding-top: var(--spacing-md);
  }

  &.align-center {
    justify-content: center;
  }

  &.align-right {
    justify-content: flex-end;
  }
}

.item-icon {
  font-size: 16px;
  flex-shrink: 0;
}

.item-content {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-suffix {
  font-size: 12px;
  color: var(--text-tertiary);
  flex-shrink: 0;
}
</style>

