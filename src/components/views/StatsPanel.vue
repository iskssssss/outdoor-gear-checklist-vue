<template>
  <div class="stats">
    <div class="stats-header">
      <h3>📊 装备统计</h3>
      <div class="completion-badge" :class="{ completed: completionRate === 100 }">
        {{ completionRate }}%
      </div>
    </div>

    <!-- 图表区域 -->
    <div class="charts-section">
      <!-- 完成率环形图 -->
      <div class="chart-container completion-chart">
        <h4>完成进度</h4>
        <BaseChart
          type="pie"
          :data="completionData"
          height="200px"
          @click="handleChartClick"
        />
      </div>

      <!-- 分类分布饼图 -->
      <div class="chart-container distribution-chart" v-if="categoryDistributionData.length > 0">
        <h4>分类分布</h4>
        <BaseChart
          type="pie"
          :data="categoryDistributionData"
          :height="categoryChartHeight"
          @click="handleChartClick"
        />
      </div>
    </div>

    <!-- 统计网格 -->
    <div class="stats-grid">
      <BaseStatCard
        icon="📦"
        :number="equipmentStore.totalCategories"
        label="装备分类"
        clickable
      />

      <BaseStatCard
        icon="🎒"
        :number="equipmentStore.totalItems"
        label="装备总数"
        clickable
      />

      <BaseStatCard
        icon="⚖️"
        :number="equipmentStore.totalWeight"
        label="总重量"
        :extra="averageWeight > 0 ? `平均 ${averageWeight}kg/件` : undefined"
        clickable
      />

      <BaseStatCard
        icon="💰"
        :number="formatPrice(equipmentStore.totalPrice)"
        label="总价格"
        :extra="averagePrice > 0 ? `平均 ¥${averagePrice}/件` : undefined"
        clickable
      />
    </div>

    <!-- 详细分析图表 -->
    <div class="analysis-charts" v-if="showAnalysisCharts">
      <!-- 重量分布柱状图 -->
      <div class="chart-container analysis-chart" v-if="weightDistributionData.categories.length > 0">
        <h4>重量分布</h4>
        <BaseChart
          type="bar"
          :data="weightDistributionData"
          height="250px"
          @click="handleChartClick"
        />
      </div>

      <!-- 价格分布柱状图 -->
      <div class="chart-container analysis-chart" v-if="priceDistributionData.categories.length > 0">
        <h4>价格分布</h4>
        <BaseChart
          type="bar"
          :data="priceDistributionData"
          height="250px"
          @click="handleChartClick"
        />
      </div>
    </div>

    <!-- 切换按钮 -->
    <div class="chart-controls">
      <BaseButton 
        @click="toggleAnalysisCharts"
        variant="outline"
        size="sm"
        :icon="showAnalysisCharts ? '📊' : '📈'"
      >
        {{ showAnalysisCharts ? '隐藏详细分析' : '显示详细分析' }}
      </BaseButton>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useEquipmentStore } from '@/stores/equipment.ts'
import { BaseStatCard, BaseButton } from '@/components/common'
import { BaseChart } from '@/components/charts'
import { useEquipmentChartData } from '@/composables/useChartData'
import { toast } from '@/utils/toast'

const equipmentStore = useEquipmentStore()
const showAnalysisCharts = ref(false)

// 使用图表数据
const {
  completionData,
  categoryDistributionData,
  weightDistributionData,
  priceDistributionData
} = useEquipmentChartData()

/**
 * 完成率百分比
 */
const completionRate = computed(() => {
  if (equipmentStore.totalItems === 0) return 0
  return Math.round((equipmentStore.completedItems / equipmentStore.totalItems) * 100)
})

/**
 * 平均重量（每件装备）
 */
const averageWeight = computed(() => {
  if (equipmentStore.totalItems === 0) return 0
  const totalKg = parseFloat(equipmentStore.totalWeight.replace('kg', ''))
  return (totalKg / equipmentStore.totalItems).toFixed(2)
})

/**
 * 平均价格（每件装备）
 */
const averagePrice = computed(() => {
  if (equipmentStore.totalItems === 0) return 0
  const totalPrice = parseFloat(equipmentStore.totalPrice.replace('人民币', ''))
  return (totalPrice / equipmentStore.totalItems).toFixed(2)
})

/**
 * 分类分布饼图高度（根据分类数量动态调整）
 */
const categoryChartHeight = computed(() => {
  const categoryCount = categoryDistributionData.value.length
  
  // 基础高度
  let baseHeight = 200
  
  // 根据分类数量调整高度
  if (categoryCount <= 3) {
    baseHeight = 200
  } else if (categoryCount <= 5) {
    baseHeight = 250
  } else if (categoryCount <= 8) {
    baseHeight = 300
  } else if (categoryCount <= 12) {
    baseHeight = 350
  } else {
    baseHeight = 400
  }
  
  return `${baseHeight}px`
})

/**
 * 格式化价格显示
 */
function formatPrice(priceString) {
  // 从字符串中提取数字和单位，如 "1234.56人民币"
  const match = priceString.match(/([\d.]+)(.*)/)
  if (!match) return priceString

  const num = parseFloat(match[1])
  const unit = match[2]

  if (isNaN(num)) return priceString

  // 添加千位分隔符
  const formatted = num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  return '¥' + formatted
}

/**
 * 切换详细分析图表显示
 */
function toggleAnalysisCharts() {
  showAnalysisCharts.value = !showAnalysisCharts.value
}

/**
 * 处理图表点击事件
 */
function handleChartClick(params) {
  if (params.componentType === 'series') {
    const chartType = params.seriesType
    const dataName = params.name
    const dataValue = params.value
    
    let message = ''
    if (chartType === 'pie') {
      message = `点击了 ${dataName}：${dataValue}`
    } else if (chartType === 'bar') {
      message = `点击了 ${dataName}：${dataValue}`
    }
    
    if (message) {
      toast.info(message)
    }
  }
}
</script>

<style scoped lang="scss">
.stats {
  // 为伪元素提供定位上下文，支持主题增强效果
  position: relative;
  background: var(--bg-card);
  border: var(--border-width) solid var(--border-color);
  border-radius: var(--border-radius-xl);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
  padding: 24px;
  transition: box-shadow 0.3s ease;

  // 添加微妙的背景图案
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-image: var(--bg-pattern);
    background-size: var(--bg-pattern-size, cover);
    opacity: var(--bg-pattern-opacity, 0.03);
    pointer-events: none;
    z-index: 0;
  }
  
  &:hover {
    box-shadow: var(--shadow-md);
  }
  
  // 确保内容在主题伪元素之上
  > * {
    position: relative;
    z-index: 1;
  }
}

.stats-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;

  h3 {
    margin: 0;
    color: var(--text-primary);
    font-size: 1.25rem;
    font-weight: 700;
  }
}

.completion-badge {
  background: var(--primary-color);
  color: var(--text-white);
  padding: 6px 16px;
  border-radius: var(--border-radius-pill);
  font-weight: 700;
  font-size: 0.95rem;
  box-shadow: var(--shadow-sm);
  transition: all 0.3s ease;

  &.completed {
    background: var(--success-color);
  }
}

.progress-section {
  margin-bottom: 24px;
}

.progress-bar-container {
  background: var(--bg-main);
  height: 32px;
  border-radius: var(--border-radius-pill);
  overflow: hidden;
  box-shadow: var(--shadow-inset, inset 0 2px 4px rgba(0, 0, 0, 0.06));
  margin-bottom: 12px;
  border: var(--border-width-sm) solid var(--border-color-light);
}

.progress-bar {
  height: 100%;
  background: var(--primary-gradient, var(--primary-color));
  transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--border-radius-pill);
  position: relative;
  overflow: hidden;
  box-shadow: var(--shadow-sm);

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: var(--shimmer-gradient, linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent));
    animation: shimmer 2s infinite;
  }
}

@keyframes shimmer {
  0% {
    left: -100%;
  }

  100% {
    left: 100%;
  }
}

.progress-text {
  color: var(--text-white, #ffffff);
  font-weight: 700;
  font-size: 0.9rem;
  z-index: 1;
  text-shadow: var(--text-shadow-sm, 0 1px 2px rgba(0, 0, 0, 0.2));
}

.progress-info {
  display: flex;
  justify-content: space-around;
  gap: 12px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: var(--border-radius);
  background: var(--bg-main);
  border: var(--border-width-sm) solid var(--border-color-light);
  transition: all 0.3s ease;
  flex: 1;
  justify-content: center;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-sm);
    background: var(--bg-input);
    border-color: var(--border-color);
  }
}

.info-icon {
  font-size: 1.15rem;
  flex-shrink: 0;
  transition: transform 0.3s ease;
  
  .info-item:hover & {
    transform: scale(1.15);
  }
}

.info-label {
  color: var(--text-secondary);
  font-size: 0.85rem;
  font-weight: 500;
}

.info-count {
  color: var(--text-primary);
  font-size: 1rem;
  font-weight: 700;
  margin-left: auto;
  padding-left: 8px;
}

// 已完成项的特殊样式
.info-completed {
  .info-count {
    color: var(--success-color, #10b981);
  }
}

// 待准备项的特殊样式
.info-pending {
  .info-count {
    color: var(--warning-color, #f59e0b);
  }
}

// 图表区域样式
.charts-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
  
  // 响应式设计
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  @media (max-width: 480px) {
    gap: 12px;
  }
}

.chart-container {
  background: var(--bg-main);
  border: var(--border-width-sm) solid var(--border-color-light);
  border-radius: var(--border-radius-lg);
  padding: 16px;
  transition: all 0.3s ease;
  min-height: 200px; // 确保最小高度
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
    border-color: var(--border-color);
  }
  
  h4 {
    margin: 0 0 12px 0;
    color: var(--text-primary);
    font-size: 1rem;
    font-weight: 600;
    text-align: center;
  }
  
  // 响应式设计
  @media (max-width: 768px) {
    padding: 12px;
    min-height: 180px;
  }
  
  @media (max-width: 480px) {
    padding: 8px;
    min-height: 160px;
    
    h4 {
      font-size: 0.9rem;
      margin-bottom: 8px;
    }
  }
}

.completion-chart {
  // 完成率图表特殊样式
  border-color: var(--accent-primary);
  
  &:hover {
    border-color: var(--accent-primary);
    box-shadow: 0 4px 12px rgba(var(--accent-primary-rgb, 59, 130, 246), 0.15);
  }
}

.distribution-chart {
  // 分布图表特殊样式
  border-color: var(--accent-success);
  
  &:hover {
    border-color: var(--accent-success);
    box-shadow: 0 4px 12px rgba(var(--accent-success-rgb, 16, 185, 129), 0.15);
  }
}

// 详细分析图表
.analysis-charts {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.analysis-chart {
  border-color: var(--accent-info);
  
  &:hover {
    border-color: var(--accent-info);
    box-shadow: 0 4px 12px rgba(var(--accent-info-rgb, 6, 182, 212), 0.15);
  }
}

// 图表控制按钮
.chart-controls {
  display: flex;
  justify-content: center;
  margin-top: 16px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 16px;
}

// BaseStatCard 已接管统计卡片样式

// 标题呼吸动画
.stats-header h3 {
  animation: breathing-glow 4s ease-in-out infinite;
}

@keyframes breathing-glow {
  0%, 100% {
    text-shadow: 0 0 5px transparent;
  }
  50% {
    text-shadow: var(--text-glow-sm, 0 0 10px rgba(255, 255, 255, 0.5));
  }
}

@keyframes pulse {

  0%,
  100% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.05);
  }
}

@keyframes pulse-glow {

  0%,
  100% {
    box-shadow: var(--pulse-glow-start);
  }

  50% {
    box-shadow: var(--pulse-glow-end);
  }
}

@media (max-width: 768px) {
  .stats {
    padding: 20px;
  }

  .stats-header h3 {
    font-size: 1.1rem;
  }

  .completion-badge {
    padding: 6px 14px;
    font-size: 0.9rem;
  }

  // 移动端图表布局
  .charts-section {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .chart-container {
    padding: 12px;
    
    h4 {
      font-size: 0.9rem;
      margin-bottom: 8px;
    }
  }

  .analysis-charts {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }
}
</style>
