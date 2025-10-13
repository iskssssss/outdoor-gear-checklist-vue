<template>
  <div 
    class="base-switch" 
    :class="[
      `switch-${size}`,
      { 
        'is-checked': isChecked, 
        'is-disabled': disabled,
        'is-loading': loading
      }
    ]"
    @click="handleClick"
    :title="title"
  >
    <div class="switch-core">
      <div class="switch-handle">
        <span v-if="loading" class="switch-loading-icon">⟳</span>
      </div>
    </div>
    <span v-if="label" class="switch-label">{{ label }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  // v-model 绑定值
  modelValue?: boolean | string | number
  // 标签文本
  label?: string
  // 选中时的值（用于非布尔值）
  activeValue?: boolean | string | number
  // 未选中时的值（用于非布尔值）
  inactiveValue?: boolean | string | number
  // 是否禁用
  disabled?: boolean
  // 是否加载中
  loading?: boolean
  // 尺寸
  size?: 'sm' | 'md' | 'lg'
  // 标题提示
  title?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  activeValue: true,
  inactiveValue: false,
  disabled: false,
  loading: false,
  size: 'md'
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean | string | number]
  'change': [value: boolean | string | number]
}>()

// 是否选中
const isChecked = computed(() => {
  return props.modelValue === props.activeValue
})

/**
 * 处理点击事件
 */
function handleClick() {
  if (props.disabled || props.loading) return

  const newValue = isChecked.value ? props.inactiveValue : props.activeValue
  emit('update:modelValue', newValue)
  emit('change', newValue)
}
</script>

<style scoped lang="scss">
.base-switch {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  user-select: none;
  transition: all 0.3s ease;

  &.is-disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &.is-loading {
    cursor: wait;
  }
}

.switch-core {
  position: relative;
  background-color: var(--text-muted, #6c757d);
  border-radius: 12px;
  transition: background-color 0.3s ease;
  flex-shrink: 0;

  // 默认尺寸 (md)
  width: 44px;
  height: 24px;

  .is-checked & {
    background-color: var(--success-color, #10b981);
  }

  .is-disabled & {
    background-color: var(--bg-disabled, #e0e0e0);
  }
}

.switch-handle {
  position: absolute;
  top: 2px;
  left: 2px;
  background-color: #fff;
  border-radius: 50%;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;

  // 默认尺寸 (md)
  width: 20px;
  height: 20px;

  .is-checked & {
    transform: translateX(20px);
  }
}

.switch-loading-icon {
  font-size: 0.75rem;
  animation: spin 1s linear infinite;
  color: var(--primary-color);
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.switch-label {
  color: var(--text-primary);
  font-size: 0.9rem;
  font-weight: 500;
  white-space: nowrap;

  .is-disabled & {
    color: var(--text-secondary);
  }
}

// 尺寸变体
.switch-sm {
  .switch-core {
    width: 36px;
    height: 20px;
  }

  .switch-handle {
    width: 16px;
    height: 16px;

    .is-checked & {
      transform: translateX(16px);
    }
  }

  .switch-label {
    font-size: 0.85rem;
  }
}

.switch-lg {
  .switch-core {
    width: 52px;
    height: 28px;
  }

  .switch-handle {
    width: 24px;
    height: 24px;

    .is-checked & {
      transform: translateX(24px);
    }
  }

  .switch-label {
    font-size: 1rem;
  }
}

// Hover 效果
.base-switch:not(.is-disabled):not(.is-loading):hover {
  .switch-core {
    box-shadow: 0 0 8px rgba(0, 0, 0, 0.15);
  }

  .switch-handle {
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
  }
}

// Active 效果
.base-switch:not(.is-disabled):not(.is-loading):active {
  .switch-handle {
    width: 24px;

    .switch-sm & {
      width: 20px;
    }

    .switch-lg & {
      width: 28px;
    }
  }
}
</style>

