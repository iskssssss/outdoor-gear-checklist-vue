<template>
  <BaseModal
    ref="modalRef"
    title="添加行程段"
    width="800px"
    v-model="isVisible"
    @close="handleClose"
  >
    <div class="add-segment-modal">
      <form @submit.prevent="handleSubmit">
        <div class="form-section">
          <h3 class="section-title">行程信息</h3>
          
          <div class="form-row">
            <div class="form-field">
              <label class="field-label">交通工具 <span class="required-mark">*</span></label>
              <BaseSelect
                v-model="formData.transportType"
                :options="transportTypeOptions"
                placeholder="选择交通工具"
                :error="errors.transportType"
              />
            </div>
            
            <div class="form-field">
              <label class="field-label">预计时长（分钟） <span class="required-mark">*</span></label>
              <BaseInput
                v-model.number="formData.duration"
                type="number"
                placeholder="预计时长"
                :error="errors.duration"
              />
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-field">
              <label class="field-label">出发地 <span class="required-mark">*</span></label>
              <BaseInput
                v-model="formData.departure.name"
                placeholder="请输入出发地"
                :error="errors.departure"
              />
            </div>
            
            <div class="form-field">
              <label class="field-label">目的地 <span class="required-mark">*</span></label>
              <BaseInput
                v-model="formData.arrival.name"
                placeholder="请输入目的地"
                :error="errors.arrival"
              />
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-field">
              <label class="field-label">出发时间 <span class="required-mark">*</span></label>
              <BaseInput
                v-model="formData.departureTime"
                type="datetime-local"
                :error="errors.departureTime"
              />
            </div>
            
            <div class="form-field">
              <label class="field-label">距离（公里）</label>
              <BaseInput
                v-model.number="formData.distance"
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
                v-model.number="formData.cost.baseCost"
                type="number"
                step="0.01"
                placeholder="基础费用"
                :error="errors.baseCost"
              />
            </div>
            
            <div class="form-field">
              <label class="field-label">货币单位</label>
              <BaseSelect
                v-model="formData.cost.currency"
                :options="currencyOptions"
                placeholder="选择货币"
              />
            </div>
          </div>
          
          <!-- 额外费用 -->
          <div class="extra-costs" v-if="showExtraCosts">
            <h4 class="subsection-title">额外费用</h4>
            
            <div class="cost-item" v-for="(cost, index) in formData.cost.otherCosts" :key="index">
              <div class="cost-inputs">
                <BaseInput
                  v-model="cost.name"
                  placeholder="费用名称"
                  class="cost-name"
                />
                <BaseInput
                  v-model.number="cost.amount"
                  type="number"
                  step="0.01"
                  placeholder="金额"
                  class="cost-amount"
                />
                <BaseButton
                  variant="outline"
                  size="sm"
                  @click="removeExtraCost(index)"
                >
                  删除
                </BaseButton>
              </div>
              <BaseInput
                v-model="cost.description"
                placeholder="费用说明（可选）"
                class="cost-description"
              />
            </div>
            
            <BaseButton
              variant="outline"
              size="sm"
              @click="addExtraCost"
            >
              ➕ 添加额外费用
            </BaseButton>
          </div>
          
          <div class="form-actions-inline">
            <BaseButton
              variant="text"
              size="sm"
              @click="toggleExtraCosts"
            >
              {{ showExtraCosts ? '隐藏' : '显示' }}额外费用
            </BaseButton>
          </div>
          
          <div class="form-field">
            <label class="field-label">备注</label>
            <BaseTextarea
              v-model="formData.notes"
              placeholder="行程备注（可选）"
              rows="2"
            />
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
              添加行程段
            </BaseButton>
          </div>
        </div>
      </form>
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import type { TransportSegment } from '@/types/transport'
import { TransportType } from '@/types/transport'
import { 
  BaseModal, 
  BaseInput, 
  BaseTextarea, 
  BaseSelect, 
  BaseButton
} from '@/components/common'

const props = defineProps<{
  routeId: string
}>()

const emit = defineEmits<{
  close: []
  save: [segment: Omit<TransportSegment, 'id'>]
}>()

const isVisible = ref(true)

// 表单数据
const formData = reactive({
  transportType: '' as TransportType,
  departure: {
    name: '',
    address: '',
    coordinates: undefined
  },
  arrival: {
    name: '',
    address: '',
    coordinates: undefined
  },
  departureTime: '',
  arrivalTime: '',
  duration: 0,
  distance: undefined as number | undefined,
  cost: {
    baseCost: 0,
    totalCost: 0,
    currency: 'CNY',
    otherCosts: [] as Array<{
      name: string
      amount: number
      description?: string
    }>
  },
  notes: ''
})

// 表单状态
const isSubmitting = ref(false)
const showExtraCosts = ref(false)
const errors = reactive({
  transportType: '',
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

  // 验证交通工具
  if (!formData.transportType) {
    errors.transportType = '请选择交通工具'
    isValid = false
  }

  // 验证出发地
  if (!formData.departure.name.trim()) {
    errors.departure = '请输入出发地'
    isValid = false
  }

  // 验证目的地
  if (!formData.arrival.name.trim()) {
    errors.arrival = '请输入目的地'
    isValid = false
  }

  // 验证时长
  if (!formData.duration || formData.duration <= 0) {
    errors.duration = '请输入有效的时长'
    isValid = false
  }

  // 验证出发时间
  if (!formData.departureTime) {
    errors.departureTime = '请选择出发时间'
    isValid = false
  }

  // 验证基础费用
  if (!formData.cost.baseCost || formData.cost.baseCost < 0) {
    errors.baseCost = '请输入有效的基础费用'
    isValid = false
  }

  return isValid
}

const calculateArrivalTime = () => {
  if (formData.departureTime && formData.duration) {
    const departure = new Date(formData.departureTime)
    const arrival = new Date(departure.getTime() + formData.duration * 60000)
    formData.arrivalTime = arrival.toISOString().slice(0, 16)
  }
}

const calculateTotalCost = () => {
  let total = formData.cost.baseCost
  formData.cost.otherCosts.forEach(cost => {
    total += cost.amount || 0
  })
  formData.cost.totalCost = total
}

const addExtraCost = () => {
  formData.cost.otherCosts.push({
    name: '',
    amount: 0,
    description: ''
  })
}

const removeExtraCost = (index: number) => {
  formData.cost.otherCosts.splice(index, 1)
  calculateTotalCost()
}

const toggleExtraCosts = () => {
  showExtraCosts.value = !showExtraCosts.value
}

const handleSubmit = async () => {
  if (!validateForm()) {
    return
  }

  isSubmitting.value = true

  try {
    // 计算到达时间和总费用
    calculateArrivalTime()
    calculateTotalCost()

    // 构建行程段数据
    const segmentData: Omit<TransportSegment, 'id'> = {
      transportType: formData.transportType,
      departure: {
        name: formData.departure.name.trim(),
        address: formData.departure.address.trim(),
        coordinates: formData.departure.coordinates
      },
      arrival: {
        name: formData.arrival.name.trim(),
        address: formData.arrival.address.trim(),
        coordinates: formData.arrival.coordinates
      },
      departureTime: new Date(formData.departureTime),
      arrivalTime: new Date(formData.arrivalTime),
      duration: formData.duration,
      distance: formData.distance,
      cost: {
        ...formData.cost,
        totalCost: formData.cost.totalCost
      },
      notes: formData.notes.trim()
    }

    emit('save', segmentData)
  } catch (error) {
    console.error('添加行程段失败:', error)
  } finally {
    isSubmitting.value = false
  }
}

const handleClose = () => {
  isVisible.value = false
  emit('close')
}

/**
 * 重置表单数据到初始状态
 */
const resetFormData = () => {
  // 重置表单数据
  formData.transportType = '' as TransportType
  formData.departure = {
    name: '',
    address: '',
    coordinates: undefined
  }
  formData.arrival = {
    name: '',
    address: '',
    coordinates: undefined
  }
  formData.departureTime = ''
  formData.arrivalTime = ''
  formData.duration = 0
  formData.distance = undefined as number | undefined
  formData.cost = {
    baseCost: 0,
    totalCost: 0,
    currency: 'CNY',
    otherCosts: [] as Array<{
      name: string
      amount: number
      description?: string
    }>
  }
  formData.notes = ''
  
  // 重置其他状态
  isSubmitting.value = false
  showExtraCosts.value = false
  
  // 重置错误信息
  Object.keys(errors).forEach(key => {
    errors[key as keyof typeof errors] = ''
  })
}

// 监听模态框显示状态，每次打开时重置表单
watch(isVisible, (newVisible) => {
  if (newVisible) {
    resetFormData()
  }
})

// 监听变化
watch(() => formData.duration, calculateArrivalTime)
watch(() => formData.departureTime, calculateArrivalTime)
watch(() => formData.cost.baseCost, calculateTotalCost)
watch(() => formData.cost.otherCosts, calculateTotalCost, { deep: true })
</script>

<style scoped lang="scss">
.add-segment-modal {
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
  
  .subsection-title {
    margin: var(--spacing-lg) 0 var(--spacing-md) 0;
    font-size: 1rem;
    font-weight: var(--font-weight-bold);
    color: var(--text-primary);
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
  
  .extra-costs {
    background: var(--bg-input);
    border: var(--border-width) solid var(--border-color);
    border-radius: var(--radius-md);
    padding: var(--spacing-lg);
    margin-bottom: var(--spacing-lg);
  }
  
  .cost-item {
    margin-bottom: var(--spacing-md);
    
    &:last-child {
      margin-bottom: 0;
    }
  }
  
  .cost-inputs {
    display: grid;
    grid-template-columns: 1fr 1fr auto;
    gap: var(--spacing-sm);
    margin-bottom: var(--spacing-sm);
    
    @media (max-width: 768px) {
      grid-template-columns: 1fr;
    }
  }
  
  .cost-description {
    width: 100%;
  }
  
  .form-actions-inline {
    margin-bottom: var(--spacing-lg);
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
