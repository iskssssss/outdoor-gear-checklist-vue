<template>
  <div ref="containerRef" class="waterfall-layout-container" :style="waterfallStyle">
    <CategoryItem
      v-for="(category, index) in props.categories"
      :key="category.id"
      :category="category"
      :layout-mode="props.layoutMode"
      :ref="el => setCategoryRef(el, index)"
      :style="itemPositions[index] || {}"
    />

    <!-- 添加分类按钮 -->
    <div 
      v-if="props.addCardVisible"
      class="add-category-card"
      :style="addButtonPosition"
      @click="emit('add-card-click')"
    >
      <slot name="add-card-content"></slot>
    </div>

    <!-- 添加分类输入框（通过slot传递） -->
    <div
      v-if="props.addCardVisible && isAddingCategory"
      class="add-category-input-card"
      :style="addButtonPosition"
    >
      <slot name="add-input-card-content"></slot>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, watch, onMounted, onUnmounted } from 'vue'
import CategoryItem from './CategoryItem.vue'

const props = defineProps({
  categories: { type: Array, required: true },
  columnGap: { type: Number, default: 16 },
  addCardVisible: { type: Boolean, default: false },
  isAdding: { type: Boolean, default: false }, // 从父组件接收是否正在添加分类
  layoutMode: { type: String, default: 'waterfall' } // 布局模式，用于控制动画
})

const emit = defineEmits(['add-card-click'])

// 瀑布流相关状态
const containerRef = ref(null)
const categoryRefs = [] // 用于存储CategoryItem的引用
const itemPositions = ref([]) // 存储每个CategoryItem的绝对定位样式
const waterfallStyle = ref({}) // 容器的高度样式
const addButtonPosition = ref({}) // 添加按钮的定位样式
const columnCount = ref(3) // 瀑布流列数
const gap = computed(() => props.columnGap) // 列间距
const isAddingCategory = computed(() => props.isAdding) // 从props获取是否正在添加

// 动画相关状态
let resizeTimeout = null
let animationFrameId = null
let isAnimating = false
let currentTransitionDuration = ref(0.5) // 当前transition时长（秒）

// 存储每个分类上次的高度，用于平滑动画
const lastHeights = new Map()

// 动画锁变量
let isAnimatingCollapse = false

/**
 * 设置分类ref
 */
const setCategoryRef = (el, index) => {
  if (el) {
    categoryRefs[index] = el
  } else {
    // 清理不存在的引用
    delete categoryRefs[index]
  }
}

/**
 * 计算瀑布流布局
 */
const calculateWaterfallLayout = () => {
  if (isAnimatingCollapse) return // 动画中禁止重新布局
  
  if (!containerRef.value || props.categories.length === 0) {
    itemPositions.value = []
    waterfallStyle.value = {}
    addButtonPosition.value = {}
    return
  }

  nextTick(() => {
    const containerWidth = containerRef.value.offsetWidth
    if (containerWidth === 0) {
      setTimeout(() => calculateWaterfallLayout(), 100)
      return
    }

    const colGap = gap.value
    const numColumns = columnCount.value
    // 使用与CSS Grid相同的宽度计算逻辑
    const columnWidth = (containerWidth - colGap * (numColumns - 1)) / numColumns
    const columnHeights = new Array(numColumns).fill(0)
    const positions = []

    props.categories.forEach((category, index) => {
      const categoryRef = categoryRefs[index]
      if (!categoryRef || !categoryRef.$el) return

      const element = categoryRef.$el
      // 使用最短列算法，而不是简单的取模
      const columnIndex = columnHeights.indexOf(Math.min(...columnHeights))
      const left = columnIndex * (columnWidth + colGap)
      const top = columnHeights[columnIndex]

      // 首次计算时使用更长的过渡时间，避免抽动
      const transitionDuration = (!itemPositions.value || itemPositions.value.length === 0) ? 0.8 : currentTransitionDuration.value
      
      positions[index] = {
        position: 'absolute',
        left: `${left}px`,
        top: `${top}px`,
        width: `${columnWidth}px`,
        transition: `all ${transitionDuration}s ease`
      }

      // 更新该列的高度
      let elementHeight
      const rect = element.getBoundingClientRect()
      const actualHeight = rect.height

      // 获取上一次高度（如果有）
      const prevHeight = lastHeights.get(category.id) || actualHeight

      if (category.collapsed) {
        // 收起状态：视觉高度约95px
        elementHeight = 95
      } else {
        // 首次计算时，直接使用实际高度，避免高度计算错误
        if (!itemPositions.value || itemPositions.value.length === 0) {
          elementHeight = actualHeight
        } else {
          // 展开状态：取 max(当前高度, 上次高度)
          // 让布局动画滞后于视觉动画，从而避免贴合
          elementHeight = Math.max(actualHeight, prevHeight)
          // 如果高度变化太大，分步靠近目标值，避免跳动
          if (Math.abs(elementHeight - prevHeight) > 20) {
            elementHeight = prevHeight + (elementHeight - prevHeight) * 0.6
          }
        }
      }

      // 更新存储高度
      lastHeights.set(category.id, actualHeight)

      columnHeights[columnIndex] += elementHeight + colGap
    })

    itemPositions.value = positions

    if (props.addCardVisible) {
      const nextIndex = props.categories.length
      const nextColumnIndex = nextIndex % numColumns
      const nextLeft = nextColumnIndex * (columnWidth + colGap)
      let nextTop = columnHeights[nextColumnIndex]

      if (isAddingCategory.value) {
         nextTop = Math.max(nextTop, Math.max(...columnHeights) - 180 - colGap)
      }

      addButtonPosition.value = {
        position: 'absolute',
        left: `${nextLeft}px`,
        top: `${nextTop}px`,
        width: `${columnWidth}px`,
        transition: `all ${currentTransitionDuration.value}s ease`
      }
      columnHeights[nextColumnIndex] += 180 // 假设添加按钮高度为180px
    }

    const maxHeight = Math.max(...columnHeights)
    waterfallStyle.value = {
      height: `${maxHeight}px`,
      position: 'relative',
      transition: `height ${currentTransitionDuration.value}s ease`
    }
  })
}

/**
 * 持续更新布局（在动画期间）
 */
const animateLayout = (startTime, duration = 500, frameCount = 0) => {
  const currentTime = Date.now()
  const elapsed = currentTime - startTime
  
  // 收起动画每帧更新，展开动画每3帧更新
  const updateFrequency = duration <= 300 ? 1 : 3
  
  if (frameCount % updateFrequency === 0) {
    calculateWaterfallLayout()
  }
  
  if (elapsed < duration && isAnimating) {
    animationFrameId = requestAnimationFrame(() => animateLayout(startTime, duration, frameCount + 1))
  } else {
    isAnimating = false
    // 动画结束后再计算一次，确保精确
    setTimeout(() => {
      calculateWaterfallLayout()
    }, 50)
  }
}

/**
 * 开始布局动画
 */
const startLayoutAnimation = (duration = 500) => {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId)
  }
  calculateWaterfallLayout() // 立即计算一次
  isAnimating = true
  animateLayout(Date.now(), duration)
}

/**
 * 处理窗口大小变化（带防抖）
 */
const handleResize = () => {
  if (resizeTimeout) {
    clearTimeout(resizeTimeout)
  }
  
  resizeTimeout = setTimeout(() => {
    const width = window.innerWidth
    
    if (width <= 768) {
      columnCount.value = 1
    } else if (width <= 1200) {
      columnCount.value = 2
    } else {
      columnCount.value = 3
    }
    
    currentTransitionDuration.value = 0.5
    nextTick(() => {
      calculateWaterfallLayout()
    })
  }, 300)
}

// 监听分类折叠状态变化
watch(() => props.categories.map(c => c.collapsed), (newStates, oldStates) => {
  if (!oldStates) return // 首次加载不处理

  let isCollapsing = false
  let isExpanding = false
  
  if (oldStates && oldStates.length > 0) {
    for (let i = 0; i < newStates.length; i++) {
      if (!oldStates[i] && newStates[i]) {
        isCollapsing = true
      } else if (oldStates[i] && !newStates[i]) {
        isExpanding = true
      }
    }
  }

  if (isCollapsing) {
    isAnimatingCollapse = true
    currentTransitionDuration.value = 0.3
    startLayoutAnimation(300)
    
    setTimeout(() => {
      isAnimatingCollapse = false
      calculateWaterfallLayout()
      startLayoutAnimation(300)
    }, 1)
  } else if (isExpanding) {
    currentTransitionDuration.value = 0.5
    calculateWaterfallLayout() 
    startLayoutAnimation(500)
  } else {
    currentTransitionDuration.value = 0.5
    calculateWaterfallLayout() 
    startLayoutAnimation(500)
  }
}, { deep: true })

// 监听分类内容变化（装备数量变化会影响高度）
watch(() => props.categories.map(c => c.items.length), () => {
  currentTransitionDuration.value = 0.5
  setTimeout(() => {
    calculateWaterfallLayout()
  }, 100)
}, { deep: true })

// 监听categories props变化以重置refs和布局
watch(() => props.categories.length, (newLength, oldLength) => {
  // 仅在长度变化时清理并重新设置refs
  if (newLength !== oldLength) {
    categoryRefs.length = newLength;
  }
  currentTransitionDuration.value = 0.5
  setTimeout(() => {
    calculateWaterfallLayout()
  }, 100)
})

// 监听layoutMode变化，当切换到瀑布流时重新计算
watch(() => props.layoutMode, (newMode, oldMode) => {
  if (newMode === 'waterfall' && oldMode !== 'waterfall') {
    // 从其他模式切换到瀑布流，延迟计算确保DOM稳定
    setTimeout(() => {
      calculateWaterfallLayout()
    }, 200)
  }
}, { immediate: false })

// 组件挂载
onMounted(() => {
  const width = window.innerWidth
  if (width <= 768) {
    columnCount.value = 1
  } else if (width <= 1200) {
    columnCount.value = 2
  } else {
    columnCount.value = 3
  }
  
  window.addEventListener('resize', handleResize)
  // 仅在瀑布流模式下延迟计算布局，确保DOM元素稳定
  if (props.layoutMode === 'waterfall') {
    setTimeout(() => {
      calculateWaterfallLayout()
    }, 200) // 200ms延迟，确保切换稳定
  }
})

// 组件卸载
onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  if (resizeTimeout) {
    clearTimeout(resizeTimeout)
  }
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId)
  }
  isAnimating = false
})
</script>

<style scoped lang="scss">
.waterfall-layout-container {
  position: relative;
  /* transition通过JavaScript动态设置 */
  display: block; /* 确保div容器是block，以便获取宽度 */
}

/* 添加分类卡片 - + 按钮样式 */
.add-category-card {
  position: absolute;
  background: transparent;
  border: 2px dashed var(--primary-color);
  border-radius: 12px;
  padding: 32px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  min-height: 180px;
  opacity: 0.7;
}

.add-category-card:hover {
  background: var(--bg-card);
  border-style: solid;
  transform: translateY(-4px);
  box-shadow: 0 6px 20px rgba(0,0,0,0.15);
  opacity: 1;
}

/* 添加分类输入卡片 */
.add-category-input-card {
  position: absolute;
  background: var(--bg-card);
  border: 2px solid var(--primary-color);
  border-radius: 12px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 15px;
  min-height: 180px;
  justify-content: center;
}
</style>
