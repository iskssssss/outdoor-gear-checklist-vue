<template>
  <div
    ref="triggerRef"
    class="base-tooltip-trigger"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
    @focus="handleFocus"
    @blur="handleBlur"
  >
    <!-- 触发器内容 -->
    <slot></slot>
    
    <!-- 工具提示内容 -->
    <Teleport to="body">
      <Transition name="tooltip-fade" @after-leave="onAfterLeave">
        <div
          v-if="isVisible"
          ref="tooltipRef"
          :class="tooltipClasses"
          :style="tooltipStyle"
          role="tooltip"
          :aria-hidden="!isVisible"
        >
          <!-- 箭头 -->
          <div v-if="showArrow" :class="arrowClasses"></div>
          
          <!-- 内容 -->
          <div class="tooltip-content">
            <slot name="content">
              {{ content }}
            </slot>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onMounted, onUnmounted } from 'vue'

interface Props {
  // 工具提示内容
  content?: string
  // 显示位置
  placement?: 'top' | 'bottom' | 'left' | 'right' | 'top-start' | 'top-end' | 'bottom-start' | 'bottom-end' | 'left-start' | 'left-end' | 'right-start' | 'right-end'
  // 触发方式
  trigger?: 'hover' | 'click' | 'focus' | 'manual'
  // 是否显示箭头
  showArrow?: boolean
  // 延迟显示时间
  delay?: number
  // 延迟隐藏时间
  hideDelay?: number
  // 是否禁用
  disabled?: boolean
  // 主题
  theme?: 'light' | 'dark' | 'primary' | 'success' | 'warning' | 'danger'
  // 最大宽度
  maxWidth?: string | number
  // 是否可交互
  interactive?: boolean
  // 偏移量
  offset?: number
  // 是否跟随鼠标
  followCursor?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  content: '',
  placement: 'top',
  trigger: 'hover',
  showArrow: true,
  delay: 100,
  hideDelay: 100,
  disabled: false,
  theme: 'light',
  maxWidth: 250,
  interactive: false,
  offset: 8,
  followCursor: false
})

const emit = defineEmits<{
  show: []
  hide: []
}>()

// 响应式数据
const isVisible = ref(false)
const triggerRef = ref<HTMLElement | null>(null)
const tooltipRef = ref<HTMLElement | null>(null)
const position = ref({ x: 0, y: 0 })
const showTimer = ref<number | null>(null)
const hideTimer = ref<number | null>(null)

// 计算属性
const tooltipClasses = computed(() => [
  'base-tooltip',
  `tooltip-${props.theme}`,
  `tooltip-${props.placement}`,
  {
    'tooltip-arrow': props.showArrow,
    'tooltip-interactive': props.interactive
  }
])

const tooltipStyle = computed(() => {
  const style: Record<string, string> = {}
  
  if (props.maxWidth) {
    style.maxWidth = typeof props.maxWidth === 'number' ? `${props.maxWidth}px` : props.maxWidth
  }
  
  if (props.followCursor) {
    style.left = `${position.value.x}px`
    style.top = `${position.value.y}px`
    style.transform = 'none'
  } else {
    style.left = `${position.value.x}px`
    style.top = `${position.value.y}px`
  }
  
  return style
})

const arrowClasses = computed(() => [
  'tooltip-arrow',
  `arrow-${props.placement}`
])

// 事件处理
function handleMouseEnter(event: MouseEvent) {
  if (props.disabled || props.trigger !== 'hover') return
  
  clearTimers()
  
  if (props.followCursor) {
    updateCursorPosition(event)
  }
  
  showTimer.value = window.setTimeout(() => {
    show()
  }, props.delay)
}

function handleMouseLeave() {
  if (props.disabled || props.trigger !== 'hover') return
  
  clearTimers()
  
  hideTimer.value = window.setTimeout(() => {
    hide()
  }, props.hideDelay)
}

function handleFocus() {
  if (props.disabled || props.trigger !== 'focus') return
  
  clearTimers()
  show()
}

function handleBlur() {
  if (props.disabled || props.trigger !== 'focus') return
  
  clearTimers()
  hide()
}

function handleClick() {
  if (props.disabled || props.trigger !== 'click') return
  
  if (isVisible.value) {
    hide()
  } else {
    show()
  }
}

function updateCursorPosition(event: MouseEvent) {
  position.value = {
    x: event.clientX,
    y: event.clientY
  }
}

function updatePosition() {
  if (!triggerRef.value || !tooltipRef.value) return
  
  const triggerRect = triggerRef.value.getBoundingClientRect()
  const tooltipRect = tooltipRef.value.getBoundingClientRect()
  const scrollX = window.pageXOffset || document.documentElement.scrollLeft
  const scrollY = window.pageYOffset || document.documentElement.scrollTop
  
  let x = 0
  let y = 0
  
  switch (props.placement) {
    case 'top':
      x = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2 + scrollX
      y = triggerRect.top - tooltipRect.height - props.offset + scrollY
      break
    case 'bottom':
      x = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2 + scrollX
      y = triggerRect.bottom + props.offset + scrollY
      break
    case 'left':
      x = triggerRect.left - tooltipRect.width - props.offset + scrollX
      y = triggerRect.top + triggerRect.height / 2 - tooltipRect.height / 2 + scrollY
      break
    case 'right':
      x = triggerRect.right + props.offset + scrollX
      y = triggerRect.top + triggerRect.height / 2 - tooltipRect.height / 2 + scrollY
      break
    // 其他位置变体的计算...
  }
  
  // 边界检测
  const viewportWidth = window.innerWidth
  const viewportHeight = window.innerHeight
  
  if (x < 0) x = 8
  if (x + tooltipRect.width > viewportWidth) x = viewportWidth - tooltipRect.width - 8
  if (y < 0) y = 8
  if (y + tooltipRect.height > viewportHeight) y = viewportHeight - tooltipRect.height - 8
  
  position.value = { x, y }
}

function show() {
  if (props.disabled) return
  
  isVisible.value = true
  emit('show')
  
  nextTick(() => {
    if (!props.followCursor) {
      updatePosition()
    }
  })
}

function hide() {
  if (props.disabled) return
  
  isVisible.value = false
  emit('hide')
}

function clearTimers() {
  if (showTimer.value) {
    clearTimeout(showTimer.value)
    showTimer.value = null
  }
  if (hideTimer.value) {
    clearTimeout(hideTimer.value)
    hideTimer.value = null
  }
}

function onAfterLeave() {
  // 工具提示完全隐藏后的回调
}

// 生命周期
onMounted(() => {
  if (props.trigger === 'click') {
    triggerRef.value?.addEventListener('click', handleClick)
  }
  
  if (props.followCursor) {
    document.addEventListener('mousemove', updateCursorPosition)
  }
})

onUnmounted(() => {
  clearTimers()
  
  if (props.trigger === 'click') {
    triggerRef.value?.removeEventListener('click', handleClick)
  }
  
  if (props.followCursor) {
    document.removeEventListener('mousemove', updateCursorPosition)
  }
})

// 暴露方法
defineExpose({
  show,
  hide,
  isVisible: computed(() => isVisible.value)
})
</script>

<style scoped lang="scss">
/* ========== 触发器 ========== */
.base-tooltip-trigger {
  display: inline-block;
}

/* ========== 工具提示基础样式 ========== */
.base-tooltip {
  position: absolute;
  z-index: 1000;
  max-width: 250px;
  padding: var(--spacing-sm);
  background: var(--bg-card);
  color: var(--text-primary);
  font-size: 0.875rem;
  line-height: 1.4;
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  border: var(--border-width) solid var(--border-color);
  pointer-events: none;
  white-space: pre-wrap;
  word-break: break-word;
}

.tooltip-interactive {
  pointer-events: auto;
}

/* ========== 主题变体 ========== */
.tooltip-light {
  background: var(--bg-card);
  color: var(--text-primary);
  border-color: var(--border-color);
}

.tooltip-dark {
  background: var(--color-gray-800);
  color: var(--text-white);
  border-color: var(--color-gray-700);
}

.tooltip-primary {
  background: var(--primary-color);
  color: var(--text-white);
  border-color: var(--primary-color);
}

.tooltip-success {
  background: var(--success-color);
  color: var(--text-white);
  border-color: var(--success-color);
}

.tooltip-warning {
  background: var(--warning-color);
  color: var(--text-primary);
  border-color: var(--warning-color);
}

.tooltip-danger {
  background: var(--danger-color);
  color: var(--text-white);
  border-color: var(--danger-color);
}

/* ========== 箭头样式 ========== */
.tooltip-arrow {
  position: absolute;
  width: 0;
  height: 0;
  border: 6px solid transparent;
}

.arrow-top {
  bottom: -12px;
  left: 50%;
  transform: translateX(-50%);
  border-top-color: inherit;
  border-bottom: none;
}

.arrow-bottom {
  top: -12px;
  left: 50%;
  transform: translateX(-50%);
  border-bottom-color: inherit;
  border-top: none;
}

.arrow-left {
  right: -12px;
  top: 50%;
  transform: translateY(-50%);
  border-left-color: inherit;
  border-right: none;
}

.arrow-right {
  left: -12px;
  top: 50%;
  transform: translateY(-50%);
  border-right-color: inherit;
  border-left: none;
}

/* ========== 内容样式 ========== */
.tooltip-content {
  position: relative;
  z-index: 1;
}

/* ========== 动画 ========== */
.tooltip-fade-enter-active,
.tooltip-fade-leave-active {
  transition: opacity 0.2s ease;
}

.tooltip-fade-enter-from,
.tooltip-fade-leave-to {
  opacity: 0;
}

/* ========== 主题集成 ========== */
.base-tooltip {
  /* 高山晨光主题 */
  body.theme-mountain-sunrise & {
    box-shadow: 0 4px 20px rgba(255, 152, 0, 0.2);
  }

  /* 森林探险主题 */
  body.theme-forest-trek & {
    box-shadow: 0 4px 20px rgba(76, 175, 80, 0.2);
  }

  /* 雪峰极光主题 */
  body.theme-snowpeak-aurora & {
    box-shadow: 0 4px 20px rgba(0, 188, 212, 0.2);
  }

  /* 手绘风格主题 */
  body.theme-paper & {
    box-shadow: 0 6px 25px rgba(0, 0, 0, 0.15);
    border-style: dashed;
  }
}
</style>
