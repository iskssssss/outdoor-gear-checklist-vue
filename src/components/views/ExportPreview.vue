<template>
  <div ref="exportContent" class="export-preview" :style="previewStyle">
    <div class="export-header">
      <h1>🏔️ 户外装备清单</h1>
    </div>

    <!-- 装备统计 -->
    <div class="export-stats">
      <div class="stats-grid">
        <BaseStatCard
          :number="equipmentStore.totalCategories"
          label="装备分类"
          variant="primary"
        />
        <BaseStatCard
          :number="equipmentStore.totalItems"
          label="装备总数"
          variant="info"
        />
        <BaseStatCard
          :number="equipmentStore.completedItems"
          label="已准备"
          variant="success"
        />
        <BaseStatCard
          :number="equipmentStore.remainingItems"
          label="待准备"
          variant="warning"
        />
        <BaseStatCard
          :number="equipmentStore.totalWeight"
          label="总重量"
          variant="default"
        />
        <BaseStatCard
          :number="equipmentStore.totalPrice"
          label="总价格"
          variant="default"
        />
      </div>
    </div>

    <div class="export-body">
      <div class="categories-grid" v-if="validCategories.length > 0" :class="{
        'grid-cols-1': gridColumns === 1,
        'grid-cols-2': gridColumns === 2,
        'grid-cols-3': gridColumns === 3
      }">
        <div v-for="category in validCategories" :key="category.id" class="category">
          <div class="category-header">
            <div class="category-title">
              <span class="category-icon-export">{{ category.icon || '✨' }}</span>
              {{ category.name }}
            </div>
          </div>
          <div class="category-content">
            <div class="items-list">
              <div v-for="item in category.items" :key="item.id" class="item" :class="{ completed: item.completed }">
                <div class="item-status">
                  {{ item.completed ? '✅' : '⭕' }}
                </div>
                <div class="item-info">
                  <span class="item-name">{{ item.name }}</span>
                  <span class="item-details">
                    {{ item.quantity }}{{ item.quantityUnit }} · {{ item.weight }}{{ item.weightUnit }}
                    <template v-if="item.price && item.price > 0">
                      · {{ item.price }}{{ item.priceUnit || '人民币' }}
                    </template>
                  </span>
                  <span v-if="item.notes && item.notes.trim()" class="item-notes">
                    📝 {{ item.notes }}
                  </span>
                  <span v-if="item.priority && item.priority !== 'medium'" class="item-priority"
                    :class="`priority-${item.priority}`">
                    {{ getPriorityLabel(item.priority) }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <p v-else class="no-data-message">暂无装备数据可导出</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useEquipmentStore } from '@/stores/equipment.ts'
import { BaseStatCard } from '@/components/common'

const equipmentStore = useEquipmentStore()

const props = defineProps({
  categories: {
    type: Array,
    required: true
  },
  exportWidth: {
    type: Number,
    default: 600 // 进一步减小导出卡片的默认宽度
  }
})

const exportContent = ref(null)

// 获取优先级标签
const getPriorityLabel = (priority) => {
  const labels = {
    high: '⚠️ 重要',
    low: '💡 可选'
  }
  return labels[priority] || priority
}

// 过滤和验证分类数据，确保所有分类都有items属性且不为空
const validCategories = computed(() => {
  if (!props.categories || !Array.isArray(props.categories)) {
    return []
  }
  return props.categories.filter(category => {
    return category &&
      category.items &&
      Array.isArray(category.items) &&
      category.items.length > 0
  })
})

// 计算预览容器的样式
const previewStyle = computed(() => ({
  width: `${props.exportWidth}px`
}))

// 根据有效分类数量动态调整网格列数（最多3列）
const gridColumns = computed(() => {
  const count = validCategories.value.length
  // 分类数量小于3时，显示实际数量的列；大于等于3时，固定显示3列
  return Math.min(count, 3)
})

// 瀑布流网格样式
const gridStyle = computed(() => ({
  columnCount: gridColumns.value,
  WebkitColumnCount: gridColumns.value, // Safari 兼容
  MozColumnCount: gridColumns.value     // Firefox 兼容
}))

// 暴露 ref 给父组件
defineExpose({
  exportContent
})
</script>

<style scoped lang="scss">
@use "../../assets/styles/_mixins" as *;
/* 引入mixin */

.export-preview {
  font-family: var(--font-family-base, 'PingFang SC', 'Microsoft YaHei', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif);
  background: var(--bg-main);
  padding: 24px;
  min-height: 100vh;
  background-color: var(--bg-card);
  display: flex;
  flex-direction: column;
  align-items: center;
  /* 居中内容 */
  /* text-align: center; 移除全局文本居中 */
  box-sizing: border-box;
}

.export-header {
  text-align: center;
  margin-top: 30px;
  margin-bottom: 40px;
  padding-bottom: 20px;
  border-bottom: var(--border-width-lg) solid var(--border-color);

  h1 {
    font-family: var(--font-family-heading, 'PingFang SC', 'Microsoft YaHei');
    font-size: 2.2rem;
    margin: 0;
    font-weight: 600;
    color: var(--text-primary);
    letter-spacing: 0.5px;
  }
}

.export-stats {
  margin-bottom: 32px;
  padding-bottom: 20px;
  border-bottom: var(--border-width) dashed var(--border-color);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 16px;
}

// BaseStatCard 已接管统计卡片样式

.export-body {
  display: flex;
  flex-direction: column;
  width: 100%;
  align-items: center;
  /* 居中内容 */
  margin-top: 20px;
}

.categories-grid {
  display: grid;
  gap: 20px;
  width: 100%;
  max-width: 100%;
  align-items: start;
}

.categories-grid.grid-cols-1 {
  grid-template-columns: 1fr;
}

.categories-grid.grid-cols-2 {
  grid-template-columns: repeat(2, 1fr);
}

.categories-grid.grid-cols-3 {
  grid-template-columns: repeat(3, 1fr);
}

.category {
  background: var(--bg-card);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-card);
  overflow: hidden;
  border: var(--border-width, 1px) solid var(--border-color, transparent);
  margin-bottom: 20px;
}

.category-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: var(--bg-gradient, linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%));
  color: var(--text-white);
  margin-bottom: 12px;
}

.category-title {
  flex: 1;
  font-size: 1.1rem;
  font-weight: 600;
  display: flex;
  /* 确保图标和文本在一行 */
  align-items: center;
  gap: 10px;
  /* 图标与文本的间距 */
  letter-spacing: 0.3px;
}

.category-icon-export {
  font-size: 1.1rem;
  /* 调整图标大小 */
  line-height: 1;
  flex-shrink: 0;
  /* 防止图标被挤压 */
}

.category-content {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.items-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  background: var(--bg-input);
  border-radius: var(--border-radius, 8px);
  border: var(--border-width, 1px) solid transparent;
  box-sizing: border-box;
  transition: all 0.3s ease;
}

// 已完成项不再有特殊样式，只通过左边图标区分

.item-status {
  font-size: 1.5rem;
  flex-shrink: 0;
  line-height: 1;
}

.item-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  /* 装备项内容左对齐 */
  text-align: left;
  /* 确保文本左对齐 */
  gap: 4px;
}

.item-name {
  font-weight: 500;
  color: var(--text-primary);
  font-size: 1rem;
  word-wrap: break-word;
}

// 移除已完成项的删除线和颜色变化
// .item.completed .item-name {
//   text-decoration: line-through;
//   color: var(--text-muted, #6c757d);
// }

.item-details {
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.item-notes {
  font-size: 0.8rem;
  color: var(--text-secondary);
  font-style: italic;
  margin-top: 4px;
  display: block;
  line-height: 1.4;
  opacity: 0.85;
}

.item-priority {
  display: inline-block;
  font-size: 0.75rem;
  padding: 2px 8px;
  border-radius: 4px;
  margin-top: 4px;
  font-weight: 500;

  &.priority-high {
    background: var(--danger-light);
    color: var(--danger-color);
    border: 1px solid var(--danger-color);
  }

  &.priority-low {
    background: var(--primary-light);
    color: var(--primary-color);
    border: 1px solid var(--primary-color);
  }
}

.no-data-message {
  text-align: center;
  color: var(--text-muted);
  font-size: 1.2rem;
  margin: 40px 0;
  padding: 20px;
  background: var(--bg-input);
  border-radius: var(--border-radius, 8px);
  border: var(--border-width) dashed var(--border-color);
}
</style>
