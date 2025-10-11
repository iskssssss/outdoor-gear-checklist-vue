<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div 
        v-if="isVisible" 
        class="base-modal-overlay" 
        @click="handleOverlayClick"
      >
        <Transition name="modal-slide">
          <div 
            v-if="isVisible"
            class="base-modal-content" 
            :style="contentStyle"
            @click.stop
          >
            <!-- 头部区域 -->
            <div class="base-modal-header">
              <slot name="header">
                <component :is="titleTag" class="base-modal-title">{{ title }}</component>
                <button 
                  class="base-modal-close" 
                  @click="close"
                  :aria-label="closeButtonAriaLabel"
                >
                  {{ closeButtonText }}
                </button>
              </slot>
            </div>

            <!-- 主体区域 -->
            <div 
              class="base-modal-body"
              :class="[bodyClass, { 'no-inner-scroll': disableBodyScroll }]"
            >
              <slot></slot>
            </div>

            <!-- 底部区域 -->
            <div 
              v-if="$slots.footer || showFooter" 
              class="base-modal-footer"
            >
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
  }
})

const emit = defineEmits(['close', 'update:modelValue'])

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
    close()
  }
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
  background-color: var(--modal-overlay-bg, rgba(0, 0, 0, 0.5));
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

/* 内容容器 */
.base-modal-content {
  background: var(--bg-card);
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* 头部 */
.base-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 25px 30px;
  border-bottom: 2px solid var(--border-color);
  border-radius: 12px 12px 0 0;
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
  padding: 4px 8px;
  border-radius: 6px;
  transition: all 0.2s ease;
  line-height: 1;

  &:hover {
    background: var(--bg-hover);
    color: var(--text-primary);
  }
}

/* 主体 */
.base-modal-body {
  padding: 30px;
  overflow-y: auto;
  flex: 1;
  min-height: 0;
  display: flex; /* 新增：使用Flexbox布局 */
  flex-direction: column; /* 新增：垂直堆叠子元素 */
  gap: 20px; /* 新增：子元素之间的间距 */
}

.base-modal-body.no-inner-scroll {
  overflow: hidden;
}

/* 美化滚动条 */
.base-modal-body::-webkit-scrollbar {
  width: 8px;
}

.base-modal-body::-webkit-scrollbar-track {
  background: var(--bg-input, #f5f5f5);
  border-radius: 4px;
}

.base-modal-body::-webkit-scrollbar-thumb {
  background: var(--border-color, #ddd);
  border-radius: 4px;
}

.base-modal-body::-webkit-scrollbar-thumb:hover {
  background: var(--text-muted, #999);
}

/* 底部 */
.base-modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px 30px;
  border-top: 2px solid var(--border-color);
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
  transform: translateY(-50px);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .base-modal-content {
    width: 95% !important;
    max-height: 95vh !important;
  }

  .base-modal-header {
    padding: 20px;
  }

  .base-modal-title {
    font-size: 1.25rem;
  }

  .base-modal-body {
    padding: 20px;
  }

  .base-modal-footer {
    padding: 15px 20px;
  }
}
</style>

