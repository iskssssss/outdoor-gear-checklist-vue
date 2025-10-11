<template>
  <div class="stats">
    <h3>📊 装备统计</h3>
    <div class="stats-grid">
      <div class="stat-item">
        <div class="stat-number">{{ equipmentStore.totalCategories }}</div>
        <div class="stat-label">装备分类</div>
      </div>
      <div class="stat-item">
        <div class="stat-number">{{ equipmentStore.totalItems }}</div>
        <div class="stat-label">装备总数</div>
      </div>
      <div class="stat-item">
        <div class="stat-number">{{ equipmentStore.completedItems }}</div>
        <div class="stat-label">已准备</div>
      </div>
      <div class="stat-item">
        <div class="stat-number">{{ equipmentStore.remainingItems }}</div>
        <div class="stat-label">待准备</div>
      </div>
      <div class="stat-item">
        <div class="stat-number">{{ equipmentStore.totalWeight }}</div>
        <div class="stat-label">总重量</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useEquipmentStore } from '../stores/equipment'

const equipmentStore = useEquipmentStore()
</script>

<style scoped lang="scss">
.stats {
  background: var(--bg-card);
  border-radius: 12px;
  padding: 25px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.stats h3 {
  margin: 0 0 20px 0;
  color: var(--text-primary);
  font-size: 1.2rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 20px;
}

.stat-item {
  text-align: center;
  padding: 20px;
  border-radius: 10px;
  color: var(--text-primary);
  transition: transform 0.3s ease;
}

.stat-item:hover {
  transform: translateY(-5px);
}

.stat-number {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 0.9rem;
  opacity: 0.9;
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .stat-number {
    font-size: 1.5rem;
  }
}
</style>

