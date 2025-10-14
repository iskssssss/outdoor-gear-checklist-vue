<template>
  <div class="stats">
    <div class="stats-header">
      <h3>📊 装备统计</h3>
      <div class="completion-badge" :class="{ completed: completionRate === 100 }">
        {{ completionRate }}%
      </div>
    </div>

    <!-- 进度条 -->
    <div class="progress-section">
      <div class="progress-bar-container">
        <div class="progress-bar" :style="{ width: completionRate + '%' }">
          <span class="progress-text" v-if="completionRate > 10">{{ equipmentStore.completedItems }} / {{
            equipmentStore.totalItems }}</span>
        </div>
      </div>
      <div class="progress-info">
        <span class="info-item info-completed">
          <span class="info-icon">✅</span>
          <span class="info-label">已准备</span>
          <span class="info-count">{{ equipmentStore.completedItems }}</span>
        </span>
        <span class="info-item info-pending">
          <span class="info-icon">⏳</span>
          <span class="info-label">待准备</span>
          <span class="info-count">{{ equipmentStore.remainingItems }}</span>
        </span>
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
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useEquipmentStore } from '@/stores/equipment.js'
import { BaseStatCard } from '@/components/common'

const equipmentStore = useEquipmentStore()

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

  .progress-bar-container {
    height: 30px;
  }

  .progress-text {
    font-size: 0.85rem;
  }
  
  .progress-info {
    gap: 8px;
  }

  .info-item {
    padding: 6px 12px;
    gap: 6px;
  }
  
  .info-icon {
    font-size: 1rem;
  }
  
  .info-label {
    font-size: 0.75rem;
  }
  
  .info-count {
    font-size: 0.9rem;
    padding-left: 4px;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }

  .stat-item {
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 12px;
    padding: 16px;
  }

  .stat-content {
    text-align: center;
  }

  .stat-icon {
    font-size: 1.8rem;
  }

  .stat-number {
    font-size: 1.3rem;
  }

  .stat-label {
    font-size: 0.8rem;
  }

  .stat-extra {
    font-size: 0.7rem;
  }
}
</style>
