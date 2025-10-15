<template>
  <BaseModal
    ref="modalRef"
    title="编辑路线"
    width="800px"
    v-model="isVisible"
    @close="handleClose"
  >
    <div class="edit-route-modal">
      <form @submit.prevent="handleSubmit">
        <!-- 基本信息 -->
        <div class="form-section">
          <h3 class="section-title">基本信息</h3>
          
          <div class="form-field">
            <label class="field-label">路线名称 <span class="required-mark">*</span></label>
            <BaseInput
              v-model="formData.name"
              placeholder="请输入路线名称"
              :error="errors.name"
            />
          </div>
          
          <div class="form-field">
            <label class="field-label">路线描述</label>
            <BaseTextarea
              v-model="formData.description"
              placeholder="请输入路线描述（可选）"
              rows="3"
            />
          </div>
          
          <div class="form-field">
            <label class="field-label">标签</label>
            <div class="tags-input">
              <BaseInput
                v-model="newTag"
                placeholder="输入标签后按回车添加"
                @keydown.enter.prevent="addTag"
              />
              <div class="tags-list" v-if="formData.tags.length > 0">
                <BaseBadge
                  v-for="(tag, index) in formData.tags"
                  :key="index"
                  variant="secondary"
                  size="sm"
                  @click="removeTag(index)"
                >
                  {{ tag }} ×
                </BaseBadge>
              </div>
            </div>
          </div>
        </div>

        <!-- 路线段管理 -->
        <div class="form-section">
          <h3 class="section-title">路线段管理</h3>
          
          <div class="segments-list" v-if="route.segments.length > 0">
            <div
              v-for="(segment, index) in route.segments"
              :key="segment.id"
              class="segment-item"
            >
              <div class="segment-info">
                <div class="segment-header">
                  <span class="segment-number">{{ index + 1 }}</span>
                  <span class="transport-icon">{{ getTransportIcon(segment.transportType) }}</span>
                  <span class="transport-name">{{ getTransportName(segment.transportType) }}</span>
                </div>
                <div class="segment-route">
                  <span class="route-from">{{ segment.departure.name }}</span>
                  <span class="route-arrow">→</span>
                  <span class="route-to">{{ segment.arrival.name }}</span>
                </div>
                <div class="segment-details">
                  <span class="detail-item">{{ formatDate(segment.departureTime) }} {{ formatTimeOnly(segment.departureTime) }}</span>
                  <span class="detail-item">{{ formatDuration(segment.duration) }}</span>
                  <span class="detail-item">{{ formatCurrency(segment.cost.totalCost) }}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div v-else class="empty-segments">
            <BaseEmpty
              title="暂无行程段"
              description="点击添加行程段开始规划您的路线"
              icon="🚗"
            />
          </div>
        </div>

        <!-- 路线统计 -->
        <div class="form-section">
          <h3 class="section-title">路线统计</h3>
          
          <div class="stats-grid">
            <div class="stat-item">
              <span class="stat-label">总时长：</span>
              <span class="stat-value">{{ formatDuration(route.totalDuration) }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">总距离：</span>
              <span class="stat-value">{{ formatDistance(route.totalDistance) }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">总费用：</span>
              <span class="stat-value">{{ formatCurrency(route.totalCost.totalCost) }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">行程段数：</span>
              <span class="stat-value">{{ route.segments.length }} 段</span>
            </div>
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="form-actions">
          <div class="button-group">
            <BaseButton variant="outline" @click="handleClose">
              取消
            </BaseButton>
            <BaseButton 
              type="submit" 
              variant="primary"
              :loading="isSubmitting"
            >
              保存修改
            </BaseButton>
          </div>
        </div>
      </form>
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, reactive, watch, inject } from 'vue'
import type { TransportRoute, TransportSegment } from '@/types/transport'
import { TransportType } from '@/types/transport'
import { useTransportStore } from '@/stores/transport'
import { toast } from '@/utils/toast'
import { 
  BaseModal, 
  BaseInput, 
  BaseTextarea, 
  BaseButton,
  BaseBadge,
  BaseEmpty
} from '@/components/common'

const props = defineProps<{
  route: TransportRoute
}>()

const emit = defineEmits<{
  close: []
  save: [updates: Partial<TransportRoute>]
}>()

const isVisible = ref(true)
const transportStore = useTransportStore()

// 注入确认对话框函数
const showConfirm = inject('showConfirm')

// 表单数据
const formData = reactive({
  name: props.route.name,
  description: props.route.description || '',
  tags: [...props.route.tags]
})

// 表单状态
const isSubmitting = ref(false)
const newTag = ref('')
const errors = reactive({
  name: ''
})

// 计算属性
const modalRef = ref()

// 方法
const validateForm = (): boolean => {
  errors.name = ''
  
  if (!formData.name.trim()) {
    errors.name = '请输入路线名称'
    return false
  }
  
  return true
}

const addTag = () => {
  const tag = newTag.value.trim()
  if (tag && !formData.tags.includes(tag)) {
    formData.tags.push(tag)
    newTag.value = ''
  }
}

const removeTag = (index: number) => {
  formData.tags.splice(index, 1)
}

// 交通工具相关方法
const getTransportIcon = (type: TransportType): string => {
  const icons: Record<TransportType, string> = {
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
  return icons[type] || '🚀'
}

const getTransportName = (type: TransportType): string => {
  const names: Record<TransportType, string> = {
    [TransportType.PLANE]: '飞机',
    [TransportType.HIGH_SPEED_RAIL]: '高铁',
    [TransportType.TRAIN]: '火车',
    [TransportType.SUBWAY]: '地铁',
    [TransportType.BUS]: '公交',
    [TransportType.TAXI]: '出租车',
    [TransportType.RENTAL_CAR]: '租车',
    [TransportType.SELF_DRIVE]: '自驾',
    [TransportType.WALKING]: '步行',
    [TransportType.BICYCLE]: '自行车',
    [TransportType.MOTORCYCLE]: '摩托车',
    [TransportType.BOAT]: '轮船',
    [TransportType.OTHER]: '其他'
  }
  return names[type] || '其他'
}

// 格式化方法
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

const formatDuration = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes}分钟`
  }
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return mins > 0 ? `${hours}小时${mins}分钟` : `${hours}小时`
}

const handleSubmit = async () => {
  if (!validateForm()) {
    return
  }

  isSubmitting.value = true

  try {
    const updates: Partial<TransportRoute> = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      tags: [...formData.tags]
    }

    emit('save', updates)
  } catch (error) {
    console.error('更新路线失败:', error)
  } finally {
    isSubmitting.value = false
  }
}

const handleClose = () => {
  isVisible.value = false
  emit('close')
}

// 工具函数
const formatCurrency = (amount: number): string => {
  return `¥${amount.toLocaleString()}`
}

const formatDistance = (distance: number): string => {
  if (distance < 1) {
    return `${Math.round(distance * 1000)}m`
  }
  return `${distance.toFixed(1)}km`
}
</script>

<style scoped lang="scss">
.edit-route-modal {
  .form-section {
    margin-bottom: var(--spacing-xl);
    
    &:last-of-type {
      margin-bottom: var(--spacing-lg);
    }
  }
  
  .section-title {
    margin: 0 0 var(--spacing-md) 0;
    font-size: 1.1rem;
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
    
    .add-segment-btn {
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
  
  .segments-list {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md);
  }
  
  .segment-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--spacing-md);
    background: var(--bg-card);
    border: var(--border-width) solid var(--border-color);
    border-radius: var(--radius-md);
    transition: all 0.2s ease;
    
    &:hover {
      border-color: var(--primary-color);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
    
    .segment-info {
      flex: 1;
      
      .segment-header {
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);
        margin-bottom: var(--spacing-xs);
        
        .segment-number {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          background: var(--primary-color);
          color: var(--text-white);
          border-radius: 50%;
          font-size: 0.8rem;
          font-weight: var(--font-weight-bold);
        }
        
        .transport-icon {
          font-size: 1.2rem;
        }
        
        .transport-name {
          font-weight: var(--font-weight-medium);
          color: var(--text-primary);
        }
      }
      
      .segment-route {
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);
        margin-bottom: var(--spacing-xs);
        
        .route-from,
        .route-to {
          font-weight: var(--font-weight-medium);
          color: var(--text-primary);
        }
        
        .route-arrow {
          color: var(--text-secondary);
          font-weight: var(--font-weight-bold);
        }
      }
      
      .segment-details {
        display: flex;
        gap: var(--spacing-md);
        
        .detail-item {
          font-size: 0.85rem;
          color: var(--text-secondary);
          background: var(--bg-input);
          padding: 2px 8px;
          border-radius: var(--radius-sm);
        }
      }
    }
  }
  
  .empty-segments {
    text-align: center;
    padding: var(--spacing-xl);
  }
  
  .tags-input {
    .tags-list {
      display: flex;
      flex-wrap: wrap;
      gap: var(--spacing-xs);
      margin-top: var(--spacing-sm);
    }
  }
  
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: var(--spacing-md);
    background: var(--bg-input);
    border: var(--border-width) solid var(--border-color);
    border-radius: var(--radius-md);
    padding: var(--spacing-lg);
  }
  
  .stat-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    .stat-label {
      font-size: 0.9rem;
      color: var(--text-secondary);
    }
    
    .stat-value {
      font-weight: var(--font-weight-bold);
      color: var(--text-primary);
    }
  }
  
  .form-field {
    margin-bottom: var(--spacing-md);
    
    .field-label {
      display: block;
      margin-bottom: var(--spacing-xs);
      font-size: 0.9rem;
      font-weight: var(--font-weight-medium);
      color: var(--text-primary);
      
      .required-mark {
        color: var(--danger);
        margin-left: 2px;
      }
    }
  }
  
  .form-actions {
    display: flex;
    justify-content: flex-end;
    padding-top: var(--spacing-lg);
    border-top: var(--border-width) solid var(--border-color);
    
    .button-group {
      display: flex;
      gap: var(--spacing-md);
    }
  }
}
</style>
