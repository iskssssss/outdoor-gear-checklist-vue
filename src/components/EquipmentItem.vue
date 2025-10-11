<template>
  <div 
    v-if="!isEditingForm"
    class="item" 
    :class="{ completed: completed }"
    @click="debouncedToggleCompleted"
  >
    <div class="item-status">
      {{ completed ? '✅' : '⭕' }}
    </div>
    <div class="item-info">
      <span class="item-name">
        <span class="item-index" v-if="itemIndex">{{ itemIndex }}</span>
        {{ item?.name }}
      </span>
      <span class="item-details">
        <template v-if="item">
          <span class="detail-row item-quantity">
            <span class="detail-icon">📦</span>
            <span class="detail-label">数量:</span>
            <span class="detail-value">{{ formatNumber(item.quantity) }}{{ item.quantityUnit }}</span>
          </span>
          <span class="detail-row item-weight">
            <span class="detail-icon">⚖️</span>
            <span class="detail-label">重量:</span>
            <span class="detail-value">
              {{ formatNumber(item.weight) }}{{ item.weightUnit }}
              <span v-if="totalWeight > 0" class="total-weight">（总重: {{ formatNumber(totalWeight, 1) }}{{ item.weightUnit }}）</span>
            </span>
          </span>
          <span v-if="item.price > 0" class="detail-row item-price">
            <span class="detail-icon">💰</span>
            <span class="detail-label">价格:</span>
            <span class="detail-value">
              {{ formatPrice(item.price) }}{{ item.priceUnit }}
              <span v-if="totalPrice > 0" class="total-price">（总价: {{ formatPrice(totalPrice) }}{{ item.priceUnit }}）</span>
            </span>
          </span>
        </template>
      </span>
    </div>
    <div v-if="!completed && !isAdding" class="item-actions" @click.stop>
      <div class="actions-dropdown">
        <button class="actions-menu-btn">⋯</button>
        <div class="actions-menu">
          <a class="actions-menu-item" @click="debouncedStartEditing">✏️ 修改</a>
          <a class="actions-menu-item danger" @click="debouncedDeleteItem">🗑️ 删除</a>
        </div>
      </div>
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
        <div class="add-item-field">
          <label>价格:</label>
          <input type="number" v-model.number="editingData.price" min="0" step="0.01">
          <select v-model="editingData.priceUnit">
            <option value="人民币">人民币</option>
            <option value="美元">美元</option>
            <option value="英镑">英镑</option>
            <option value="日元">日元</option>
          </select>
        </div>
      </div>
      <div class="add-item-button-container">
        <button class="add-item-button" @click="debouncedConfirmChanges">{{ isAdding ? '✓ 确认添加' : '✓ 确认修改' }}</button>
        <button class="add-item-button cancel" @click="debouncedCancelChanges">✕ 取消</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick, computed, inject } from 'vue'
import { useEquipmentStore } from '../stores/equipment'
import { debounce } from '../utils/debounce'

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
  },
  itemIndex: {
    type: Number,
    required: false
  }
})

const emit = defineEmits(['save', 'cancel'])

const equipmentStore = useEquipmentStore()
const showConfirm = inject('showConfirm')

// 编辑/添加状态
const isEditingForm = ref(props.isAdding);
const editingData = ref(props.isAdding ? {
  name: '',
  quantity: 1,
  quantityUnit: '个',
  weight: 0,
  weightUnit: 'g',
  price: 0,
  priceUnit: '人民币'
} : { 
  ...props.item,
  price: props.item?.price || 0,
  priceUnit: props.item?.priceUnit || '人民币'
});
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

const totalPrice = computed(() => {
  const item = props.isAdding ? editingData.value : props.item;
  const price = parseFloat(item.price || 0)
  const quantity = parseFloat(item.quantity)
  if (isNaN(price) || isNaN(quantity)) {
    return 0
  }
  return price * quantity
})

/**
 * 格式化数字显示（添加千位分隔符）
 */
function formatNumber(value, decimals = 0) {
  const num = parseFloat(value)
  if (isNaN(num)) return '0'
  return num.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

/**
 * 格式化价格显示（添加千位分隔符）
 */
function formatPrice(price) {
  const num = parseFloat(price)
  if (isNaN(num)) return '0.00'
  return num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

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
        weightUnit: 'g',
        price: 0,
        priceUnit: '人民币'
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
      weightUnit: 'g',
      price: 0,
      priceUnit: '人民币'
    }
  } else {
    editingData.value = { 
      ...props.item,
      priceUnit: props.item?.priceUnit || '人民币'
    };
  }
}

/**
 * 删除装备
 */
async function deleteItem() {
  const confirmed = await showConfirm({
    title: '删除装备',
    message: `确定要删除 #${props.itemIndex} "${props.item.name}"吗？`,
    confirmButtonText: '删除'
  })

  if (confirmed) {
    equipmentStore.deleteItem(props.categoryId, props.item.id)
  }
}

const debouncedStartEditing = debounce(startEdit, 300)
const debouncedConfirmChanges = debounce(handleSave, 300)
const debouncedCancelChanges = debounce(handleCancel, 300)
const debouncedDeleteItem = debounce(deleteItem, 300)
const debouncedToggleCompleted = debounce(toggleItem, 300)
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
  position: relative; /* 为序号定位做准备 */
}

.item-index {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  font-size: 11px;
  font-weight: 700;
  color: var(--primary-color);
  background: rgba(var(--primary-color-rgb, 74, 144, 226), 0.15);
  border-radius: 4px;
  padding: 2px 6px;
  margin-right: 6px;
  opacity: 0.9;
  transition: all 0.2s ease;
  border: 1px solid rgba(var(--primary-color-rgb, 74, 144, 226), 0.3);
  flex-shrink: 0; /* 防止序号被压缩 */
}

.item:hover .item-index {
  opacity: 1;
  color: #fff;
  background: var(--primary-color);
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  border-color: var(--primary-color);
  transform: scale(1.05);
}

/* ========== 各主题序号差异化样式 ========== */

/* 默认主题 - 现代渐变风格 */
body.theme-default .item-index {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(118, 75, 162, 0.2) 100%);
  border: 1px solid rgba(102, 126, 234, 0.4);
  border-radius: 6px;
  color: #667eea;
  font-weight: 600;
}

body.theme-default .item:hover .item-index {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #ffffff;
  border-color: #667eea;
  box-shadow: 0 3px 8px rgba(102, 126, 234, 0.4);
}

/* 手绘主题 - 不规则手绘风格 */
body.theme-paper .item-index {
  background: #fffef9;
  border: 2px solid #41403e;
  border-radius: 255px 15px 225px 15px / 15px 225px 15px 255px;
  color: #2c2416;
  font-family: 'Patrick Hand', cursive, sans-serif;
  font-weight: 400;
  box-shadow: 2px 2px 0 rgba(0, 0, 0, 0.1);
}

body.theme-paper .item:hover .item-index {
  background: #86a361;
  color: #fffef9;
  border-color: #2c2416;
  transform: scale(1.08);
  box-shadow: 3px 3px 0 rgba(0, 0, 0, 0.15);
}

/* 暗黑主题 - 荧光发光效果 */
body.theme-dark .item-index {
  background: rgba(0, 217, 255, 0.1);
  border: 1px solid #00d9ff;
  border-radius: 4px;
  color: #00d9ff;
  font-weight: 700;
  box-shadow: 0 0 8px rgba(0, 217, 255, 0.3);
  text-shadow: 0 0 4px rgba(0, 217, 255, 0.5);
}

body.theme-dark .item:hover .item-index {
  background: #00d9ff;
  color: #1a1d29;
  border-color: #00d9ff;
  box-shadow: 0 0 15px rgba(0, 217, 255, 0.6), 0 0 30px rgba(0, 217, 255, 0.3);
  text-shadow: none;
}

/* 柔和主题 - 圆润马卡龙风格 */
body.theme-soft .item-index {
  background: linear-gradient(135deg, #ffd4ea 0%, #e6d9ff 100%);
  border: 2px solid #ff9ecd;
  border-radius: 50%;
  color: #ff9ecd;
  font-weight: 600;
  min-width: 20px;
  height: 20px;
  box-shadow: 0 2px 8px rgba(255, 158, 205, 0.2);
}

body.theme-soft .item:hover .item-index {
  background: linear-gradient(135deg, #ff9ecd 0%, #c4b0ff 100%);
  color: #ffffff;
  border-color: #ff9ecd;
  transform: scale(1.15);
  box-shadow: 0 4px 12px rgba(255, 158, 205, 0.4);
}

/* 像素主题 - 8位像素方块风格 */
body.theme-pixel .item-name {
  align-items: normal;
}

body.theme-pixel .item-index {
  background: #008080;
  border: 2px solid #202020;
  border-radius: 0;
  color: #ffffff;
  font-weight: 700;
  font-family: 'Courier New', monospace;
  min-width: 20px;
  height: 20px;
  line-height: 20px; /* 添加行高确保垂直居中 */
  padding: 0 6px; /* 调整内边距 */
  box-shadow: 2px 2px 0 #404040;
  image-rendering: pixelated;
}

body.theme-pixel .item:hover .item-index {
  background: #00a0a0;
  color: #ffffff;
  border-color: #000000;
  transform: scale(1.05);
  box-shadow: 3px 3px 0 #606060;
}

/* 极简主题 - 纯净线条感 */
body.theme-minimal .item-index {
  background: transparent;
  border: 1px solid #cccccc;
  border-radius: 50%;
  color: #666666;
  font-weight: 300;
  min-width: 20px;
  height: 20px;
  font-size: 10px;
}

body.theme-minimal .item:hover .item-index {
  background: #000000;
  color: #ffffff;
  border-color: #000000;
  font-weight: 500;
  transform: scale(1.1);
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
  display: flex;
  align-items: center; /* 让序号和文字垂直居中对齐 */
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
  gap: 4px; /* 行之间的间距 */
}

.detail-row {
  display: flex;
  align-items: baseline;
  line-height: 1.6;
  gap: 4px;
  flex-wrap: wrap; /* 允许换行，但尽量避免 */
}

.detail-icon {
  flex-shrink: 0; /* 图标不收缩 */
  font-size: 1em;
}

.detail-label {
  flex-shrink: 0; /* 标签不收缩 */
  color: var(--text-primary);
  font-weight: 500;
}

.detail-value {
  flex: 1;
  min-width: 0; /* 允许收缩 */
  color: var(--text-primary);
  font-weight: 500;
  word-break: break-word; /* 长文本可以断行 */
}

.item-quantity {
  color: var(--text-primary);
}

.item-weight {
  color: var(--text-primary);
}

.total-weight {
  color: var(--text-secondary);
  font-weight: 400;
  font-size: 0.9em;
  white-space: nowrap; /* 总重尽量不换行 */
}

.item-price {
  color: var(--text-primary);
}

.total-price {
  color: var(--text-secondary);
  font-weight: 400;
  font-size: 0.9em;
  white-space: nowrap; /* 总价尽量不换行 */
}

.item-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

// 下拉菜单容器
.actions-dropdown {
  position: relative;
  display: inline-block;

  &:hover .actions-menu,
  .actions-menu:hover {
    display: block;
    animation: dropdownFadeIn 0.2s ease;
  }

  &:hover .actions-menu-btn {
    background: var(--primary-color);
    color: white;
  }

  // 扩展hover区域，确保鼠标在按钮和菜单之间移动时不会断开
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

// 三个点按钮
.actions-menu-btn {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 6px;
  background: var(--bg-input);
  color: var(--text-primary);
  font-size: 1.2rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;

  &:hover {
    background: var(--primary-color);
    color: white;
  }
}

// 下拉菜单
.actions-menu {
  display: none;
  position: absolute;
  right: 0;
  top: 100%;
  margin-top: 0; /* 无间隙，直接连接 */
  min-width: 120px;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  padding: 4px 0;
  z-index: 100;
  padding-top: 4px; /* 顶部留一点呼吸空间 */
}

// 菜单项
.actions-menu-item {
  display: block;
  padding: 8px 16px;
  font-size: 0.9rem;
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
}

@keyframes dropdownFadeIn {
  from {
    opacity: 0;
    transform: translateY(-5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
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

