<template>
  <div class="transport-page">
    <!-- 页面头部 -->
    <div class="transport-header">
      <div class="header-content">
        <h1 class="page-title">
          <span class="title-icon">🚗</span>
          交通规划
        </h1>
        <p class="page-subtitle">规划您的出行路线，管理交通费用</p>
      </div>
      
      <!-- 快速操作按钮 -->
      <div class="header-actions">
        <BaseButton variant="primary" @click="showAddRouteModal = true">
          <span class="btn-icon">➕</span>
          新建路线
        </BaseButton>
        <BaseButton variant="outline" @click="showBudgetModal = true">
          <span class="btn-icon">💰</span>
          预算管理
        </BaseButton>
        <BaseButton variant="outline" @click="createTestData" class="test-btn">
          <span class="btn-icon">🧪</span>
          创建测试数据
        </BaseButton>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-section">
      <div class="stats-grid">
        <BaseStatCard
          title="总路线数"
          :number="transportStore.totalRoutes"
          icon="🗺️"
          variant="primary"
        />
        <BaseStatCard
          title="总费用"
          :number="formatCurrency(transportStore.totalCost)"
          icon="💰"
          variant="success"
        />
        <BaseStatCard
          title="总里程"
          :number="formatDistance(transportStore.totalDistance)"
          icon="📏"
          variant="info"
        />
        <BaseStatCard
          title="总时长"
          :number="formatDuration(transportStore.totalDuration)"
          icon="⏱️"
          variant="warning"
        />
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="transport-content">
      <!-- 侧边栏 -->
      <aside class="transport-sidebar">
        <!-- 路线列表 -->
        <div class="sidebar-section">
          <div class="section-header">
            <h3>我的路线</h3>
            <BaseButton variant="text" size="sm" @click="refreshRoutes">
              <span class="refresh-icon" :class="{ spinning: isLoading }">🔄</span>
            </BaseButton>
          </div>
          
          <div class="route-list">
            <div
              v-for="route in transportStore.routes"
              :key="route.id"
              class="route-item"
              :class="{ active: currentRoute?.id === route.id }"
              @click="selectRoute(route)"
            >
              <div class="route-header">
                <h4 class="route-name">{{ route.name }}</h4>
                <div class="route-actions">
                  <BaseButton
                    variant="text"
                    size="sm"
                    @click.stop="toggleFavorite(route.id)"
                    :title="route.isFavorite ? '取消收藏' : '添加收藏'"
                    class="favorite-btn"
                    :class="{ 'is-favorite': route.isFavorite }"
                  >
                    <span class="btn-icon">⭐</span>
                  </BaseButton>
                  <BaseButtonDropdown 
                    class="actions-dropdown"
                    text="..."
                    variant="outline"
                    size="sm"
                  >
                    <BaseDropdownItem @click="editRoute(route)" class="action-item edit">
                      <span class="action-icon">✏️</span>
                      编辑
                    </BaseDropdownItem>
                    <BaseDropdownItem @click="duplicateRoute(route)" class="action-item copy">
                      <span class="action-icon">📋</span>
                      复制
                    </BaseDropdownItem>
                    <BaseDropdownItem @click="deleteRoute(route.id)" variant="danger" class="action-item delete">
                      <span class="action-icon">🗑️</span>
                      删除
                    </BaseDropdownItem>
                  </BaseButtonDropdown>
                </div>
              </div>
              
              <div class="route-info">
                <div class="route-segments">
                  <span class="segment-count">{{ route.segments.length }} 段行程</span>
                </div>
                <div class="route-cost">
                  {{ formatCurrency(route.totalCost.totalCost) }}
                </div>
              </div>
              
              <div class="route-tags" v-if="route.tags.length > 0">
                <BaseBadge
                  v-for="tag in route.tags"
                  :key="tag"
                  variant="secondary"
                  size="sm"
                >
                  {{ tag }}
                </BaseBadge>
              </div>
            </div>
            
            <div v-if="transportStore.routes.length === 0" class="empty-state">
                <BaseEmpty
                  title="暂无路线"
                  description="点击新建路线开始规划您的出行"
                  icon="🗺️"
                />
            </div>
          </div>
        </div>

        <!-- 收藏路线 -->
        <div class="sidebar-section" v-if="transportStore.favoriteRoutes.length > 0">
          <div class="section-header">
            <h3>收藏路线</h3>
          </div>
          
          <div class="favorite-routes">
            <div
              v-for="route in transportStore.favoriteRoutes"
              :key="route.id"
              class="favorite-route-item"
              @click="selectRoute(route)"
            >
              <span class="favorite-icon">⭐</span>
              <span class="route-name">{{ route.name }}</span>
            </div>
          </div>
        </div>
      </aside>

      <!-- 主内容区 -->
      <main class="transport-main">
        <!-- 路线详情 -->
        <div v-if="currentRoute" class="route-detail">
          <div class="detail-header">
            <h2 class="route-title">{{ currentRoute.name }}</h2>
            <div class="route-meta">
              <span class="meta-item">
                <span class="meta-icon">⏱️</span>
                {{ formatDuration(currentRoute.totalDuration) }}
              </span>
              <span class="meta-item">
                <span class="meta-icon">📏</span>
                {{ formatDistance(currentRoute.totalDistance) }}
              </span>
              <span class="meta-item">
                <span class="meta-icon">💰</span>
                {{ formatCurrency(currentRoute.totalCost.totalCost) }}
              </span>
            </div>
          </div>

          <!-- 路线段列表 -->
          <div class="segments-section">
            <div class="section-header">
              <h3>行程安排</h3>
              <BaseButton variant="primary" size="sm" @click="showAddSegmentModal = true">
                <span class="btn-icon">➕</span>
                添加行程
              </BaseButton>
            </div>

            <div class="segments-timeline">
              <div
                v-for="(segment, index) in currentRoute.segments"
                :key="segment.id"
                class="timeline-item"
              >
                <div class="timeline-marker">
                  <div class="marker-number">{{ index + 1 }}</div>
                </div>
                
                <div class="timeline-content">
                  <div class="segment-card">
                    <div class="segment-header">
                      <div class="transport-info">
                        <span class="transport-icon">{{ getTransportIcon(segment.transportType) }}</span>
                        <span class="transport-name">{{ getTransportName(segment.transportType) }}</span>
                      </div>
                      <div class="segment-actions">
                        <BaseButton 
                          variant="outline" 
                          size="sm" 
                          @click="editSegment(segment)"
                          class="segment-action-btn edit-btn"
                        >
                          <span class="btn-icon">✏️</span>
                          编辑
                        </BaseButton>
                        <BaseButton 
                          variant="danger" 
                          size="sm" 
                          @click="deleteSegment(segment.id)"
                          class="segment-action-btn delete-btn"
                        >
                          <span class="btn-icon">🗑️</span>
                          删除
                        </BaseButton>
                      </div>
                    </div>
                    
                    <div class="segment-route">
                      <div class="route-point departure">
                        <div class="point-time">
                          <div class="time-date">{{ formatDate(segment.departureTime) }}</div>
                          <div class="time-clock">{{ formatTimeOnly(segment.departureTime) }}</div>
                        </div>
                        <div class="point-location">{{ segment.departure.name }}</div>
                      </div>
                      
                      <div class="route-line">
                        <div class="line-duration">{{ formatDuration(segment.duration) }}</div>
                        <div class="line-distance" v-if="segment.distance">
                          {{ formatDistance(segment.distance) }}
                        </div>
                      </div>
                      
                      <div class="route-point arrival">
                        <div class="point-time">
                          <div class="time-date">{{ formatDate(segment.arrivalTime) }}</div>
                          <div class="time-clock">{{ formatTimeOnly(segment.arrivalTime) }}</div>
                        </div>
                        <div class="point-location">{{ segment.arrival.name }}</div>
                      </div>
                    </div>
                    
                    <div class="segment-cost">
                      <span class="cost-label">费用：</span>
                      <span class="cost-amount">{{ formatCurrency(segment.cost.totalCost) }}</span>
                    </div>
                    
                    <div v-if="segment.notes" class="segment-notes">
                      <span class="notes-label">备注：</span>
                      <span class="notes-content">{{ segment.notes }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-else class="empty-main">
          <BaseEmpty
            title="选择一条路线"
            description="从左侧列表中选择一条路线查看详情，或创建新的路线"
            icon="🗺️"
          />
        </div>
      </main>
    </div>

    <!-- 模态框 -->
    <AddRouteModal
      v-model="showAddRouteModal"
      @close="showAddRouteModal = false"
      @save="handleAddRoute"
    />
    
    <EditRouteModal
      v-model="showEditRouteModal"
      v-if="currentRoute"
      :route="currentRoute"
      @close="showEditRouteModal = false"
      @save="handleUpdateRoute"
    />
    
    <AddSegmentModal
      v-model="showAddSegmentModal"
      v-if="currentRoute"
      :route-id="currentRoute.id"
      @close="showAddSegmentModal = false"
      @save="handleAddSegment"
    />
    
    <EditSegmentModal
      v-model="showEditSegmentModal"
      v-if="currentSegment"
      :segment="currentSegment"
      :route-id="currentRoute?.id"
      @close="showEditSegmentModal = false"
      @save="handleUpdateSegment"
    />
    
    <BudgetModal
      v-model="showBudgetModal"
      @close="showBudgetModal = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, inject } from 'vue'
import { useTransportStore } from '@/stores/transport'
import type { TransportRoute, TransportSegment } from '@/types/transport'
import { TransportType } from '@/types/transport'
import { BaseButton, BaseButtonDropdown, BaseDropdownItem, BaseBadge, BaseStatCard, BaseEmpty } from '@/components/common'
import { toast } from '@/utils/toast'
import { v4 as uuidv4 } from 'uuid'

// 组件导入
import AddRouteModal from '@/components/modals/AddRouteModal.vue'
import EditRouteModal from '@/components/modals/EditRouteModal.vue'
import AddSegmentModal from '@/components/modals/AddSegmentModal.vue'
import EditSegmentModal from '@/components/modals/EditSegmentModal.vue'
import BudgetModal from '@/components/modals/BudgetModal.vue'

const transportStore = useTransportStore()

// 注入确认对话框函数
const showConfirm = inject('showConfirm')

// 状态
const currentRoute = ref<TransportRoute | null>(null)
const currentSegment = ref<TransportSegment | null>(null)
const isLoading = ref(false)

// 模态框状态
const showAddRouteModal = ref(false)
const showEditRouteModal = ref(false)
const showAddSegmentModal = ref(false)
const showEditSegmentModal = ref(false)
const showBudgetModal = ref(false)

// 交通工具图标映射
const transportIcons: Record<TransportType, string> = {
  [TransportType.PLANE]: '✈️',
  [TransportType.HIGH_SPEED_RAIL]: '🚄',
  [TransportType.TRAIN]: '🚂',
  [TransportType.SUBWAY]: '🚇',
  [TransportType.BUS]: '🚌',
  [TransportType.TAXI]: '🚕',
  [TransportType.RENTAL_CAR]: '🚗',
  [TransportType.SELF_DRIVE]: '🚙',
  [TransportType.WALKING]: '🚶',
  [TransportType.BICYCLE]: '🚲',
  [TransportType.MOTORCYCLE]: '🏍️',
  [TransportType.BOAT]: '⛵',
  [TransportType.OTHER]: '🚀'
}

// 交通工具名称映射
const transportNames: Record<TransportType, string> = {
  [TransportType.PLANE]: '飞机',
  [TransportType.HIGH_SPEED_RAIL]: '高铁',
  [TransportType.TRAIN]: '火车',
  [TransportType.SUBWAY]: '地铁',
  [TransportType.BUS]: '公交',
  [TransportType.TAXI]: '打车',
  [TransportType.RENTAL_CAR]: '租车',
  [TransportType.SELF_DRIVE]: '自驾',
  [TransportType.WALKING]: '步行',
  [TransportType.BICYCLE]: '自行车',
  [TransportType.MOTORCYCLE]: '摩托车',
  [TransportType.BOAT]: '船只',
  [TransportType.OTHER]: '其他'
}

// 方法
const selectRoute = (route: TransportRoute) => {
  currentRoute.value = route
}

const toggleFavorite = (routeId: string) => {
  transportStore.toggleFavorite(routeId)
}

const editRoute = (route: TransportRoute) => {
  currentRoute.value = route
  showEditRouteModal.value = true
}

const duplicateRoute = (route: TransportRoute) => {
  const duplicatedRoute = {
    ...route,
    name: `${route.name} (副本)`,
    isFavorite: false,
    tags: [...route.tags]
  }
  transportStore.addRoute(duplicatedRoute)
}

const createTestData = () => {
  // 创建测试预算
  const testBudget = {
    name: '测试预算',
    totalBudget: 10000,
    currency: 'CNY',
    categories: [
      { type: TransportType.PLANE, budget: 5000, used: 0 },
      { type: TransportType.HIGH_SPEED_RAIL, budget: 3000, used: 0 },
      { type: TransportType.TRAIN, budget: 2000, used: 0 }
    ]
  }
  
  transportStore.addBudget(testBudget)
  
  // 创建测试路线
  const testRoute = {
    name: '北京到上海测试路线',
    description: '测试路线描述',
    tags: ['测试', '商务'],
    segments: [
      {
        transportType: TransportType.PLANE,
        departure: { name: '北京首都机场', address: '北京市顺义区' },
        arrival: { name: '上海浦东机场', address: '上海市浦东新区' },
        departureTime: new Date('2024-01-15T08:00:00'),
        arrivalTime: new Date('2024-01-15T10:30:00'),
        duration: 150,
        distance: 1200,
        cost: { baseCost: 1200, totalCost: 1200, currency: 'CNY' },
        notes: '测试航班'
      },
      {
        transportType: TransportType.HIGH_SPEED_RAIL,
        departure: { name: '上海虹桥站', address: '上海市闵行区' },
        arrival: { name: '杭州东站', address: '杭州市江干区' },
        departureTime: new Date('2024-01-15T14:00:00'),
        arrivalTime: new Date('2024-01-15T15:30:00'),
        duration: 90,
        distance: 200,
        cost: { baseCost: 150, totalCost: 150, currency: 'CNY' },
        notes: '测试高铁'
      }
    ],
    isFavorite: false,
    // 这些字段会在 addRoute 中通过 updateRouteTotals 自动计算
    totalCost: { baseCost: 0, totalCost: 0, currency: 'CNY' },
    totalDuration: 0,
    totalDistance: 0
  }
  
  transportStore.addRoute(testRoute)
  
  // 重新计算预算使用情况
  transportStore.calculateBudgetUsage()
  
  toast.success('测试数据创建成功！')
}

const deleteRoute = async (routeId: string) => {
  const route = transportStore.routes.find(r => r.id === routeId)
  if (!route) return
  
  // 使用 BaseConfirm 组件进行确认
  const confirmed = await showConfirm({
    title: '删除路线',
    message: `确定要删除路线"${route.name}"吗？此操作不可撤销。`,
    confirmText: '删除',
    cancelText: '取消',
    variant: 'danger'
  })
  
  if (confirmed) {
    const success = transportStore.deleteRoute(routeId)
    if (success) {
      if (currentRoute.value?.id === routeId) {
        currentRoute.value = null
      }
    }
  }
}

const editSegment = (segment: TransportSegment) => {
  currentSegment.value = segment
  showEditSegmentModal.value = true
}

const deleteSegment = async (segmentId: string) => {
  if (!currentRoute.value) return
  
  const segment = currentRoute.value.segments.find(s => s.id === segmentId)
  if (!segment) return
  
  const confirmed = await showConfirm({
    title: '删除行程段',
    message: `确定要删除从"${segment.departure.name}"到"${segment.arrival.name}"的行程段吗？`,
    confirmText: '删除',
    cancelText: '取消',
    variant: 'danger'
  })
  
  if (confirmed) {
    transportStore.deleteSegment(currentRoute.value.id, segmentId)
  }
}

const refreshRoutes = async () => {
  isLoading.value = true
  try {
    transportStore.loadFromStorage()
  } finally {
    isLoading.value = false
  }
}

// 事件处理
const handleAddRoute = (routeData: any) => {
  transportStore.addRoute(routeData)
  showAddRouteModal.value = false
}

const handleUpdateRoute = (routeData: any) => {
  if (currentRoute.value) {
    transportStore.updateRoute(currentRoute.value.id, routeData)
    showEditRouteModal.value = false
  }
}

const handleAddSegment = (segmentData: any) => {
  if (currentRoute.value) {
    transportStore.addSegment(currentRoute.value.id, segmentData)
    showAddSegmentModal.value = false
  }
}

const handleUpdateSegment = (segmentData: any) => {
  if (currentRoute.value && currentSegment.value) {
    transportStore.updateSegment(currentRoute.value.id, currentSegment.value.id, segmentData)
    showEditSegmentModal.value = false
  }
}

// 预算管理事件处理
const handleAddBudget = (budgetData: any) => {
  transportStore.addBudget(budgetData)
}

const handleUpdateBudget = (budgetData: any) => {
  // 这里需要根据当前编辑的预算来更新
  // 由于 BudgetModal 内部已经处理了更新逻辑，这里可能不需要额外处理
}

// 工具函数
const getTransportIcon = (type: TransportType): string => {
  return transportIcons[type] || transportIcons[TransportType.OTHER]
}

const getTransportName = (type: TransportType): string => {
  return transportNames[type] || transportNames[TransportType.OTHER]
}

const formatCurrency = (amount: number): string => {
  return `¥${amount.toLocaleString()}`
}

const formatDistance = (distance: number): string => {
  if (distance < 1) {
    return `${Math.round(distance * 1000)}m`
  }
  return `${distance.toFixed(1)}km`
}

const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  
  if (hours > 0) {
    return mins > 0 ? `${hours}h${mins}m` : `${hours}h`
  }
  return `${mins}m`
}

const formatTime = (date: Date): string => {
  return date.toLocaleString('zh-CN', { 
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit', 
    minute: '2-digit',
    hour12: false
  })
}

const formatDate = (date: Date): string => {
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

const formatTimeOnly = (date: Date): string => {
  return date.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  })
}

// 生命周期
onMounted(() => {
  transportStore.initialize()
  // 初始化时计算预算使用情况
  transportStore.calculateBudgetUsage()
})
</script>

<style scoped lang="scss">
.transport-page {
  padding: var(--spacing-lg);
  max-width: 1400px;
  margin: 0 auto;
}

.transport-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-xl);
  padding-bottom: var(--spacing-lg);
  border-bottom: var(--border-width) solid var(--border-color);
}

.header-content {
  .page-title {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    margin: 0 0 var(--spacing-xs) 0;
    font-size: 2rem;
    font-weight: var(--font-weight-bold);
    color: var(--text-primary);
    
    .title-icon {
      font-size: 2.2rem;
    }
  }
  
  .page-subtitle {
    margin: 0;
    color: var(--text-secondary);
    font-size: 1rem;
  }
}

.header-actions {
  display: flex;
  gap: var(--spacing-sm);
  
  .test-btn {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    
    &:hover {
      background: linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%);
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    }
  }
  
  .btn-icon {
    margin-right: var(--spacing-xs);
  }
}

.stats-section {
  margin-bottom: var(--spacing-xl);
  
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: var(--spacing-lg);
  }
}

.transport-content {
  display: grid;
  grid-template-columns: 350px 1fr;
  gap: var(--spacing-xl);
  min-height: 600px;
}

.transport-sidebar {
  background: var(--bg-card);
  border: var(--border-width) solid var(--border-color);
  border-radius: var(--radius-md);
  padding: var(--spacing-lg);
  height: fit-content;
  position: sticky;
  top: var(--spacing-lg);
}

.sidebar-section {
  margin-bottom: var(--spacing-xl);
  
  &:last-child {
    margin-bottom: 0;
  }
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);
  padding-bottom: var(--spacing-sm);
  border-bottom: var(--border-width) solid var(--border-color);
  
  h3 {
    margin: 0;
    font-size: 1.1rem;
    font-weight: var(--font-weight-bold);
    color: var(--text-primary);
  }
}

.route-list {
  .route-item {
    padding: var(--spacing-md);
    border: var(--border-width) solid var(--border-color);
    border-radius: var(--radius-sm);
    margin-bottom: var(--spacing-sm);
    cursor: pointer;
    transition: all 0.2s ease;
    
    &:hover {
      border-color: var(--primary-color);
      background: var(--bg-hover);
    }
    
    &.active {
      border-color: var(--primary-color);
      background: var(--primary-color-light, #e3f2fd);
      color: var(--text-primary);
      
      .route-name,
      .route-segments,
      .route-cost {
        color: var(--text-primary);
      }
      
      .route-name {
        color: var(--primary-color);
        font-weight: var(--font-weight-bold);
      }
    }
    
    &:last-child {
      margin-bottom: 0;
    }
  }
  
  .route-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: var(--spacing-sm);
  }
  
  .route-name {
    margin: 0;
    font-size: 1rem;
    font-weight: var(--font-weight-bold);
    color: var(--text-primary);
    flex: 1;
  }
  
  .route-actions {
    display: flex;
    gap: var(--spacing-xs);
    align-items: center;
    
    .favorite-btn {
      transition: all 0.2s ease;
      
      &:hover {
        background: var(--warning-color);
        color: var(--text-white);
        transform: scale(1.1);
      }
      
      &.is-favorite {
        color: var(--warning-color);
        
        &:hover {
          background: var(--danger-color);
        }
      }
    }
    
    .actions-dropdown {
      opacity: 0.7;
      transition: all 0.2s ease;
      
      &:hover {
        opacity: 1;
        transform: scale(1.05);
      }
      
      :deep(.base-button) {
        min-width: 32px;
        padding: var(--spacing-xs) var(--spacing-sm);
        font-weight: var(--font-weight-bold);
        letter-spacing: 0.5px;
        
        &:hover {
          background: var(--primary-color);
          color: var(--text-white);
        }
      }
    }
    
    .btn-icon {
      font-size: 1rem;
      line-height: 1;
    }
  }
  
  // 下拉菜单项样式
  .action-item {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    padding: var(--spacing-sm) var(--spacing-md);
    transition: all 0.2s ease;
    
    &:hover {
      background: var(--bg-hover);
    }
    
    &.edit:hover {
      background: var(--primary-color);
      color: var(--text-white);
    }
    
    &.copy:hover {
      background: var(--info-color);
      color: var(--text-white);
    }
    
    &.delete:hover {
      background: var(--danger-color);
      color: var(--text-white);
    }
    
    .action-icon {
      font-size: 1rem;
      line-height: 1;
    }
  }
  
  .route-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--spacing-sm);
  }
  
  .route-segments {
    font-size: 0.9rem;
    color: var(--text-secondary);
  }
  
  .route-cost {
    font-weight: var(--font-weight-bold);
    color: var(--success-color);
  }
  
  .route-tags {
    display: flex;
    gap: var(--spacing-xs);
    flex-wrap: wrap;
  }
}

.favorite-routes {
  .favorite-route-item {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    padding: var(--spacing-sm);
    border-radius: var(--radius-sm);
    cursor: pointer;
    transition: background 0.2s ease;
    
    &:hover {
      background: var(--bg-hover);
    }
    
    .favorite-icon {
      color: var(--warning-color);
    }
    
    .route-name {
      font-size: 0.9rem;
      color: var(--text-primary);
    }
  }
}

.transport-main {
  background: var(--bg-card);
  border: var(--border-width) solid var(--border-color);
  border-radius: var(--radius-md);
  padding: var(--spacing-lg);
}

.route-detail {
  .detail-header {
    margin-bottom: var(--spacing-xl);
    padding-bottom: var(--spacing-lg);
    border-bottom: var(--border-width) solid var(--border-color);
  }
  
  .route-title {
    margin: 0 0 var(--spacing-sm) 0;
    font-size: 1.8rem;
    font-weight: var(--font-weight-bold);
    color: var(--text-primary);
  }
  
  .route-meta {
    display: flex;
    gap: var(--spacing-lg);
    
    .meta-item {
      display: flex;
      align-items: center;
      gap: var(--spacing-xs);
      font-size: 0.9rem;
      color: var(--text-secondary);
      
      .meta-icon {
        font-size: 1rem;
      }
    }
  }
}

.segments-section {
  .segments-timeline {
    position: relative;
    
    &::before {
      content: '';
      position: absolute;
      left: 20px;
      top: 0;
      bottom: 0;
      width: 2px;
      background: var(--border-color);
    }
  }
  
  .timeline-item {
    position: relative;
    margin-bottom: var(--spacing-lg);
    
    &:last-child {
      margin-bottom: 0;
    }
  }
  
  .timeline-marker {
    position: absolute;
    left: 0;
    top: 0;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--primary-color);
    border-radius: var(--radius-full);
    z-index: 1;
    
    .marker-number {
      color: var(--btn-primary-text);
      font-weight: var(--font-weight-bold);
      font-size: 0.9rem;
    }
  }
  
  .timeline-content {
    margin-left: 60px;
  }
  
  .segment-card {
    background: var(--bg-input);
    border: var(--border-width) solid var(--border-color);
    border-radius: var(--radius-md);
    padding: var(--spacing-lg);
    
    .segment-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--spacing-md);
    }
    
    .transport-info {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      
      .transport-icon {
        font-size: 1.2rem;
      }
      
      .transport-name {
        font-weight: var(--font-weight-bold);
        color: var(--text-primary);
      }
    }
    
    .segment-actions {
      display: flex;
      gap: var(--spacing-xs);
      
      .segment-action-btn {
        transition: all 0.2s ease;
        font-size: 0.85rem;
        
        &:hover {
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        }
        
        &.edit-btn:hover {
          background: var(--primary-color);
          color: var(--text-white);
        }
        
        &.delete-btn:hover {
          background: var(--danger-color);
          color: var(--text-white);
          transform: translateY(-1px) scale(1.05);
        }
        
        .btn-icon {
          margin-right: var(--spacing-xs);
          font-size: 0.9rem;
        }
      }
    }
    
    .segment-route {
      display: flex;
      align-items: center;
      gap: var(--spacing-lg);
      margin-bottom: var(--spacing-md);
    }
    
    .route-point {
      flex: 1;
      
      .point-time {
        font-size: 0.9rem;
        color: var(--text-secondary);
        margin-bottom: var(--spacing-xs);
        
        .time-date {
          font-size: 0.8rem;
          color: var(--text-tertiary);
          margin-bottom: 2px;
        }
        
        .time-clock {
          font-size: 0.9rem;
          font-weight: var(--font-weight-medium);
          color: var(--text-secondary);
        }
      }
      
      .point-location {
        font-weight: var(--font-weight-bold);
        color: var(--text-primary);
      }
    }
    
    .route-line {
      text-align: center;
      min-width: 80px;
      
      .line-duration {
        font-size: 0.9rem;
        color: var(--primary-color);
        font-weight: var(--font-weight-bold);
        margin-bottom: var(--spacing-xs);
      }
      
      .line-distance {
        font-size: 0.8rem;
        color: var(--text-muted);
      }
    }
    
    .segment-cost {
      margin-bottom: var(--spacing-sm);
      
      .cost-label {
        font-size: 0.9rem;
        color: var(--text-secondary);
        margin-right: var(--spacing-xs);
      }
      
      .cost-amount {
        font-weight: var(--font-weight-bold);
        color: var(--success-color);
      }
    }
    
    .segment-notes {
      .notes-label {
        font-size: 0.9rem;
        color: var(--text-secondary);
        margin-right: var(--spacing-xs);
      }
      
      .notes-content {
        font-size: 0.9rem;
        color: var(--text-primary);
      }
    }
  }
}

.empty-main {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 400px;
}

.refresh-icon {
  &.spinning {
    animation: spin 1s linear infinite;
  }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

// 响应式设计
@media (max-width: 1200px) {
  .transport-content {
    grid-template-columns: 300px 1fr;
  }
}

@media (max-width: 992px) {
  .transport-content {
    grid-template-columns: 1fr;
  }
  
  .transport-sidebar {
    position: static;
    margin-bottom: var(--spacing-lg);
  }
  
  .transport-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-lg);
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .transport-page {
    padding: var(--spacing-md);
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .route-meta {
    flex-direction: column;
    gap: var(--spacing-sm);
  }
  
  .segment-route {
    flex-direction: column;
    gap: var(--spacing-sm);
  }
  
  .route-line {
    min-width: auto;
  }
}
</style>
