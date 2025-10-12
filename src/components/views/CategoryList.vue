<template>
  <div class="categories-section">
    <!-- 全局操作按钮 -->
    <div class="global-actions" v-if="equipmentStore.categories.length > 0 || isAdding || equipmentStore.hasLoaded">
      <!-- 左侧操作组 -->
      <div class="actions-left">
        <!-- 智能推荐按钮 -->
        <button class="btn btn-recommendation" @click="debouncedShowRecommendation" title="AI 智能推荐装备">
          <span class="btn-icon">💡</span>
          <span class="btn-text">智能推荐</span>
        </button>

        <!-- 导入下拉菜单 -->
        <div class="action-dropdown" :ref="el => menuRefs.import.trigger.value = el">
          <button class="btn btn-primary btn-sm" @click.stop="toggleMenu('import')">
            📥 导入
          </button>
          <div class="action-menu" :ref="el => menuRefs.import.menu.value = el" :style="importMenuStyle">
            <a class="menu-item" @click.prevent="debouncedImportData">📄 导入 JSON</a>
            <a class="menu-item" @click.prevent="debouncedImportFromCart">🛒 导入购物车</a>
          </div>
        </div>

        <!-- 导出下拉菜单 -->
        <div class="action-dropdown" :ref="el => menuRefs.export.trigger.value = el">
          <button class="btn btn-primary btn-sm" @click.stop="toggleMenu('export')">
            📤 导出
          </button>
          <div class="action-menu" :ref="el => menuRefs.export.menu.value = el" :style="exportMenuStyle">
            <a class="menu-item" @click.prevent="debouncedExportData">📄 导出 JSON</a>
            <a class="menu-item" @click.prevent="debouncedExportToImage">🖼️ 导出图片</a>
          </div>
        </div>

        <!-- 分类管理下拉菜单 -->
        <div class="action-dropdown" :ref="el => menuRefs.manage.trigger.value = el">
          <button class="btn btn-secondary btn-sm" @click.stop="toggleMenu('manage')">
            📂 分类管理
          </button>
          <div class="action-menu" :ref="el => menuRefs.manage.menu.value = el" :style="manageMenuStyle">
            <a class="menu-item" @click.prevent="debouncedInitializeCategories">✨ 初始化分类</a>
            <a class="menu-item danger" @click.prevent="debouncedClearAllData">🗑️ 清空所有数据</a>
          </div>
        </div>
      </div>

      <!-- 右侧操作组 -->
      <div class="actions-right">
        <!-- 快捷撤销按钮 -->
        <button class="btn btn-undo" @click="debouncedQuickUndo" :disabled="!canUndo"
          :title="`撤销最近的操作 (Ctrl+Z)${undoableCount > 0 ? ` - 共${undoableCount}条可撤销` : ''}`">
          <span class="undo-icon">⟲</span>
          <span class="undo-text">撤销</span>
          <span v-if="undoableCount > 0" class="undo-count">{{ undoableCount }}</span>
        </button>

        <button class="btn btn-secondary btn-sm" @click="toggleAllCategories"
          :title="allCollapsed ? '展开全部分类' : '收起全部分类'">
          {{ allCollapsed ? '📂 展开全部' : '📁 收起全部' }}
        </button>

        <!-- 更多操作下拉菜单 -->
        <div class="more-actions-dropdown" :ref="el => menuRefs.more.trigger.value = el">
          <button class="btn btn-secondary btn-sm" @click.stop="toggleMenu('more')">
            ⋯ 更多
          </button>
          <div class="more-actions-menu" :ref="el => menuRefs.more.menu.value = el" :style="moreMenuStyle">
            <a class="menu-item" @click.prevent="debouncedToggleLayout">
              {{ layoutMode === 'grid' ? '💧 切换到瀑布流' : '🔲 切换到网格' }}
            </a>
            <a class="menu-item" @click.prevent="debouncedShowCategorySort">🔀 排序分类</a>
            <a class="menu-item" @click.prevent="debouncedToggleGroupByStatus">
              {{ equipmentStore.groupByStatus ? '📊 取消状态分栏' : '📋 启用状态分栏' }}
            </a>
            <a class="menu-item" @click.prevent="debouncedShowOperationLog">📋 操作日志</a>
          </div>
        </div>
      </div>
    </div>

    <!-- 排序模态框 -->
    <CategorySortModal ref="categorySortModalRef" />

    <!-- 图片预览模态框 -->
    <BaseModal ref="previewModalRef" title="🖼️ 图片预览" width="1600px" max-height="90vh" :show-footer="true"
      @close="closePreview">
      <div class="preview-body">
        <img v-if="previewImageUrl" :src="previewImageUrl" alt="预览图片" class="preview-image">
      </div>

      <template #footer>
        <button class="btn btn-primary" @click="confirmDownload">📥 下载图片</button>
        <button class="btn btn-secondary" @click="closePreview">✕ 取消</button>
      </template>
    </BaseModal>

    <!-- 隐藏的导出容器 -->
    <div class="hidden-export-container">
      <ExportPreview v-if="isGeneratingImage" ref="exportPreviewRef" :categories="equipmentStore.categories"
        :export-width="imageExportConfig.exportWidth" />
    </div>

    <!-- 导入购物车模态框 -->
    <ImportCartModal ref="importCartModalRef" />

    <!-- 装备分类列表 -->
    <div v-if="equipmentStore.categories.length === 0 && !isAdding" class="empty-state">
      <h3>还没有装备分类</h3>
      <p>点击下方 "+" 按钮开始创建您的装备清单</p>
    </div>

    <!-- 瀑布流布局组件 -->
    <WaterfallLayout v-show="layoutMode === 'waterfall'" :categories="equipmentStore.categories" :column-gap="16"
      :add-card-visible="true" :is-adding="isAdding" :layout-mode="layoutMode" @add-card-click="showAddInput">
      <template v-slot:add-card-content>
        <div class="add-icon">+</div>
        <div class="add-text">添加分类</div>
      </template>
      <template v-slot:add-input-card-content>
        <input ref="categoryInput" type="text" v-model="newCategoryName" @keypress.enter="addCategory" @blur="cancelAdd"
          placeholder="输入分类名称" class="category-input">
        <div class="input-actions">
          <button class="btn btn-primary btn-sm" @click="addCategory">✓ 确认</button>
          <button class="btn btn-secondary btn-sm" @click="cancelAdd">✕ 取消</button>
        </div>
      </template>
    </WaterfallLayout>

    <!-- 网格布局 -->
    <div v-show="layoutMode === 'grid'" class="categories-container">
      <CategoryItem v-for="category in equipmentStore.categories" :key="category.id" :category="category"
        :layout-mode="layoutMode" />

      <!-- 添加分类按钮/输入框 (网格模式下) -->
      <div class="add-category-card" v-if="!isAdding" @click="showAddInput">
        <div class="add-icon">+</div>
        <div class="add-text">添加分类</div>
      </div>

      <div class="add-category-input-card" v-else>
        <input ref="categoryInput" type="text" v-model="newCategoryName" @keypress.enter="addCategory" @blur="cancelAdd"
          placeholder="输入分类名称" class="category-input">
        <div class="input-actions">
          <button class="btn btn-primary btn-sm" @click="addCategory">✓ 确认</button>
          <button class="btn btn-secondary btn-sm" @click="cancelAdd">✕ 取消</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, watch, onMounted, onUnmounted, inject } from 'vue'
import { useEquipmentStore } from '../../stores/equipment'
import { useOperationLogStore } from '../../stores/operationLog'
// 引入
import { useResponsiveMenu } from '../../composables/useResponsiveMenu'
import CategoryItem from './CategoryItem.vue'
import WaterfallLayout from '../layout/WaterfallLayout.vue'
import CategorySortModal from '../modals/CategorySortModal.vue'
import BaseModal from '../common/BaseModal.vue'
import ExportPreview from './ExportPreview.vue'
import ImportCartModal from '../modals/ImportCartModal.vue'
// 引入自定义确认框
import BaseConfirm from '../common/BaseConfirm.vue'
import html2canvas from 'html2canvas'
import { imageExportConfig } from '../../config/appConfig'
import { debounce } from '../../utils/debounce'

// 定义事件
const emit = defineEmits(['show-recommendation', 'show-operation-log'])

const equipmentStore = useEquipmentStore()
const logStore = useOperationLogStore()

// 注入 toast 通知
const toast = inject('toast')
// 注入全局确认框方法
const showConfirm = inject('showConfirm')
const newCategoryName = ref('')
const isAdding = ref(false)
const categoryInput = ref(null)
// 'grid' 或 'waterfall'
const layoutMode = ref('grid')
const categorySortModalRef = ref(null)

// 图片预览相关状态
const previewModalRef = ref(null)
const previewImageUrl = ref('')
const previewBlob = ref(null)
const isGeneratingImage = ref(false)
const exportPreviewRef = ref(null)

// 导入购物车模态框引用
const importCartModalRef = ref(null)
// 新增确认模态框引用
const confirmModalRef = ref(null)

// --- 响应式下拉菜单 ---
// 当前激活的菜单
const activeMenu = ref(null)
const menuRefs = {
  import: { trigger: ref(null), menu: ref(null), isOpen: ref(false) },
  export: { trigger: ref(null), menu: ref(null), isOpen: ref(false) },
  manage: { trigger: ref(null), menu: ref(null), isOpen: ref(false) },
  more: { trigger: ref(null), menu: ref(null), isOpen: ref(false) },
}

const { menuStyle: importMenuStyle } = useResponsiveMenu(menuRefs.import.trigger, menuRefs.import.menu, { isOpen: menuRefs.import.isOpen })
const { menuStyle: exportMenuStyle } = useResponsiveMenu(menuRefs.export.trigger, menuRefs.export.menu, { isOpen: menuRefs.export.isOpen })
const { menuStyle: manageMenuStyle } = useResponsiveMenu(menuRefs.manage.trigger, menuRefs.manage.menu, { isOpen: menuRefs.manage.isOpen })
const { menuStyle: moreMenuStyle } = useResponsiveMenu(menuRefs.more.trigger, menuRefs.more.menu, { isOpen: menuRefs.more.isOpen })

function toggleMenu(menuName) {
  if (activeMenu.value && activeMenu.value !== menuName) {
    menuRefs[activeMenu.value].isOpen.value = false
  }

  if (menuRefs[menuName]) {
    menuRefs[menuName].isOpen.value = !menuRefs[menuName].isOpen.value
    activeMenu.value = menuRefs[menuName].isOpen.value ? menuName : null
  }
}

function handleClickOutside(event) {
  if (activeMenu.value) {
    const trigger = menuRefs[activeMenu.value].trigger.value
    const menu = menuRefs[activeMenu.value].menu.value
    if (trigger && !trigger.contains(event.target) && menu && !menu.contains(event.target)) {
      menuRefs[activeMenu.value].isOpen.value = false
      activeMenu.value = null
    }
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})


// 撤销相关
const undoableCount = computed(() => logStore.undoableCount)
const canUndo = computed(() => undoableCount.value > 0)

/**
 * 计算是否所有分类都已收起
 */
const allCollapsed = computed(() => {
  if (equipmentStore.categories.length === 0) return false
  return equipmentStore.categories.every(cat => cat.collapsed)
})

/**
 * 显示添加输入框
 */
function showAddInput() {
  isAdding.value = true
  nextTick(() => {
    categoryInput.value?.focus()
  })
}

/**
 * 添加分类
 */
function addCategory() {
  if (equipmentStore.addCategory(newCategoryName.value)) {
    toast?.success(`分类"${newCategoryName.value}"添加成功！`)
    newCategoryName.value = ''
    isAdding.value = false
  }
}

/**
 * 取消添加
 */
function cancelAdd() {
  // 延迟取消，避免与点击确认按钮冲突
  setTimeout(() => {
    newCategoryName.value = ''
    isAdding.value = false
  }, 200)
}

/**
 * 切换布局模式
 */
function toggleLayout() {
  layoutMode.value = layoutMode.value === 'grid' ? 'waterfall' : 'grid'

  // 切换到瀑布流模式时，延迟触发布局计算
  if (layoutMode.value === 'waterfall') {
    nextTick(() => {
      setTimeout(() => {
        // 触发resize事件，强制WaterfallLayout重新计算
        window.dispatchEvent(new Event('resize'))
      }, 150)
    })
  }
}

/**
 * 切换所有分类的展开/收起状态
 */
function toggleAllCategories() {
  const shouldCollapse = !allCollapsed.value
  equipmentStore.categories.forEach(category => {
    if (category.collapsed !== shouldCollapse) {
      equipmentStore.toggleCategoryCollapse(category.id)
    }
  })
}

/**
 * 显示分类排序模态框
 */
function showSortModal() {
  categorySortModalRef.value?.show()
}

/**
 * 快速撤销最近的操作
 */
async function quickUndo() {
  const latestLog = equipmentStore.getLatestUndoableLog()
  if (!latestLog) {
    toast.info('没有可以撤销的操作')
    return
  }

  const confirmed = await showConfirm({
    title: '快速撤销',
    message: `确定要撤销以下操作吗？\n\n${latestLog.action}`,
    confirmButtonText: '确定撤销'
  })

  if (confirmed) {
    equipmentStore.quickUndo()
  }
}

/**
 * 切换装备分栏显示模式
 */
function toggleGroupByStatus() {
  equipmentStore.toggleGroupByStatus()
}

/**
 * 显示智能推荐模态框
 */
function showRecommendation() {
  emit('show-recommendation')
}

/**
 * 显示操作日志模态框
 */
function showOperationLog() {
  emit('show-operation-log')
}

/**
 * 显示导入购物车模态框
 */
function showImportCart() {
  importCartModalRef.value?.show()
}

/**
 * 导入数据
 */
async function importData() {
  const confirmed = await showConfirm({
    title: '导入数据',
    message: '导入数据将覆盖当前清单，确定要继续吗？',
    confirmButtonText: '继续'
  })

  if (!confirmed) {
    return
  }

  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'application/json'

  input.onchange = function (e) {
    const file = e.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = function (event) {
      try {
        const importedData = JSON.parse(event.target.result)

        if (!Array.isArray(importedData)) {
          toast?.error('导入失败：数据格式不正确')
          return
        }

        equipmentStore.importData(importedData)
        toast?.success(`成功导入 ${importedData.length} 个分类！`)
      } catch (error) {
        toast?.error('导入失败：文件格式错误')
        console.error('导入失败:', error)
      }
    }

    reader.readAsText(file)
  }

  input.click()
}

/**
 * 导出数据
 */
function exportData() {
  const dataStr = JSON.stringify(equipmentStore.categories, null, 2)
  const dataBlob = new Blob([dataStr], { type: 'application/json' })
  const url = URL.createObjectURL(dataBlob)

  const link = document.createElement('a')
  link.href = url
  link.download = `outdoor-gear-checklist-${new Date().toISOString().split('T')[0]}.json`
  link.click()

  URL.revokeObjectURL(url)
  toast?.success('数据导出成功！')
}

/**
 * 导出为图片
 */
async function exportToImage() {
  try {
    // 显示导出预览组件
    isGeneratingImage.value = true

    // 等待组件渲染完成
    await nextTick()

    // 额外等待一下，确保所有样式都已应用
    await new Promise(resolve => setTimeout(resolve, imageExportConfig.renderDelay))

    // 确保组件已经挂载
    if (!exportPreviewRef.value || !exportPreviewRef.value.exportContent) {
      throw new Error('导出组件未正确加载')
    }

    const element = exportPreviewRef.value.exportContent

    // 检查元素是否有内容
    if (!element || element.children.length === 0) {
      throw new Error('导出内容为空')
    }

    // 使用 html2canvas 生成高质量图片
    const canvas = await html2canvas(element, {
      backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--bg-card').trim(),
      scale: imageExportConfig.scale,
      logging: false,
      useCORS: true,
      allowTaint: true,
      windowWidth: imageExportConfig.exportWidth,
      windowHeight: element.scrollHeight,
      dpi: imageExportConfig.dpi,
      imageTimeout: imageExportConfig.imageTimeout,
      letterRendering: true,
      removeContainer: true,
      imageRendering: 'high-quality'
    })

    // 生成预览图片（高质量）
    canvas.toBlob(blob => {
      if (!blob) {
        throw new Error('图片生成失败')
      }
      previewBlob.value = blob
      previewImageUrl.value = URL.createObjectURL(blob)
      previewModalRef.value?.show()
      // 隐藏导出组件
      isGeneratingImage.value = false
    }, imageExportConfig.format, imageExportConfig.quality)
  } catch (error) {
    console.error('导出图片失败:', error)
    toast?.error(`导出图片失败: ${error.message}`)
    isGeneratingImage.value = false
  }
}

/**
 * 关闭预览
 */
function closePreview() {
  previewModalRef.value?.close()
  if (previewImageUrl.value) {
    URL.revokeObjectURL(previewImageUrl.value)
    previewImageUrl.value = ''
    previewBlob.value = null
  }
}

/**
 * 确认下载
 */
function confirmDownload() {
  if (previewBlob.value) {
    const url = URL.createObjectURL(previewBlob.value)
    const link = document.createElement('a')
    link.href = url
    link.download = `outdoor-gear-checklist-${new Date().toISOString().split('T')[0]}.png`
    link.click()
    URL.revokeObjectURL(url)
    toast?.success('图片下载成功！')
  }
  closePreview()
}

/**
 * 初始化分类
 */
async function initializeCategories() {
  const confirmed = await showConfirm({
    title: '确认初始化',
    message: '这将清空所有现有分类并导入默认分类，确定要继续吗？',
    confirmButtonText: '继续'
  })

  if (confirmed) {
    equipmentStore.initializeCategories()
    toast?.success('分类初始化成功！')
  }
}

/**
 * 清空所有数据
 */
async function clearAllData() {
  const confirmed = await showConfirm({
    title: '清空所有数据',
    message: '此操作将删除所有装备分类和物品。您确定要继续吗？',
    confirmButtonText: '确定清空',
    showDangerWarning: false
  });

  if (confirmed) {
    equipmentStore.clearAllData()
    toast?.success('所有数据已清空')
  }
}

const debouncedAddCategory = debounce(addCategory, 300)
const debouncedImportData = debounce(importData, 300)
const debouncedImportFromCart = debounce(() => importCartModalRef.value.show(), 300)
const debouncedExportData = debounce(exportData, 300)
const debouncedExportToImage = debounce(exportToImage, 300)
const debouncedInitializeCategories = debounce(initializeCategories, 300)
const debouncedClearAllData = debounce(clearAllData, 300)
const debouncedQuickUndo = debounce(quickUndo, 300)
const debouncedShowRecommendation = debounce(() => emit('show-recommendation'), 300)
const debouncedShowModelConfig = debounce(() => emit('show-model-config'), 300)
const debouncedShowOperationLog = debounce(() => emit('show-operation-log'), 300)
const debouncedShowCategorySort = debounce(() => categorySortModalRef.value.show(), 300)
const debouncedToggleLayout = debounce(toggleLayout, 300)
const debouncedToggleGroupByStatus = debounce(toggleGroupByStatus, 300)

</script>

<style scoped lang="scss">
.categories-section {
  margin-bottom: 16px;
}

.global-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  gap: 12px;
  padding: 12px;
  background: var(--bg-card);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-sm);

  .actions-left,
  .actions-right {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
  }

  .btn {
    transition: all 0.3s ease;
    font-size: 0.9rem;
    display: flex;
    align-items: center;
    gap: 4px;

    &:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: var(--shadow-md);
    }
  }

  .btn-icon,
  .btn-text {
    display: inline-block;
  }

  // 智能推荐按钮样式
  .btn-recommendation {
    padding: 8px 16px;
    background: var(--primary-color);
    color: var(--btn-primary-text);
    border: var(--border-width, 1px) solid var(--primary-color);
    border-radius: var(--border-radius-sm);
    font-weight: 600;
    cursor: pointer;
    box-shadow: var(--shadow-sm);
    position: relative;

    &:hover:not(:disabled) {
      background: var(--primary-dark);
      border-color: var(--primary-dark);
      box-shadow: var(--shadow-md);
    }

    &:active {
      transform: translateY(0);
      box-shadow: var(--shadow-sm);
    }

    .btn-icon {
      font-size: 1.1rem;
      line-height: 1;
    }
  }

  // 通用下拉菜单容器
  .action-dropdown,
  .more-actions-dropdown {
    position: relative;
    display: inline-block;
  }

  // 撤销按钮样式
  .btn-undo {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 16px;
    background: var(--success-color);
    color: var(--btn-success-text);
    border: var(--border-width, 1px) solid var(--success-color);
    border-radius: var(--border-radius-sm);
    font-weight: 600;
    cursor: pointer;
    box-shadow: var(--shadow-sm);
    position: relative;

    &:hover:not(:disabled) {
      filter: brightness(0.9);
      transform: translateY(-2px);
      box-shadow: var(--shadow-md);
    }

    &:active:not(:disabled) {
      transform: translateY(0);
      box-shadow: var(--shadow-sm);
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      background: var(--text-muted);
      border-color: var(--text-muted);
      box-shadow: none;
      filter: none;
    }

    .undo-icon {
      font-size: 1.1rem;
      line-height: 1;
    }

    .undo-text {
      font-weight: 600;
    }

    .undo-count {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 18px;
      height: 18px;
      padding: 0 5px;
      background: var(--bg-mask);
      border-radius: 9px;
      font-size: 0.7rem;
      font-weight: 700;
    }
  }
}

// 下拉菜单样式
.action-menu,
.more-actions-menu {
  /* 移除 display, position, left, top, margin-top, z-index */
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-lg);
  min-width: 160px;
  overflow: hidden;
  padding: 4px 0;
  z-index: 1000;
}

.more-actions-dropdown .more-actions-menu {
  /* 移除 right, left, auto */
}

/* 移除所有 :hover 触发的样式 */

@keyframes dropdownFadeIn {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.menu-item {
  display: block;
  padding: 10px 16px;
  color: var(--text-primary);
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.85rem;
  white-space: nowrap;

  &:hover {
    background: var(--bg-hover);
    color: var(--primary-color);
  }

  &.danger {
    color: var(--danger-color);

    &:hover {
      background: var(--danger-light);
    }
  }
}

.categories-container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  align-items: start;
}

.empty-state {
  grid-column: 1 / -1;
  text-align: center;
  padding: 60px 20px;
  background: var(--bg-card);
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-md);
  // 调整间距
  margin-bottom: 16px;
}

.empty-state h3 {
  color: var(--text-secondary);
  margin-bottom: 10px;
}

.empty-state p {
  color: var(--text-muted);
}

/* 添加分类卡片 - + 按钮样式 */
.add-category-card {
  background: var(--bg-card);
  border: var(--border-width) dashed var(--primary-color);
  border-radius: var(--border-radius);
  padding: 32px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  min-height: 180px;
  opacity: 0.8;
  box-shadow: var(--shadow-sm);
}

.add-category-card:hover {
  background: var(--bg-hover);
  border-style: solid;
  border-color: var(--primary-color);
  transform: translateY(-4px);
  box-shadow: var(--shadow-md);
  opacity: 1;
}

.add-icon {
  font-size: 3rem;
  font-weight: 300;
  color: var(--primary-color);
  line-height: 1;
}

.add-text {
  font-size: 1.1rem;
  font-weight: 500;
  color: var(--primary-color);
}

/* 添加分类输入卡片 */
.add-category-input-card {
  background: var(--bg-card);
  border: var(--border-width) solid var(--primary-color);
  border-radius: var(--border-radius);
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 15px;
  min-height: 180px;
  justify-content: center;
  box-shadow: var(--shadow-md);
}

.category-input {
  width: 100%;
  padding: 12px 16px;
  border: var(--border-width) solid var(--border-color);
  border-radius: var(--border-radius);
  font-size: 1rem;
  background: var(--bg-input);
  color: var(--text-primary);
  transition: all 0.3s ease;
}

.category-input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px var(--primary-color-shadow);
}

.input-actions {
  display: flex;
  gap: 10px;
  justify-content: center;
}

.btn {
  padding: 10px 24px;
  border: none;
  border-radius: var(--border-radius);
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-sm {
  padding: 8px 16px;
  font-size: 0.9rem;
}

.btn-primary {
  background: var(--primary-color);
  color: var(--btn-primary-text);

  &:hover {
    background: var(--primary-dark);
  }

  &:active {
    transform: translateY(-2px) scale(0.95);
  }
}

.btn-secondary {
  background: var(--text-muted);
  color: var(--text-white);

  &:hover {
    background: var(--text-secondary);
  }
}

.btn {
  transition: all 0.2s ease;
}

.btn:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

/* 响应式布局 */
@media (max-width: 1200px) {
  .categories-container {
    grid-template-columns: repeat(2, 1fr);
  }
}

// 图片预览模态框样式
.preview-body {
  flex: 1;
  overflow: auto;
  padding: 20px;
  background: var(--bg-main);
  min-height: 0;
  display: flex;
  justify-content: center;
  align-items: flex-start;
}

.preview-image {
  display: block;
  width: 100%;
  height: auto;
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-md);
  object-fit: contain;
}

// 隐藏的导出容器
.hidden-export-container {
  position: fixed;
  left: -10000px;
  top: 0;
  pointer-events: none;
  z-index: -9999;
  opacity: 0;
}

/* 响应式布局 */
@media (max-width: 1200px) {
  .categories-container {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .categories-container {
    grid-template-columns: 1fr;
  }

  .global-actions {
    flex-direction: column;
    gap: 10px;

    .actions-left,
    .actions-right {
      width: 100%;
      justify-content: center;
    }

    .btn-recommendation {
      padding: 6px 12px;
      font-size: 0.85rem;

      .btn-icon {
        font-size: 1rem;
      }

      .btn-text {
        font-size: 0.85rem;
      }
    }

    .btn-undo {
      padding: 6px 12px;
      font-size: 0.85rem;

      .undo-icon {
        font-size: 1rem;
      }

      .undo-text {
        font-size: 0.85rem;
      }

      .undo-count {
        min-width: 16px;
        height: 16px;
        padding: 0 4px;
        font-size: 0.65rem;
      }
    }
  }

  .action-menu,
  .more-actions-menu {
    left: 50%;
    transform: translateX(-50%);
  }

  .more-actions-dropdown .more-actions-menu {
    right: auto;
    left: 50%;
    transform: translateX(-50%);
  }

  .preview-image {
    width: 100%;
  }
}
</style>
