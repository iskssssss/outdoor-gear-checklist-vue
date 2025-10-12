<template>
  <div class="category" :class="{ collapsed: category.collapsed, 'waterfall-mode': layoutMode === 'waterfall' }">
    <div class="category-header">
      <button 
        class="category-collapse-btn" 
        @click="debouncedToggleCollapse"
        :title="category.collapsed ? '展开' : '收起'"
      >
        {{ category.collapsed ? '▶' : '▼' }}
      </button>
      
      <div 
        v-if="!isEditingName" 
        class="category-title" 
        @click="debouncedStartEditName"
        title="点击编辑分类名称"
      >
        <span 
          class="category-icon" 
          :class="{ 'is-editing-icon': isEditingIcon }"
          @click.stop="debouncedStartEditIcon"
          :title="isEditingIcon ? '保存或取消图标编辑' : '点击编辑图标'"
        >
          {{ category.icon || '✨' }}
        </span>
        <input 
          v-if="isEditingIcon"
          ref="iconInput"
          v-model="editingIcon"
          class="category-icon-input"
          @blur="debouncedSaveEditIcon"
          @keypress.enter="debouncedSaveEditIcon"
          @keypress.esc="debouncedCancelEditIcon"
          @click.stop
          placeholder="输入图标"
          :style="{ width: `${editingIcon.length + 2}ch` }"
        >
        <span v-else class="category-name-display">{{ category.name }}</span>
      </div>
      <div 
        v-else
        class="category-name-edit-group" 
      >
        <span class="category-icon edit-icon">{{ category.icon || '✨' }}</span>
        <input 
          ref="nameInput"
          v-model="editingName"
          class="category-name-input"
          @blur="debouncedSaveEditName"
          @keypress.enter="debouncedSaveEditName"
          @keypress.esc="debouncedCancelEditName"
          @click.stop
        >
      </div>
      
      <div class="category-actions" v-if="!isEditingName && !isEditingIcon">
        <div class="category-dropdown">
          <button class="category-menu-btn">⋯</button>
          <div class="category-menu">
            <a class="category-menu-item" @click="debouncedStartEditName">✏️ 编辑名称</a>
            <a 
              v-if="category.items.length > 0" 
              class="category-menu-item" 
              @click="debouncedReindexItems"
            >
              🔢 重新编码
            </a>
            <a class="category-menu-item danger" @click="debouncedDeleteCategory">🗑️ 删除分类</a>
          </div>
        </div>
      </div>
    </div>

    <div class="category-content">
      <div class="items-list">
        <template v-if="category.items.length > 0">
          <!-- 启用分栏显示 -->
          <template v-if="equipmentStore.groupByStatus">
            <!-- 待准备装备区域 -->
            <div v-if="pendingItems.length > 0" class="items-section">
              <div class="section-title">📋 待准备</div>
              <div class="items-container">
                <EquipmentItem
                  v-for="item in pendingItems"
                  :key="item.id"
                  :item="item"
                  :category-id="category.id"
                  :item-index="item.index"
                  @save="handleEditItem"
                />
              </div>
            </div>

            <!-- 已准备装备区域 -->
            <div v-if="completedItems.length > 0" class="items-section">
              <div class="section-title">✅ 已准备</div>
              <div class="items-container">
                <EquipmentItem
                  v-for="item in completedItems"
                  :key="item.id"
                  :item="item"
                  :category-id="category.id"
                  :item-index="item.index"
                  completed
                  @save="handleEditItem"
                />
              </div>
            </div>
          </template>

          <!-- 不分栏显示 - 显示所有装备 -->
          <template v-else>
            <div class="items-section">
              <div class="items-container">
                <EquipmentItem
                  v-for="item in category.items"
                  :key="item.id"
                  :item="item"
                  :category-id="category.id"
                  :item-index="item.index"
                  :completed="item.completed"
                  @save="handleEditItem"
                />
              </div>
            </div>
          </template>
        </template>

        <!-- 添加装备区域 -->
        <div class="add-item-section">
          <div v-if="!isAddingItem" class="add-item-button-container">
            <button class="add-item-button" @click="debouncedShowAddItemInput">+ 添加装备</button>
          </div>
          <EquipmentItem
            v-else
            :category-id="category.id"
            :is-adding="true"
            @save="handleAddItem"
            @cancel="cancelAddItem"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, watch, inject } from 'vue'
import { useEquipmentStore } from '../../stores/equipment'
import EquipmentItem from './EquipmentItem.vue'
import { debounce } from '../../utils/debounce'

const props = defineProps({
  category: {
    type: Object,
    required: true
  },
  layoutMode: {
    type: String,
    default: 'grid'
  }
})

const equipmentStore = useEquipmentStore()
const toast = inject('toast')
const showConfirm = inject('showConfirm') // 注入全局确认框方法

// 监听分类数据变化，检查数据完整性
watch(() => props.category.items, (newItems) => {
  // 检查是否有重复的ID（重要：防止操作错误的装备）
  const ids = newItems.map(i => i.id)
  const uniqueIds = new Set(ids)
  if (ids.length !== uniqueIds.size) {
    console.error(`❌ 分类"${props.category.name}"发现重复的装备ID!`, 
      '请点击"重编码"按钮修复。', ids)
  }
}, { deep: true })

// 分类名称编辑
const isEditingName = ref(false)
const editingName = ref('')
const nameInput = ref(null)
const iconInput = ref(null)
const isEditingIcon = ref(false)
const editingIcon = ref('')

// 添加装备
const isAddingItem = ref(false)
const newItem = ref({
  name: '',
  quantity: 1,
  quantityUnit: '个',
  weight: 0,
  weightUnit: 'g'
})
const itemNameInput = ref(null)

// 计算属性：待准备和已完成的装备
const pendingItems = computed(() => 
  props.category.items.filter(item => !item.completed)
)

const completedItems = computed(() => 
  props.category.items.filter(item => item.completed)
)

/**
 * 切换折叠状态
 */
function toggleCollapse() {
  equipmentStore.toggleCategoryCollapse(props.category.id)
}

/**
 * 开始编辑分类名称
 */
function startEditName() {
  isEditingName.value = true
  editingName.value = props.category.name
  nextTick(() => {
    nameInput.value?.focus()
    nameInput.value?.select()
  })
}

/**
 * 保存分类名称
 */
function saveEditName() {
  if (editingName.value.trim()) {
    equipmentStore.editCategoryName(props.category.id, editingName.value)
  }
  isEditingName.value = false
}

/**
 * 取消编辑分类名称
 */
function cancelEditName() {
  isEditingName.value = false
}

/**
 * 删除分类
 */
async function deleteCategory() {
  const categoryName = props.category.name
  const confirmed = await showConfirm({
    title: '删除分类',
    message: `确定要删除"${categoryName}"及其所有装备吗？`,
    confirmButtonText: '删除',
    showDangerWarning: true
  })

  if (confirmed) {
    equipmentStore.deleteCategory(props.category.id)
  }
}

/**
 * 重新编码装备序号
 */
async function reindexItems() {
  const confirmed = await showConfirm({
    title: '重新编码装备',
    message: `确定要重新编码"${props.category.name}"分类的所有装备序号吗？\n\n序号将按照当前顺序重新编码为 1, 2, 3...`,
    confirmButtonText: '确定'
  })
  if (confirmed) {
    // 先修复重复ID（如果有）
    const fixedCount = equipmentStore.fixDuplicateIds(props.category.id)
    
    // 再重新编码序号
    equipmentStore.reindexCategory(props.category.id)
    equipmentStore.saveData()
    
    if (fixedCount > 0) {
      toast?.success(`重编码完成！同时修复了 ${fixedCount} 个重复的装备ID`)
    } else {
      toast?.success('重编码完成！')
    }
  }
}

/**
 * 开始编辑分类图标
 */
function startEditIcon() {
  console.log('startEditIcon triggered.', { oldIsEditingIcon: isEditingIcon.value, currentIcon: props.category.icon });
  isEditingIcon.value = true;
  editingIcon.value = props.category.icon || '';
  nextTick(() => {
    iconInput.value?.focus();
    iconInput.value?.select();
  });
}

/**
 * 保存分类图标
 */
function saveEditIcon() {
  console.log('saveEditIcon triggered.', { isEditingIconBefore: isEditingIcon.value, editingIconValue: editingIcon.value, categoryIcon: props.category.icon });
  if (isEditingIcon.value) {
    const trimmedIcon = editingIcon.value.trim();
    if (trimmedIcon !== props.category.icon) {
      console.log('Icon actually changed, calling store update.');
      equipmentStore.editCategoryIcon(props.category.id, trimmedIcon);
    } else {
      console.log('Icon not changed, no store update needed.');
    }
    
    isEditingIcon.value = false; // 无论是否修改，都退出编辑状态
    editingIcon.value = ''; // 强制清除输入框内容
    console.log('saveEditIcon finished.', { isEditingIconAfter: isEditingIcon.value, editingIconAfter: editingIcon.value });
  }
}

/**
 * 取消编辑分类图标
 */
function cancelEditIcon() {
  console.log('cancelEditIcon triggered.', { isEditingIconBefore: isEditingIcon.value, editingIconValue: editingIcon.value });
  isEditingIcon.value = false;
  editingIcon.value = ''; // 强制清除输入框内容
  console.log('cancelEditIcon finished.', { isEditingIconAfter: isEditingIcon.value, editingIconAfter: editingIcon.value });
}

/**
 * 显示添加装备输入框
 */
function showAddItemInput() {
  isAddingItem.value = true
  nextTick(() => {
    // itemNameInput.value?.focus() // EquipmentItem will handle focus
  })
}

/**
 * 处理添加装备 (EquipmentItem 触发 save 事件)
 */
function handleAddItem(item) {
  if (equipmentStore.addItem(props.category.id, item)) {
    isAddingItem.value = false
  }
}

/**
 * 处理编辑装备 (EquipmentItem 触发 save 事件)
 */
function handleEditItem(updatedItem) {
  if (equipmentStore.editItem(props.category.id, updatedItem.id, updatedItem)) {
    // 编辑成功后可以做一些处理，例如关闭编辑状态 (EquipmentItem 内部已处理)
  }
}

/**
 * 取消添加装备
 */
function cancelAddItem() {
  isAddingItem.value = false
  // newItem.value = { // EquipmentItem will handle its own reset
  //   name: '',
  //   quantity: 1,
  //   quantityUnit: '个',
  //   weight: 0,
  //   weightUnit: 'g'
  // }
}

const debouncedToggleCollapse = debounce(toggleCollapse, 300)
const debouncedStartEditName = debounce(startEditName, 300)
const debouncedSaveEditName = debounce(saveEditName, 300)
const debouncedCancelEditName = debounce(cancelEditName, 300)
const debouncedDeleteCategory = debounce(deleteCategory, 300)
const debouncedReindexItems = debounce(reindexItems, 300)
const debouncedStartEditIcon = debounce(startEditIcon, 300)
const debouncedSaveEditIcon = debounce(saveEditIcon, 300)
const debouncedCancelEditIcon = debounce(cancelEditIcon, 300)
const debouncedShowAddItemInput = debounce(showAddItemInput, 300)
</script>

<style scoped lang="scss">
.category {
  background: var(--bg-card);
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  overflow: hidden;
  transition: max-height 0.5s ease, box-shadow 0.3s ease;
  max-height: 2000px; /* 默认展开的最大高度，足够容纳大量装备 */
}

.category.collapsed {
  /* 收起时使用更快的动画 */
  transition: max-height 0.3s ease, box-shadow 0.3s ease;
  max-height: 95px; /* 折叠时只显示标题栏 */
}

/* 瀑布流模式下禁用所有动画，避免干扰布局计算 */
.category.waterfall-mode {
  transition: none !important;
}

.category.waterfall-mode * {
  transition: none !important;
}

.category:hover {
  box-shadow: 0 4px 15px rgba(0,0,0,0.15);
}

.category-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 16px;
  flex-wrap: nowrap; /* 确保不换行 */
}

.category-collapse-btn {
  background: var(--bg-button-overlay, rgba(255,255,255,0.2));
  border: none;
  color: var(--text-white, white);
  width: 32px;
  height: 32px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.category-collapse-btn:hover {
  background: var(--bg-button-overlay-hover, rgba(255,255,255,0.3));
  transform: scale(1.1);
}

.category-collapse-btn:active {
  transform: scale(0.95);
}

.category-title {
  flex: 1 1 auto;
  min-width: 0;
  font-size: 1.2rem;
  font-weight: 600;
  cursor: pointer;
  padding: 5px 10px;
  border-radius: 6px;
  transition: background 0.3s ease;
  display: flex; /* 让图标和文本在一行 */
  align-items: center;
  gap: 8px; /* 图标与文本间距 */
}

.category-title:hover {
  background: var(--bg-hover, rgba(255,255,255,0.1));
}

.category-name-input {
  flex: 1 1 auto; /* 允许收缩，但至少保持内容宽度 */
  min-width: 0;   /* 允许在必要时收缩到0 */
  padding: 8px 12px;
  border: 2px solid var(--border-color);
  border-radius: 8px;
  font-size: 1rem;
  background: var(--bg-input);
  color: var(--text-primary);
  transition: all 0.3s ease;
}

.category-name-input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.category-actions {
  flex-shrink: 0;
  position: relative;
}

.category-dropdown {
  position: relative;
  display: inline-block;
  
  /* 扩展hover区域，确保鼠标在按钮和菜单之间移动时不会断开 */
  &::after {
    content: '';
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    height: 10px; /* 扩展10px的hover区域 */
    background: transparent;
  }
}

.category-menu-btn {
  background: var(--bg-input);
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
  line-height: 1;
}

.category-menu-btn:hover {
  background: var(--bg-hover);
  color: var(--primary-color);
}

.category-menu {
  display: none;
  position: absolute;
  right: 0;
  top: 100%;
  margin-top: 0; /* 无间隙，直接连接 */
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  min-width: 150px;
  z-index: 100;
  overflow: hidden;
  padding-top: 4px; /* 顶部留一点呼吸空间 */
}

.category-dropdown:hover .category-menu,
.category-menu:hover {
  display: block;
  animation: fadeIn 0.2s ease;
}

.category-menu-item {
  display: block;
  padding: 10px 16px;
  color: var(--text-primary);
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.9rem;
  white-space: nowrap;
  
  &:hover {
    background: var(--bg-hover);
    color: var(--primary-color);
  }
  
  &.danger {
    color: var(--danger-color, #dc3545);
    
    &:hover {
      background: rgba(220, 53, 69, 0.1);
      color: var(--danger-color, #dc3545);
    }
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.category-content {
  padding: 16px;
  opacity: 1;
  transition: opacity 0.4s ease 0.1s; /* 延迟0.1s开始淡入，持续0.4s */
}

.category.collapsed .category-content {
  opacity: 0;
  transition: opacity 0.2s ease; /* 收起时快速淡出 */
}

.items-section {
  margin-bottom: 16px;
}

.section-title {
  font-weight: 600;
  font-size: 1rem;
  color: var(--text-secondary);
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 2px solid var(--border-color);
}

.items-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.empty-items {
  padding: 15px;
  text-align: center;
  color: var(--text-muted);
  font-size: 0.9rem;
  background: var(--bg-input);
  border-radius: 6px;
}

.add-item-section {
  margin-top: 15px;
  padding-top: 15px;
  border-top: 2px dashed var(--border-color);
}

.add-item-button-container {
  display: flex;
  gap: 10px;
  justify-content: center;
}

.add-item-button {
  padding: 10px 24px;
  border: 2px dashed var(--primary-color);
  background: transparent;
  color: var(--primary-color);
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.add-item-button:hover {
  background: var(--primary-color);
  color: var(--text-white, white);
  border-style: solid;
}

.add-item-button.cancel {
  border-color: var(--danger-color, #dc3545);
  color: var(--danger-color, #dc3545);
}

.add-item-button.cancel:hover {
  background: var(--danger-color, #dc3545);
  color: var(--text-white, white);
}

.category-name-edit-group {
  flex: 1 1 auto;
  min-width: 0;
  display: flex; /* 让图标和输入框在一行 */
  align-items: center;
  gap: 8px; /* 图标与输入框间距 */
}

.category-icon {
  font-size: 1.2rem;
  line-height: 1; /* 确保图标垂直居中 */
  cursor: pointer; /* 默认可点击，之后添加编辑功能 */
  transition: transform 0.2s ease;
}

.category-icon:hover {
  transform: scale(1.1);
}

.category-icon.edit-icon {
  cursor: default; /* 编辑模式下图标不可点击 */
}

.category-icon.is-editing-icon {
  cursor: text; /* 编辑模式下图标可点击 */
}

.category-name-display {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.category-icon-input {
  flex: 1;
  min-width: 0;
  padding: 8px 12px;
  border: 2px solid var(--border-color);
  border-radius: 8px;
  font-size: 1rem;
  background: var(--bg-input);
  color: var(--text-primary);
  transition: all 0.3s ease;
}

.category-icon-input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

@media (max-width: 768px) {
  .category-header {
    flex-wrap: wrap;
  }
  
  .category-actions {
    width: 100%;
    justify-content: flex-end;
  }
}
</style>

