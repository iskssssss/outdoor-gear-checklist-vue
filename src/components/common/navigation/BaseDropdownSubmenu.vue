<template>
  <div 
    class="base-dropdown-submenu" 
    :class="{ 
      'is-disabled': disabled, 
      'is-active': active,
      'is-open': isSubMenuOpen,
      'is-divided': divided
    }"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
  >
    <!-- 父级菜单项 -->
    <div class="submenu-trigger" @click="handleClick">
      <span v-if="icon" class="item-icon">{{ icon }}</span>
      <span class="item-text">
        <slot name="title">{{ title }}</slot>
      </span>
      <span class="submenu-arrow">▶</span>
    </div>

    <!-- 子菜单 -->
    <transition name="submenu-slide">
      <div v-show="isSubMenuOpen" class="submenu-content" ref="submenuRef">
        <slot></slot>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onBeforeUnmount } from 'vue'

interface Props {
  // 标题
  title?: string
  // 图标
  icon?: string
  // 是否禁用
  disabled?: boolean
  // 是否激活状态（高亮显示）
  active?: boolean
  // 是否显示分隔线
  divided?: boolean
  // 展开触发方式
  expandTrigger?: 'click' | 'hover'
  // 展开延迟（ms）
  expandDelay?: number
  // 收起延迟（ms）
  collapseDelay?: number
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  active: false,
  divided: false,
  expandTrigger: 'hover',  // 默认悬停展开
  expandDelay: 150,        // 展开延迟 150ms
  collapseDelay: 200       // 收起延迟 200ms
})

const isSubMenuOpen = ref(false)
const submenuRef = ref<HTMLElement | null>(null)
let hoverTimer: ReturnType<typeof setTimeout> | null = null

/**
 * 清理定时器
 */
function clearTimer() {
  if (hoverTimer) {
    clearTimeout(hoverTimer)
    hoverTimer = null
  }
}

/**
 * 处理点击事件
 */
function handleClick() {
  if (props.disabled) return
  
  // 点击模式：切换展开/收起
  if (props.expandTrigger === 'click') {
    isSubMenuOpen.value = !isSubMenuOpen.value
  }
}

/**
 * 鼠标进入
 */
function handleMouseEnter() {
  if (props.disabled) return
  
  if (props.expandTrigger === 'hover') {
    clearTimer()
    hoverTimer = setTimeout(() => {
      isSubMenuOpen.value = true
    }, props.expandDelay)
  }
}

/**
 * 鼠标离开
 */
function handleMouseLeave() {
  if (props.expandTrigger === 'hover') {
    clearTimer()
    hoverTimer = setTimeout(() => {
      isSubMenuOpen.value = false
    }, props.collapseDelay)
  }
}

/**
 * 打开子菜单
 */
function open() {
  if (!props.disabled) {
    isSubMenuOpen.value = true
  }
}

/**
 * 关闭子菜单
 */
function close() {
  isSubMenuOpen.value = false
}

/**
 * 切换子菜单
 */
function toggle() {
  if (props.disabled) return
  isSubMenuOpen.value = !isSubMenuOpen.value
}

// 组件卸载前清理定时器
onBeforeUnmount(() => {
  clearTimer()
})

// 暴露方法
defineExpose({
  open,
  close,
  toggle
})
</script>

<style scoped lang="scss">
.base-dropdown-submenu {
  position: relative;
  width: 100%;

  &.is-disabled {
    opacity: 0.5;
    cursor: not-allowed;
    pointer-events: none;
  }

  // 分隔线（参考 BaseDropdownItem）
  &.is-divided {
    &::before {
      content: '';
      display: block;
      height: 1px;
      background: var(--border-color);
      margin: 4px 12px;
    }
  }
}

.submenu-trigger {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  color: var(--text-primary);
  position: relative;
  white-space: nowrap;
  user-select: none;

  // 悬停效果
  &:hover:not(.is-disabled) {
    background: var(--bg-hover);
    color: var(--primary-color);

    .submenu-arrow {
      color: var(--primary-color);
    }
  }

  // 激活状态
  .is-active & {
    background: var(--primary-light);
    color: var(--primary-color);
    font-weight: 600;
  }

  // 展开状态
  .is-open & {
    background: var(--bg-hover);
    color: var(--primary-color);
  }

  // 禁用状态
  .is-disabled & {
    color: var(--text-secondary);
    cursor: not-allowed;
    opacity: 0.5;
  }
}

.item-icon {
  flex-shrink: 0;
  font-size: 1rem;
  line-height: 1;
  width: 1.2em;
  text-align: center;
}

.item-text {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 0.9rem;
}

.submenu-arrow {
  flex-shrink: 0;
  font-size: 0.7rem;
  color: var(--text-secondary);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  margin-left: auto;
  transform-origin: center;

  // 展开时旋转
  .is-open & {
    transform: rotate(90deg);
    color: var(--primary-color);
  }
}

// 子菜单容器
.submenu-content {
  position: absolute;
  left: 100%;
  top: 0;
  min-width: 150px;
  max-height: 300px; // 限制最大高度
  overflow-y: auto;  // 超出滚动
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-lg);
  z-index: 1001; // 确保在父菜单之上
  margin-left: 4px; // 与父菜单保持小间距

  // 自定义滚动条
  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: var(--bg-main);
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: var(--border-color);
    border-radius: 3px;

    &:hover {
      background: var(--text-secondary);
    }
  }
}

// 子菜单滑入滑出动画
.submenu-slide-enter-active {
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.submenu-slide-leave-active {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.submenu-slide-enter-from {
  opacity: 0;
  transform: translateX(-10px) scale(0.95);
}

.submenu-slide-leave-to {
  opacity: 0;
  transform: translateX(-10px) scale(0.95);
}

// 确保子菜单项样式与父菜单一致
.submenu-content :deep(.dropdown-item) {
  white-space: nowrap;
}
</style>

