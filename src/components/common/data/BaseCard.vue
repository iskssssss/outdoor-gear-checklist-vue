<template>
  <div :class="cardClasses" @click="handleClick">
    <!-- 头部插槽 -->
    <div v-if="$slots.header || title" class="card-header">
      <slot name="header">
        <h3 class="card-title">{{ title }}</h3>
      </slot>
      <div v-if="$slots.extra" class="card-extra">
        <slot name="extra"></slot>
      </div>
    </div>
    
    <!-- 主体插槽 -->
    <div class="card-body">
      <slot></slot>
    </div>
    
    <!-- 底部插槽 -->
    <div v-if="$slots.footer" class="card-footer">
      <slot name="footer"></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  // 卡片标题
  title?: string
  // 是否可悬浮
  hoverable?: boolean
  // 是否可点击
  clickable?: boolean
  // 边框样式
  bordered?: boolean
  // 阴影深度
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  // 内边距大小
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  hoverable: false,
  clickable: false,
  bordered: true,
  shadow: 'md',
  padding: 'md'
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const cardClasses = computed(() => [
  'base-card',
  `card-padding-${props.padding}`,
  `card-shadow-${props.shadow}`,
  {
    'card-hoverable': props.hoverable,
    'card-clickable': props.clickable,
    'card-bordered': props.bordered
  }
])

function handleClick(event: MouseEvent) {
  if (props.clickable) {
    emit('click', event)
  }
}
</script>

<style scoped lang="scss">
/* ========== 基础卡片样式 ========== */
.base-card {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
}

/* ========== 边框 ========== */
.card-bordered {
  border: var(--border-width) solid var(--border-color);
}

/* ========== 阴影变体 ========== */
.card-shadow-none {
  box-shadow: none;
}

.card-shadow-sm {
  box-shadow: var(--shadow-sm);
}

.card-shadow-md {
  box-shadow: var(--shadow-md);
}

.card-shadow-lg {
  box-shadow: var(--shadow-lg);
}

.card-shadow-xl {
  box-shadow: var(--shadow-xl);
}

/* ========== 内边距变体 ========== */
.card-padding-none {
  .card-header,
  .card-body,
  .card-footer {
    padding: 0;
  }
}

.card-padding-sm {
  .card-header,
  .card-body,
  .card-footer {
    padding: var(--spacing-sm) var(--spacing-md);
  }
}

.card-padding-md {
  .card-header,
  .card-body,
  .card-footer {
    padding: var(--spacing-md) var(--spacing-lg);
  }
}

.card-padding-lg {
  .card-header,
  .card-body,
  .card-footer {
    padding: var(--spacing-lg) var(--spacing-xl);
  }
}

/* ========== 可悬浮效果 ========== */
.card-hoverable:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-xl);
}

/* ========== 可点击效果 ========== */
.card-clickable {
  cursor: pointer;

  &:active {
    transform: scale(0.98);
  }
}

/* ========== 卡片头部 ========== */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: var(--border-width) solid var(--border-color);
}

.card-title {
  margin: 0;
  font-size: 1.125rem;
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
}

.card-extra {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

/* ========== 卡片主体 ========== */
.card-body {
  flex: 1;
  color: var(--text-primary);
}

/* ========== 卡片底部 ========== */
.card-footer {
  border-top: var(--border-width) solid var(--border-color);
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: var(--spacing-md);
}
</style>

