<template>
  <div class="table-view-container">
    <div v-if="!categories || categories.length === 0" class="no-data">
      没有可显示的分类数据。
    </div>
    <div v-else>
      <div class="tabs-container"
        :class="{ 'can-scroll-left': canScrollLeft, 'can-scroll-right': canScrollRight }">
        <div class="tabs" ref="tabsRef">
          <button
            v-for="category in categories"
            :key="category.id"
            class="tab-button"
            :class="{ 'active': selectedCategoryId === category.id }"
            @click="selectCategory(category.id)"
          >
            <span class="category-icon">{{ category.icon || '✨' }}</span>
            <span class="category-name">{{ category.name }}</span>
          </button>
        </div>
      </div>
      <div class="table-actions">
        <button v-if="!isEditing" @click="enterEditMode" class="btn-edit">✏️ 编辑</button>
        <template v-else>
          <button @click="saveChanges" class="btn-save">💾 保存</button>
          <button @click="cancelEdit" class="btn-cancel">❌ 取消</button>
          <button v-if="selectedCategory" @click="reindexDraftItems" class="btn-reindex">🔢 重新编码</button>
          <button @click="addNewDraftItem" class="btn-add">➕ 添加新装备</button>
        </template>
      </div>
      <div class="table-content">
        <table v-if="selectedCategory" class="equipment-table">
          <thead>
            <tr>
              <th>序号</th>
              <th>装备信息</th>
              <th>数量</th>
              <th>小计重量</th>
              <th>小计价格</th>
              <th>准备状态</th>
              <th v-if="isEditing">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in displayItems" :key="item.id">
              <td data-label="序号">{{ index + 1 }}</td>
              <td data-label="装备信息" class="item-details">
                <div class="item-name">
                  <input v-if="isEditing" type="text" v-model="item.name" />
                  <span v-else>{{ item.name }}</span>
                </div>
                <div class="item-meta">
                  <div class="meta-item">
                    <strong class="meta-label">重量:</strong>
                    <div v-if="isEditing" class="meta-inputs">
                      <input type="number" v-model.number="item.weight" class="meta-input" />
                      <input type="text" v-model="item.weightUnit" class="unit-input meta-unit-input" />
                    </div>
                    <span v-else class="meta-value">{{ item.weight }}{{ item.weightUnit }}</span>
                  </div>
                  <div class="meta-item">
                    <strong class="meta-label">价格:</strong>
                    <div v-if="isEditing" class="meta-inputs">
                      <input type="number" v-model.number="item.price" class="meta-input" />
                      <input type="text" v-model="item.priceUnit" class="unit-input meta-unit-input" />
                    </div>
                    <span v-else class="meta-value">{{ item.price }}{{ item.priceUnit }}</span>
                  </div>
                </div>
              </td>
              <td data-label="数量" class="quantity-cell">
                <div class="meta-inputs" v-if="isEditing">
                  <input type="number" v-model.number="item.quantity" class="quantity-input" />
                  <input type="text" v-model="item.quantityUnit" class="unit-input" />
                </div>
                <span v-else>{{ item.quantity }}{{ item.quantityUnit }}</span>
              </td>
              <td data-label="小计重量" class="subtotal">{{ (item.weight || 0) * (item.quantity || 0) }} {{ item.weightUnit }}</td>
              <td data-label="小计价格" class="subtotal">{{ ((item.price || 0) * (item.quantity || 0)).toFixed(2) }} {{ item.priceUnit }}</td>
              <td data-label="准备状态">
                <div class="status-switch" :class="{ 'completed': item.completed }" @click="toggleItemStatus(item)">
                  <div class="switch-handle"></div>
                </div>
              </td>
              <td v-if="isEditing" data-label="操作">
                <button @click="removeDraftItem(item.id)" class="btn-remove">删除</button>
              </td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <td colspan="3"><strong>总计</strong></td>
              <td>{{ totalWeight }} kg</td>
              <td :colspan="isEditing ? 3 : 2">{{ totalPrice }} 人民币</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, computed, nextTick, onUnmounted, onUpdated, inject } from 'vue'
import { useEquipmentStore } from '../../stores/equipment'
import { useOperationLogStore } from '../../stores/operationLog'

const props = defineProps({
  categories: {
    type: Array,
    required: true
  }
})

const toast = inject('toast')
const equipmentStore = useEquipmentStore()
const logStore = useOperationLogStore()
const selectedCategoryId = ref(null)
const isEditing = ref(false)
const draftItems = ref([]) // 草稿数据

const tabsContainerRef = ref(null)
const tabsRef = ref(null)
const canScrollLeft = ref(false)
const canScrollRight = ref(false)

// 选中的分类（响应式）
const selectedCategory = computed(() => {
  if (!selectedCategoryId.value) return null
  return props.categories.find(c => c.id === selectedCategoryId.value)
})

// 显示的数据：编辑模式下使用草稿，否则使用原始数据
const displayItems = computed(() => {
  if (!selectedCategory.value) return []
  return isEditing.value ? draftItems.value : selectedCategory.value.items
})

const totalWeight = computed(() => {
  const items = displayItems.value
  if (!items || items.length === 0) return 0
  const weightInGrams = items.reduce((sum, item) => {
    let weight = item.weight || 0
    switch (item.weightUnit) {
      case 'kg': weight *= 1000; break
      case '斤': weight *= 500; break
      case '磅': weight *= 453.592; break
    }
    return sum + weight * (item.quantity || 0)
  }, 0)
  return (weightInGrams / 1000).toFixed(2)
})

const totalPrice = computed(() => {
  const items = displayItems.value
  if (!items || items.length === 0) return 0
  return items.reduce((sum, item) => {
    let price = item.price || 0
    switch (item.priceUnit) {
      case '美元': price *= 7; break
      case '英镑': price *= 9; break
      case '日元': price *= 0.05; break
    }
    return sum + price * (item.quantity || 0)
  }, 0).toFixed(2)
})

const selectCategory = (categoryId) => {
  // 如果正在编辑，先取消编辑
  if (isEditing.value) {
    cancelEdit()
  }
  selectedCategoryId.value = categoryId
}

// 进入编辑模式
const enterEditMode = () => {
  if (!selectedCategory.value) return
  // 深拷贝当前分类的装备列表作为草稿
  draftItems.value = JSON.parse(JSON.stringify(selectedCategory.value.items))
  isEditing.value = true
}

// 保存修改
const saveChanges = () => {
  if (!selectedCategoryId.value || !selectedCategory.value) return
  
  // 保存操作前的状态
  const beforeState = {
    action: 'batchEditItems',
    categories: JSON.parse(JSON.stringify(equipmentStore.categories))
  }
  
  // 统计修改的项目数
  let modifiedCount = 0
  let addedCount = 0
  let deletedCount = 0
  
  const originalItems = selectedCategory.value.items
  const originalIds = new Set(originalItems.map(item => item.id))
  const draftIds = new Set(draftItems.value.map(item => item.id))
  
  // 检测新增的装备
  draftItems.value.forEach(draftItem => {
    if (!originalIds.has(draftItem.id)) {
      addedCount++
      equipmentStore.addItem(selectedCategoryId.value, draftItem)
    } else {
      // 检测是否有修改
      const originalItem = originalItems.find(item => item.id === draftItem.id)
      if (JSON.stringify(originalItem) !== JSON.stringify(draftItem)) {
        modifiedCount++
        equipmentStore.updateEquipment(selectedCategoryId.value, draftItem.id, draftItem)
      }
    }
  })
  
  // 检测删除的装备
  originalItems.forEach(originalItem => {
    if (!draftIds.has(originalItem.id)) {
      deletedCount++
      equipmentStore.removeItem(selectedCategoryId.value, originalItem.id)
    }
  })
  
  // 重新编码以确保序号连续
  equipmentStore.reindexCategory(selectedCategoryId.value)
  equipmentStore.saveData()
  
  // 记录操作日志
  const changes = []
  if (addedCount > 0) changes.push(`新增 ${addedCount} 个`)
  if (modifiedCount > 0) changes.push(`修改 ${modifiedCount} 个`)
  if (deletedCount > 0) changes.push(`删除 ${deletedCount} 个`)
  
  const actionDescription = changes.length > 0 
    ? `批量编辑装备：${changes.join('、')}` 
    : '批量编辑装备（无变化）'
  
  logStore.log('edit', actionDescription, {
    category: selectedCategory.value.name,
    added: addedCount,
    modified: modifiedCount,
    deleted: deletedCount
  }, beforeState)
  
  isEditing.value = false
  draftItems.value = []
  toast.success('修改已保存')
}

// 取消编辑
const cancelEdit = () => {
  isEditing.value = false
  draftItems.value = []
  toast.info('已取消编辑')
}

// 添加新装备到草稿
const addNewDraftItem = () => {
  if (!selectedCategoryId.value && props.categories.length > 0) {
    selectCategory(props.categories[0].id)
    enterEditMode()
  }

  if (!selectedCategoryId.value) {
    toast.warning('请先创建一个分类')
    return
  }

  const maxIndex = draftItems.value.reduce((max, item) => Math.max(max, item.index || 0), 0)
  const newItem = {
    id: Date.now() + Math.floor(Math.random() * 10000),
    index: maxIndex + 1,
    name: '',
    weight: 0,
    weightUnit: 'g',
    quantity: 1,
    quantityUnit: '个',
    price: 0,
    priceUnit: '人民币',
    completed: false
  }
  draftItems.value.push(newItem)
}

// 从草稿中删除装备
const removeDraftItem = (itemId) => {
  draftItems.value = draftItems.value.filter(item => item.id !== itemId)
}

// 重新编码草稿中的装备
const reindexDraftItems = () => {
  draftItems.value.forEach((item, index) => {
    item.index = index + 1
  })
  toast.success('重新编码完成')
}

// 切换装备状态（在展示模式下直接修改，编辑模式下修改草稿）
const toggleItemStatus = (item) => {
  if (isEditing.value) {
    // 编辑模式下，修改草稿
    const draftItem = draftItems.value.find(i => i.id === item.id)
    if (draftItem) {
      draftItem.completed = !draftItem.completed
    }
  } else {
    // 展示模式下，直接修改 store
    equipmentStore.toggleEquipmentStatus(selectedCategoryId.value, item.id)
  }
}

const checkScroll = () => {
  const el = tabsRef.value
  if (el) {
    canScrollLeft.value = el.scrollLeft > 0
    canScrollRight.value = el.scrollWidth > el.clientWidth && el.scrollLeft < el.scrollWidth - el.clientWidth
  }
}

const handleWheelScroll = (event) => {
  const el = tabsRef.value
  if (el && event.deltaY !== 0) {
    event.preventDefault()
    el.scrollLeft += event.deltaY
  }
}

watch(() => props.categories, () => {
  nextTick(() => {
    checkScroll()
  })
}, { deep: true, immediate: true })

onMounted(() => {
  if (tabsRef.value) {
    tabsRef.value.addEventListener('scroll', checkScroll)
    tabsRef.value.addEventListener('wheel', handleWheelScroll)
  }
  window.addEventListener('resize', checkScroll)
  checkScroll()
})

onUnmounted(() => {
  if (tabsRef.value) {
    tabsRef.value.removeEventListener('scroll', checkScroll)
    tabsRef.value.removeEventListener('wheel', handleWheelScroll)
  }
  window.removeEventListener('resize', checkScroll)
})

onUpdated(() => {
  checkScroll()
})

watch(() => props.categories, (newCategories) => {
  if (newCategories && newCategories.length > 0 && !selectedCategoryId.value) {
    selectCategory(newCategories[0].id)
  }
}, { immediate: true })

onMounted(() => {
  if (props.categories && props.categories.length > 0) {
    selectCategory(props.categories[0].id)
  }
})
</script>

<style scoped lang="scss">
.table-view-container {
  background: var(--bg-card);
  padding: 16px;
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-sm);
}

.tabs-container {
  position: relative;
  width: 100%;
  margin-bottom: 16px; /* Moved from .tabs */

  &::before,
  &::after {
    content: '';
    position: absolute;
    top: 0;
    bottom: 2px; /* Align with the border on .tabs */
    width: 30px;
    pointer-events: none;
    transition: opacity 0.3s;
    z-index: 1;
  }

  &::before {
    left: 0;
    background: linear-gradient(to right, var(--bg-card), transparent);
    opacity: 0;
  }

  &::after {
    right: 0;
    background: linear-gradient(to left, var(--bg-card), transparent);
    opacity: 0;
  }

  &.can-scroll-left::before {
    opacity: 1;
  }

  &.can-scroll-right::after {
    opacity: 1;
  }
}

.tabs {
  display: flex;
  /* margin-bottom: 16px; */ /* Removed */
  overflow-x: auto;
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none;  /* IE 10+ */
  border: var(--border-width) solid var(--border-color);
  border-radius: var(--border-radius-lg);
  padding: 4px;
  background-color: var(--bg-main);

  &::-webkit-scrollbar {
    display: none; /* Chrome, Safari, Opera */
  }
}

.tab-button {
  padding: 10px 12px;
  margin: 0 4px; /* 增加按钮之间的间距 */
  cursor: pointer;
  background: transparent;
  border: none;
  font-size: 1rem;
  color: var(--text-secondary);
  position: relative;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
  border-radius: var(--border-radius-sm);

  &:first-child {
    margin-left: 0; /* 第一个按钮左边不需要间距 */
  }

  &:last-child {
    margin-right: 0; /* 最后一个按钮右边不需要间距 */
  }

  &:hover {
    background-color: var(--bg-hover);
    color: var(--text-primary);
  }

  &.active {
    background-color: var(--primary-color);
    color: var(--btn-primary-text);
    font-weight: bold;
    box-shadow: var(--shadow-sm);
  }
}

.equipment-table {
  width: 100%;
  border-collapse: collapse;
  border-radius: var(--border-radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-sm);

  th {
    padding: 12px;
    text-align: center;
    vertical-align: middle;
    background-color: var(--bg-hover);
    color: var(--text-secondary);
    font-weight: 600;
    border-bottom: 2px solid var(--border-color);
  }

  td {
    border-bottom: var(--border-width) solid var(--border-color);
    padding: 12px;
    text-align: center;
    vertical-align: middle;
    background-color: var(--bg-card);
  }

  .status-switch {
    position: relative;
    width: 44px;
    height: 24px;
    background-color: var(--text-muted);
    border-radius: 12px;
    cursor: pointer;
    transition: background-color 0.3s ease;
    margin: 0 auto;

    &.completed {
      background-color: var(--success-color);
    }

    .switch-handle {
      position: absolute;
      top: 2px;
      left: 2px;
      width: 20px;
      height: 20px;
      background-color: #fff;
      border-radius: 50%;
      transition: transform 0.3s ease;
    }

    &.completed .switch-handle {
      transform: translateX(20px);
    }
  }

  tbody tr {
    transition: background-color 0.2s ease-in-out;

    &:hover {
      background-color: var(--bg-hover);
    }

    &:last-child td {
      border-bottom: none;
    }
  }

  input[type="text"],
  input[type="number"] {
    width: 100%;
    background-color: var(--bg-main);
    color: var(--text-primary);
    border: var(--border-width) solid var(--border-color);
    padding: 8px;
    border-radius: var(--border-radius-sm);
    transition: all 0.3s ease;
    text-align: center;
    position: relative; /* Add position for z-index to work */

    &:focus {
      outline: none;
      border-color: var(--primary-color);
      box-shadow: 0 0 0 3px var(--primary-color-shadow);
      z-index: 1; /* Ensure the focused input is on top */
    }
  }

  .subtotal {
    background-color: var(--bg-card);
    font-weight: bold;
    color: var(--text-secondary);
    font-style: italic;
  }

  tfoot {
    font-weight: bold;
    color: var(--text-primary);

    td {
      background-color: var(--bg-card);
      border-top: 2px solid var(--border-color);
    }
  }

  .quantity-cell {
    .meta-inputs {
      justify-content: center;
      width: 100px; /* Force a fixed width */
      margin: 0 auto; /* Center the container */
    }
  }

  .quantity-input {
    width: 50px;
  }

  .item-details {
    text-align: center;
    max-width: 300px;
  }

  .item-name {
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 8px;
  }

  .item-meta {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 2px;
    font-size: 0.85rem;
    color: var(--text-muted);
    flex-direction: column;
  }

  .meta-item {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }

  .meta-label {
    font-weight: 500;
    white-space: nowrap;
    line-height: 1.5;
    display: flex;
    align-items: center;
  }

  .meta-inputs {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 4px;
  }

  .meta-value {
    font-weight: 600;
    color: var(--text-secondary);
    line-height: 1.5;
    display: flex;
    align-items: center;
  }

  .meta-input {
    width: 80px;
    padding: 2px 4px;
    font-size: 0.85rem;
  }

  .meta-unit-input {
    width: 50px;
  }
}

.table-actions {
  margin-top: 16px;
  margin-bottom: 16px;
  display: flex;
  gap: 10px;
}

.btn-add,
.btn-remove,
.btn-reindex,
.btn-edit,
.btn-save,
.btn-cancel {
  padding: 8px 12px;
  border: var(--border-width) solid transparent;
  border-radius: var(--border-radius-sm);
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
  }
}

.btn-add {
  background-color: var(--primary-color);
  color: var(--btn-primary-text);

  &:hover {
    background-color: var(--primary-dark);
  }
}

.btn-edit {
  background-color: transparent;
  color: var(--primary-color);
  border-color: var(--primary-color);

  &:hover {
    background-color: var(--primary-color);
    color: var(--btn-primary-text);
  }
}

.btn-save {
  background-color: var(--success-color);
  color: #fff;

  &:hover {
    background-color: var(--success-dark);
  }
}

.btn-cancel {
  background-color: var(--text-muted);
  color: #fff;

  &:hover {
    background-color: var(--danger-color);
  }
}

.btn-reindex {
  background-color: var(--secondary-color);
  color: var(--btn-secondary-text);

  &:hover {
    background-color: var(--secondary-dark);
  }
}

.btn-remove {
  background-color: var(--danger-color);
  color: var(--btn-danger-text);

  &:hover {
    background-color: var(--danger-dark);
  }
}

@media (max-width: 768px) {
  .equipment-table {
    border: none;
    border-spacing: 0;

    thead {
      display: none;
    }

    tr {
      display: block;
      border: var(--border-width) solid var(--border-color);
      border-radius: var(--border-radius-lg);
      margin-bottom: 1em;
      box-shadow: var(--shadow-sm);

      &:hover {
        transform: none;
        box-shadow: var(--shadow-md);
      }
    }

    td {
      display: block;
      text-align: right;
      border-bottom: 1px dotted var(--border-color);
      position: relative;
      padding-left: 50%;
      background-color: transparent;

      &:first-child {
        border-top-left-radius: 0;
        border-top-right-radius: 0;
      }

      &:last-child {
        border-bottom-left-radius: 0;
        border-bottom-right-radius: 0;
        border-bottom: none;
      }

      &::before {
        content: attr(data-label);
        position: absolute;
        left: 10px;
        width: calc(50% - 20px);
        padding-right: 10px;
        white-space: nowrap;
        text-align: left;
        font-weight: bold;
      }
    }
  }
}

.no-data {
  text-align: center;
  padding: 20px;
  color: var(--text-muted);
}
</style>
