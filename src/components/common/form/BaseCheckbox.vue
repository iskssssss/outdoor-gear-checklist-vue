<template>
  <label 
    class="base-checkbox"
    :class="[
      `size-${size}`,
      { 
        checked: isChecked, 
        disabled, 
        indeterminate, 
        'is-error': status === 'error',
        'is-success': status === 'success',
        'is-warning': status === 'warning',
      }
    ]"
    :for="id"
  >
    <input
      type="checkbox"
      class="checkbox-input"
      :id="id"
      :checked="isChecked"
      :disabled="disabled"
      :indeterminate="indeterminate"
      :aria-checked="indeterminate ? 'mixed' : (isChecked ? 'true' : 'false')"
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
  /**
   * v-model 绑定的值。
   * - 当为单个复选框时，类型为 `boolean | string | number`。
   * - 当用于复选框组时，类型为 `Array<string | number>`。
   * @default false
   */
  modelValue?: boolean | string | number | Array<string | number>
  /**
   * 复选框的标签文本。
   */
  label?: string
  /**
   * 当前复选框的值，当 `modelValue` 为数组时使用。
   */
  value?: string | number  // 当 modelValue 是数组时使用
  /**
   * 选中状态时 `modelValue` 的值。
   * @default true
   */
  trueValue?: boolean | string | number
  /**
   * 未选中状态时 `modelValue` 的值。
   * @default false
   */
  falseValue?: boolean | string | number
  /**
   * 是否禁用复选框。
   * @default false
   */
  disabled?: boolean
  /**
   * 是否处于半选（不确定）状态。
   * @default false
   */
  indeterminate?: boolean
  /**
   * 复选框的尺寸。
   * @values 'sm' | 'md' | 'lg'
   * @default 'md'
   */
  size?: 'sm' | 'md' | 'lg'
  /**
   * 复选框的当前状态，可用于视觉提示。
   * @values 'normal' | 'error' | 'success' | 'warning'
   * @default 'normal'
   */
  status?: 'normal' | 'error' | 'success' | 'warning'
  /**
   * 复选框的唯一 ID。
   * @default 随机生成的 ID
   */
  id?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  trueValue: true,
  falseValue: false,
  disabled: false,
  indeterminate: false,
  size: 'md',
  status: 'normal',
  id: `checkbox-${Math.random().toString(36).substr(2, 9)}`,
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
    opacity: var(--opacity-disabled); /* 使用语义化变量 */
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
    border: solid var(--text-on-accent); /* 使用语义化变量 */
    border-width: 0 2px 2px 0;
    transform: rotate(45deg);
  }

  .base-checkbox:hover:not(.disabled) & {
    border-color: var(--accent-primary); /* 使用语义化变量 */
  }

  .base-checkbox.checked & {
    background: var(--accent-primary); /* 使用语义化变量 */
    border-color: var(--accent-primary); /* 使用语义化变量 */

    &::after {
      display: block;
    }
  }

  .base-checkbox.indeterminate & {
    background: var(--accent-primary); /* 使用语义化变量 */
    border-color: var(--accent-primary); /* 使用语义化变量 */

    &::after {
      display: block;
      left: 50%;
      top: 50%;
      width: 8px;
      height: 2px;
      border: none;
      background: var(--text-on-accent); /* 使用语义化变量 */
      transform: translate(-50%, -50%) rotate(0deg);
    }
  }

  .base-checkbox.disabled & {
    background: var(--bg-disabled); /* 使用语义化变量 */
    border-color: var(--border-color);
  }
}

.checkbox-label {
  color: var(--text-primary);
  font-size: 14px;
  line-height: 1.5;

  .base-checkbox.disabled & {
    color: var(--text-disabled); /* 使用语义化变量 */
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
  outline: 2px solid var(--outline-focus); /* 使用语义化变量 */
  outline-offset: 2px;
}
</style>

