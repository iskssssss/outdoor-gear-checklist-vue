<template>
  <div class="base-empty" :class="[`size-${size}`]">
    <div class="empty-icon">
      <slot name="icon">
        <span class="default-icon">{{ icon }}</span>
      </slot>
    </div>
    <div class="empty-content">
      <p class="empty-description">
        <slot name="description">
          {{ description }}
        </slot>
      </p>
      <div v-if="$slots.extra || extra" class="empty-extra">
        <slot name="extra">
          {{ extra }}
        </slot>
      </div>
    </div>
    <div v-if="$slots.action" class="empty-action">
      <slot name="action"></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  description?: string
  icon?: string
  extra?: string
  size?: 'sm' | 'md' | 'lg'
}

withDefaults(defineProps<Props>(), {
  description: '暂无数据',
  icon: '📦',
  size: 'md'
})
</script>

<style scoped lang="scss">
.base-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-xxl) var(--spacing-lg);
  text-align: center;
  color: var(--text-secondary);
}

.empty-icon {
  margin-bottom: var(--spacing-lg);

  .default-icon {
    font-size: 64px;
    display: block;
    opacity: 0.6;
  }
}

.empty-content {
  margin-bottom: var(--spacing-md);
}

.empty-description {
  font-size: 16px;
  color: var(--text-secondary);
  margin: 0;
  margin-bottom: var(--spacing-sm);
}

.empty-extra {
  font-size: 14px;
  color: var(--text-tertiary);
}

.empty-action {
  margin-top: var(--spacing-lg);
}

/* 尺寸变体 */
.base-empty.size-sm {
  padding: var(--spacing-lg);

  .empty-icon .default-icon {
    font-size: 48px;
  }

  .empty-description {
    font-size: 14px;
  }
}

.base-empty.size-lg {
  padding: var(--spacing-xxxl) var(--spacing-xl);

  .empty-icon .default-icon {
    font-size: 96px;
  }

  .empty-description {
    font-size: 18px;
  }
}

/* 动画 */
.base-empty {
  animation: fadeIn 0.4s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>

