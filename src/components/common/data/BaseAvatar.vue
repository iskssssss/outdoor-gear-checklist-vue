<template>
  <div :class="avatarClasses" :style="avatarStyle">
    <!-- 图片头像 -->
    <img
      v-if="src && !imageError"
      :src="src"
      :alt="alt"
      class="avatar-image"
      @error="handleImageError"
      @load="handleImageLoad"
    />
    
    <!-- 图标头像 -->
    <span v-else-if="icon" class="avatar-icon">{{ icon }}</span>
    
    <!-- 文本头像 -->
    <span v-else-if="text" class="avatar-text">{{ displayText }}</span>
    
    <!-- 默认头像 -->
    <span v-else class="avatar-default">👤</span>
    
    <!-- 在线状态指示器 -->
    <div v-if="online !== undefined" class="avatar-status" :class="statusClasses"></div>
    
    <!-- 徽章 -->
    <div v-if="badge" class="avatar-badge">{{ badge }}</div>
    
    <!-- 加载状态 -->
    <div v-if="loading" class="avatar-loading">
      <div class="loading-spinner"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

interface Props {
  // 头像图片地址
  src?: string
  // 图片alt文本
  alt?: string
  // 图标
  icon?: string
  // 文本内容
  text?: string
  // 尺寸
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number
  // 形状
  shape?: 'circle' | 'square' | 'rounded'
  // 在线状态
  online?: boolean
  // 徽章内容
  badge?: string | number
  // 加载状态
  loading?: boolean
  // 背景色
  backgroundColor?: string
  // 文字颜色
  textColor?: string
  // 最大显示字符数
  maxTextLength?: number
  // 点击事件
  clickable?: boolean
  // 禁用状态
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  src: '',
  alt: '',
  icon: '',
  text: '',
  size: 'md',
  shape: 'circle',
  online: undefined,
  badge: '',
  loading: false,
  backgroundColor: '',
  textColor: '',
  maxTextLength: 2,
  clickable: false,
  disabled: false
})

const emit = defineEmits<{
  click: [event: MouseEvent]
  error: [event: Event]
  load: [event: Event]
}>()

const imageError = ref(false)
const imageLoaded = ref(false)

// 计算属性
const displayText = computed(() => {
  if (!props.text) return ''
  return props.text.slice(0, props.maxTextLength).toUpperCase()
})

const avatarClasses = computed(() => [
  'base-avatar',
  `avatar-${typeof props.size === 'number' ? 'custom' : props.size}`,
  `avatar-${props.shape}`,
  {
    'avatar-clickable': props.clickable && !props.disabled,
    'avatar-disabled': props.disabled,
    'avatar-loading': props.loading,
    'avatar-image-loaded': imageLoaded.value
  }
])

const avatarStyle = computed(() => {
  const style: Record<string, string> = {}
  
  if (typeof props.size === 'number') {
    style.width = `${props.size}px`
    style.height = `${props.size}px`
    style.fontSize = `${props.size * 0.4}px`
  }
  
  if (props.backgroundColor) {
    style.backgroundColor = props.backgroundColor
  }
  
  if (props.textColor) {
    style.color = props.textColor
  }
  
  return style
})

const statusClasses = computed(() => ({
  'status-online': props.online === true,
  'status-offline': props.online === false
}))

// 事件处理
function handleClick(event: MouseEvent) {
  if (props.clickable && !props.disabled && !props.loading) {
    emit('click', event)
  }
}

function handleImageError(event: Event) {
  imageError.value = true
  emit('error', event)
}

function handleImageLoad(event: Event) {
  imageLoaded.value = true
  emit('load', event)
}
</script>

<style scoped lang="scss">
/* ========== 基础头像样式 ========== */
.base-avatar {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: var(--primary-color);
  color: var(--text-white);
  font-weight: var(--font-weight-medium);
  overflow: hidden;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

/* ========== 尺寸变体 ========== */
.avatar-xs {
  width: 24px;
  height: 24px;
  font-size: 0.75rem;
}

.avatar-sm {
  width: 32px;
  height: 32px;
  font-size: 0.875rem;
}

.avatar-md {
  width: 40px;
  height: 40px;
  font-size: 1rem;
}

.avatar-lg {
  width: 64px;
  height: 64px;
  font-size: 1.5rem;
}

.avatar-xl {
  width: 96px;
  height: 96px;
  font-size: 2rem;
}

.avatar-custom {
  /* 自定义尺寸通过内联样式设置 */
}

/* ========== 形状变体 ========== */
.avatar-circle {
  border-radius: 50%;
}

.avatar-square {
  border-radius: var(--radius-sm);
}

.avatar-rounded {
  border-radius: var(--radius-md);
}

/* ========== 头像内容 ========== */
.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.avatar-icon {
  font-size: 1.2em;
  line-height: 1;
}

.avatar-text {
  font-weight: var(--font-weight-bold);
  letter-spacing: 0.5px;
}

.avatar-default {
  font-size: 1.2em;
  opacity: 0.7;
}

/* ========== 状态样式 ========== */
.avatar-clickable {
  cursor: pointer;
  
  &:hover {
    transform: scale(1.05);
    box-shadow: var(--shadow-md);
  }
  
  &:active {
    transform: scale(0.95);
  }
}

.avatar-disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.avatar-loading {
  pointer-events: none;
}

/* ========== 在线状态指示器 ========== */
.avatar-status {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 25%;
  height: 25%;
  border-radius: 50%;
  border: 2px solid var(--bg-card);
  
  &.status-online {
    background: var(--success-color);
  }
  
  &.status-offline {
    background: var(--text-muted);
  }
}

/* ========== 徽章 ========== */
.avatar-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  min-width: 18px;
  height: 18px;
  padding: 0 4px;
  background: var(--danger-color);
  color: var(--text-white);
  font-size: 0.7rem;
  font-weight: var(--font-weight-bold);
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid var(--bg-card);
  line-height: 1;
}

/* ========== 加载状态 ========== */
.avatar-loading {
  .avatar-loading {
    position: absolute;
    inset: 0;
    background: rgba(255, 255, 255, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: inherit;
    z-index: 10;
    
    .loading-spinner {
      width: 60%;
      height: 60%;
      border: 2px solid var(--border-color);
      border-top-color: var(--primary-color);
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* ========== 图片加载状态 ========== */
.avatar-image-loaded {
  .avatar-image {
    animation: fadeIn 0.3s ease;
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* ========== 主题集成 ========== */
.base-avatar {
  /* 高山晨光主题 */
  body.theme-mountain-sunrise & {
    box-shadow: 0 2px 8px rgba(255, 152, 0, 0.2);
  }

  /* 森林探险主题 */
  body.theme-forest-trek & {
    box-shadow: 0 2px 8px rgba(76, 175, 80, 0.2);
  }

  /* 雪峰极光主题 */
  body.theme-snowpeak-aurora & {
    box-shadow: 0 2px 8px rgba(0, 188, 212, 0.2);
  }

  /* 手绘风格主题 */
  body.theme-paper & {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
}
</style>
