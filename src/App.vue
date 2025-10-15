<template>
  <div class="app-container">
    <AppHeader @show-model-config="showModelConfig" />
    <div class="router-view-wrapper">
      <router-view @show-recommendation="showRecommendation" @show-operation-log="showOperationLog" />
    </div>
    <AppFooter />

    <!-- 模态框组件 -->
    <RecommendationModal ref="recommendationModalRef" />
    <ModelConfigModal ref="modelConfigModalRef" />
    <OperationLogModal ref="operationLogModalRef" />
    <ChangelogPage :as-modal="true" ref="changelogModalRef" />
    <ThemeSelectorModal ref="themeSelectorModalRef" />

    <!-- Toast 通知组件 -->
    <ToastNotification ref="toastRef" />

    <!-- 自定义确认模态框 -->
    <BaseConfirm ref="confirmModalRef" />

    <!-- 浮动操作按钮组（数据驱动） -->
    <div class="fab-group">
      <template v-for="fab in fabButtons" :key="fab.value">
        <!-- 主题切换按钮 -->
        <BaseButton
          v-if="fab.type === 'theme'"
          :class="fab.class"
          :icon="fab.icon"
          :title="fab.title"
          @click="fab.handler"
        />
        <!-- 回到顶部按钮（保留独立组件） -->
        <BackToTopButton v-else-if="fab.type === 'back-to-top'" :class="fab.class" />
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, provide } from 'vue';
import { useEventListener, useMagicKeys } from '@vueuse/core';
import AppHeader from './components/layout/AppHeader.vue';
import AppFooter from './components/layout/AppFooter.vue';
import RecommendationModal from './components/modals/RecommendationModal.vue';
import ModelConfigModal from './components/modals/ModelConfigModal.vue';
import OperationLogModal from './components/modals/OperationLogModal.vue';
import ChangelogPage from './components/views/ChangelogPage.vue';
import ThemeSelectorModal from './components/modals/ThemeSelectorModal.vue';
import { ToastNotification, BaseConfirm, BaseButton } from '@/components/common'
import { BackToTopButton } from '@/components/common'
import { useEquipmentStore } from './stores/equipment';
import { useModelConfigStore } from './stores/modelConfig';
import { useThemeStore } from './stores/themeStore';
import { toast as toastService } from './utils/toast';
// 1. 导入 eventBus
import { eventBus } from './utils/eventBus.ts';
// 引入 Composable
import { useVersionChecker } from './composables/useVersionChecker';

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
const changelogModalRef = ref(null)
const themeSelectorModalRef = ref(null)

// 版本检测
const { checkVersion, currentVersion, previousVersion, confirmUpdate, remindLater } = useVersionChecker()


// 获取当前主题信息
const getCurrentTheme = computed(() => {
  return themeStore.themes.find(t => t.id === themeStore.currentTheme) || themeStore.themes[0]
})

// ==================== 数据驱动的浮动按钮配置 ====================

// 浮动操作按钮配置
const fabButtons = computed(() => [
  {
    type: 'theme',
    value: 'theme-toggle',
    icon: '🎨',
    class: 'fab-item theme-toggle-btn',
    title: `当前主题: ${getCurrentTheme.value.name}`,
    handler: showThemeSelector
  },
  {
    type: 'back-to-top',
    value: 'back-to-top',
    class: 'fab-item'
  }
])

// ==================== 数据驱动配置结束 ====================

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

  // 检查版本更新
  setTimeout(() => {
    const hasUpdate = checkVersion()
    if (hasUpdate) {
      showVersionUpdateDialog()
    }
  }, 1500) // 延迟1.5秒显示，避免干扰初始化
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
    // equipmentStore.syncData() // 暂时注释掉，因为该方法不存在
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

function showChangelog() {
  changelogModalRef.value?.show()
}

function showThemeSelector() {
  themeSelectorModalRef.value?.show()
}

// 显示版本更新对话框
function showVersionUpdateDialog() {
  confirmModalRef.value?.show({
    title: '🎉 版本更新',
    message: `应用已更新至 v${currentVersion.value}！\n${previousVersion.value ? `（从 v${previousVersion.value} 升级）` : ''}`,
    confirmText: '查看更新日志',
    cancelText: '稍后查看',
    onConfirm: () => {
      confirmUpdate()
      showChangelog()
    },
    onCancel: () => {
      remindLater()
    }
  })
}
</script>

<style lang="scss">
/* 基础样式已在 main.ts 中导入，这里只需要组件特定的样式 */

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
  padding: var(--spacing-xl) 0;
}

.main-section {
  padding: var(--spacing-lg);
}

.section-title {
  font-size: 1.5rem;
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
  margin-bottom: var(--spacing-lg);
  padding-left: var(--spacing-sm);
  border-left: 4px solid var(--primary-color);
}

.main-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: var(--spacing-md);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

/* ===== 浮动操作按钮组 (FAB Group) ===== */
.fab-group {
  position: fixed;
  bottom: var(--spacing-md);
  right: var(--spacing-sm);
  z-index: 998;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

:deep(.fab-item) {
  width: 50px;
  height: 50px;
  border-radius: var(--radius-full);
  background-color: var(--bg-card);
  border: var(--border-width) solid var(--border-color);
  box-shadow: var(--shadow-md);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;

  &:hover {
    transform: scale(1.1);
    box-shadow: var(--shadow-lg);
  }

  .icon {
    font-size: 1.8rem;
  }
}

/* 主题切换器在 FAB Group 中的特定样式 */
:deep(.theme-toggle-btn) {
  &:hover {
    transform: scale(1.1) rotate(20deg);
  }
}

/* 移动端适配 */
@media (max-width: 768px) {
  .fab-group {
    bottom: var(--spacing-lg);
    right: var(--spacing-lg);
    gap: var(--spacing-md);
  }

  :deep(.fab-item) {
    width: 48px;
    height: 48px;
  }
}
</style>
