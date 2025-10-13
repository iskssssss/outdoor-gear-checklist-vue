<template>
  <div class="app-container" @click="handleClickOutside">
    <AppHeader @show-model-config="showModelConfig" />
    <div class="router-view-wrapper">
      <router-view @show-recommendation="showRecommendation" @show-operation-log="showOperationLog" />
    </div>
    <AppFooter />

    <!-- 模态框组件 -->
    <RecommendationModal ref="recommendationModalRef" />
    <ModelConfigModal ref="modelConfigModalRef" />
    <OperationLogModal ref="operationLogModalRef" />

    <!-- Toast 通知组件 -->
    <ToastNotification ref="toastRef" />

    <!-- 自定义确认模态框 -->
    <BaseConfirm ref="confirmModalRef" />

    <!-- 浮动操作按钮组 -->
    <div class="fab-group">
      <!-- 主题切换器菜单 (现在是 fab-group 的直接子元素) -->
      <div class="theme-options-wrapper" ref="themeSwitcherMenuRef" :style="themeSwitcherStyle">
        <div class="theme-options-list">
          <button v-for="theme in themeStore.themes" :key="theme.id" class="theme-option"
            :class="{ active: theme.id === themeStore.currentTheme }" @click="switchToTheme(theme.id, $event)"
            :title="theme.description">
            <span class="theme-icon">{{ theme.icon }}</span>
            <span class="theme-name">{{ theme.name }}</span>
          </button>
        </div>
      </div>

      <!-- 主题切换器触发按钮 -->
      <button class="fab-item theme-toggle-btn" ref="themeSwitcherTriggerRef" @click.stop="toggleThemeSwitcher"
        :title="getCurrentTheme.name">
        <span class="icon">🎨</span>
      </button>

      <!-- 回到顶部按钮 -->
      <BackToTopButton class="fab-item" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, provide } from 'vue';
import { onClickOutside, useEventListener, useMagicKeys } from '@vueuse/core';
import AppHeader from './components/layout/AppHeader.vue';
import AppFooter from './components/layout/AppFooter.vue';
import RecommendationModal from './components/modals/RecommendationModal.vue';
import ModelConfigModal from './components/modals/ModelConfigModal.vue';
import OperationLogModal from './components/modals/OperationLogModal.vue';
import ToastNotification from './components/common/ToastNotification.vue';
import BaseConfirm from './components/common/BaseConfirm.vue';
import BackToTopButton from './components/common/BackToTopButton.vue';
import { useEquipmentStore } from './stores/equipment';
import { useModelConfigStore } from './stores/modelConfig';
import { useThemeStore } from './stores/themeStore';
import { toast as toastService } from './utils/toast';
// 1. 导入 eventBus
import { eventBus } from './utils/eventBus';
// 引入 Composable
import { useResponsiveMenu } from './composables/useResponsiveMenu';

// 初始化stores
const equipmentStore = useEquipmentStore()
const modelConfigStore = useModelConfigStore()
const themeStore = useThemeStore()

// Toast 引用
const toastRef = ref(null)
// 新增确认模态框引用
const confirmModalRef = ref(null)

// 提供全局 toast 方法
provide('toast', {
  success: (message, duration) => toastRef.value?.success(message, duration),
  error: (message, duration) => toastRef.value?.error(message, duration),
  warning: (message, duration) => toastRef.value?.warning(message, duration),
  info: (message, duration) => toastRef.value?.info(message, duration),
})

// 提供全局 confirm 方法
provide('showConfirm', (options) => confirmModalRef.value?.show(options))

// 模态框引用
const recommendationModalRef = ref(null)
const modelConfigModalRef = ref(null)
const operationLogModalRef = ref(null)

// --- 主题切换器 ---
const themeSwitcherExpanded = ref(false)
const themeSwitcherTriggerRef = ref(null)
const themeSwitcherMenuRef = ref(null)
const { menuStyle: themeSwitcherStyle } = useResponsiveMenu(
  themeSwitcherTriggerRef,
  themeSwitcherMenuRef,
  { isOpen: themeSwitcherExpanded, offset: 12 }
)

onClickOutside(themeSwitcherMenuRef, (event) => {
  if (!themeSwitcherTriggerRef.value?.contains(event.target)) {
    themeSwitcherExpanded.value = false;
  }
}, { ignore: [themeSwitcherTriggerRef] });


// 获取当前主题信息
const getCurrentTheme = computed(() => {
  return themeStore.themes.find(t => t.id === themeStore.currentTheme) || themeStore.themes[0]
})

// 切换主题选择器展开/收起
function toggleThemeSwitcher() {
  themeSwitcherExpanded.value = !themeSwitcherExpanded.value
}

// 切换到指定主题
function switchToTheme(themeId, event) {
  themeStore.switchTheme(themeId, event)
  themeSwitcherExpanded.value = false
}

// 点击页面其他地方时收起主题切换器
function handleClickOutside(event) {
  // 如果点击的不是主题切换器区域，则收起
  const themeSwitcher = event.target.closest('.theme-switcher-floated')
  if (!themeSwitcher && themeSwitcherExpanded.value) {
    themeSwitcherExpanded.value = false
  }
}

// 键盘快捷键处理
const keys = useMagicKeys();
const CtrlZ = keys['Ctrl+Z'];
const CmdZ = keys['Cmd+Z'];

useEventListener(window, 'keydown', (event) => {
    if ((CtrlZ.value || CmdZ.value) && !event.shiftKey) {
        event.preventDefault();
        const activeElement = document.activeElement;
        const isInputting =
            activeElement.tagName === 'INPUT' ||
            activeElement.tagName === 'TEXTAREA' ||
            activeElement.isContentEditable;
        if (!isInputting) {
            equipmentStore.quickUndo();
        }
    }
});

// 页面加载时加载数据并绑定快捷键
onMounted(() => {
  if (toastRef.value) {
    toastService.setInstance(toastRef.value);
  }
  
  console.log('🚀 户外装备清单系统已初始化 (Vue 3版本)');
  console.log('💡 提示: 按 Ctrl+Z (或 Cmd+Z) 可以撤销最近的操作');
})

// 组件卸载时移除事件监听
onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyboardShortcut)

  // 3. 移除全局滚动监听
  window.removeEventListener('scroll', handleGlobalScroll);
})

// 4. 定义全局滚动处理函数
function handleGlobalScroll(event) {
  // 通过事件总线广播滚动事件
  eventBus.emit('scroll', event);
}

// 监听页面可见性变化,实现多标签页同步
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) {
    console.log('👀 页面重新获得焦点，检查数据同步...')
    equipmentStore.syncData()
  }
})

// 显示模态框方法
function showRecommendation() {
  recommendationModalRef.value?.show()
}

function showModelConfig() {
  modelConfigModalRef.value?.show()
}

function showOperationLog() {
  operationLogModalRef.value?.show()
}
</script>

<style lang="scss">
/* 引入基础样式 */
@import './assets/main.scss';

/* 移除旧的主题切换动画 */
::view-transition-old(root),
::view-transition-new(root) {
  animation: none;
}

/* 背景由主题系统控制，在 styles/themes.scss 中定义 */
.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.router-view-wrapper {
  flex-grow: 1;
  // 确保内容区域至少占满整个屏幕
  min-height: 100vh;
  padding: 32px 0;
}

.main-section {
  padding: 20px;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 20px;
  padding-left: 10px;
  border-left: 4px solid var(--primary-color);
}

.main-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* ===== 浮动操作按钮组 (FAB Group) ===== */
.fab-group {
  position: fixed;
  bottom: 16px;
  right: 8px;
  z-index: 998;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.fab-item {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: var(--bg-card);
  border: 2px solid var(--border-color);
  box-shadow: var(--shadow-md);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.fab-item:hover {
  transform: scale(1.1);
  box-shadow: var(--shadow-lg);
}

.fab-item .icon {
  font-size: 1.8rem;
}

/* 主题切换器在 FAB Group 中的特定样式 */
.theme-toggle-btn:hover {
  transform: scale(1.1) rotate(20deg);
}

.theme-options-wrapper {
  /* 由 useResponsiveMenu 控制定位, z-index 需高于 fab-group */
  z-index: 999;
  background-color: var(--bg-card);
  border: 2px solid var(--border-color);
  border-radius: var(--border-radius-lg);
  padding: 10px;
  box-shadow: var(--shadow-xl);
  width: 180px;
}

/* 移除 .theme-switcher-floated 样式 */

.theme-options-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.theme-option {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border: 2px solid transparent;
  border-radius: var(--border-radius-sm);
  background: transparent;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: left;
  font-size: 0.95rem;
  color: var(--text-primary);

  &:hover {
    background: var(--bg-input);
    border-color: var(--primary-color);
    transform: translateX(-4px);
  }

  &.active {
    background: var(--primary-color);
    color: var(--btn-primary-text, white);
    border-color: var(--primary-color);
    font-weight: 600;
  }
}

.theme-icon {
  font-size: 1.2rem;
  flex-shrink: 0;
}

.theme-name {
  flex: 1;
  white-space: nowrap;
}

@keyframes slideInRight {
  from {
    opacity: 0;
    // 从下往上滑入
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 右下角的主题选择器样式已移除 */

/* 移动端适配 */
@media (max-width: 768px) {
  .fab-group {
    bottom: 20px;
    right: 20px;
    gap: 12px;
  }

  .fab-item {
    width: 48px;
    height: 48px;
  }
}
</style>
