<template>
  <div class="categories-section">
    <!-- 全局操作按钮 -->
    <div class="global-actions" v-if="equipmentStore.categories.length > 0">
      <button 
        class="btn btn-secondary btn-sm" 
        @click="toggleAllCategories"
        :title="allCollapsed ? '展开全部分类' : '收起全部分类'"
      >
        {{ allCollapsed ? '📂 展开全部' : '📁 收起全部' }}
      </button>
    </div>
    
    <!-- 装备分类列表 -->
    <div class="categories-container">
      <div v-if="equipmentStore.categories.length === 0" class="empty-state">
        <h3>还没有装备分类</h3>
        <p>点击下方 "+" 按钮开始创建您的装备清单</p>
      </div>
      
      <CategoryItem
        v-for="category in equipmentStore.categories"
        :key="category.id"
        :category="category"
      />
      
      <!-- 添加分类按钮 -->
      <div class="add-category-card" v-if="!isAdding" @click="showAddInput">
        <div class="add-icon">+</div>
        <div class="add-text">添加分类</div>
      </div>
      
      <!-- 添加分类输入框 -->
      <div class="add-category-input-card" v-else>
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
import { ref, computed, nextTick } from 'vue'
import { useEquipmentStore } from '../stores/equipment'
import CategoryItem from './CategoryItem.vue'

const equipmentStore = useEquipmentStore()
const newCategoryName = ref('')
const isAdding = ref(false)
const categoryInput = ref(null)

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
  margin-bottom: 30px;
}

.global-actions {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 16px;
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
  gap: 20px;
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
  background: var(--bg-card);
  border: 2px dashed var(--primary-color);
  border-radius: 12px;
  padding: 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  min-height: 200px;
}

.add-category-card:hover {
  background: var(--bg-input);
  border-style: solid;
  transform: translateY(-4px);
  box-shadow: 0 6px 20px rgba(0,0,0,0.15);
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
  padding: 30px;
  display: flex;
  flex-direction: column;
  gap: 15px;
  min-height: 200px;
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
}

.btn-secondary {
  background: var(--text-muted);
  color: var(--text-white, white);
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

