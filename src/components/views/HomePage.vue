<template>
  <div class="main-content">
    <div class="sidebar">
      <StatsPanel />
    </div>
    <div class="content">
      <CategoryList 
        @show-recommendation="showRecommendation" 
        @show-operation-log="showOperationLog"
      />
    </div>
  </div>
</template>

<script setup>
import CategoryList from './CategoryList.vue'
import StatsPanel from './StatsPanel.vue'

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
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 20px;
}

.content {
  min-width: 0; /* Prevents content from overflowing its grid cell */
}

/* On tablets and smaller screens, switch to a single-column layout */
@media (max-width: 992px) {
  .main-content {
    grid-template-columns: 1fr;
  }
}
</style>
