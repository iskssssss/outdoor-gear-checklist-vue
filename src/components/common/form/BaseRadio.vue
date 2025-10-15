<template>
  <label 
    class="base-radio"
    :class="[
      `size-${size}`,
      { 
        checked: isChecked, 
        disabled 
      }
    ]"
  >
    <input
      type="radio"
      class="radio-input"
      :checked="isChecked"
      :disabled="disabled"
      :value="value"
      @change="handleChange"
    />
    <span class="radio-inner"></span>
    <span v-if="$slots.default || label" class="radio-label">
      <slot>{{ label }}</slot>
    </span>
  </label>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  modelValue?: string | number | boolean
  value: string | number | boolean
  label?: string
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  size: 'md'
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | number | boolean): void
  (e: 'change', value: string | number | boolean): void
}>()

const isChecked = computed(() => {
  return props.modelValue === props.value
})

function handleChange() {
  if (props.disabled) return
  emit('update:modelValue', props.value)
  emit('change', props.value)
}
</script>

<style scoped lang="scss">
.base-radio {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-sm);
  cursor: pointer;
  user-select: none;
  position: relative;

  &.disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.radio-input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.radio-inner {
  position: relative;
  display: inline-block;
  width: 18px;
  height: 18px;
  background: var(--bg-card);
  border: 2px solid var(--border-color);
  border-radius: 50%;
  transition: all 0.3s ease;
  flex-shrink: 0;

  &::after {
    content: '';
    position: absolute;
    display: none;
    left: 50%;
    top: 50%;
    width: 8px;
    height: 8px;
    background: white;
    border-radius: 50%;
    transform: translate(-50%, -50%);
  }

  .base-radio:hover:not(.disabled) & {
    border-color: var(--primary-color);
  }

  .base-radio.checked & {
    background: var(--primary-color);
    border-color: var(--primary-color);

    &::after {
      display: block;
    }
  }

  .base-radio.disabled & {
    background: var(--bg-disabled, #f5f5f5);
    border-color: var(--border-color);
  }
}

.radio-label {
  color: var(--text-primary);
  font-size: 14px;
  line-height: 1.5;

  .base-radio.disabled & {
    color: var(--text-disabled, #999);
  }
}

/* 尺寸变体 */
.base-radio.size-sm {
  .radio-inner {
    width: 14px;
    height: 14px;

    &::after {
      width: 6px;
      height: 6px;
    }
  }

  .radio-label {
    font-size: 12px;
  }
}

.base-radio.size-lg {
  .radio-inner {
    width: 22px;
    height: 22px;

    &::after {
      width: 10px;
      height: 10px;
    }
  }

  .radio-label {
    font-size: 16px;
  }
}

/* 焦点样式 */
.radio-input:focus-visible + .radio-inner {
  outline: 2px solid var(--primary-color);
  outline-offset: 2px;
}
</style>

