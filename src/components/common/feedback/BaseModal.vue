<template>
  <Teleport to="body">
    <Transition name="modal-fade" @after-leave="onAfterLeave">
      <div v-if="isVisible" class="base-modal-overlay" @click="handleOverlayClick">
        <Transition name="modal-slide">
          <div v-if="isVisible" class="base-modal-content" :style="contentStyle" @click.stop>
            <!-- 头部区域 -->
            <div class="base-modal-header">
              <slot name="header">
                <component :is="titleTag" class="base-modal-title">{{ title }}</component>
                <button class="base-modal-close" @click="attemptClose" :aria-label="closeButtonAriaLabel">
                  {{ closeButtonText }}
                </button>
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

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  // 模态框标题
  title: {
    type: String,
    default: ''
  },
  // 标题标签类型 (h1-h6)
  titleTag: {
    type: String,
    default: 'h3',
    validator: (value) => ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(value)
  },
  // 模态框宽度
  width: {
    type: String,
    default: '800px'
  },
  // 模态框最大高度
  maxHeight: {
    type: String,
    default: '90vh'
  },
  // 是否显示底部
  showFooter: {
    type: Boolean,
    default: false
  },
  // 点击遮罩层是否关闭
  closeOnOverlayClick: {
    type: Boolean,
    default: true
  },
  // 是否禁止模态框主体滚动
  disableBodyScroll: {
    type: Boolean,
    default: false
  },
  // 关闭按钮文本
  closeButtonText: {
    type: String,
    default: '×'
  },
  // 关闭按钮 aria-label
  closeButtonAriaLabel: {
    type: String,
    default: '关闭'
  },
  // body 额外的 class
  bodyClass: {
    type: [String, Array, Object],
    default: ''
  },
  // 是否立即显示
  modelValue: {
    type: Boolean,
    default: false
  },
  // 关闭前的钩子函数
  beforeClose: {
    type: Function,
    default: null
  }
})

const emit = defineEmits(['close', 'update:modelValue', 'after-close'])

// 内部状态
const isVisible = ref(props.modelValue)
let scrollPosition = 0
let modalCount = 0 // 全局模态框计数器

// 计算内容样式
const contentStyle = computed(() => ({
  width: props.width,
  maxWidth: '90%',
  maxHeight: props.maxHeight
}))

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
  modalCount++

  // 只在第一个模态框打开时锁定滚动
  if (modalCount === 1) {
    scrollPosition = window.scrollY
    document.body.style.top = `-${scrollPosition}px`
    document.body.classList.add('no-scroll')
  }

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
  modalCount = Math.max(0, modalCount - 1)

  // 只在所有模态框关闭后解锁滚动
  if (modalCount === 0) {
    document.body.classList.remove('no-scroll')
    document.body.style.top = ''
    window.scrollTo(0, scrollPosition)
  }

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
 * 在模态框关闭动画结束后触发
 */
function onAfterLeave() {
  emit('after-close');
}

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

/* 动画 */
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
  transform: translateY(-50px);  /* 保持动画距离固定，不使用token */
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
