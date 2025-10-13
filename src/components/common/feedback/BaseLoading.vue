<template>
  <div class="base-loading" :class="[`size-${size}`, `type-${type}`]">
    <div class="loading-spinner">
      <div v-if="type === 'spinner'" class="spinner"></div>
      <div v-else-if="type === 'dots'" class="dots">
        <span class="dot"></span>
        <span class="dot"></span>
        <span class="dot"></span>
      </div>
      <div v-else-if="type === 'pulse'" class="pulse"></div>
    </div>
    <p v-if="text || $slots.default" class="loading-text">
      <slot>{{ text }}</slot>
    </p>
  </div>
</template>

<script setup lang="ts">
interface Props {
  text?: string
  size?: 'sm' | 'md' | 'lg'
  type?: 'spinner' | 'dots' | 'pulse'
}

withDefaults(defineProps<Props>(), {
  text: '加载中...',
  size: 'md',
  type: 'spinner'
})
</script>

<style scoped lang="scss">
.base-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-xl);
  gap: var(--spacing-md);
}

.loading-spinner {
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Spinner 样式 */
.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--border-color);
  border-top-color: var(--primary-color);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Dots 样式 */
.dots {
  display: flex;
  gap: 8px;
}

.dot {
  width: 12px;
  height: 12px;
  background: var(--primary-color);
  border-radius: 50%;
  animation: bounce 1.4s infinite ease-in-out both;

  &:nth-child(1) {
    animation-delay: -0.32s;
  }

  &:nth-child(2) {
    animation-delay: -0.16s;
  }
}

@keyframes bounce {
  0%, 80%, 100% {
    transform: scale(0);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

/* Pulse 样式 */
.pulse {
  width: 40px;
  height: 40px;
  background: var(--primary-color);
  border-radius: 50%;
  animation: pulse 1.2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(0.8);
    opacity: 0.5;
  }
  50% {
    transform: scale(1.2);
    opacity: 1;
  }
}

/* 文本样式 */
.loading-text {
  margin: 0;
  font-size: 14px;
  color: var(--text-secondary);
  text-align: center;
}

/* 尺寸变体 */
.base-loading.size-sm {
  padding: var(--spacing-md);

  .spinner {
    width: 24px;
    height: 24px;
    border-width: 2px;
  }

  .dot {
    width: 8px;
    height: 8px;
  }

  .pulse {
    width: 24px;
    height: 24px;
  }

  .loading-text {
    font-size: 12px;
  }
}

.base-loading.size-lg {
  padding: var(--spacing-xxl);

  .spinner {
    width: 60px;
    height: 60px;
    border-width: 4px;
  }

  .dot {
    width: 16px;
    height: 16px;
  }

  .pulse {
    width: 60px;
    height: 60px;
  }

  .loading-text {
    font-size: 16px;
  }
}
</style>

