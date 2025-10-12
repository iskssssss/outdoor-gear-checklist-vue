<template>
  <!-- 使用指南页面 -->
  <DocPage v-if="showDocPage" @close="closeDocPage" />
  
  <!-- 主页面 -->
  <div v-else class="app-container" @click="handleClickOutside">
    <!-- 固定在右上角的主题切换器 -->
    <div class="theme-switcher-fixed" :class="{ expanded: themeSwitcherExpanded }">
      <button 
        class="theme-toggle-btn" 
        @click="toggleThemeSwitcher"
        :title="getCurrentTheme.name"
      >
        {{ getCurrentTheme.icon }}
      </button>
      <div v-show="themeSwitcherExpanded" class="theme-options">
        <button
          v-for="theme in themeStore.themes"
          :key="theme.id"
          class="theme-option"
          :class="{ active: theme.id === themeStore.currentTheme }"
          @click="switchToTheme(theme.id)"
          :title="theme.description"
        >
          <span class="theme-icon">{{ theme.icon }}</span>
          <span class="theme-name">{{ theme.name }}</span>
        </button>
      </div>
    </div>

    <AppHeader 
      @show-model-config="showModelConfig"
      @show-changelog="showChangelog"
      @show-doc="openDocPage"
    />
    <div class="main-content">
      <StatsPanel />
      <CategoryList 
        @show-recommendation="showRecommendation" 
        @show-operation-log="showOperationLog"
      />
    </div>

    <AppFooter 
      @show-changelog="showChangelog"
      @show-doc="openDocPage"
    />

    <!-- 主题选择按钮已移除 -->
  </div>

  <!-- 模态框组件 -->
  <RecommendationModal ref="recommendationModalRef" />
  <ModelConfigModal ref="modelConfigModalRef" />
  <OperationLogModal ref="operationLogModalRef" />
  <ChangelogModal ref="changelogModalRef" />
  
  <!-- Toast 通知组件 -->
  <ToastNotification ref="toastRef" />

  <!-- 自定义确认模态框 -->
  <BaseConfirm ref="confirmModalRef" />
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, provide } from 'vue'
import AppHeader from './components/layout/AppHeader.vue'
import CategoryList from './components/views/CategoryList.vue'
import StatsPanel from './components/views/StatsPanel.vue'
import AppFooter from './components/layout/AppFooter.vue'
import RecommendationModal from './components/modals/RecommendationModal.vue'
import ModelConfigModal from './components/modals/ModelConfigModal.vue'
import OperationLogModal from './components/modals/OperationLogModal.vue'
import ChangelogModal from './components/modals/ChangelogModal.vue'
import DocPage from './components/views/DocPage.vue'
import ToastNotification from './components/common/ToastNotification.vue'
import BaseConfirm from './components/common/BaseConfirm.vue' // 引入自定义确认框
import { useEquipmentStore } from './stores/equipment'
import { useModelConfigStore } from './stores/modelConfig'
import { useThemeStore } from './stores/themeStore'
import { toast as toastService } from './utils/toast'

// 初始化stores
const equipmentStore = useEquipmentStore()
const modelConfigStore = useModelConfigStore()
const themeStore = useThemeStore()

// Toast 引用
const toastRef = ref(null)
const confirmModalRef = ref(null) // 新增确认模态框引用

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

// 使用指南页面状态
const showDocPage = ref(false)

// 主题切换器状态
const themeSwitcherExpanded = ref(false)

// 获取当前主题信息
const getCurrentTheme = computed(() => {
  return themeStore.themes.find(t => t.id === themeStore.currentTheme) || themeStore.themes[0]
})

// 切换主题选择器展开/收起
function toggleThemeSwitcher(event) {
  event.stopPropagation() // 阻止事件冒泡
  themeSwitcherExpanded.value = !themeSwitcherExpanded.value
}

// 切换到指定主题
function switchToTheme(themeId) {
  themeStore.switchTheme(themeId)
  themeSwitcherExpanded.value = false
}

// 点击页面其他地方时收起主题切换器
function handleClickOutside(event) {
  // 如果点击的不是主题切换器区域，则收起
  const themeSwitcher = event.target.closest('.theme-switcher-fixed')
  if (!themeSwitcher && themeSwitcherExpanded.value) {
    themeSwitcherExpanded.value = false
  }
}

// 键盘快捷键处理
function handleKeyboardShortcut(event) {
  // Ctrl+Z 或 Cmd+Z (Mac) - 撤销操作
  if ((event.ctrlKey || event.metaKey) && event.key === 'z' && !event.shiftKey) {
    // 防止默认行为（浏览器的撤销）
    event.preventDefault()
    
    // 检查是否在输入框中
    const activeElement = document.activeElement
    const isInputting = activeElement.tagName === 'INPUT' || 
                       activeElement.tagName === 'TEXTAREA' || 
                       activeElement.isContentEditable
    
    // 如果不在输入状态，执行撤销操作
    if (!isInputting) {
      equipmentStore.quickUndo()
    }
  }
}

// 页面加载时加载数据并绑定快捷键
onMounted(() => {
  equipmentStore.loadData()
  modelConfigStore.loadSettings()
  themeStore.loadTheme() // 加载主题设置
  
  // 设置全局 toast 实例
  if (toastRef.value) {
    toastService.setInstance(toastRef.value)
  }
  
  // 添加键盘快捷键监听
  window.addEventListener('keydown', handleKeyboardShortcut)
  
  console.log('🚀 户外装备清单系统已初始化 (Vue 3版本)')
  console.log('💡 提示: 按 Ctrl+Z (或 Cmd+Z) 可以撤销最近的操作')
})

// 组件卸载时移除事件监听
onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyboardShortcut)
})

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

function showChangelog() {
  changelogModalRef.value?.show()
}

function openDocPage() {
  showDocPage.value = true
}

function closeDocPage() {
  showDocPage.value = false
}
</script>

<style lang="scss">
@use './assets/main' as *;

/* 背景由主题系统控制，在 styles/themes.scss 中定义 */
.app-container {
  min-height: 100vh;
  position: relative;
}

.main-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* ===== 固定主题切换器 ===== */
.theme-switcher-fixed {
  position: fixed;
  top: 12px;
  right: 18px;
  z-index: 999;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
}

.theme-toggle-btn {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--bg-card);
  border: 2px solid var(--border-color);
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.12);
  font-size: 1.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  
  &:hover {
    transform: scale(1.08) rotate(15deg);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  }
  
  &:active {
    transform: scale(0.95);
  }
}

.theme-options {
  display: flex;
  flex-direction: column;
  gap: 6px;
  background: var(--bg-card);
  border: 2px solid var(--border-color);
  border-radius: 10px;
  padding: 8px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12);
  animation: slideInRight 0.3s ease;
  min-width: 140px;
}

.theme-option {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border: 2px solid transparent;
  border-radius: 6px;
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
    color: var(--text-white, white);
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
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* 右下角的主题选择器样式已移除 */

/* 移动端适配 */
@media (max-width: 768px) {
  .theme-switcher-fixed {
    top: 10px;
    right: 10px;
  }
  
  .theme-toggle-btn {
    width: 48px;
    height: 48px;
    font-size: 1.5rem;
  }
  
  .theme-options {
    min-width: 140px;
    padding: 8px;
  }
  
  .theme-option {
    padding: 8px 12px;
    font-size: 0.9rem;
  }
  
  .theme-icon {
    font-size: 1.1rem;
  }

  .theme-selector {
    bottom: 10px;
    right: 10px;
    padding: 8px 12px;
    gap: 8px;
  }

  .theme-selector label {
    font-size: 0.9rem;
  }

  .theme-selector select {
    font-size: 0.8rem;
    padding: 6px 10px;
    padding-right: 25px;
    background-position: right 6px center;
    background-size: 10px;
  }
}
</style>

