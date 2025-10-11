<template>
  <div class="app-container" @click="handleClickOutside">
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
      @show-recommendation="showRecommendation"
      @show-model-config="showModelConfig"
      @show-operation-log="showOperationLog"
      @show-changelog="showChangelog"
    />
    <div class="main-content">
      <StatsPanel />
      <CategoryList />
    </div>

    <!-- 主题选择按钮已移除 -->
  </div>

  <!-- 模态框组件 -->
  <RecommendationModal ref="recommendationModalRef" />
  <ModelConfigModal ref="modelConfigModalRef" />
  <OperationLogModal ref="operationLogModalRef" />
  <ChangelogModal ref="changelogModalRef" />
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import AppHeader from './components/AppHeader.vue'
import CategoryList from './components/CategoryList.vue'
import StatsPanel from './components/StatsPanel.vue'
import RecommendationModal from './components/RecommendationModal.vue'
import ModelConfigModal from './components/ModelConfigModal.vue'
import OperationLogModal from './components/OperationLogModal.vue'
import ChangelogModal from './components/ChangelogModal.vue'
import { useEquipmentStore } from './stores/equipment'
import { useModelConfigStore } from './stores/modelConfig'
import { useThemeStore } from './stores/themeStore'

// 初始化stores
const equipmentStore = useEquipmentStore()
const modelConfigStore = useModelConfigStore()
const themeStore = useThemeStore()

// 模态框引用
const recommendationModalRef = ref(null)
const modelConfigModalRef = ref(null)
const operationLogModalRef = ref(null)
const changelogModalRef = ref(null)

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

// 页面加载时加载数据
onMounted(() => {
  equipmentStore.loadData()
  modelConfigStore.loadSettings()
  themeStore.loadTheme() // 加载主题设置
  console.log('🚀 户外装备清单系统已初始化 (Vue 3版本)')
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

