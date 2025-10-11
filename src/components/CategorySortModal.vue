<template>
  <BaseModal
    ref="modalRef"
    title="🔀 分类排序"
    title-tag="h2"
    width="500px"
    max-height="80vh"
    :show-footer="true"
    @close="handleClose"
  >
    <template #default>
        <p class="hint-text">拖动卡片可以调整分类顺序</p>
        
        <div class="sort-list">
          <div 
            v-for="(category, index) in sortedCategories" 
            :key="category.id"
            class="sort-item"
            draggable="true"
            @dragstart="handleDragStart(index)"
            @dragover.prevent="handleDragOver(index)"
            @drop="handleDrop(index)"
            @dragend="handleDragEnd"
            :class="{ 'dragging': draggingIndex === index }"
          >
            <span class="drag-handle">⋮⋮</span>
            <span class="category-icon">{{ category.icon || '✨' }}</span>
            <span class="category-name">{{ category.name }}</span>
            <span class="item-count">{{ category.items.length }} 项</span>
          </div>
        </div>
    </template>

    <template #footer>
      <button class="btn btn-secondary" @click="close">取消</button>
      <button class="btn btn-primary" @click="saveOrder">保存顺序</button>
    </template>
  </BaseModal>
</template>

<script setup>
import { ref, defineExpose } from 'vue'
import { useEquipmentStore } from '../stores/equipment'
import BaseModal from './BaseModal.vue'

const equipmentStore = useEquipmentStore()

const modalRef = ref(null)
const sortedCategories = ref([])
const draggingIndex = ref(null)
const dragOverIndex = ref(null)

/**
 * 显示模态框
 */
function show() {
  // 复制当前分类列表
  sortedCategories.value = JSON.parse(JSON.stringify(equipmentStore.categories))
  modalRef.value?.show()
}

/**
 * 关闭模态框
 */
function close() {
  draggingIndex.value = null
  dragOverIndex.value = null
  modalRef.value?.close()
}

function handleClose() {
  draggingIndex.value = null
  dragOverIndex.value = null
}

/**
 * 开始拖拽
 */
function handleDragStart(index) {
  draggingIndex.value = index
}

/**
 * 拖拽经过
 */
function handleDragOver(index) {
  if (draggingIndex.value === null || draggingIndex.value === index) return
  
  // 移动元素
  const draggedItem = sortedCategories.value[draggingIndex.value]
  sortedCategories.value.splice(draggingIndex.value, 1)
  sortedCategories.value.splice(index, 0, draggedItem)
  
  // 更新拖拽索引
  draggingIndex.value = index
}

/**
 * 拖拽结束
 */
function handleDragEnd() {
  draggingIndex.value = null
}

/**
 * 放置
 */
function handleDrop(index) {
  // 实际的移动已经在 dragOver 中处理了
}

/**
 * 保存排序
 */
function saveOrder() {
  equipmentStore.updateCategoriesOrder(sortedCategories.value)
  console.log('✅ 分类顺序已保存')
  close()
}

// 暴露方法给父组件
defineExpose({
  show,
  close
})
</script>

<style scoped lang="scss">
.hint-text {
  color: var(--text-secondary);
  font-size: 14px;
  margin-bottom: 16px;
  text-align: center;
}

.sort-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.sort-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  background: var(--bg-input);
  border-radius: 10px;
  cursor: move;
  transition: all 0.3s ease;
  border: 2px solid transparent;
  user-select: none;

  &:hover {
    background: var(--bg-hover);
    border-color: var(--primary-color);
    transform: translateX(4px);
  }

  &.dragging {
    opacity: 0.5;
    transform: scale(0.98);
  }
}

.drag-handle {
  font-size: 18px;
  color: var(--text-secondary);
  cursor: grab;
  
  &:active {
    cursor: grabbing;
  }
}

.category-icon {
  font-size: 24px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.category-name {
  flex: 1;
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
}

.item-count {
  font-size: 14px;
  color: var(--text-secondary);
  background: var(--bg-card);
  padding: 4px 10px;
  border-radius: 12px;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary {
  background: var(--primary-color);
  color: white;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
  }
}

.btn-secondary {
  background: var(--bg-input);
  color: var(--text-primary);
  
  &:hover {
    background: var(--bg-hover);
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .sort-item {
    padding: 12px 16px;
  }
}
</style>

