<template>
  <label 
    class="base-checkbox"
    :class="[
      `size-${size}`,
      { 
        checked: isChecked, 
        disabled, 
        indeterminate 
      }
    ]"
  >
    <input
      type="checkbox"
      class="checkbox-input"
      :checked="isChecked"
      :disabled="disabled"
      :indeterminate="indeterminate"
      @change="handleChange"
    />
    <span class="checkbox-inner"></span>
    <span v-if="$slots.default || label" class="checkbox-label">
      <slot>{{ label }}</slot>
    </span>
  </label>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  modelValue?: boolean | string | number | Array<string | number>
  label?: string
  value?: string | number  // 当 modelValue 是数组时使用
  trueValue?: boolean | string | number
  falseValue?: boolean | string | number
  disabled?: boolean
  indeterminate?: boolean
  size?: 'sm' | 'md' | 'lg'
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  trueValue: true,
  falseValue: false,
  disabled: false,
  indeterminate: false,
  size: 'md'
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean | string | number | Array<string | number>): void
  (e: 'change', value: boolean | string | number | Array<string | number>): void
}>()

const isChecked = computed(() => {
  // 如果 modelValue 是数组，检查 value 是否在数组中
  if (Array.isArray(props.modelValue) && props.value !== undefined) {
    return props.modelValue.includes(props.value)
  }
  // 否则使用原来的逻辑
  return props.modelValue === props.trueValue
})

function handleChange(event: Event) {
  const target = event.target as HTMLInputElement
  
  // 如果 modelValue 是数组，处理数组值
  if (Array.isArray(props.modelValue) && props.value !== undefined) {
    const newValue = [...props.modelValue]
    if (target.checked) {
      // 添加到数组
      if (!newValue.includes(props.value)) {
        newValue.push(props.value)
      }
    } else {
      // 从数组中移除
      const index = newValue.indexOf(props.value)
      if (index > -1) {
        newValue.splice(index, 1)
      }
    }
    emit('update:modelValue', newValue)
    emit('change', newValue)
  } else {
    // 原来的逻辑
    const value = target.checked ? props.trueValue : props.falseValue
    emit('update:modelValue', value)
    emit('change', value)
  }
}
</script>

<style scoped lang="scss">
.base-checkbox {
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

.checkbox-input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.checkbox-inner {
  position: relative;
  display: inline-block;
  width: 18px;
  height: 18px;
  background: var(--bg-card);
  border: 2px solid var(--border-color);
  border-radius: var(--radius-sm);
  transition: all 0.3s ease;
  flex-shrink: 0;

  &::after {
    content: '';
    position: absolute;
    display: none;
    left: 5px;
    top: 2px;
    width: 4px;
    height: 8px;
    border: solid white;
    border-width: 0 2px 2px 0;
    transform: rotate(45deg);
  }

  .base-checkbox:hover:not(.disabled) & {
    border-color: var(--primary-color);
  }

  .base-checkbox.checked & {
    background: var(--primary-color);
    border-color: var(--primary-color);

    &::after {
      display: block;
    }
  }

  .base-checkbox.indeterminate & {
    background: var(--primary-color);
    border-color: var(--primary-color);

    &::after {
      display: block;
      left: 50%;
      top: 50%;
      width: 8px;
      height: 2px;
      border: none;
      background: white;
      transform: translate(-50%, -50%) rotate(0deg);
    }
  }

  .base-checkbox.disabled & {
    background: var(--bg-disabled, #f5f5f5);
    border-color: var(--border-color);
  }
}

.checkbox-label {
  color: var(--text-primary);
  font-size: 14px;
  line-height: 1.5;

  .base-checkbox.disabled & {
    color: var(--text-disabled, #999);
  }
}

/* 尺寸变体 */
.base-checkbox.size-sm {
  .checkbox-inner {
    width: 14px;
    height: 14px;

    &::after {
      left: 4px;
      top: 1px;
      width: 3px;
      height: 6px;
    }
  }

  .checkbox-label {
    font-size: 12px;
  }
}

.base-checkbox.size-lg {
  .checkbox-inner {
    width: 22px;
    height: 22px;

    &::after {
      left: 7px;
      top: 3px;
      width: 5px;
      height: 10px;
    }
  }

  .checkbox-label {
    font-size: 16px;
  }
}

/* 焦点样式 */
.checkbox-input:focus-visible + .checkbox-inner {
  outline: 2px solid var(--primary-color);
  outline-offset: 2px;
}
</style>

