<template>
  <div class="categories-section">
    <!-- 全局操作按钮 -->
    <div class="global-actions" v-if="equipmentStore.categories.length > 0 || isAdding">
      <button 
        class="btn btn-primary btn-sm" 
        @click="toggleLayout"
        :title="layoutMode === 'grid' ? '切换到瀑布流模式' : '切换到网格模式'"
      >
        {{ layoutMode === 'grid' ? '💧 瀑布流' : '🔲 网格' }}
      </button>
      <button 
        class="btn btn-secondary btn-sm" 
        @click="toggleAllCategories"
        :title="allCollapsed ? '展开全部分类' : '收起全部分类'"
      >
        {{ allCollapsed ? '📂 展开全部' : '📁 收起全部' }}
      </button>
    </div>
    
    <!-- 装备分类列表 -->
    <div v-if="equipmentStore.categories.length === 0 && !isAdding" class="empty-state">
      <h3>还没有装备分类</h3>
      <p>点击下方 "+" 按钮开始创建您的装备清单</p>
    </div>

    <!-- 瀑布流布局组件 -->
    <WaterfallLayout
      v-show="layoutMode === 'waterfall'"
      :categories="equipmentStore.categories"
      :column-gap="16"
      :add-card-visible="true"
      :is-adding="isAdding"
      :layout-mode="layoutMode"
      @add-card-click="showAddInput"
    >
      <template v-slot:add-card-content>
        <div class="add-icon">+</div>
        <div class="add-text">添加分类</div>
      </template>
      <template v-slot:add-input-card-content>
        <input 
          ref="categoryInput"
          type="text" 
          v-model="newCategoryName" 
          @keypress.enter="addCategory"
          @blur="cancelAdd"
          placeholder="输入分类名称"
          class="category-input"
        >
        <div class="input-actions">
          <button class="btn btn-primary btn-sm" @click="addCategory">✓ 确认</button>
          <button class="btn btn-secondary btn-sm" @click="cancelAdd">✕ 取消</button>
        </div>
      </template>
    </WaterfallLayout>

    <!-- 网格布局 -->
    <div 
      v-show="layoutMode === 'grid'"
      class="categories-container"
    >
      <CategoryItem
        v-for="category in equipmentStore.categories"
        :key="category.id"
        :category="category"
        :layout-mode="layoutMode"
      />
      
      <!-- 添加分类按钮/输入框 (网格模式下) -->
      <div 
        class="add-category-card" 
        v-if="!isAdding" 
        @click="showAddInput"
      >
        <div class="add-icon">+</div>
        <div class="add-text">添加分类</div>
      </div>
      
      <div 
        class="add-category-input-card" 
        v-else
      >
        <input 
          ref="categoryInput"
          type="text" 
          v-model="newCategoryName" 
          @keypress.enter="addCategory"
          @blur="cancelAdd"
          placeholder="输入分类名称"
          class="category-input"
        >
        <div class="input-actions">
          <button class="btn btn-primary btn-sm" @click="addCategory">✓ 确认</button>
          <button class="btn btn-secondary btn-sm" @click="cancelAdd">✕ 取消</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, watch, onMounted, onUnmounted } from 'vue'
import { useEquipmentStore } from '../stores/equipment'
import CategoryItem from './CategoryItem.vue'
import WaterfallLayout from './WaterfallLayout.vue' // 引入瀑布流布局组件

const equipmentStore = useEquipmentStore()
const newCategoryName = ref('')
const isAdding = ref(false)
const categoryInput = ref(null)
const layoutMode = ref('grid') // 'grid' 或 'waterfall'

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

</script>

<style scoped lang="scss">
.categories-section {
  margin-bottom: 16px;
}

.global-actions {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 12px;
  gap: 10px;
  
  .btn {
    transition: all 0.3s ease;
    font-size: 0.9rem;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
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
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
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
  background: transparent;
  border: 2px dashed var(--primary-color);
  border-radius: 12px;
  padding: 32px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  min-height: 180px;
  opacity: 0.7;
}

.add-category-card:hover {
  background: var(--bg-card);
  border-style: solid;
  transform: translateY(-4px);
  box-shadow: 0 6px 20px rgba(0,0,0,0.15);
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
  border: 2px solid var(--primary-color);
  border-radius: 12px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 15px;
  min-height: 180px;
  justify-content: center;
}

.category-input {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid var(--border-color);
  border-radius: 8px;
  font-size: 1rem;
  background: var(--bg-input);
  color: var(--text-primary);
  transition: all 0.3s ease;
}

.category-input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.input-actions {
  display: flex;
  gap: 10px;
  justify-content: center;
}

.btn {
  padding: 10px 24px;
  border: none;
  border-radius: 8px;
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
  color: var(--text-white, white);
  
  &:hover {
    background: var(--primary-dark, #5568d3);
  }
  
  &:active {
    transform: translateY(-2px) scale(0.95);
  }
}

.btn-secondary {
  background: var(--text-muted);
  color: var(--text-white, white);
  
  &:hover {
    background: var(--text-secondary);
  }
}

.btn {
  transition: all 0.2s ease;
}

.btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
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
}
</style>

