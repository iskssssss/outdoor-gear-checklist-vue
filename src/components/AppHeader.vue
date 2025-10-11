<template>
  <div class="header">
    <div class="container">
      <div 
        class="header-title-group"
      >
        <h1 class="header-icon">🏔️</h1>
        <h1 class="header-title-text">户外装备清单</h1>
      </div>
      <p class="header-slogan">为您的户外探险做好充分准备</p> <!-- 恢复 Slogan 内容 -->
      <div class="header-content-wrapper">
        <!-- 导航栏风格的功能菜单 -->
        <nav class="nav-menu">
          <!-- 导入功能 -->
          <div class="nav-dropdown">
            <a class="nav-link dropdown-toggle">
              📥 导入
            </a>
            <div class="dropdown-menu">
              <a class="dropdown-item" @click="importData">📄 导入 JSON</a>
              <a class="dropdown-item" @click="showImportCart">🛒 导入购物车</a>
            </div>
          </div>

          <!-- 导出功能 -->
          <div class="nav-dropdown">
            <a class="nav-link dropdown-toggle">
              📤 导出
            </a>
            <div class="dropdown-menu">
              <a class="dropdown-item" @click="exportData">📄 导出 JSON</a>
              <a class="dropdown-item" @click="exportToImage">🖼️ 导出图片</a>
            </div>
          </div>

          <!-- 分类管理 -->
          <div class="nav-dropdown">
            <a class="nav-link dropdown-toggle">
              📂 分类管理
            </a>
            <div class="dropdown-menu">
              <a class="dropdown-item" @click="initializeCategories">✨ 初始化分类</a>
              <a class="dropdown-item danger" @click="clearAllData">🗑️ 清空所有数据</a>
            </div>
          </div>

          <!-- AI 工具 -->
          <div class="nav-dropdown">
            <a class="nav-link dropdown-toggle">
              🤖 AI 工具
            </a>
            <div class="dropdown-menu">
              <a class="dropdown-item" @click="showRecommendations">💡 智能推荐</a>
              <a class="dropdown-item" @click="showModelConfig">⚙️ 模型配置</a>
            </div>
          </div>

          <!-- 其他 -->
          <div class="nav-dropdown">
            <a class="nav-link dropdown-toggle">
              ⋯ 更多
            </a>
            <div class="dropdown-menu">
              <a class="dropdown-item" @click="showOperationLog">📋 操作日志</a>
              <a class="dropdown-item disabled">📚 使用文档（开发中）</a>
              <a class="dropdown-item disabled">📧 联系我们（开发中）</a>
            </div>
          </div>
        </nav>
      </div>
    </div>
  </div>

  <!-- 图片预览模态框 -->
  <div v-if="showPreviewModal" class="modal" @click="closePreview">
    <div class="modal-content preview-modal" @click.stop>
      <div class="modal-header">
        <h3>🖼️ 图片预览</h3>
        <span class="close" @click="closePreview">&times;</span>
      </div>
      <div class="modal-body preview-body">
        <img v-if="previewImageUrl" :src="previewImageUrl" alt="预览图片" class="preview-image">
      </div>
      <div class="modal-footer">
        <button class="btn btn-primary" @click="confirmDownload">📥 下载图片</button>
        <button class="btn btn-secondary" @click="closePreview">✕ 取消</button>
      </div>
    </div>
  </div>

  <!-- 隐藏的导出容器 -->
  <div class="hidden-export-container">
    <ExportPreview v-if="isGeneratingImage" ref="exportPreviewRef" :categories="equipmentStore.categories"
      :export-width="imageExportConfig.exportWidth" />
  </div>

  <!-- 导入购物车模态框 -->
  <ImportCartModal ref="importCartModalRef" />
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { useEquipmentStore } from '../stores/equipment'
import html2canvas from 'html2canvas'
import ExportPreview from './ExportPreview.vue'
import ImportCartModal from './ImportCartModal.vue' // 导入新的模态框组件
import { imageExportConfig } from '../config/appConfig'

const equipmentStore = useEquipmentStore()

// 事件定义
const emit = defineEmits(['show-recommendation', 'show-model-config', 'show-operation-log'])

// 图片预览相关状态
const showPreviewModal = ref(false)
const previewImageUrl = ref('')
const previewBlob = ref(null)
const isGeneratingImage = ref(false)
const exportPreviewRef = ref(null)

// 导入购物车模态框引用
const importCartModalRef = ref(null) // 新增模态框引用

/**
 * 显示导入购物车模态框
 */
function showImportCart() {
  importCartModalRef.value?.show()
}

/**
 * 导入数据
 */
function importData() {
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
          alert('导入的数据格式不正确')
          return
        }

        equipmentStore.importData(importedData)
      } catch (error) {
        alert('导入失败：文件格式错误')
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
  link.download = `hiking-checklist-${new Date().toISOString().split('T')[0]}.json`
  link.click()

  URL.revokeObjectURL(url)
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
      backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--bg-card').trim() || '#ffffff',
      scale: imageExportConfig.scale, // 高分辨率缩放
      logging: false,
      useCORS: true,
      allowTaint: true,
      windowWidth: imageExportConfig.exportWidth,
      windowHeight: element.scrollHeight,
      dpi: imageExportConfig.dpi, // 高 DPI 设置
      imageTimeout: imageExportConfig.imageTimeout,
      // 额外的质量优化选项
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
      showPreviewModal.value = true
      // 隐藏导出组件
      isGeneratingImage.value = false
    }, imageExportConfig.format, imageExportConfig.quality)
  } catch (error) {
    console.error('导出图片失败:', error)
    alert(`导出图片失败: ${error.message}，请重试！`)
    isGeneratingImage.value = false
  }
}

/**
 * 关闭预览
 */
function closePreview() {
  showPreviewModal.value = false
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
    link.download = `hiking-checklist-${new Date().toISOString().split('T')[0]}.png`
    link.click()
    URL.revokeObjectURL(url)
  }
  closePreview()
}

/**
 * 清空所有数据
 */
function clearAllData() {
  equipmentStore.clearAllData()
}

/**
 * 初始化分类
 */
function initializeCategories() {
  if (confirm('这将清空所有现有分类并导入默认分类，确定要继续吗？')) {
    equipmentStore.initializeCategories();
  }
}

/**
 * 显示推荐模态框
 */
function showRecommendations() {
  emit('show-recommendation')
}

/**
 * 显示模型配置模态框
 */
function showModelConfig() {
  emit('show-model-config')
}

/**
 * 显示操作日志模态框
 */
function showOperationLog() {
  emit('show-operation-log')
}
</script>

<style scoped lang="scss">
// ==================== 标题栏主体样式 ====================
.header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: var(--bg-header);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1); // 恢复展开时的阴影
  margin-bottom: 30px;
  padding: 30px 0; // 恢复展开时的 padding
  transition: none; // 移除所有过渡效果
}

// ==================== 容器布局 ====================
.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  flex-direction: column; // 恢复展开时的布局
  justify-content: center; // 恢复展开时的布局
  align-items: center;
  transition: none; // 移除所有过渡效果
  overflow: visible; // 确保下拉菜单可见
}

.header-content-wrapper {
  width: 100%; // 恢复展开时的宽度
  display: flex;
  justify-content: center;
  align-items: center;
  transition: none; // 移除所有过渡效果
  overflow: visible; // 确保下拉菜单可见
  // flex-shrink: 1;
  // min-width: 0;
}

// ==================== 标题样式 ====================
h1 {
  margin: 0;
  color: var(--text-primary);
  flex-shrink: 0;
}

.header-icon {
  font-size: 2.25rem; // 恢复展开时的字体大小
  transition: none; // 移除所有过渡效果
}

.header-title-group {
  display: flex;
  justify-content: center; // 恢复展开时的布局
  align-items: center;
  transition: none; // 移除所有过渡效果
  flex-shrink: 0;
  gap: 8px;
}

.header-title-text {
  font-size: 2.5rem; // 恢复展开时的字体大小
  overflow: hidden;
  white-space: nowrap;
  max-width: 300px; // 恢复展开时的宽度
  opacity: 1; // 恢复展开时的透明度
  transform: translateX(0); // 恢复展开时的位置
  margin-left: 8px; // 恢复展开时的 margin
  transition: none; // 移除所有过渡效果
}

// ==================== 副标题（Slogan）样式 ====================
p {
  text-align: center;
  color: var(--text-secondary);
  font-size: 1.1rem;
  margin: 0;
}

.header-slogan {
  overflow: hidden;
  width: 100%;
  text-align: center;
  max-height: 50px; // 恢复展开时的高度
  opacity: 1; // 恢复展开时的透明度
  margin: 10px 0 15px 0; // 恢复展开时的 margin
  transition: none; // 移除所有过渡效果
}

// ==================== 导航栏样式 ====================
.nav-menu {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 12px 0;
  margin-top: 20px;
  flex-shrink: 1;
  min-width: 0;
  white-space: nowrap;
  overflow: visible; // 修改为 visible，确保下拉菜单可见
  -webkit-overflow-scrolling: touch;
  transition: none;
}

// 二级菜单容器
.nav-dropdown {
  position: relative;
  display: inline-block;
  
  // hover 时显示下拉菜单（包括菜单本身的 hover）
  &:hover .dropdown-menu,
  .dropdown-menu:hover {
    display: block;
    animation: dropdownFadeIn 0.2s ease;
  }
  
  // hover 时箭头旋转
  &:hover .dropdown-toggle::after {
    transform: translateY(-50%) rotate(180deg);
  }
  
  // 确保从一级菜单到二级菜单之间没有间隙
  &::before {
    content: '';
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    height: 8px; // 与 dropdown-menu 的 margin-top 相同
    background: transparent;
  }
}

// 一级菜单链接
.nav-link {
  position: relative;
  padding: 8px 16px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  border-bottom: 2px solid transparent;
  text-decoration: none;
  white-space: nowrap;
  display: inline-block;
  color: var(--text-primary);
  
  &:hover {
    border-bottom-color: var(--primary-color);
    color: var(--primary-color);
  }
  
  &.dropdown-toggle {
    padding-right: 24px;
    
    &::after {
      content: '▼';
      position: absolute;
      right: 8px;
      top: 50%;
      transform: translateY(-50%);
      font-size: 0.6rem;
      transition: transform 0.3s ease;
    }
  }
}

// 二级菜单容器
.dropdown-menu {
  display: none; // 默认隐藏
  position: absolute;
  top: 100%;
  left: 0;
  margin-top: 8px;
  min-width: 180px;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  padding: 8px 0;
  z-index: 1000;
}

@keyframes dropdownFadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

// 二级菜单项
.dropdown-item {
  display: block;
  padding: 10px 20px;
  font-size: 0.85rem;
  color: var(--text-primary);
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  
  &:hover {
    background: var(--bg-hover, rgba(102, 126, 234, 0.1));
    color: var(--primary-color);
  }
  
  &.danger {
    color: var(--danger-color, #dc3545);
    
    &:hover {
      background: rgba(220, 53, 69, 0.1);
    }
  }
  
  &.disabled {
    color: var(--text-secondary);
    cursor: not-allowed;
    opacity: 0.5;
    
    &:hover {
      background: transparent;
      color: var(--text-secondary);
    }
  }
}

// ==================== 图片预览模态框样式 ====================
.preview-modal {
  width: 90vw !important;
  max-width: 1600px !important;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
}

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
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  object-fit: contain;
}

.modal-footer {
  display: flex;
  justify-content: center;
  gap: 12px;
  padding: 20px;
  border-top: 1px solid var(--border-color);
}

.btn {
  padding: 10px 24px;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary {
  background: var(--primary-color, #667eea);
  color: var(--text-white, white);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  }
}

.btn-secondary {
  background: var(--text-secondary, #666);
  color: var(--text-white, white);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }
}

// ==================== 隐藏的导出容器 ====================
.hidden-export-container {
  position: fixed;
  left: -10000px;
  top: 0;
  pointer-events: none;
  z-index: -9999;
  opacity: 0;
}

// ==================== 响应式设计 ====================
@media (max-width: 768px) {
  .container {
    flex-direction: column;
    align-items: center;
  }

  .header-title-group {
    justify-content: center;
  }

  .header-icon {
    font-size: 2.25rem; // 移动端图标大小与桌面端一致
  }

  .header-title-text {
    font-size: 2rem; // 移动端标题字体大小
    transform: translateX(0); 
    opacity: 1;
    max-width: none; 
  }

  .nav-menu {
    gap: 10px;
    padding: 12px 0;
    margin-top: 20px;
    justify-content: center;
  }

  .nav-dropdown {
    flex-shrink: 0;
  }

  .nav-link {
    font-size: 0.85rem;
    padding: 6px 12px;
  }

  .dropdown-menu {
    left: 50%;
    transform: translateX(-50%);
    min-width: 160px;
  }

  .preview-modal {
    width: 95vw;
    max-width: 95vw;
    max-height: 95vh;
  }

  .preview-image {
    width: 100%;
  }

  .modal-footer {
    flex-direction: column;
  }

  .btn {
    width: 100%;
  }
}
</style>
