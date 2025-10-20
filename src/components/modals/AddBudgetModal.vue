<template>
  <BaseModal
    ref="modalRef"
    title="新建预算"
    width="800px"
    v-model="isVisible"
    @close="handleClose"
  >
    <div class="add-budget-modal">
      <form @submit.prevent="handleSubmit">
        <div class="form-section">
          <h3 class="section-title">预算信息</h3>
          
          <div class="form-field">
            <label class="field-label">预算名称 <span class="required-mark">*</span></label>
            <BaseInput
              v-model="formData.name"
              placeholder="请输入预算名称"
              :error="errors.name"
            />
          </div>
          
          <div class="form-field">
            <label class="field-label">总预算金额（元） <span class="required-mark">*</span></label>
            <BaseInput
              v-model.number="formData.totalBudget"
              type="number"
              step="0.01"
              placeholder="请输入总预算金额"
              :error="errors.totalBudget"
            />
          </div>
          
          <div class="form-field">
            <label class="field-label">货币单位</label>
            <BaseSelect
              v-model="formData.currency"
              :options="currencyOptions"
              placeholder="选择货币"
            />
          </div>
        </div>

        <div class="form-section">
          <h3 class="section-title">分类预算</h3>
          <p class="section-description">为不同交通工具设置预算分配</p>
          
          <div class="category-budgets">
            <div
              v-for="(category, index) in formData.categories"
              :key="index"
              class="category-item"
            >
              <div class="category-header">
                <span class="transport-icon">{{ getTransportIcon(category.type) }}</span>
                <span class="transport-name">{{ getTransportName(category.type) }}</span>
                <BaseButton
                  variant="text"
                  size="sm"
                  @click="removeCategory(index)"
                >
                  删除
                </BaseButton>
              </div>
              
              <div class="category-inputs">
                <BaseFormField label="预算金额（元）">
                  <BaseInput
                    v-model.number="category.budget"
                    type="number"
                    step="0.01"
                    placeholder="预算金额"
                  />
                </BaseFormField>
              </div>
            </div>
            
            <BaseButton
              variant="outline"
              size="sm"
              @click="addCategory"
            >
              ➕ 添加交通工具
            </BaseButton>
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
              创建预算
            </BaseButton>
          </div>
        </div>
      </form>
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { TransportType } from '@/types/transport'
import { 
  BaseModal, 
  BaseInput, 
  BaseSelect, 
  BaseButton
} from '@/components/common'

const emit = defineEmits<{
  close: []
  save: [budget: any]
}>()

const isVisible = ref(true)

// 表单数据
const formData = reactive({
  name: '',
  totalBudget: 0,
  currency: 'CNY',
  categories: [
    { type: TransportType.PLANE, budget: 0, used: 0 },
    { type: TransportType.HIGH_SPEED_RAIL, budget: 0, used: 0 },
    { type: TransportType.TRAIN, budget: 0, used: 0 }
  ]
})

// 表单状态
const isSubmitting = ref(false)
const errors = reactive({
  name: '',
  totalBudget: ''
})

// 选项数据
const currencyOptions = [
  { value: 'CNY', label: '人民币 (¥)' },
  { value: 'USD', label: '美元 ($)' },
  { value: 'EUR', label: '欧元 (€)' },
  { value: 'JPY', label: '日元 (¥)' },
  { value: 'GBP', label: '英镑 (£)' }
]

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
const modalRef = ref()

// 方法
const validateForm = (): boolean => {
  errors.name = ''
  errors.totalBudget = ''
  
  if (!formData.name.trim()) {
    errors.name = '请输入预算名称'
    return false
  }
  
  if (!formData.totalBudget || formData.totalBudget <= 0) {
    errors.totalBudget = '请输入有效的预算金额'
    return false
  }
  
  return true
}

const getTransportIcon = (type: TransportType): string => {
  return transportIcons[type] || transportIcons[TransportType.OTHER]
}

const getTransportName = (type: TransportType): string => {
  return transportNames[type] || transportNames[TransportType.OTHER]
}

const addCategory = () => {
  // 找到还没有添加的交通工具类型
  const allTypes = Object.values(TransportType)
  const usedTypes = formData.categories.map(c => c.type)
  const availableType = allTypes.find(type => !usedTypes.includes(type))
  
  if (availableType) {
    formData.categories.push({
      type: availableType,
      budget: 0
    })
  }
}

const removeCategory = (index: number) => {
  if (formData.categories.length > 1) {
    formData.categories.splice(index, 1)
  }
}

const handleSubmit = async () => {
  if (!validateForm()) {
    return
  }

  isSubmitting.value = true

  try {
    const budgetData = {
      name: formData.name.trim(),
      totalBudget: formData.totalBudget,
      usedAmount: 0,
      remainingAmount: formData.totalBudget,
      currency: formData.currency,
      categories: formData.categories.map(category => ({
        type: category.type,
        budget: category.budget,
        used: 0
      }))
    }

    emit('save', budgetData)
  } catch (error) {
    console.error('创建预算失败:', error)
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
  formData.name = ''
  formData.totalBudget = 0
  formData.currency = 'CNY'
  formData.categories = [
    { type: TransportType.PLANE, budget: 0, used: 0 },
    { type: TransportType.HIGH_SPEED_RAIL, budget: 0, used: 0 },
    { type: TransportType.TRAIN, budget: 0, used: 0 }
  ]
  
  // 重置其他状态
  isSubmitting.value = false
  
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
</script>

<style scoped lang="scss">
.add-budget-modal {
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
  
  .category-budgets {
    .category-item {
      background: var(--bg-input);
      border: var(--border-width) solid var(--border-color);
      border-radius: var(--radius-md);
      padding: var(--spacing-lg);
      margin-bottom: var(--spacing-md);
      
      &:last-child {
        margin-bottom: 0;
      }
    }
    
    .category-header {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      margin-bottom: var(--spacing-md);
      
      .transport-icon {
        font-size: 1.2rem;
      }
      
      .transport-name {
        flex: 1;
        font-weight: var(--font-weight-bold);
        color: var(--text-primary);
      }
    }
    
    .category-inputs {
      display: grid;
      grid-template-columns: 1fr;
      gap: var(--spacing-md);
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
