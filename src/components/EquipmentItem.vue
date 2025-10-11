<template>
  <div 
    v-if="!isEditingForm"
    class="item" 
    :class="{ completed: completed }"
    @click="toggleItem"
  >
    <div class="item-status">
      {{ completed ? '✅' : '⭕' }}
    </div>
    <div class="item-info">
      <span class="item-name">{{ item?.name }}</span>
      <span class="item-details">
        <template v-if="item">
          {{ item.quantity }}{{ item.quantityUnit }} · {{ item.weight }}{{ item.weightUnit }}
          <span v-if="totalWeight > 0">总重量: {{ totalWeight.toFixed(1) }}{{ item.weightUnit }}</span>
        </template>
      </span>
    </div>
    <div v-if="!completed && !isAdding" class="item-actions" @click.stop>
      <button class="btn btn-warning btn-sm" @click="startEdit">修改</button>
      <button class="btn btn-danger btn-sm" @click="deleteItem">删除</button>
    </div>
  </div>

  <div v-else class="item editing">
    <div class="add-item-input-container">
      <input 
        type="text" 
        class="add-item-input" 
        v-model="editingData.name"
        ref="editNameInput"
        :placeholder="isAdding ? '输入装备名称' : '装备名称'"
      >
      <div class="add-item-details">
        <div class="add-item-field">
          <label>重量:</label>
          <input type="number" v-model.number="editingData.weight" min="0" step="0.1">
          <select v-model="editingData.weightUnit">
            <option value="g">g</option>
            <option value="kg">kg</option>
            <option value="斤">斤</option>
            <option value="磅">磅</option>
          </select>
        </div>
        <div class="add-item-field">
          <label>数量:</label>
          <input type="number" v-model.number="editingData.quantity" min="0" step="1">
          <select v-model="editingData.quantityUnit">
            <option value="个">个</option>
            <option value="件">件</option>
            <option value="双">双</option>
            <option value="套">套</option>
            <option value="瓶">瓶</option>
          </select>
        </div>
      </div>
      <div class="add-item-button-container">
        <button class="add-item-button" @click="handleSave">{{ isAdding ? '✓ 确认添加' : '✓ 确认修改' }}</button>
        <button class="add-item-button cancel" @click="handleCancel">✕ 取消</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick, computed } from 'vue'
import { useEquipmentStore } from '../stores/equipment'

const props = defineProps({
  item: {
    type: Object,
    required: false // Not required if isAdding is true
  },
  categoryId: {
    type: Number,
    required: true
  },
  completed: {
    type: Boolean,
    default: false
  },
  isAdding: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['save', 'cancel'])

const equipmentStore = useEquipmentStore()

// 编辑/添加状态
const isEditingForm = ref(props.isAdding);
const editingData = ref(props.isAdding ? {
  name: '',
  quantity: 1,
  quantityUnit: '个',
  weight: 0,
  weightUnit: 'g'
} : { ...props.item });
const editNameInput = ref(null)

const totalWeight = computed(() => {
  const item = props.isAdding ? editingData.value : props.item;
  const weight = parseFloat(item.weight)
  const quantity = parseFloat(item.quantity)
  if (isNaN(weight) || isNaN(quantity)) {
    return 0
  }
  return weight * quantity
})

/**
 * 切换装备完成状态
 */
function toggleItem() {
  if (!props.isAdding) {
    equipmentStore.toggleItem(props.categoryId, props.item.id)
  }
}

/**
 * 开始编辑
 */
function startEdit() {
  isEditingForm.value = true
  editingData.value = { ...props.item }
  nextTick(() => {
    editNameInput.value?.focus()
  })
}

/**
 * 处理保存 (for both add and edit)
 */
function handleSave() {
  if (editingData.value.name.trim()) {
    emit('save', editingData.value)
    if (props.isAdding) {
      editingData.value = {
        name: '',
        quantity: 1,
        quantityUnit: '个',
        weight: 0,
        weightUnit: 'g'
      }
    }
    isEditingForm.value = false;
  }
}

/**
 * 处理取消 (for both add and edit)
 */
function handleCancel() {
  emit('cancel')
  isEditingForm.value = false;
  if (props.isAdding) {
     editingData.value = {
      name: '',
      quantity: 1,
      quantityUnit: '个',
      weight: 0,
      weightUnit: 'g'
    }
  } else {
    editingData.value = { ...props.item };
  }
}

/**
 * 删除装备
 */
function deleteItem() {
  equipmentStore.deleteItem(props.categoryId, props.item.id)
}
</script>

<style scoped lang="scss">
.item {
  display: flex;
  align-items: flex-start; /* 将align-items改为flex-start */
  gap: 8px; /* 减小间距 */
  padding: 12px 16px;
  background: var(--bg-input);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
  width: 100%;
}

.item:hover {
  background: var(--bg-card);
  border-color: var(--primary-color);
}

.item.completed {
  opacity: 0.7;
  background: var(--success-light, #d4edda);
}

.item.completed:hover {
  background: var(--success-light, #c3e6cb);
  filter: brightness(0.95);
}

.item.editing {
  cursor: default;
  border-color: var(--primary-color);
  background: var(--bg-card);
  padding: 15px;
  box-sizing: border-box;
  width: 100%; /* 确保占据父容器的100%宽度 */
}

.item.editing:hover {
  border-color: var(--primary-color);
}

.item-status {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.item-info {
  flex: 1 1 auto; /* 允许增长和收缩，并设置基础宽度 */
  min-width: 0; /* 允许在必要时收缩到0 */
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.item-name {
  font-weight: 500;
  color: var(--text-primary);
  font-size: 1rem;
}

.item.completed .item-name {
  text-decoration: line-through;
  color: var(--text-muted);
}

.item-details {
  font-size: 0.85rem;
  color: var(--text-secondary);
  white-space: normal; /* 允许文本换行 */
  word-break: break-word; /* 防止长单词溢出 */
  display: flex; /* 启用Flexbox布局 */
  flex-direction: column; /* 子元素垂直堆叠 */
}

.item-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

.btn {
  padding: 6px 12px;
  border: none;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-warning {
  background: var(--warning-color, #ffc107);
  color: var(--text-primary);
  
  /* 暗黑主题下使用深色文字以提高对比度 */
  body.theme-dark & {
    color: #1a1d29;
  }
}

.btn-danger {
  background: var(--danger-color, #dc3545);
  color: var(--text-white, white);
}

.btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.2);
}

.add-item-input-container {
  display: flex;
  flex-direction: column;
  gap: 8px; /* 减小间距 */
  width: 100%;
}

.add-item-input {
  width: 100%;
  padding: 10px 14px;
  border: 2px solid var(--border-color);
  border-radius: 6px;
  font-size: 0.95rem;
  transition: all 0.3s ease;
  background: var(--bg-input);
  color: var(--text-primary);
  box-sizing: border-box;
}

.add-item-input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.add-item-details {
  display: grid;
  grid-template-columns: 1fr; /* 始终单列 */
  gap: 10px; 
}

@media (min-width: 480px) { /* 移除此媒体查询中的双列设置 */
  /* .add-item-details {
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  } */
}

.add-item-field {
  display: flex;
  align-items: center;
  /* flex-wrap: wrap; */ /* 移除flex-wrap，尝试让元素保持在同一行 */
  gap: 4px; /* 元素之间的间距 */
}

.add-item-field label {
  font-weight: 500;
  color: var(--text-secondary);
  font-size: 0.9rem;
  flex-shrink: 0; 
  white-space: nowrap;
  /* margin-right: 4px; 让gap处理间距 */
}

.add-item-field input {
  flex: 1; /* 简化flex属性，让input填充剩余空间 */
  min-width: 0; /* 允许在必要时收缩到0 */
  padding: 6px 10px;
  border: 2px solid var(--border-color);
  border-radius: 4px;
  font-size: 0.9rem;
  background: var(--bg-input);
  color: var(--text-primary);
  box-sizing: border-box;
}

.add-item-field input:focus {
  outline: none;
  border-color: var(--primary-color);
}

.add-item-field select {
  padding: 6px 2px;
  border: 2px solid var(--border-color);
  border-radius: 4px;
  font-size: 0.85rem;
  background: var(--bg-input);
  color: var(--text-primary);
  cursor: pointer;
  flex-shrink: 0; /* 防止收缩 */
  width: 55px; /* 进一步减小固定宽度 */
  /* min-width: 50px; 移除min-width，width已固定 */
  text-align: center;
  box-sizing: border-box;
}

.add-item-field select:focus {
  outline: none;
  border-color: var(--primary-color);
}

.add-item-button-container {
  display: flex;
  gap: 8px;
  justify-content: center;
}

.add-item-button {
  padding: 8px 20px;
  border: 2px solid var(--primary-color);
  background: var(--primary-color);
  color: var(--text-white, white);
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.add-item-button:hover {
  background: var(--primary-dark, #5568d3);
  border-color: var(--primary-dark, #5568d3);
}

.add-item-button.cancel {
  border-color: var(--danger-color, #dc3545);
  background: var(--danger-color, #dc3545);
}

.add-item-button.cancel:hover {
  background: var(--danger-color);
  border-color: var(--danger-color);
  filter: brightness(0.9);
}

@media (max-width: 768px) {
  .item {
    flex-wrap: wrap;
  }
  
  .item-actions {
    width: 100%;
    justify-content: flex-end;
  }
}
</style>

