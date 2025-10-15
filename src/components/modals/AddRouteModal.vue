<template>
  <BaseModal
    ref="modalRef"
    title="新建路线"
    width="1000px"
    v-model="isVisible"
    @close="handleClose"
  >
    <div class="add-route-modal">
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

        <!-- 初始行程段 -->
        <div class="form-section">
          <h3 class="section-title">初始行程段</h3>
          <p class="section-description">您可以先添加一个行程段，后续可以继续添加更多</p>
          
          <div class="segment-form">
            <div class="form-row">
              <div class="form-field">
                <label class="field-label">交通工具 <span class="required-mark">*</span></label>
                <BaseSelect
                  v-model="formData.segments[0].transportType"
                  :options="transportTypeOptions"
                  placeholder="选择交通工具"
                />
              </div>
              
              <div class="form-field">
                <label class="field-label">出发地 <span class="required-mark">*</span></label>
                <BaseInput
                  v-model="formData.segments[0].departure.name"
                  placeholder="请输入出发地"
                  :error="errors.departure"
                />
              </div>
            </div>
            
            <div class="form-row">
              <div class="form-field">
                <label class="field-label">目的地 <span class="required-mark">*</span></label>
                <BaseInput
                  v-model="formData.segments[0].arrival.name"
                  placeholder="请输入目的地"
                  :error="errors.arrival"
                />
              </div>
              
              <div class="form-field">
                <label class="field-label">预计时长（分钟） <span class="required-mark">*</span></label>
                <BaseInput
                  v-model.number="formData.segments[0].duration"
                  type="number"
                  placeholder="预计时长"
                  :error="errors.duration"
                />
              </div>
            </div>
            
            <div class="form-row">
              <div class="form-field">
                <label class="field-label">出发时间 <span class="required-mark">*</span></label>
                <BaseInput
                  v-model="formData.segments[0].departureTime"
                  type="datetime-local"
                  :error="errors.departureTime"
                />
              </div>
              
              <div class="form-field">
                <label class="field-label">距离（公里）</label>
                <BaseInput
                  v-model.number="formData.segments[0].distance"
                  type="number"
                  step="0.1"
                  placeholder="距离（可选）"
                />
              </div>
            </div>
            
            <div class="form-row">
              <div class="form-field">
                <label class="field-label">基础费用（元） <span class="required-mark">*</span></label>
                <BaseInput
                  v-model.number="formData.segments[0].cost.baseCost"
                  type="number"
                  step="0.01"
                  placeholder="基础费用"
                  :error="errors.baseCost"
                />
              </div>
              
              <div class="form-field">
                <label class="field-label">货币单位</label>
                <BaseSelect
                  v-model="formData.segments[0].cost.currency"
                  :options="currencyOptions"
                  placeholder="选择货币"
                />
              </div>
            </div>
            
            <div class="form-field">
              <label class="field-label">备注</label>
              <BaseTextarea
                v-model="formData.segments[0].notes"
                placeholder="行程备注（可选）"
                rows="2"
              />
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
              创建路线
            </BaseButton>
          </div>
        </div>
      </form>
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { useTransportStore } from '@/stores/transport'
import type { TransportRoute, TransportSegment } from '@/types/transport'
import { TransportType } from '@/types/transport'
import { 
  BaseModal, 
  BaseForm, 
  BaseFormField, 
  BaseInput, 
  BaseTextarea, 
  BaseSelect, 
  BaseButton, 
  BaseBadge
} from '@/components/common'

const emit = defineEmits<{
  close: []
  save: [route: Omit<TransportRoute, 'id' | 'createdAt' | 'updatedAt'>]
}>()

const isVisible = ref(true)

const transportStore = useTransportStore()

// 表单数据
const formData = reactive({
  name: '',
  description: '',
  tags: [] as string[],
  segments: [{
    transportType: TransportType.PLANE,
    departure: {
      name: '',
      address: '',
      coordinates: undefined as { lat: number; lng: number } | undefined
    },
    arrival: {
      name: '',
      address: '',
      coordinates: undefined as { lat: number; lng: number } | undefined
    },
    departureTime: '',
    arrivalTime: '',
    duration: 0,
    distance: undefined as number | undefined,
    cost: {
      baseCost: 0,
      totalCost: 0,
      currency: 'CNY'
    },
    notes: ''
  }]
})

// 表单状态
const isSubmitting = ref(false)
const newTag = ref('')
const errors = reactive({
  name: '',
  departure: '',
  arrival: '',
  duration: '',
  departureTime: '',
  baseCost: ''
})

// 选项数据
const transportTypeOptions = [
  { value: 'plane', label: '✈️ 飞机' },
  { value: 'high_speed_rail', label: '🚄 高铁' },
  { value: 'train', label: '🚂 火车' },
  { value: 'subway', label: '🚇 地铁' },
  { value: 'bus', label: '🚌 公交' },
  { value: 'taxi', label: '🚕 打车' },
  { value: 'rental_car', label: '🚗 租车' },
  { value: 'self_drive', label: '🚙 自驾' },
  { value: 'walking', label: '🚶 步行' },
  { value: 'bicycle', label: '🚲 自行车' },
  { value: 'motorcycle', label: '🏍️ 摩托车' },
  { value: 'boat', label: '⛵ 船只' },
  { value: 'other', label: '🚀 其他' }
]

const currencyOptions = [
  { value: 'CNY', label: '人民币 (¥)' },
  { value: 'USD', label: '美元 ($)' },
  { value: 'EUR', label: '欧元 (€)' },
  { value: 'JPY', label: '日元 (¥)' },
  { value: 'GBP', label: '英镑 (£)' }
]

// 计算属性
const modalRef = ref()

// 方法
const validateForm = (): boolean => {
  // 重置错误信息
  Object.keys(errors).forEach(key => {
    errors[key as keyof typeof errors] = ''
  })

  let isValid = true

  // 验证路线名称
  if (!formData.name.trim()) {
    errors.name = '请输入路线名称'
    isValid = false
  }

  // 验证出发地
  if (!formData.segments[0].departure.name.trim()) {
    errors.departure = '请输入出发地'
    isValid = false
  }

  // 验证目的地
  if (!formData.segments[0].arrival.name.trim()) {
    errors.arrival = '请输入目的地'
    isValid = false
  }

  // 验证时长
  if (!formData.segments[0].duration || formData.segments[0].duration <= 0) {
    errors.duration = '请输入有效的时长'
    isValid = false
  }

  // 验证出发时间
  if (!formData.segments[0].departureTime) {
    errors.departureTime = '请选择出发时间'
    isValid = false
  }

  // 验证基础费用
  if (!formData.segments[0].cost.baseCost || formData.segments[0].cost.baseCost < 0) {
    errors.baseCost = '请输入有效的基础费用'
    isValid = false
  }

  return isValid
}

const calculateArrivalTime = () => {
  if (formData.segments[0].departureTime && formData.segments[0].duration) {
    const departure = new Date(formData.segments[0].departureTime)
    const arrival = new Date(departure.getTime() + formData.segments[0].duration * 60000)
    formData.segments[0].arrivalTime = arrival.toISOString().slice(0, 16)
  }
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

const handleSubmit = async () => {
  if (!validateForm()) {
    return
  }

  isSubmitting.value = true

  try {
    // 计算到达时间
    calculateArrivalTime()

    // 构建路线数据
    const routeData: Omit<TransportRoute, 'id' | 'createdAt' | 'updatedAt'> = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      tags: [...formData.tags],
      segments: formData.segments.map(segment => ({
        id: '', // 将在 store 中生成
        transportType: segment.transportType,
        departure: {
          name: segment.departure.name.trim(),
          address: segment.departure.address.trim(),
          coordinates: segment.departure.coordinates
        },
        arrival: {
          name: segment.arrival.name.trim(),
          address: segment.arrival.address.trim(),
          coordinates: segment.arrival.coordinates
        },
        departureTime: new Date(segment.departureTime),
        arrivalTime: new Date(segment.arrivalTime),
        duration: segment.duration,
        distance: segment.distance,
        cost: {
          ...segment.cost,
          totalCost: segment.cost.baseCost
        },
        notes: segment.notes.trim()
      })),
      totalCost: {
        baseCost: formData.segments[0].cost.baseCost,
        totalCost: formData.segments[0].cost.baseCost,
        currency: formData.segments[0].cost.currency
      },
      totalDuration: formData.segments[0].duration,
      totalDistance: formData.segments[0].distance || 0,
      isFavorite: false
    }

    emit('save', routeData)
  } catch (error) {
    console.error('创建路线失败:', error)
  } finally {
    isSubmitting.value = false
  }
}

const handleClose = () => {
  isVisible.value = false
  emit('close')
}

// 监听时长变化，自动计算到达时间
watch(() => formData.segments[0].duration, calculateArrivalTime)
watch(() => formData.segments[0].departureTime, calculateArrivalTime)
</script>

<style scoped lang="scss">
.add-route-modal {
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
  
  .section-description {
    margin: 0 0 var(--spacing-lg) 0;
    font-size: 0.9rem;
    color: var(--text-secondary);
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
  
  .form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--spacing-lg);
    margin-bottom: var(--spacing-lg);
    
    @media (max-width: 768px) {
      grid-template-columns: 1fr;
      gap: var(--spacing-md);
    }
  }
  
  .tags-input {
    .tags-list {
      display: flex;
      flex-wrap: wrap;
      gap: var(--spacing-xs);
      margin-top: var(--spacing-sm);
    }
  }
  
  .segment-form {
    background: var(--bg-input);
    border: var(--border-width) solid var(--border-color);
    border-radius: var(--radius-md);
    padding: var(--spacing-lg);
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
