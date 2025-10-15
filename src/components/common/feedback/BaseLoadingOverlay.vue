<template>
  <transition name="overlay-fade">
    <div v-if="visible" class="base-loading-overlay" :class="{ blur }">
      <div class="overlay-content">
        <BaseLoading :type="type" :size="size">
          <slot>{{ text }}</slot>
        </BaseLoading>
        <p v-if="hint || $slots.hint" class="overlay-hint" :class="{ warning: hintType === 'warning' }">
          <slot name="hint">{{ hint }}</slot>
        </p>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import BaseLoading from './BaseLoading.vue'

interface Props {
  // 是否显示
  visible?: boolean
  // 加载文本
  text?: string
  // 提示信息
  hint?: string
  // 提示类型
  hintType?: 'normal' | 'warning'
  // 是否模糊背景
  blur?: boolean
  // 加载动画类型
  type?: 'spinner' | 'dots' | 'pulse'
  // 尺寸
  size?: 'sm' | 'md' | 'lg'
}

withDefaults(defineProps<Props>(), {
  visible: false,
  text: '加载中...',
  hint: '',
  hintType: 'normal',
  blur: true,
  type: 'spinner',
  size: 'md'
})
</script>

<style scoped lang="scss">
.base-loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--bg-overlay, rgba(0, 0, 0, 0.75));
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;

  &.blur {
    backdrop-filter: blur(4px);
  }
}

.overlay-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-lg);
  color: var(--text-white, white);
  text-align: center;
}

.overlay-hint {
  margin: 0;
  font-size: 0.95rem;
  color: var(--text-white, white);
  opacity: 0.9;

  &.warning {
    color: var(--warning-color);
    font-weight: var(--font-weight-semibold);
  }
}

/* 过渡动画 */
.overlay-fade-enter-active,
.overlay-fade-leave-active {
  transition: opacity 0.3s ease;
}

.overlay-fade-enter-from,
.overlay-fade-leave-to {
  opacity: 0;
}
</style>

