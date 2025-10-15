<template>
  <div :class="cardClasses" @click="handleClick">
    <!-- 封面图片 -->
    <div v-if="cover || $slots.cover" class="card-cover">
      <slot name="cover">
        <img :src="cover" :alt="title" class="cover-image" />
      </slot>
      <div v-if="loading" class="card-loading-overlay">
        <div class="loading-spinner"></div>
      </div>
    </div>

    <!-- 头部插槽 -->
    <div v-if="$slots.header || title || actions.length > 0" class="card-header">
      <slot name="header">
        <div class="card-title-section">
          <h3 class="card-title">{{ title }}</h3>
          <p v-if="description" class="card-description">{{ description }}</p>
        </div>
      </slot>
      <div class="card-actions">
        <slot name="extra"></slot>
        <div v-if="actions.length > 0" class="action-buttons">
          <button
            v-for="(action, index) in actions"
            :key="index"
            class="action-btn"
            :title="action.label"
            @click.stop="action.action"
          >
            {{ action.icon }}
          </button>
        </div>
      </div>
    </div>
    
    <!-- 标签区域 -->
    <div v-if="tags.length > 0 || $slots.tags" class="card-tags">
      <slot name="tags">
        <span v-for="tag in tags" :key="tag" class="card-tag">{{ tag }}</span>
      </slot>
    </div>
    
    <!-- 主体插槽 -->
    <div class="card-body">
      <slot></slot>
    </div>
    
    <!-- 底部插槽 -->
    <div v-if="$slots.footer" class="card-footer">
      <slot name="footer"></slot>
    </div>

    <!-- 选中状态指示器 -->
    <div v-if="selected" class="card-selected-indicator">
      <div class="selected-checkmark">✓</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  /**
   * 卡片标题。
   */
  title?: string
  /**
   * 卡片描述。
   */
  description?: string
  /**
   * 卡片的封面图片 URL 或 base64。
   */
  cover?: string
  /**
   * 是否在鼠标悬浮时显示浮动效果。
   * @default false
   */
  hoverable?: boolean
  /**
   * 卡片是否可点击。
   * @default false
   */
  clickable?: boolean
  /**
   * 是否显示卡片边框。
   * @default true
   */
  bordered?: boolean
  /**
   * 卡片的阴影深度。
   * @values 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
   * @default 'md'
   */
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  /**
   * 卡片内部的内边距大小。
   * @values 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl'
   * @default 'md'
   */
  padding?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  /**
   * 卡片的预设尺寸，影响最大宽度。
   * @values 'sm' | 'md' | 'lg'
   * @default 'md'
   */
  size?: 'sm' | 'md' | 'lg'
  /**
   * 卡片的视觉变体。
   * @values 'default' | 'outlined' | 'elevated' | 'filled'
   * @default 'default'
   */
  variant?: 'default' | 'outlined' | 'elevated' | 'filled'
  /**
   * 卡片是否处于加载状态。
   * @default false
   */
  loading?: boolean
  /**
   * 卡片是否禁用。
   * @default false
   */
  disabled?: boolean
  /**
   * 卡片是否被选中。
   * @default false
   */
  selected?: boolean
  /**
   * 头部区域的动作按钮数组。
   */
  actions?: Array<{
    icon: string
    label: string
    action: () => void
  }>
  /**
   * 卡片的标签数组。
   */
  tags?: string[]
  /**
   * 是否启用主题集成样式。
   * @default true
   */
  themeIntegration?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  description: '',
  cover: '',
  hoverable: false,
  clickable: false,
  bordered: true,
  shadow: 'md',
  padding: 'md',
  size: 'md',
  variant: 'default',
  loading: false,
  disabled: false,
  selected: false,
  actions: () => [],
  tags: () => [],
  themeIntegration: true
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const cardClasses = computed(() => [
  'base-card',
  `card-padding-${props.padding}`,
  `card-shadow-${props.shadow}`,
  `card-size-${props.size}`,
  `card-variant-${props.variant}`,
  {
    'card-hoverable': props.hoverable,
    'card-clickable': props.clickable && !props.disabled,
    'card-bordered': props.bordered,
    'card-loading': props.loading,
    'card-disabled': props.disabled,
    'card-selected': props.selected,
    'card-theme-integration': props.themeIntegration
  }
])

function handleClick(event: MouseEvent) {
  if (props.clickable && !props.disabled && !props.loading) {
    emit('click', event)
  }
}
</script>

<style scoped lang="scss">
@import '../../../assets/styles/_theme-outdoor-mixins.scss';

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

.card-padding-xs {
  .card-header,
  .card-body,
  .card-footer {
    padding: var(--spacing-xs) var(--spacing-sm);
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

.card-padding-xl {
  .card-header,
  .card-body,
  .card-footer {
    padding: var(--spacing-xl) var(--spacing-2xl);
  }
}

/* ========== 尺寸变体 ========== */
.card-size-sm {
  max-width: 280px;
}

.card-size-md {
  max-width: 400px;
}

.card-size-lg {
  max-width: 600px;
}

/* ========== 卡片变体 ========== */
.card-variant-default {
  background: var(--bg-card);
  color: var(--text-primary);
}

.card-variant-outlined {
  background: transparent;
  border: var(--border-width-lg) solid var(--border-color);
  color: var(--text-primary);
}

.card-variant-elevated {
  background: var(--bg-card);
  box-shadow: var(--shadow-xl);
  border: none;
  color: var(--text-primary);
}

.card-variant-filled {
  background: var(--bg-hover);
  border: none;
  color: var(--text-primary);
}

/* ========== 状态样式 ========== */
.card-loading {
  position: relative;
  pointer-events: none;
  
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: var(--bg-overlay-light); /* 使用语义化变量 */
    border-radius: inherit;
    z-index: 10;
  }
}

.card-disabled {
  opacity: 0.6;
  cursor: not-allowed;
  pointer-events: none;
}

.card-selected {
  border-color: var(--primary-color);
  box-shadow: var(--shadow-selected-primary); /* 使用语义化变量 */
}

/* ========== 可悬浮效果 ========== */
.card-hoverable:hover:not(.card-disabled):not(.card-loading) {
  transform: translateY(-4px);
  box-shadow: var(--shadow-xl);
}

/* ========== 可点击效果 ========== */
.card-clickable {
  cursor: pointer;
  transition: all 0.2s ease;

  &:active:not(.card-disabled):not(.card-loading) {
    transform: scale(0.98);
  }
}

/* ========== 封面图片 ========== */
.card-cover {
  position: relative;
  width: 100%;
  height: 200px;
  overflow: hidden;
  border-radius: var(--radius-lg) var(--radius-lg) 0 0;

  .cover-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
  }

  &:hover .cover-image {
    transform: scale(1.05);
  }
}

/* ========== 加载状态 ========== */
.card-loading-overlay {
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;

  .loading-spinner {
    width: 32px;
    height: 32px;
    border: 3px solid var(--border-color);
    border-top-color: var(--primary-color);
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* ========== 头部样式 ========== */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--spacing-md);
}

.card-title-section {
  flex: 1;
}

.card-description {
  margin: var(--spacing-xs) 0 0 0;
  font-size: 0.9rem;
  color: var(--text-secondary);
  line-height: 1.4;
}

.card-actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  flex-shrink: 0;
}

.action-buttons {
  display: flex;
  gap: var(--spacing-xs);
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  color: var(--text-muted);
  cursor: pointer;
  border-radius: var(--radius-sm);
  transition: all 0.2s ease;
  font-size: 1.1rem;

  &:hover {
    background: var(--bg-hover);
    color: var(--text-primary);
  }

  &:active {
    transform: scale(0.95);
  }
}

/* ========== 标签样式 ========== */
.card-tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm) var(--spacing-lg);
}

.card-tag {
  display: inline-block;
  padding: var(--spacing-xs) var(--spacing-sm);
  background: var(--accent-primary); /* 使用语义化变量 */
  color: var(--text-on-accent); /* 使用语义化变量 */
  font-size: 0.75rem;
  border-radius: var(--radius-full);
  font-weight: 500;
}

/* ========== 选中状态指示器 ========== */
.card-selected-indicator {
  position: absolute;
  top: var(--spacing-md);
  right: var(--spacing-md);
  width: 24px;
  height: 24px;
  background: var(--primary-color);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 5;

  .selected-checkmark {
    color: var(--text-white);
    font-size: 0.8rem;
    font-weight: bold;
  }
}

/* ========== 卡片标题 ========== */
.card-title {
  margin: 0;
  font-size: 1.125rem;
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
  line-height: 1.3;
}

.card-body {
  flex: 1;
  color: var(--text-primary);
  line-height: 1.5;
}

/* ========== 卡片底部 ========== */
.card-footer {
  border-top: var(--border-width) solid var(--border-color);
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: var(--spacing-md);
}

/* ========== 主题集成样式 ========== */
.card-theme-integration {
  /* 高山晨光主题 */
  body.theme-mountain-sunrise & {
    @include mountain-sunrise-border;
  }

  /* 森林探险主题 */
  body.theme-forest-trek & {
    @include forest-trek-texture;
  }

  /* 雪峰极光主题 */
  body.theme-snowpeak-aurora & {
    @include snowpeak-aurora-border;
  }

  /* 沙漠日落主题 */
  body.theme-desert-sunset & {
    @include desert-sunset-texture;
  }

  /* 雨林探秘主题 */
  body.theme-rainforest-expedition & {
    @include rainforest-mist-border;
  }

  /* 高原晨雾主题 */
  body.theme-highland-mist & {
    @include highland-mist-border;
  }

  /* 火山熔岩主题 */
  body.theme-volcano-adventure & {
    @include volcano-crack-effect;
  }

  /* 北极光雪原主题 */
  body.theme-polar-aurora & {
    @include polar-aurora-snowflake;
  }

  /* 手绘风格主题 */
  body.theme-paper & {
    /* paper-shadow mixin 暂未实现 */
  }
}

/* ========== 响应式设计 ========== */
@media (max-width: 768px) {
  .base-card {
    max-width: 100%;
  }

  .card-cover {
    height: 160px;
  }

  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-sm);
  }

  .card-actions {
    align-self: flex-end;
  }

  .card-tags {
    padding: var(--spacing-xs) var(--spacing-md);
  }

  .card-tag {
    font-size: 0.7rem;
  }
}
</style>

