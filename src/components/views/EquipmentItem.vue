<template>
  <div v-if="!isEditingForm" class="item" :class="{ completed: completed }" @click="debouncedToggleCompleted">
    <!-- <div class="item-status">
      {{ completed ? '✅' : '⭕' }}
    </div> -->
    <div class="item-info">
      <span class="item-name">
        <span class="item-index" v-if="itemIndex">{{ itemIndex }}</span>
        {{ item?.name }}
        <BaseBadge v-if="item?.isRecommended" variant="info" icon="🤖" size="sm">推荐</BaseBadge>
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
              <span v-if="totalWeight > 0" class="total-weight">（总重: {{ formatNumber(totalWeight, 1) }}{{
                item.weightUnit }}）</span>
            </span>
          </span>
          <span v-if="item.price > 0" class="detail-row item-price">
            <span class="detail-icon">💰</span>
            <span class="detail-label">价格:</span>
            <span class="detail-value">
              {{ formatPrice(item.price) }}{{ item.priceUnit }}
              <span v-if="totalPrice > 0" class="total-price">（总价: {{ formatPrice(totalPrice) }}{{ item.priceUnit
                }}）</span>
            </span>
          </span>
        </template>
      </span>
    </div>
    <div v-if="!completed && !isAdding" class="item-actions" @click.stop>
      <BaseButtonDropdown text="⋯" size="sm" placement="bottom-end" class="actions-menu-btn">
        <BaseDropdownItem icon="✏️" @click="debouncedStartEditing">修改</BaseDropdownItem>
        <BaseDropdownItem icon="🗑️" danger @click="debouncedDeleteItem">删除</BaseDropdownItem>
      </BaseButtonDropdown>
    </div>
  </div>

  <div v-else class="item editing">
    <div class="add-item-input-container">
      <BaseInput v-model="editingData.name" ref="editNameInput"
        :placeholder="isAdding ? '输入装备名称' : '装备名称'" />
      <div class="add-item-details">
        <div class="add-item-field">
          <label>重量:</label>
          <BaseInput type="number" v-model.number="editingData.weight" />
          <BaseSelect v-model="editingData.weightUnit" :options="[
            { label: 'g', value: 'g' },
            { label: 'kg', value: 'kg' },
            { label: '斤', value: '斤' },
            { label: '磅', value: '磅' }
          ]" />
        </div>
        <div class="add-item-field">
          <label>数量:</label>
          <BaseInput type="number" v-model.number="editingData.quantity" />
          <BaseSelect v-model="editingData.quantityUnit" :options="[
            { label: '个', value: '个' },
            { label: '件', value: '件' },
            { label: '双', value: '双' },
            { label: '套', value: '套' },
            { label: '瓶', value: '瓶' }
          ]" />
        </div>
        <div class="add-item-field">
          <label>价格:</label>
          <BaseInput type="number" v-model.number="editingData.price" />
          <BaseSelect v-model="editingData.priceUnit" :options="[
            { label: '人民币', value: '人民币' },
            { label: '美元', value: '美元' },
            { label: '英镑', value: '英镑' },
            { label: '日元', value: '日元' }
          ]" />
        </div>
      </div>
      <div class="add-item-button-container">
        <BaseButton class="add-item-button" variant="primary" icon="✓" @click="debouncedConfirmChanges">{{ isAdding ? '确认添加' : '确认修改' }}</BaseButton>
        <BaseButton class="add-item-button cancel" variant="secondary" icon="✕" @click="debouncedCancelChanges">取消</BaseButton>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick, computed, inject } from 'vue'
import { useEquipmentStore } from '@/stores/equipment.ts'
import { useDebounceFn } from '@vueuse/core'
import { BaseButton, BaseInput, BaseSelect, BaseButtonDropdown, BaseDropdownItem, BaseBadge } from '@/components/common'

const props = defineProps({
  item: {
    type: Object,
    // Not required if isAdding is true
    required: false
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

const debouncedStartEditing = useDebounceFn(startEdit, 300)
const debouncedConfirmChanges = useDebounceFn(handleSave, 300)
const debouncedCancelChanges = useDebounceFn(handleCancel, 300)
const debouncedDeleteItem = useDebounceFn(deleteItem, 300)
const debouncedToggleCompleted = useDebounceFn(toggleItem, 300)
</script>

<style scoped lang="scss">
.item {
  display: flex;
  // 将align-items改为flex-start
  align-items: flex-start;
  // 减小间距
  gap: 8px;
  padding: 12px 16px;
  background: var(--bg-input);
  border-radius: var(--border-radius);
  cursor: pointer;
  transition: all 0.3s ease;
  border: var(--border-width-lg) solid transparent;
  width: 100%;
  // 为序号定位做准备
  position: relative;
}

.item-index {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  font-size: var(--font-size-xs);
  font-weight: 700;
  color: var(--primary-color);
  background: var(--primary-color-bg-light);
  border-radius: var(--border-radius-sm);
  padding: 2px 6px;
  margin-right: 6px;
  opacity: 0.9;
  transition: all 0.2s ease;
  border: var(--border-width) solid var(--primary-color-border);
  // 防止序号被压缩
  flex-shrink: 0;
}

.item:hover .item-index {
  opacity: 1;
  color: var(--text-white);
  background: var(--primary-color);
  box-shadow: var(--shadow-sm);
  border-color: var(--primary-color);
  transform: scale(1.05);
}

.item:hover {
  background: var(--bg-card);
  border-color: var(--primary-color);
}

.item.completed {
  opacity: 0.7;
  background: var(--success-light);
}

.item.completed:hover {
  background: var(--success-light);
  filter: brightness(0.95);
}

.item.editing {
  cursor: default;
  border-color: var(--primary-color);
  background: var(--bg-card);
  padding: 15px;
  box-sizing: border-box;
  // 确保占据父容器的100%宽度
  width: 100%;
}

.item.editing:hover {
  border-color: var(--primary-color);
}

.item-status {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.item-info {
  // 允许增长和收缩，并设置基础宽度
  flex: 1 1 auto;
  // 允许在必要时收缩到0
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.item-name {
  font-weight: 700;
  color: var(--text-primary);
  font-size: 1rem;
  display: flex;
  // 让序号和文字垂直居中对齐
  align-items: center;
}

.item.completed .item-name {
  text-decoration: line-through;
  color: var(--text-muted);
}

.item-details {
  font-size: 0.85rem;
  color: var(--text-secondary);
  // 允许文本换行
  white-space: normal;
  // 防止长单词溢出
  word-break: break-word;
  // 启用Flexbox布局
  display: flex;
  // 子元素垂直堆叠
  flex-direction: column;
  // 行之间的间距
  gap: 4px;
}

.detail-row {
  display: flex;
  align-items: baseline;
  line-height: 1.6;
  gap: 4px;
  // 允许换行，但尽量避免
  flex-wrap: wrap;
}

.detail-icon {
  // 图标不收缩
  flex-shrink: 0;
  font-size: 1em;
}

.detail-label {
  // 标签不收缩
  flex-shrink: 0;
  color: var(--text-primary);
  font-weight: 500;
}

.detail-value {
  flex: 1;
  // 允许收缩
  min-width: 0;
  color: var(--text-primary);
  font-weight: 500;
  // 长文本可以断行
  word-break: break-word;
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
  // 总重尽量不换行
  white-space: nowrap;
}

.item-price {
  color: var(--text-primary);
}

.total-price {
  color: var(--text-secondary);
  font-weight: 400;
  font-size: 0.9em;
  // 总价尽量不换行
  white-space: nowrap;
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

  &:hover :deep(.actions-menu-btn) {
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
    // 扩展10px的hover区域
    height: 10px;
    background: transparent;
  }
}

// 三个点按钮
:deep(.actions-menu-btn) {
  width: 32px;
  height: 32px;
  padding: 0;
  font-size: 1.2rem;
  font-weight: bold;

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
  // 无间隙，直接连接
  margin-top: 0;
  min-width: 120px;
  background: var(--bg-card);
  border: var(--border-width) solid var(--border-color);
  border-radius: var(--border-radius-sm);
  box-shadow: var(--shadow-lg);
  padding: 4px 0;
  z-index: 100;
  // 顶部留一点呼吸空间
  padding-top: 4px;
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

// BaseButton 已接管所有按钮样式

.add-item-input-container {
  display: flex;
  flex-direction: column;
  // 减小间距
  gap: 8px;
  width: 100%;
}

// BaseInput 已接管所有输入框样式

.add-item-details {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

@media (min-width: 480px) {
  /* 移除此媒体查询中的双列设置 */
  /* .add-item-details {
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  } */
}

.add-item-field {
  display: flex;
  align-items: center;
  // 减小间距
  gap: 4px;
}

.add-item-field label {
  font-weight: 500;
  color: var(--text-secondary);
  font-size: 0.9rem;
  width: auto;
  flex-shrink: 0;
}

.add-item-field input {
  // 允许输入框填充剩余空间
  flex: 1 1 auto;
  // 允许输入框在必要时收缩
  min-width: 0;
  padding: 8px 12px;
  border: var(--border-width-lg) solid var(--border-color);
  border-radius: var(--border-radius-sm);
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
  padding: 8px 4px;
  border: var(--border-width-lg) solid var(--border-color);
  border-radius: var(--border-radius-sm);
  font-size: 0.85rem;
  background: var(--bg-input);
  color: var(--text-primary);
  cursor: pointer;
  // 设置一个固定的单位选择框宽度
  width: 65px;
  flex-shrink: 0;
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

:deep(.add-item-button) {
  padding: 8px 20px;
  font-size: 0.9rem;
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

.recommended-badge {
  display: inline-block;
  margin-left: 8px;
  padding: 2px 8px;
  // 使用信息蓝色或默认蓝色
  background-color: var(--info-color);
  color: white;
  border-radius: var(--border-radius-lg);
  font-size: 0.75rem;
  font-weight: 600;
  vertical-align: middle;
  box-shadow: var(--shadow-sm);
}
</style>
