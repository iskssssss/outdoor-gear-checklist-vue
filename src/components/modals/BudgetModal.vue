<template>
  <BaseModal
    ref="modalRef"
    title="预算管理"
    width="1200px"
    v-model="isVisible"
    @close="handleClose"
  >
    <div class="budget-modal">
      <!-- 预算概览 -->
      <div class="budget-overview">
        <div class="section-header">
          <h3 class="section-title">预算概览</h3>
          <BaseButton 
            variant="outline" 
            size="sm" 
            @click="refreshBudgetUsage"
            class="refresh-btn"
          >
            <span class="btn-icon">🔄</span>
            刷新使用情况
          </BaseButton>
        </div>
        
        <div class="overview-stats">
          <div class="stat-card">
            <div class="stat-icon">💰</div>
            <div class="stat-content">
              <div class="stat-label">总预算</div>
              <div class="stat-value">{{ formatCurrency(totalBudget) }}</div>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon">📊</div>
            <div class="stat-content">
              <div class="stat-label">已使用</div>
              <div class="stat-value">{{ formatCurrency(totalUsed) }}</div>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon">📈</div>
            <div class="stat-content">
              <div class="stat-label">剩余</div>
              <div class="stat-value" :class="{ 'warning': remainingBudget < totalBudget * 0.2 }">
                {{ formatCurrency(remainingBudget) }}
              </div>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon">📉</div>
            <div class="stat-content">
              <div class="stat-label">使用率</div>
              <div class="stat-value" :class="getUsagePercentageClass(usagePercentage)">
                {{ usagePercentage }}%
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 预算列表 -->
      <div class="budget-list">
        <div class="section-header">
          <h3 class="section-title">预算列表</h3>
          <BaseButton variant="primary" size="sm" @click="showAddBudgetModal = true">
            <span class="btn-icon">➕</span>
            新建预算
          </BaseButton>
        </div>
        
        <div class="budgets">
          <div
            v-for="budget in transportStore.budgets"
            :key="budget.id"
            class="budget-item"
          >
            <div class="budget-header">
              <h4 class="budget-name">{{ budget.name }}</h4>
              <div class="budget-actions">
                <BaseButton 
                  variant="outline" 
                  size="sm" 
                  @click="editBudget(budget)"
                  class="budget-action-btn edit-btn"
                >
                  <span class="btn-icon">✏️</span>
                  编辑
                </BaseButton>
                <BaseButton 
                  variant="danger" 
                  size="sm" 
                  @click="deleteBudget(budget.id)"
                  class="budget-action-btn delete-btn"
                >
                  <span class="btn-icon">🗑️</span>
                  删除
                </BaseButton>
              </div>
            </div>
            
            <div class="budget-progress">
              <div class="progress-bar">
                <div 
                  class="progress-fill" 
                  :style="{ width: `${(budget.usedAmount / budget.totalBudget) * 100}%` }"
                  :class="{ 'warning': budget.usedAmount > budget.totalBudget * 0.8 }"
                ></div>
              </div>
              <div class="progress-text">
                {{ formatCurrency(budget.usedAmount) }} / {{ formatCurrency(budget.totalBudget) }}
                <span class="usage-percentage" :class="getUsagePercentageClass((budget.usedAmount / budget.totalBudget) * 100)">
                  ({{ Math.round((budget.usedAmount / budget.totalBudget) * 100) }}%)
                </span>
              </div>
            </div>
            
            <div class="budget-categories">
              <div
                v-for="category in budget.categories"
                :key="category.type"
                class="category-item"
              >
                <div class="category-info">
                  <span class="category-name">{{ getTransportName(category.type) }}</span>
                  <span class="category-icon">{{ getTransportIcon(category.type) }}</span>
                </div>
                <div class="category-details">
                  <span class="category-amount">{{ formatCurrency(category.used) }} / {{ formatCurrency(category.budget) }}</span>
                  <span 
                    class="category-percentage" 
                    :class="getUsagePercentageClass((category.used / category.budget) * 100)"
                  >
                    {{ Math.round((category.used / category.budget) * 100) }}%
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <div v-if="transportStore.budgets.length === 0" class="empty-state">
              <BaseEmpty
                title="暂无预算"
                description="点击新建预算开始管理您的交通费用"
                icon="💰"
              />
          </div>
        </div>
      </div>

      <!-- 费用分析 -->
      <div class="cost-analysis">
        <h3 class="section-title">费用分析</h3>
        
        <div class="analysis-charts">
          <div class="chart-container">
            <h4 class="chart-title">按交通工具分类</h4>
            <div class="chart-content">
              <div
                v-for="item in transportStore.transportStats.transportBreakdown"
                :key="item.type"
                class="chart-item"
              >
                <div class="chart-label">
                  <span class="transport-icon">{{ getTransportIcon(item.type) }}</span>
                  <span class="transport-name">{{ getTransportName(item.type) }}</span>
                </div>
                <div class="chart-bar">
                  <div 
                    class="chart-fill" 
                    :style="{ width: `${(item.totalCost / maxCost) * 100}%` }"
                  ></div>
                </div>
                <div class="chart-value">{{ formatCurrency(item.totalCost) }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 添加预算模态框 -->
    <AddBudgetModal
      v-if="showAddBudgetModal"
      @close="showAddBudgetModal = false"
      @save="handleAddBudget"
    />
    
    <!-- 编辑预算模态框 -->
    <EditBudgetModal
      v-if="showEditBudgetModal && currentBudget"
      :budget="currentBudget"
      @close="showEditBudgetModal = false"
      @save="handleUpdateBudget"
    />
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, computed, inject } from 'vue'
import { useTransportStore } from '@/stores/transport'
import type { TransportBudget } from '@/types/transport'
import { TransportType } from '@/types/transport'
import { BaseModal, BaseButton, BaseEmpty } from '@/components/common'
import { toast } from '@/utils/toast'

// 组件导入
import AddBudgetModal from '@/components/modals/AddBudgetModal.vue'
import EditBudgetModal from '@/components/modals/EditBudgetModal.vue'

const emit = defineEmits<{
  close: []
}>()

const isVisible = ref(true)

const transportStore = useTransportStore()

// 注入确认对话框函数
const showConfirm = inject('showConfirm')

// 状态
const showAddBudgetModal = ref(false)
const showEditBudgetModal = ref(false)
const currentBudget = ref<TransportBudget | null>(null)

// 交通工具图标和名称映射
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

// 计算属性
const totalBudget = computed(() => 
  transportStore.budgets.reduce((sum, budget) => sum + budget.totalBudget, 0)
)

const totalUsed = computed(() => 
  transportStore.budgets.reduce((sum, budget) => sum + budget.usedAmount, 0)
)

const remainingBudget = computed(() => totalBudget.value - totalUsed.value)

const usagePercentage = computed(() => 
  totalBudget.value > 0 ? Math.round((totalUsed.value / totalBudget.value) * 100) : 0
)

const maxCost = computed(() => 
  Math.max(...transportStore.transportStats.transportBreakdown.map(item => item.totalCost), 0)
)

// 方法
const getTransportIcon = (type: TransportType): string => {
  return transportIcons[type] || transportIcons[TransportType.OTHER]
}

const getTransportName = (type: TransportType): string => {
  return transportNames[type] || transportNames[TransportType.OTHER]
}

const formatCurrency = (amount: number): string => {
  return `¥${amount.toLocaleString()}`
}

const editBudget = (budget: TransportBudget) => {
  currentBudget.value = budget
  showEditBudgetModal.value = true
}

const deleteBudget = async (budgetId: string) => {
  const budget = transportStore.budgets.find(b => b.id === budgetId)
  if (!budget) return
  
  const confirmed = await showConfirm({
    title: '删除预算',
    message: `确定要删除预算"${budget.name}"吗？此操作不可撤销。`,
    confirmText: '删除',
    cancelText: '取消',
    variant: 'danger'
  })
  
  if (confirmed) {
    transportStore.deleteBudget(budgetId)
  }
}

const handleAddBudget = (budgetData: any) => {
  transportStore.addBudget(budgetData)
  showAddBudgetModal.value = false
}

const handleUpdateBudget = (budgetData: any) => {
  if (currentBudget.value) {
    transportStore.updateBudget(currentBudget.value.id, budgetData)
    showEditBudgetModal.value = false
  }
}

const refreshBudgetUsage = () => {
  transportStore.calculateBudgetUsage()
  toast.success('预算使用情况已刷新')
  
  // 调试信息：显示计算后的预算明细
  console.log('预算使用情况已更新:', transportStore.budgets.map(budget => ({
    name: budget.name,
    totalUsed: budget.usedAmount,
    categories: budget.categories.map(cat => ({
      type: cat.type,
      budget: cat.budget,
      used: cat.used,
      percentage: Math.round((cat.used / cat.budget) * 100)
    }))
  })))
}

const getUsagePercentageClass = (percentage: number) => {
  if (percentage >= 90) return 'danger'
  if (percentage >= 70) return 'warning'
  if (percentage >= 50) return 'info'
  return 'success'
}

const handleClose = () => {
  isVisible.value = false
  emit('close')
}
</script>

<style scoped lang="scss">
.budget-modal {
  .section-title {
    margin: 0 0 var(--spacing-lg) 0;
    font-size: 1.2rem;
    font-weight: var(--font-weight-bold);
    color: var(--text-primary);
    padding-bottom: var(--spacing-sm);
    border-bottom: var(--border-width) solid var(--border-color);
  }
  
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--spacing-lg);
    
    .btn-icon {
      margin-right: var(--spacing-xs);
    }
  }
}

.budget-overview {
  margin-bottom: var(--spacing-xl);
  
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--spacing-lg);
    
    .refresh-btn {
      transition: all 0.2s ease;
      
      &:hover {
        background: var(--primary-color);
        color: var(--text-white);
        transform: scale(1.05);
      }
      
      .btn-icon {
        margin-right: var(--spacing-xs);
        font-size: 0.9rem;
      }
    }
  }
  
  .overview-stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: var(--spacing-lg);
  }
  
  .stat-card {
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
    background: var(--bg-card);
    border: var(--border-width) solid var(--border-color);
    border-radius: var(--radius-md);
    padding: var(--spacing-lg);
    
    .stat-icon {
      font-size: 2rem;
      width: 60px;
      height: 60px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--bg-input);
      border-radius: var(--radius-md);
    }
    
    .stat-content {
      flex: 1;
      
      .stat-label {
        font-size: 0.9rem;
        color: var(--text-secondary);
        margin-bottom: var(--spacing-xs);
      }
      
      .stat-value {
        font-size: 1.2rem;
        font-weight: var(--font-weight-bold);
        color: var(--text-primary);
        
        &.warning {
          color: var(--warning-color);
        }
        
        &.danger {
          color: var(--danger-color);
        }
        
        &.info {
          color: var(--info-color);
        }
        
        &.success {
          color: var(--success-color);
        }
      }
    }
  }
}

.budget-list {
  margin-bottom: var(--spacing-xl);
  
  .budgets {
    .budget-item {
      background: var(--bg-card);
      border: var(--border-width) solid var(--border-color);
      border-radius: var(--radius-md);
      padding: var(--spacing-lg);
      margin-bottom: var(--spacing-md);
      
      &:last-child {
        margin-bottom: 0;
      }
    }
    
    .budget-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--spacing-md);
      
      .budget-name {
        margin: 0;
        font-size: 1.1rem;
        font-weight: var(--font-weight-bold);
        color: var(--text-primary);
      }
      
      .budget-actions {
        display: flex;
        gap: var(--spacing-xs);
        
        .budget-action-btn {
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
    }
    
    .budget-progress {
      margin-bottom: var(--spacing-md);
      
      .progress-bar {
        width: 100%;
        height: 8px;
        background: var(--bg-input);
        border-radius: var(--radius-sm);
        overflow: hidden;
        margin-bottom: var(--spacing-sm);
        
        .progress-fill {
          height: 100%;
          background: var(--primary-color);
          transition: width 0.3s ease;
          
          &.warning {
            background: var(--warning-color);
          }
        }
      }
      
      .progress-text {
        font-size: 0.9rem;
        color: var(--text-secondary);
        text-align: right;
        
        .usage-percentage {
          margin-left: var(--spacing-xs);
          font-weight: var(--font-weight-medium);
          
          &.warning {
            color: var(--warning-color);
          }
          
          &.danger {
            color: var(--danger-color);
          }
          
          &.info {
            color: var(--info-color);
          }
          
          &.success {
            color: var(--success-color);
          }
        }
      }
    }
    
    .budget-categories {
      .category-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: var(--spacing-sm) 0;
        border-bottom: var(--border-width) solid var(--border-color);
        
        &:last-child {
          border-bottom: none;
        }
        
        .category-info {
          display: flex;
          align-items: center;
          gap: var(--spacing-xs);
          
          .category-name {
            font-size: 0.9rem;
            color: var(--text-primary);
            font-weight: var(--font-weight-medium);
          }
          
          .category-icon {
            font-size: 1rem;
          }
        }
        
        .category-details {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: var(--spacing-xs);
          
          .category-amount {
            font-size: 0.85rem;
            color: var(--text-secondary);
          }
          
          .category-percentage {
            font-size: 0.8rem;
            font-weight: var(--font-weight-medium);
            padding: 2px 6px;
            border-radius: var(--radius-sm);
            background: var(--bg-input);
            
            &.warning {
              color: var(--warning-color);
              background: rgba(var(--warning-color-rgb), 0.1);
            }
            
            &.danger {
              color: var(--danger-color);
              background: rgba(var(--danger-color-rgb), 0.1);
            }
            
            &.info {
              color: var(--info-color);
              background: rgba(var(--info-color-rgb), 0.1);
            }
            
            &.success {
              color: var(--success-color);
              background: rgba(var(--success-color-rgb), 0.1);
            }
          }
        }
      }
    }
  }
}

.cost-analysis {
  .analysis-charts {
    .chart-container {
      background: var(--bg-card);
      border: var(--border-width) solid var(--border-color);
      border-radius: var(--radius-md);
      padding: var(--spacing-lg);
      
      .chart-title {
        margin: 0 0 var(--spacing-lg) 0;
        font-size: 1rem;
        font-weight: var(--font-weight-bold);
        color: var(--text-primary);
      }
      
      .chart-content {
        .chart-item {
          display: flex;
          align-items: center;
          gap: var(--spacing-md);
          margin-bottom: var(--spacing-md);
          
          &:last-child {
            margin-bottom: 0;
          }
          
          .chart-label {
            display: flex;
            align-items: center;
            gap: var(--spacing-sm);
            min-width: 120px;
            
            .transport-icon {
              font-size: 1.2rem;
            }
            
            .transport-name {
              font-size: 0.9rem;
              color: var(--text-primary);
            }
          }
          
          .chart-bar {
            flex: 1;
            height: 20px;
            background: var(--bg-input);
            border-radius: var(--radius-sm);
            overflow: hidden;
            
            .chart-fill {
              height: 100%;
              background: var(--primary-color);
              transition: width 0.3s ease;
            }
          }
          
          .chart-value {
            min-width: 80px;
            text-align: right;
            font-size: 0.9rem;
            font-weight: var(--font-weight-bold);
            color: var(--text-primary);
          }
        }
      }
    }
  }
}

.empty-state {
  padding: var(--spacing-xl);
  text-align: center;
}

// 响应式设计
@media (max-width: 768px) {
  .overview-stats {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .budget-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-sm);
  }
  
  .chart-item {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-sm);
  }
  
  .chart-bar {
    width: 100%;
  }
}
</style>
