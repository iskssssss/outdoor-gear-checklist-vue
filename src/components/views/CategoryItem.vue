<template>
  <div class="category" :class="{ collapsed: category.collapsed, 'waterfall-mode': layoutMode === 'waterfall' }">
    <div class="category-header">
      <button class="category-collapse-btn" @click="debouncedToggleCollapse" :title="category.collapsed ? '展开' : '收起'">
        {{ category.collapsed ? '▶' : '▼' }}
      </button>

      <div v-if="!isEditingName" class="category-title" @click="debouncedStartEditName" title="点击编辑分类名称">
        <span class="category-icon" :class="{ 'is-editing-icon': isEditingIcon }" @click.stop="debouncedStartEditIcon"
          :title="isEditingIcon ? '保存或取消图标编辑' : '点击编辑图标'">
          {{ category.icon || '✨' }}
        </span>
        <input v-if="isEditingIcon" ref="iconInput" v-model="editingIcon" class="category-icon-input"
          @blur="debouncedSaveEditIcon" @keypress.enter="debouncedSaveEditIcon" @keypress.esc="debouncedCancelEditIcon"
          @click.stop placeholder="输入图标" :style="{ width: `${editingIcon.length + 2}ch` }">
        <span v-else class="category-name-display">{{ category.name }}</span>
      </div>
      <div v-else class="category-name-edit-group">
        <span class="category-icon edit-icon">{{ category.icon || '✨' }}</span>
        <input ref="nameInput" v-model="editingName" class="category-name-input" @blur="debouncedSaveEditName"
          @keypress.enter="debouncedSaveEditName" @keypress.esc="debouncedCancelEditName" @click.stop>
      </div>

      <div class="category-actions" v-if="!isEditingName && !isEditingIcon">
        <BaseButtonDropdown text="⋯" variant="secondary" size="sm" placement="bottom-end">
          <BaseDropdownItem icon="✏️" @click="debouncedStartEditName">编辑名称</BaseDropdownItem>
          <BaseDropdownItem v-if="category.items.length > 0" icon="🔢" @click="debouncedReindexItems">重新编码</BaseDropdownItem>
          <BaseDropdownItem icon="🗑️" danger @click="debouncedDeleteCategory">删除分类</BaseDropdownItem>
        </BaseButtonDropdown>
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
                <EquipmentItem v-for="item in pendingItems" :key="item.id" :item="item" :category-id="category.id"
                  :item-index="item.index" @save="handleEditItem" />
              </div>
            </div>

            <!-- 已准备装备区域 -->
            <div v-if="completedItems.length > 0" class="items-section">
              <div class="section-title">✅ 已准备</div>
              <div class="items-container">
                <EquipmentItem v-for="item in completedItems" :key="item.id" :item="item" :category-id="category.id"
                  :item-index="item.index" completed @save="handleEditItem" />
              </div>
            </div>
          </template>

          <!-- 不分栏显示 - 显示所有装备 -->
          <template v-else>
            <div class="items-section">
              <div class="items-container">
                <EquipmentItem v-for="item in category.items" :key="item.id" :item="item" :category-id="category.id"
                  :item-index="item.index" :completed="item.completed" @save="handleEditItem" />
              </div>
            </div>
          </template>
        </template>

        <!-- 添加装备区域 -->
        <div class="add-item-section">
          <div v-if="!isAddingItem" class="add-item-button-container">
            <BaseButton variant="outline" icon="+" @click="debouncedShowAddItemInput" class="add-item-button">添加装备</BaseButton>
          </div>
          <EquipmentItem v-else :category-id="category.id" :is-adding="true" @save="handleAddItem"
            @cancel="cancelAddItem" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, watch, inject } from 'vue'
import { useEquipmentStore } from '@/stores/equipment.ts'
import EquipmentItem from './EquipmentItem.vue'
import { useDebounceFn } from '@vueuse/core'
import { BaseButton, BaseButtonDropdown, BaseDropdownItem } from '@/components/common'

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
// 注入全局确认框方法
const showConfirm = inject('showConfirm')

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

    // 无论是否修改，都退出编辑状态
    isEditingIcon.value = false;
    // 强制清除输入框内容
    editingIcon.value = '';
    console.log('saveEditIcon finished.', { isEditingIconAfter: isEditingIcon.value, editingIconAfter: editingIcon.value });
  }
}

/**
 * 取消编辑分类图标
 */
function cancelEditIcon() {
  console.log('cancelEditIcon triggered.', { isEditingIconBefore: isEditingIcon.value, editingIconValue: editingIcon.value });
  isEditingIcon.value = false;
  // 强制清除输入框内容
  editingIcon.value = '';
  console.log('cancelEditIcon finished.', { isEditingIconAfter: isEditingIcon.value, editingIconAfter: editingIcon.value });
}

/**
 * 显示添加装备输入框
 */
function showAddItemInput() {
  isAddingItem.value = true
  nextTick(() => {
    // EquipmentItem will handle focus
    // itemNameInput.value?.focus() 
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
  // EquipmentItem will handle its own reset
  // newItem.value = { 
  //   name: '',
  //   quantity: 1,
  //   quantityUnit: '个',
  //   weight: 0,
  //   weightUnit: 'g'
  // }
}

const debouncedToggleCollapse = useDebounceFn(toggleCollapse, 300)
const debouncedStartEditName = useDebounceFn(startEditName, 300)
const debouncedSaveEditName = useDebounceFn(saveEditName, 300)
const debouncedCancelEditName = useDebounceFn(cancelEditName, 300)
const debouncedDeleteCategory = useDebounceFn(deleteCategory, 300)
const debouncedReindexItems = useDebounceFn(reindexItems, 300)
const debouncedStartEditIcon = useDebounceFn(startEditIcon, 300)
const debouncedSaveEditIcon = useDebounceFn(saveEditIcon, 300)
const debouncedCancelEditIcon = useDebounceFn(cancelEditIcon, 300)
const debouncedShowAddItemInput = useDebounceFn(showAddItemInput, 300)
</script>

<style scoped lang="scss">
.category {
  // 为伪元素提供定位上下文
  position: relative;
  background: var(--bg-card);
  border: var(--border-width) solid var(--border-color);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
  transition: max-height 0.5s ease, box-shadow 0.3s ease;
  // 默认展开的最大高度，足够容纳大量装备
  max-height: 2000px;
}

.category.collapsed {
  /* 收起时使用更快的动画 */
  transition: max-height 0.3s ease, box-shadow 0.3s ease;
  // 折叠时只显示标题栏
  max-height: 95px;
}

/* 瀑布流模式下禁用所有动画，避免干扰布局计算 */
.category.waterfall-mode {
  transition: none !important;
}

.category.waterfall-mode * {
  transition: none !important;
}

.category:hover {
  box-shadow: var(--shadow-md);
}

.category-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 16px;
  // 确保不换行
  flex-wrap: nowrap;
}

.category-collapse-btn {
  background: var(--bg-input);
  border: 1px solid var(--border-color);
  color: var(--text-secondary);
  width: 32px;
  height: 32px;
  border-radius: var(--border-radius-sm);
  cursor: pointer;
  font-size: var(--font-size-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.category-collapse-btn:hover {
  background: var(--bg-hover);
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
  border-radius: var(--border-radius-sm);
  transition: background 0.3s ease;
  // 让图标和文本在一行
  display: flex;
  align-items: center;
  // 图标与文本间距
  gap: 8px;
}

.category-title:hover {
  background: var(--bg-hover);
}

.category-name-input {
  // 允许收缩，但至少保持内容宽度
  flex: 1 1 auto;
  // 允许在必要时收缩到0
  min-width: 0;
  padding: 8px 12px;
  border: var(--border-width-lg) solid var(--border-color);
  border-radius: var(--border-radius-sm);
  font-size: 1rem;
  background: var(--bg-input);
  color: var(--text-primary);
  transition: all 0.3s ease;
}

.category-name-input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px var(--primary-color-shadow);
}

.category-actions {
  flex-shrink: 0;
  position: relative;
}

// BaseButtonDropdown 和 BaseDropdownItem 已接管下拉菜单样式

.category-content {
  padding: 16px;
  opacity: 1;
  // 延迟0.1s开始淡入，持续0.4s
  transition: opacity 0.4s ease 0.1s;
}

.category.collapsed .category-content {
  opacity: 0;
  // 收起时快速淡出
  transition: opacity 0.2s ease;
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
  border-bottom: var(--border-width-lg) solid var(--border-color);
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
  border-radius: var(--border-radius-sm);
}

.add-item-section {
  margin-top: 15px;
  padding-top: 15px;
  border-top: var(--border-width-lg) dashed var(--border-color);
}

.add-item-button-container {
  display: flex;
  gap: 10px;
  justify-content: center;
}

// BaseButton 已接管添加按钮样式

.category-name-edit-group {
  flex: 1 1 auto;
  min-width: 0;
  // 让图标和输入框在一行
  display: flex;
  align-items: center;
  // 图标与输入框间距
  gap: 8px;
}

.category-icon {
  font-size: 1.2rem;
  // 确保图标垂直居中
  line-height: 1;
  // 默认可点击，之后添加编辑功能
  cursor: pointer;
  transition: transform 0.2s ease;
}

.category-icon:hover {
  transform: scale(1.1);
}

.category-icon.edit-icon {
  // 编辑模式下图标不可点击
  cursor: default;
}

.category-icon.is-editing-icon {
  // 编辑模式下图标可点击
  cursor: text;
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
  border: var(--border-width-lg) solid var(--border-color);
  border-radius: var(--border-radius-sm);
  font-size: 1rem;
  background: var(--bg-input);
  color: var(--text-primary);
  transition: all 0.3s ease;
}

.category-icon-input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px var(--primary-color-shadow);
}
</style>
