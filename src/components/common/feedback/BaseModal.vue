<template>
  <Teleport to="body">
    <Transition name="modal-fade" @after-leave="onAfterLeave">
      <div v-if="isVisible" class="base-modal-overlay" @click="handleOverlayClick">
        <Transition :name="`modal-${animation}`">
          <div 
            v-if="isVisible" 
            :class="modalClasses" 
            :style="contentStyle" 
            @click.stop
            @keydown.esc="handleEscKey"
            tabindex="-1"
            ref="modalContentRef"
          >
            <!-- 头部区域 -->
            <div v-if="showHeader" class="base-modal-header" :class="headerClasses">
              <slot name="header">
                <div class="modal-header-content">
                  <div class="modal-title-section">
                    <component :is="titleTag" class="base-modal-title">{{ title }}</component>
                    <p v-if="description" class="modal-description">{{ description }}</p>
                  </div>
                  <button 
                    v-if="showClose" 
                    class="base-modal-close" 
                    @click="attemptClose" 
                    :aria-label="closeButtonAriaLabel"
                  >
                    {{ closeButtonText }}
                  </button>
                </div>
              </slot>
            </div>

            <!-- 主体区域 -->
            <div class="base-modal-body" :class="[bodyClass, { 'no-inner-scroll': disableBodyScroll }]">
              <slot></slot>
            </div>

            <!-- 底部区域 -->
            <div v-if="$slots.footer || showFooter" class="base-modal-footer">
              <slot name="footer"></slot>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch, onUnmounted } from 'vue'
import type { PropType } from 'vue'

// 引入 useScrollLock
import { useScrollLock } from '@vueuse/core'

interface Props {
  /**
   * 模态框标题。
   */
  title?: string;
  /**
   * 标题标签类型 (h1-h6)。
   * @values 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
   * @default 'h3'
   */
  titleTag?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  /**
   * 模态框描述文本。
   */
  description?: string;
  /**
   * 模态框宽度。可以是 CSS 宽度值或数字 (px)。
   * @default '800px'
   */
  width?: string | number;
  /**
   * 模态框高度。可以是 CSS 高度值或数字 (px)。
   * @default 'auto'
   */
  height?: string | number;
  /**
   * 模态框最大高度。可以是 CSS 高度值或数字 (px)。
   * @default '90vh'
   */
  maxHeight?: string | number;
  /**
   * 模态框最小高度。可以是 CSS 高度值或数字 (px)。
   * @default '200px'
   */
  minHeight?: string | number;
  /**
   * 模态框预设尺寸。
   * @values 'small' | 'medium' | 'large' | 'fullscreen'
   * @default 'medium'
   */
  size?: 'small' | 'medium' | 'large' | 'fullscreen';
  /**
   * 模态框类型。可以影响样式和行为。
   * @values 'default' | 'confirm' | 'alert' | 'drawer'
   * @default 'default'
   */
  type?: 'default' | 'confirm' | 'alert' | 'drawer';
  /**
   * 是否显示模态框底部区域。
   * @default false
   */
  showFooter?: boolean;
  /**
   * 是否显示模态框头部区域。
   * @default true
   */
  showHeader?: boolean;
  /**
   * 是否显示右上角的关闭按钮。
   * @default true
   */
  showClose?: boolean;
  /**
   * 点击遮罩层时是否关闭模态框。
   * @default true
   */
  closeOnOverlayClick?: boolean;
  /**
   * 按下 ESC 键时是否关闭模态框。
   * @default true
   */
  closeOnEsc?: boolean;
  /**
   * 是否禁止模态框主体内容区域的滚动。
   * @default false
   */
  disableBodyScroll?: boolean;
  /**
   * 关闭按钮的文本内容。通常是 '×'。
   * @default '×'
   */
  closeButtonText?: string;
  /**
   * 关闭按钮的 aria-label 属性，用于无障碍访问。
   * @default '关闭'
   */
  closeButtonAriaLabel?: string;
  /**
   * 模态框主体内容的额外 class。
   */
  bodyClass?: string | string[] | Record<string, boolean>;
  /**
   * 控制模态框的显示/隐藏 (v-model)。
   * @default false
   */
  modelValue?: boolean;
  /**
   * 关闭前的钩子函数。如果返回 `false` 或 Promise resolve `false`，则阻止关闭。
   */
  beforeClose?: () => boolean | Promise<boolean>;
  /**
   * 模态框的动画类型。
   * @values 'slide' | 'fade' | 'zoom' | 'none'
   * @default 'slide'
   */
  animation?: 'slide' | 'fade' | 'zoom' | 'none';
  /**
   * 是否允许模态框拖拽。目前暂未实现此功能。
   * @default false
   */
  draggable?: boolean;
  /**
   * 是否允许模态框调整大小。目前暂未实现此功能。
   * @default false
   */
  resizable?: boolean;
  /**
   * 是否启用主题集成样式。
   * @default true
   */
  themeIntegration?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  titleTag: 'h3',
  description: '',
  width: '800px',
  height: 'auto',
  maxHeight: '90vh',
  minHeight: '200px',
  size: 'medium',
  type: 'default',
  showFooter: false,
  showHeader: true,
  showClose: true,
  closeOnOverlayClick: true,
  closeOnEsc: true,
  disableBodyScroll: false,
  closeButtonText: '×',
  closeButtonAriaLabel: '关闭',
  bodyClass: () => [], // Use a factory function for array/object defaults
  modelValue: false,
  beforeClose: undefined,
  animation: 'slide',
  draggable: false, // Changed default to false
  resizable: false, // Changed default to false
  themeIntegration: true
})

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'update:modelValue', value: boolean): void;
  (e: 'after-close'): void;
}>()

// 内部状态
const isVisible = ref<boolean>(props.modelValue)
const modalContentRef = ref<HTMLDivElement | null>(null)

// 使用 useScrollLock 锁定 body 滚动
const isLocked = useScrollLock(document.body)

// 计算内容样式
const contentStyle = computed<Record<string, string>>(() => {
  const style: Record<string, string> = {}
  
  // 宽度
  if (props.size === 'small') {
    style.width = '400px'
  } else if (props.size === 'medium') {
    style.width = '800px'
  } else if (props.size === 'large') {
    style.width = '1200px'
  } else if (props.size === 'fullscreen') {
    style.width = '100vw'
    style.height = '100vh'
    style.maxWidth = '100vw'
    style.maxHeight = '100vh'
    style.borderRadius = '0'
  } else {
    style.width = typeof props.width === 'number' ? `${props.width}px` : props.width
  }
  
  // 高度
  if (props.height !== 'auto') {
    style.height = typeof props.height === 'number' ? `${props.height}px` : props.height
  }
  
  // 最大高度
  style.maxHeight = typeof props.maxHeight === 'number' ? `${props.maxHeight}px` : props.maxHeight
  
  // 最小高度
  style.minHeight = typeof props.minHeight === 'number' ? `${props.minHeight}px` : props.minHeight
  
  // 最大宽度
  if (props.size !== 'fullscreen') {
    style.maxWidth = '90%'
  }
  
  return style
})

// 计算模态框类名
const modalClasses = computed(() => [
  'base-modal-content',
  `modal-${props.type}`,
  `modal-${props.size}`,
  `modal-${props.animation}`,
  {
    'modal-draggable': props.draggable,
    'modal-resizable': props.resizable,
    'modal-theme-integration': props.themeIntegration
  }
])

// 计算头部类名
const headerClasses = computed(() => [
  `header-${props.type}`,
  {
    'header-draggable': props.draggable
  }
])

// 监听 modelValue 变化
watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    show()
  } else {
    close()
  }
})

/**
 * 显示模态框
 */
function show() {
  isVisible.value = true
  isLocked.value = true // 锁定滚动
  emit('update:modelValue', true)
}

/**
 * 尝试关闭模态框，会触发表单类的拟态框都必须点击关闭按钮才能关闭
 */
async function attemptClose() {
  if (props.beforeClose) {
    try {
      const canClose = await props.beforeClose()
      if (canClose === false) {
        return;
      }
    } catch (e) {
      console.error("`beforeClose` hook failed:", e);
      // a hook error should prevent closing
      return;
    }
  }
  close();
}

/**
 * 关闭模态框
 */
function close() {
  isVisible.value = false
  isLocked.value = false // 解锁滚动
  emit('close')
  emit('update:modelValue', false)
}

/**
 * 处理遮罩层点击
 */
function handleOverlayClick() {
  if (props.closeOnOverlayClick) {
    attemptClose()
  }
}

/**
 * 处理ESC键
 */
function handleEscKey() {
  if (props.closeOnEsc) {
    attemptClose()
  }
}

/**
 * 在模态框关闭动画结束后触发
 */
function onAfterLeave() {
  emit('after-close');
}

onUnmounted(() => {
  if (isLocked.value) {
    isLocked.value = false // 确保组件卸载时释放滚动锁
  }
})

// 暴露方法
defineExpose({
  show,
  close
})
</script>

<style scoped lang="scss">
/* 遮罩层 */
.base-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: var(--bg-overlay);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

/* 内容容器 */
.base-modal-content {
  background: var(--bg-card);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-xl);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
}

/* ========== 模态框类型样式 ========== */
.modal-confirm {
  .base-modal-header {
    border-bottom-color: var(--warning-color);
    background: linear-gradient(135deg, var(--bg-warning-light), var(--bg-card)); /* 使用语义化变量 */
  }
}

.modal-alert {
  .base-modal-header {
    border-bottom-color: var(--danger-color);
    background: linear-gradient(135deg, var(--bg-danger-light), var(--bg-card)); /* 使用语义化变量 */
  }
}

.modal-drawer {
  border-radius: 0;
  box-shadow: none;
  border-left: var(--border-width-lg) solid var(--primary-color);
}

/* ========== 拖拽和调整大小相关样式已移除 ========== */
/*
.modal-draggable {
  cursor: move;
}

.header-draggable {
  cursor: move;
  user-select: none;
}

.modal-drag-handle {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 20px;
  cursor: move;
  z-index: 10;
}

.modal-resize-handle {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 20px;
  height: 20px;
  cursor: nw-resize;
  z-index: 10;
  
  &::after {
    content: '';
    position: absolute;
    bottom: 2px;
    right: 2px;
    width: 8px;
    height: 8px;
    border-right: 2px solid var(--text-muted);
    border-bottom: 2px solid var(--text-muted);
  }
}
*/

/* ========== 头部样式增强 ========== */
.modal-header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--spacing-md);
  width: 100%;
}

.modal-title-section {
  flex: 1;
}

.modal-description {
  margin: var(--spacing-xs) 0 0 0;
  font-size: 0.9rem;
  color: var(--text-secondary);
  line-height: 1.4;
}

/* 头部 */
.base-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-lg) var(--spacing-xl);  /* 头部需要较大内边距 */
  border-bottom: var(--border-width) solid var(--border-color);
  border-radius: var(--border-radius-lg) var(--border-radius-lg) 0 0;
  flex-shrink: 0;
  background: var(--bg-card);
  position: sticky;
  top: 0;
  z-index: 1;
}

.base-modal-title {
  margin: 0;
  font-size: 1.5rem;
  color: var(--text-primary);
}

.base-modal-close {
  font-size: 2rem;
  font-weight: 300;
  cursor: pointer;
  color: var(--text-secondary);
  background: none;
  border: none;
  padding: var(--spacing-xs) var(--spacing-sm);  /* 关闭按钮小内边距 */
  border-radius: var(--radius-sm);
  transition: all 0.2s ease;
  line-height: 1;

  &:hover {
    background: var(--bg-hover);
    color: var(--text-primary);
  }
}

/* 主体 */
.base-modal-body {
  padding: var(--spacing-xl);  /* 主体需要充足的内边距 */
  overflow-y: auto;
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);  /* 内容元素间标准间距 */
}

.base-modal-body.no-inner-scroll {
  overflow: hidden;
}

/* 底部 */
.base-modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-md);  /* 按钮间标准间距 */
  padding: var(--spacing-lg) var(--spacing-xl);  /* 底部与头部对称 */
  border-top: var(--border-width) solid var(--border-color);
  flex-shrink: 0;
}

/* ========== 动画样式 ========== */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-slide-enter-active,
.modal-slide-leave-active {
  transition: all 0.3s ease;
}

.modal-slide-enter-from,
.modal-slide-leave-to {
  opacity: 0;
  transform: translateY(-50px);
}

.modal-zoom-enter-active,
.modal-zoom-leave-active {
  transition: all 0.3s ease;
}

.modal-zoom-enter-from,
.modal-zoom-leave-to {
  opacity: 0;
  transform: scale(0.8);
}

.modal-none-enter-active,
.modal-none-leave-active {
  transition: none;
}

.modal-none-enter-from,
.modal-none-leave-to {
  opacity: 1;
}

/* ========== 主题集成 ========== */
.modal-theme-integration {
  /* 高山晨光主题 */
  body.theme-mountain-sunrise & {
    box-shadow: var(--shadow-modal-mountain-sunrise);
    border: var(--border-modal-mountain-sunrise);
  }

  /* 森林探险主题 */
  body.theme-forest-trek & {
    box-shadow: var(--shadow-modal-forest-trek);
    border: var(--border-modal-forest-trek);
  }

  /* 雪峰极光主题 */
  body.theme-snowpeak-aurora & {
    box-shadow: var(--shadow-modal-snowpeak-aurora);
    border: var(--border-modal-snowpeak-aurora);
  }

  /* 手绘风格主题 */
  body.theme-paper & {
    box-shadow: var(--shadow-modal-paper);
    border-style: dashed;
  }
}

/* 响应式设计 - 移动端减小间距 */
@media (max-width: 768px) {
  .base-modal-content {
    width: 95% !important;
    max-height: 95vh !important;
  }

  .base-modal-header {
    padding: var(--spacing-lg);  /* 移动端减小头部内边距 */
  }

  .base-modal-title {
    font-size: 1.25rem;
  }

  .base-modal-body {
    padding: var(--spacing-lg);  /* 移动端减小主体内边距 */
  }

  .base-modal-footer {
    padding: var(--spacing-md) var(--spacing-lg);  /* 移动端减小底部内边距 */
  }
}
</style>
