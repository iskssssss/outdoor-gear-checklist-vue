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
              :aria-sort="sortKey === column.key ? (sortOrder === 'asc' ? 'ascending' : 'descending') : 'none'"
            >
              <template v-if="column.headerRender">
                <component :is="column.headerRender(column)" />
              </template>
              <template v-else>
                {{ column.label }}
              </template>
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
              <template v-if="column.render">
                <component :is="column.render(row, column, getNestedValue(row, column.key), rowIndex)" />
              </template>
              <template v-else>
                <slot :name="`cell-${column.key}`" :row="row" :value="getNestedValue(row, column.key)" :index="rowIndex">
                  {{ getNestedValue(row, column.key) }}
                </slot>
              </template>
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
  /**
   * 列的唯一标识符，用于访问数据和排序。
   * 支持嵌套路径，如 'user.name'。
   */
  key: string
  /**
   * 列的显示名称。
   */
  label: string
  /**
   * 列的宽度，可以是 CSS 宽度值。
   */
  width?: string
  /**
   * 列内容的对齐方式。
   * @values 'left' | 'center' | 'right'
   * @default 'left'
   */
  align?: 'left' | 'center' | 'right'
  /**
   * 是否允许该列排序。
   * @default false
   */
  sortable?: boolean
  /**
   * 自定义排序函数。接收两个行数据，返回比较结果。
   */
  sorter?: (a: Record<string, any>, b: Record<string, any>) => number;
  /**
   * 自定义单元格渲染函数。接收当前行、列和值，返回 VNode。
   */
  render?: (row: Record<string, any>, column: TableColumn, value: any, index: number) => any;
  /**
   * 自定义表头渲染函数。接收当前列，返回 VNode。
   */
  headerRender?: (column: TableColumn) => any;
}

interface Props {
  /**
   * 表格的标题。
   */
  title?: string
  /**
   * 表格的列配置数组。
   */
  columns?: TableColumn[]
  /**
   * 表格的数据数组。
   */
  data?: Record<string, any>[]
  /**
   * 是否显示表格边框。
   * @default true
   */
  bordered?: boolean
  /**
   * 是否显示斑马纹。
   * @default true
   */
  striped?: boolean
  /**
   * 是否在鼠标悬浮时显示行高亮效果。
   * @default true
   */
  hoverable?: boolean
  /**
   * 行是否可点击，会触发 'row-click' 事件。
   * @default false
   */
  rowClickable?: boolean
  /**
   * 是否允许表格内容垂直滚动。
   * @default false
   */
  scrollable?: boolean
  /**
   * 表格的尺寸。
   * @values 'sm' | 'md' | 'lg'
   * @default 'md'
   */
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

const sortKey = ref<string>('')
const sortOrder = ref<'asc' | 'desc'>('asc')

/**
 * 安全地获取对象的嵌套属性值。
 * @param obj 源对象
 * @param key 属性路径，可以是 'a.b.c' 形式
 * @returns 嵌套属性的值或 undefined
 */
function getNestedValue(obj: Record<string, any>, key: string): any {
  return key.split('.').reduce((acc, part) => acc && acc[part], obj);
}

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

  const currentColumn = props.columns?.find(col => col.key === sortKey.value)
  if (!currentColumn) return props.data
  
  return [...props.data].sort((a, b) => {
    if (currentColumn.sorter) {
      return sortOrder.value === 'asc' ? currentColumn.sorter(a, b) : -currentColumn.sorter(a, b)
    }
    
    const aVal = getNestedValue(a, sortKey.value)
    const bVal = getNestedValue(b, sortKey.value)
    
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
    background: var(--bg-table-header); /* 使用语义化变量 */
    color: var(--text-on-table-header); /* 使用语义化变量 */
    font-weight: var(--font-weight-bold);
    user-select: none;

    &.sortable {
      cursor: pointer;
      transition: background 0.2s ease;

      &:hover {
        background: var(--bg-table-header-hover); /* 使用语义化变量 */
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

