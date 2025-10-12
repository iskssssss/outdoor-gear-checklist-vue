<template>
  <div class="main-content">
    <div class="main-header">
      <StatsPanel />
    </div>
    <CategoryList @show-recommendation="$emit('show-recommendation')"
      @show-operation-log="$emit('show-operation-log')" />
  </div>
</template>

<script setup>
import StatsPanel from './StatsPanel.vue'
import CategoryList from './CategoryList.vue'

defineEmits(['show-recommendation', 'show-operation-log'])

function showRecommendation() {
  // Logic to show modal will be handled in App.vue
}

function showOperationLog() {
  // Logic to show modal will be handled in App.vue
}
</script>

<style scoped lang="scss">
.main-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  // 新增内边距以创建与页脚的间距
  padding-bottom: 40px;
}

.main-header {
  /* 未来可以添加一些欢迎语或快速操作 */
}

.content {
  // Prevents content from overflowing its grid cell
  min-width: 0;
}

/* On tablets and smaller screens, switch to a single-column layout */
@media (max-width: 992px) {
  .main-content {
    grid-template-columns: 1fr;
  }
}
</style>
