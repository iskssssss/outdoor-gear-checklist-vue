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
          <span class="progress-text" v-if="completionRate > 10">{{ equipmentStore.completedItems }} / {{ equipmentStore.totalItems }}</span>
        </div>
      </div>
      <div class="progress-info">
        <span class="info-item">
          <span class="icon">✅</span> 已准备 {{ equipmentStore.completedItems }}
        </span>
        <span class="info-item">
          <span class="icon">⏳</span> 待准备 {{ equipmentStore.remainingItems }}
        </span>
      </div>
    </div>

    <!-- 统计网格 -->
    <div class="stats-grid">
      <div class="stat-item stat-categories">
        <div class="stat-icon">📦</div>
        <div class="stat-content">
          <div class="stat-number">{{ equipmentStore.totalCategories }}</div>
          <div class="stat-label">装备分类</div>
        </div>
      </div>

      <div class="stat-item stat-items">
        <div class="stat-icon">🎒</div>
        <div class="stat-content">
          <div class="stat-number">{{ equipmentStore.totalItems }}</div>
          <div class="stat-label">装备总数</div>
        </div>
      </div>

      <div class="stat-item stat-weight">
        <div class="stat-icon">⚖️</div>
        <div class="stat-content">
          <div class="stat-number">{{ equipmentStore.totalWeight }}</div>
          <div class="stat-label">总重量</div>
          <div class="stat-extra" v-if="averageWeight > 0">
            平均 {{ averageWeight }}kg/件
          </div>
        </div>
      </div>

      <div class="stat-item stat-price">
        <div class="stat-icon">💰</div>
        <div class="stat-content">
          <div class="stat-number">{{ formatPrice(equipmentStore.totalPrice) }}</div>
          <div class="stat-label">总价格</div>
          <div class="stat-extra" v-if="averagePrice > 0">
            平均 ¥{{ averagePrice }}/件
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useEquipmentStore } from '../stores/equipment'

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
  background: var(--bg-card);
  border-radius: var(--border-radius, 16px);
  padding: 28px;
  box-shadow: var(--shadow-card, 0 4px 20px rgba(0, 0, 0, 0.08));
  position: relative;
  overflow: hidden;
}

.stats-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;

  h3 {
    margin: 0;
    color: var(--text-primary);
    font-size: 1.3rem;
    font-weight: 700;
  }
}

.completion-badge {
  background: var(--primary-color);
  color: var(--text-white);
  padding: 8px 18px;
  border-radius: calc(var(--border-radius, 8px) * 2);
  font-weight: 700;
  font-size: 1rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;

  &.completed {
    background: var(--success-color);
  }
}

.progress-section {
  margin-bottom: 28px;
}

.progress-bar-container {
  background: var(--bg-input, rgba(0, 0, 0, 0.05));
  height: 36px;
  border-radius: calc(var(--border-radius, 8px) * 2);
  overflow: hidden;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 12px;
  border: var(--border-width, 1px) solid var(--border-color, transparent);
}

.progress-bar {
  height: 100%;
  background: var(--primary-color);
  transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: calc(var(--border-radius, 8px) * 2);
  position: relative;
  overflow: hidden;

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
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
  color: var(--text-white);
  font-weight: 700;
  font-size: 0.95rem;
  z-index: 1;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.progress-info {
  display: flex;
  justify-content: space-around;
  gap: 16px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--text-primary);
  font-size: 0.95rem;
  font-weight: 500;

  .icon {
    font-size: 1.1rem;
  }
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 20px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  border-radius: var(--border-radius, 14px);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: var(--bg-hover, var(--bg-input));
  border: var(--border-width, 2px) solid var(--border-color);
  position: relative;
  overflow: hidden;
  box-shadow: var(--shadow-card);

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
    transition: left 0.5s;
  }

  &:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-hover, 0 8px 24px rgba(0, 0, 0, 0.12));
    
    &::before {
      left: 100%;
    }
  }
}

.stat-icon {
  font-size: 2.2rem;
  flex-shrink: 0;
}

.stat-content {
  flex: 1;
  text-align: left;
}

.stat-number {
  font-size: 1.6rem;
  font-weight: 700;
  margin-bottom: 4px;
  color: var(--text-primary);
  line-height: 1.2;
}

.stat-label {
  font-size: 0.85rem;
  color: var(--text-secondary);
  font-weight: 500;
  opacity: 0.8;
}

.stat-extra {
  font-size: 0.75rem;
  color: var(--text-secondary);
  margin-top: 4px;
  opacity: 0.7;
  font-weight: 400;
}

/* ========== 默认主题样式 ========== */
body.theme-default .stats,
body:not([class*="theme-"]) .stats {
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
    z-index: 1;
  }

  .completion-badge {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    animation: pulse 2s ease-in-out infinite;

    &.completed {
      background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
    }
  }

  .progress-bar-container {
    background: #f3f4f7;
  }

  .progress-bar {
    background: linear-gradient(90deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
    box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
  }

  .info-item {
    .icon {
      filter: grayscale(0);
    }
  }

  .stat-item {
    &::before {
      background: linear-gradient(90deg, transparent, rgba(102, 126, 234, 0.15), transparent);
    }
    
    &:hover::before {
      background: linear-gradient(90deg, transparent, rgba(102, 126, 234, 0.25), transparent);
    }
  }

  .stat-categories {
    background: linear-gradient(135deg, rgba(102, 126, 234, 0.08) 0%, rgba(118, 75, 162, 0.08) 100%);
    border-color: rgba(102, 126, 234, 0.2);
    
    &:hover {
      border-color: rgba(102, 126, 234, 0.4);
    }
  }

  .stat-items {
    background: linear-gradient(135deg, rgba(17, 153, 142, 0.08) 0%, rgba(56, 239, 125, 0.08) 100%);
    border-color: rgba(17, 153, 142, 0.2);
    
    &:hover {
      border-color: rgba(17, 153, 142, 0.4);
    }
  }

  .stat-weight {
    background: linear-gradient(135deg, rgba(247, 159, 31, 0.08) 0%, rgba(238, 69, 64, 0.08) 100%);
    border-color: rgba(247, 159, 31, 0.2);
    
    &:hover {
      border-color: rgba(247, 159, 31, 0.4);
    }
  }

  .stat-price {
    background: linear-gradient(135deg, rgba(255, 215, 0, 0.12) 0%, rgba(255, 140, 0, 0.12) 100%);
    border-color: rgba(255, 215, 0, 0.3);
    
    &:hover {
      border-color: rgba(255, 215, 0, 0.5);
    }

    .stat-number {
      background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
  }
}

/* ========== 暗黑主题样式 ========== */
body.theme-dark .stats {
  .completion-badge {
    background: linear-gradient(135deg, #00d9ff 0%, #b388ff 100%);
    box-shadow: 0 0 15px rgba(0, 217, 255, 0.5);
    animation: pulse-glow 2s ease-in-out infinite;
    
    &.completed {
      background: linear-gradient(135deg, #00e676 0%, #00c853 100%);
      box-shadow: 0 0 15px rgba(0, 230, 118, 0.5);
    }
  }

  .progress-bar-container {
    background: #1a1d29;
    box-shadow: inset 0 0 10px rgba(0, 217, 255, 0.1);
  }

  .progress-bar {
    background: linear-gradient(90deg, #00d9ff 0%, #b388ff 100%);
    box-shadow: 0 0 15px rgba(0, 217, 255, 0.6);
    
    &::after {
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
    }
  }

  .info-item {
    color: var(--text-primary);
    
    .icon {
      text-shadow: 0 0 8px rgba(0, 217, 255, 0.3);
    }
  }

  .stat-item {
    background: linear-gradient(135deg, #1a1d29 0%, #252a3d 100%);
    border-color: rgba(0, 217, 255, 0.2);
    
    &::before {
      background: linear-gradient(90deg, transparent, rgba(0, 217, 255, 0.2), transparent);
    }
    
    &:hover {
      box-shadow: 0 0 20px rgba(0, 217, 255, 0.3);
      border-color: rgba(0, 217, 255, 0.4);
      
      &::before {
        background: linear-gradient(90deg, transparent, rgba(0, 217, 255, 0.3), transparent);
      }
    }
  }

  .stat-categories {
    border-color: rgba(0, 217, 255, 0.25);
  }

  .stat-items {
    border-color: rgba(179, 136, 255, 0.25);
  }

  .stat-weight {
    border-color: rgba(255, 215, 64, 0.25);
  }

  .stat-price {
    border-color: rgba(0, 229, 118, 0.25);
  }
}

/* ========== 手绘主题样式 ========== */
body.theme-paper .stats {
  .completion-badge {
    background: linear-gradient(135deg, #86a361 0%, #6b8a4f 100%);
    border: 2px solid var(--border-color);
    box-shadow: 3px 3px 0 rgba(0, 0, 0, 0.1);
    
    &.completed {
      background: linear-gradient(135deg, #6b8a4f 0%, #86a361 100%);
      border-color: #374427;
    }
  }

  .progress-bar-container {
    border-radius: 15px 255px 225px 15px / 255px 15px 15px 225px;
    background: #f5f0e6;
    border: 2px solid var(--border-color);
  }

  .progress-bar {
    background: linear-gradient(90deg, #86a361 0%, #6b8a4f 100%);
    border-radius: 15px 255px 225px 15px / 255px 15px 15px 225px;
    
    &::after {
      display: none; // 手绘风格不需要流光效果
    }
  }

  .info-item {
    .icon {
      transform: rotate(-2deg);
    }
  }

  .stat-item {
    background: var(--bg-card);
    box-shadow: 5px 5px 0 rgba(0, 0, 0, 0.1);
    border: 2px solid var(--border-color);
    
    &::before {
      display: none; // 手绘风格不需要流光效果
    }
    
    &:hover {
      transform: translateY(-2px) rotate(0.5deg);
      box-shadow: 6px 6px 0 rgba(0, 0, 0, 0.15);
    }
  }

  .stat-categories {
    background: var(--success-light);
    border-color: var(--success-color);
  }

  .stat-items {
    background: #deefff;
    border-color: var(--secondary-color);
  }

  .stat-weight {
    background: var(--warning-light);
    border-color: var(--warning-color);
  }

  .stat-price {
    background: var(--success-light);
    border-color: var(--success-color);
    
    .stat-number {
      color: var(--success-text);
      background: none;
      -webkit-text-fill-color: unset;
      font-weight: 700;
    }
  }
}

/* ========== 柔和主题样式 ========== */
body.theme-soft .stats {
  .completion-badge {
    background: linear-gradient(135deg, #ff9ecd 0%, #c4b0ff 100%);
    box-shadow: 0 4px 12px rgba(255, 158, 205, 0.3);
    
    &.completed {
      background: linear-gradient(135deg, #90d9c5 0%, #6bc9b0 100%);
      box-shadow: 0 4px 12px rgba(144, 217, 197, 0.4);
    }
  }

  .progress-bar-container {
    background: #fff5fb;
    border: 2px solid var(--border-color);
  }

  .progress-bar {
    background: linear-gradient(90deg, #ff9ecd 0%, #c4b0ff 100%);
    box-shadow: 0 2px 8px rgba(255, 158, 205, 0.3);
  }

  .info-item {
    .icon {
      transform: scale(1.1);
    }
  }

  .stat-item {
    background: var(--bg-card);
    border: 2px solid var(--border-color);
    box-shadow: 0 4px 12px rgba(255, 158, 205, 0.15);
    
    &::before {
      background: linear-gradient(90deg, transparent, rgba(255, 158, 205, 0.15), transparent);
    }
    
    &:hover {
      transform: translateY(-4px) scale(1.02);
      box-shadow: 0 8px 20px rgba(255, 158, 205, 0.25);
      
      &::before {
        background: linear-gradient(90deg, transparent, rgba(255, 158, 205, 0.25), transparent);
      }
    }
  }

  .stat-categories {
    background: linear-gradient(135deg, rgba(255, 158, 205, 0.12) 0%, rgba(196, 176, 255, 0.12) 100%);
    border-color: rgba(255, 158, 205, 0.3);
    
    &:hover {
      border-color: rgba(255, 158, 205, 0.5);
    }
  }

  .stat-items {
    background: linear-gradient(135deg, rgba(144, 217, 197, 0.12) 0%, rgba(107, 201, 176, 0.12) 100%);
    border-color: rgba(144, 217, 197, 0.3);
    
    &:hover {
      border-color: rgba(144, 217, 197, 0.5);
    }
  }

  .stat-weight {
    background: linear-gradient(135deg, rgba(255, 210, 128, 0.12) 0%, rgba(255, 198, 92, 0.12) 100%);
    border-color: rgba(255, 210, 128, 0.3);
    
    &:hover {
      border-color: rgba(255, 210, 128, 0.5);
    }
  }

  .stat-price {
    background: linear-gradient(135deg, rgba(255, 210, 128, 0.15) 0%, rgba(255, 198, 92, 0.15) 100%);
    border-color: rgba(255, 210, 128, 0.4);
    
    &:hover {
      border-color: rgba(255, 210, 128, 0.6);
    }

    .stat-number {
      background: linear-gradient(135deg, #ffd280 0%, #ffb84d 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
  }
}

/* ========== 极简主题样式 ========== */
body.theme-minimal .stats {
  &::before {
    display: none;
  }

  .completion-badge {
    border: 2px solid var(--primary-color);
    background: transparent;
    color: var(--primary-color);
    animation: none;
    box-shadow: none;
    
    &.completed {
      background: var(--primary-color);
      color: var(--text-white);
    }
  }

  .progress-bar-container {
    background: #ffffff;
    border: 1px solid var(--border-color);
    border-radius: 0;
    box-shadow: none;
  }

  .progress-bar {
    background: #000000;
    border-radius: 0;
    
    &::after {
      display: none; // 极简风格不需要流光效果
    }
  }

  .info-item {
    .icon {
      filter: grayscale(100%);
    }
  }

  .stat-item {
    background: transparent;
    border-bottom: 2px solid var(--border-color);
    border-left: none;
    border-right: none;
    border-top: none;
    border-radius: 0;
    box-shadow: none;

    &::before {
      display: none; // 极简主题不需要任何装饰效果
    }

    &:hover {
      transform: none;
      border-bottom-color: var(--primary-color);
      box-shadow: none;
    }
  }

  .stat-categories,
  .stat-items,
  .stat-weight,
  .stat-price {
    background: transparent;
    
    &:hover {
      background: rgba(0, 0, 0, 0.02);
    }
  }

  .stat-price .stat-number {
    color: var(--text-primary);
    background: none;
    -webkit-text-fill-color: unset;
  }
}

/* ========== 像素主题样式 ========== */
body.theme-pixel .stats {
  .completion-badge {
    border-radius: 0;
    background: linear-gradient(90deg, #008080 0%, #00a0a0 100%);
    box-shadow: 4px 4px var(--pixel-shadow-color);
    animation: none;
    border: 2px solid var(--pixel-border-color);
    
    &.completed {
      background: linear-gradient(90deg, #00a000 0%, #00c000 100%);
      box-shadow: 4px 4px #004000;
    }
  }

  .progress-bar-container {
    border-radius: 0;
    background: #404040;
    border: 2px solid var(--pixel-border-color);
    box-shadow: inset 2px 2px var(--pixel-shadow-color);
  }

  .progress-bar {
    border-radius: 0;
    background: linear-gradient(90deg, #008080 0%, #00a0a0 50%, #008080 100%);
    box-shadow: 2px 2px var(--pixel-shadow-color);
    
    &::after {
      display: none; // 像素风格不需要流光效果
    }
  }

  .info-item {
    .icon {
      image-rendering: pixelated;
    }
  }

  .stat-item {
    background: var(--bg-card);
    border-radius: 0;
    border: 2px solid var(--pixel-border-color);
    box-shadow: 4px 4px var(--pixel-shadow-color);

    &::before {
      display: none; // 像素风格不需要流光效果
    }

    &:hover {
      transform: translate(-2px, -2px);
      box-shadow: 6px 6px var(--pixel-shadow-color);
    }
  }

  .stat-categories {
    background: linear-gradient(135deg, #c0c0c0 0%, #a0a0a0 100%);
    border-color: var(--primary-color);
  }

  .stat-items {
    background: linear-gradient(135deg, #a0ffa0 0%, #80e080 100%);
    border-color: var(--success-color);
  }

  .stat-weight {
    background: linear-gradient(135deg, #ffff80 0%, #e0e060 100%);
    border-color: var(--warning-color);
  }

  .stat-price {
    background: linear-gradient(135deg, #ffa0a0 0%, #e08080 100%);
    border-color: var(--danger-color);
    
    .stat-number {
      color: var(--text-primary);
      background: none;
      -webkit-text-fill-color: unset;
    }
  }
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

@keyframes pulse-glow {
  0%, 100% {
    box-shadow: 0 0 15px rgba(0, 217, 255, 0.5);
  }
  50% {
    box-shadow: 0 0 25px rgba(0, 217, 255, 0.8);
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

  .info-item {
    font-size: 0.85rem;
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

