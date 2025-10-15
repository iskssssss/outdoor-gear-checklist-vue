<template>
  <div class="base-table-wrapper">
    <div v-if="$slots.header || title" class="table-header">
      <slot name="header">
        <h3 class="table-title">{{ title }}</h3>
      </slot>
      <div v-if="$slots.actions" class="table-actions">
        <slot name="actions"></slot>
      </div>
    </div>
    
    <div class="table-container" :class="{ 'scrollable': scrollable }">
      <table :class="tableClasses">
        <!-- 表头 -->
        <thead v-if="columns.length > 0">
          <tr>
            <th
              v-for="(column, index) in columns"
              :key="index"
              :style="{ width: column.width, textAlign: column.align || 'left' }"
              :class="{ 'sortable': column.sortable }"
              @click="column.sortable ? handleSort(column) : null"
            >
              {{ column.label }}
              <span v-if="column.sortable" class="sort-icon">
                {{ getSortIcon(column.key) }}
              </span>
            </th>
          </tr>
        </thead>
        
        <!-- 表头插槽（自定义） -->
        <thead v-else-if="$slots.thead">
          <slot name="thead"></slot>
        </thead>
        
        <!-- 表体 -->
        <tbody v-if="data.length > 0">
          <tr
            v-for="(row, rowIndex) in sortedData"
            :key="rowIndex"
            :class="{ 'clickable': rowClickable }"
            @click="rowClickable ? $emit('row-click', row, rowIndex) : null"
          >
            <td
              v-for="(column, colIndex) in columns"
              :key="colIndex"
              :style="{ textAlign: column.align || 'left' }"
            >
              <slot :name="`cell-${column.key}`" :row="row" :value="row[column.key]" :index="rowIndex">
                {{ row[column.key] }}
              </slot>
            </td>
          </tr>
        </tbody>
        
        <!-- 表体插槽（自定义） -->
        <tbody v-else-if="$slots.tbody">
          <slot name="tbody"></slot>
        </tbody>
        
        <!-- 空数据 -->
        <tbody v-else>
          <tr>
            <td :colspan="columns.length" class="empty-row">
              <slot name="empty">
                <div class="empty-state">
                  <span class="empty-icon">📋</span>
                  <p>暂无数据</p>
                </div>
              </slot>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <!-- 底部分页或操作 -->
    <div v-if="$slots.footer" class="table-footer">
      <slot name="footer"></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

interface TableColumn {
  key: string
  label: string
  width?: string
  align?: 'left' | 'center' | 'right'
  sortable?: boolean
}

interface Props {
  // 表格标题
  title?: string
  // 列配置
  columns?: TableColumn[]
  // 数据
  data?: Record<string, any>[]
  // 是否带边框
  bordered?: boolean
  // 是否带斑马纹
  striped?: boolean
  // 是否可悬浮
  hoverable?: boolean
  // 行是否可点击
  rowClickable?: boolean
  // 是否可滚动
  scrollable?: boolean
  // 尺寸
  size?: 'sm' | 'md' | 'lg'
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  columns: () => [],
  data: () => [],
  bordered: true,
  striped: true,
  hoverable: true,
  rowClickable: false,
  scrollable: false,
  size: 'md'
})

const emit = defineEmits<{
  'row-click': [row: Record<string, any>, index: number]
  'sort': [key: string, order: 'asc' | 'desc']
}>()

const sortKey = ref('')
const sortOrder = ref<'asc' | 'desc'>('asc')

const tableClasses = computed(() => [
  'base-table',
  `table-${props.size}`,
  {
    'table-bordered': props.bordered,
    'table-striped': props.striped,
    'table-hoverable': props.hoverable
  }
])

const sortedData = computed(() => {
  if (!sortKey.value) return props.data
  
  return [...props.data].sort((a, b) => {
    const aVal = a[sortKey.value]
    const bVal = b[sortKey.value]
    
    if (aVal === bVal) return 0
    
    const compare = aVal < bVal ? -1 : 1
    return sortOrder.value === 'asc' ? compare : -compare
  })
})

function handleSort(column: TableColumn) {
  if (sortKey.value === column.key) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortKey.value = column.key
    sortOrder.value = 'asc'
  }
  emit('sort', column.key, sortOrder.value)
}

function getSortIcon(key: string) {
  if (sortKey.value !== key) return '↕'
  return sortOrder.value === 'asc' ? '↑' : '↓'
}
</script>

<style scoped lang="scss">
/* ========== 表格包装器 ========== */
.base-table-wrapper {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  width: 100%;
}

/* ========== 表格头部 ========== */
.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md) 0;
}

.table-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
}

.table-actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

/* ========== 表格容器 ========== */
.table-container {
  width: 100%;
  overflow-x: auto;

  &.scrollable {
    max-height: 600px;
    overflow-y: auto;
  }
}

/* ========== 基础表格样式 ========== */
.base-table {
  width: 100%;
  border-collapse: collapse;
  background: var(--bg-card);
  border-radius: var(--radius-md);
  overflow: hidden;

  th,
  td {
    text-align: left;
    vertical-align: middle;
    color: var(--text-primary);
    border: var(--border-width) solid var(--border-color);
  }

  th {
    background: var(--primary-color);
    color: var(--btn-primary-text);
    font-weight: var(--font-weight-bold);
    user-select: none;

    &.sortable {
      cursor: pointer;
      transition: background 0.2s ease;

      &:hover {
        background: var(--primary-dark);
      }
    }
  }

  .sort-icon {
    margin-left: var(--spacing-xs);
    opacity: 0.7;
  }
}

/* ========== 尺寸变体 ========== */
.table-sm {
  th,
  td {
    padding: var(--spacing-xs) var(--spacing-sm);
    font-size: 0.875rem;
  }
}

.table-md {
  th,
  td {
    padding: var(--spacing-sm) var(--spacing-md);
    font-size: 1rem;
  }
}

.table-lg {
  th,
  td {
    padding: var(--spacing-md) var(--spacing-lg);
    font-size: 1.125rem;
  }
}

/* ========== 边框样式 ========== */
.table-bordered {
  border: var(--border-width) solid var(--border-color);
}

/* ========== 斑马纹 ========== */
.table-striped {
  tbody tr:nth-child(even) {
    background: var(--bg-input);
  }
}

/* ========== 可悬浮 ========== */
.table-hoverable {
  tbody tr {
    transition: background 0.2s ease;

    &:hover {
      background: var(--bg-hover);
    }
  }
}

/* ========== 可点击行 ========== */
tr.clickable {
  cursor: pointer;

  &:active {
    transform: scale(0.99);
  }
}

/* ========== 空状态 ========== */
.empty-row {
  text-align: center;
  padding: var(--spacing-3xl) !important;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-md);
  color: var(--text-muted);

  .empty-icon {
    font-size: 3rem;
    opacity: 0.5;
  }

  p {
    margin: 0;
    font-size: 1rem;
  }
}

/* ========== 表格底部 ========== */
.table-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md) 0;
}
</style>

