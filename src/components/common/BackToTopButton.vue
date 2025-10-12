<template>
  <transition name="fade">
    <button
      v-show="showBackToTop"
      class="back-to-top"
      @click="scrollToTop"
      title="回到顶部"
    >
      <span class="arrow">↑</span>
    </button>
  </transition>
</template>

<script setup>
import { ref, watch, onUnmounted } from 'vue'

const props = defineProps({
  scrollContainer: {
    type: Object,
    default: null
  },
  debug: {
    type: Boolean,
    default: false
  }
})

const showBackToTop = ref(false)
const scrollTarget = ref(null)

function handleScroll() {
  let scrollTop;
  if (scrollTarget.value === window) {
    scrollTop = window.scrollY;
  } else {
    scrollTop = scrollTarget.value?.scrollTop;
  }
  
  if (props.debug) {
    console.log('[BackToTopButton Debug] Scroll Top:', scrollTop, 'Target:', scrollTarget.value)
  }
  showBackToTop.value = scrollTop > 300
}

function scrollToTop() {
  const target = scrollTarget.value || window
  target.scrollTo({ top: 0, behavior: 'smooth' })
}

function setupScrollListener(newTarget) {
  if (scrollTarget.value) {
    scrollTarget.value.removeEventListener('scroll', handleScroll)
  }
  
  scrollTarget.value = newTarget || window
  scrollTarget.value.addEventListener('scroll', handleScroll, { passive: true })
}

watch(() => props.scrollContainer, (newContainer) => {
  setupScrollListener(newContainer)
}, { immediate: true })

onUnmounted(() => {
  if (scrollTarget.value) {
    scrollTarget.value.removeEventListener('scroll', handleScroll)
  }
})
</script>

<style scoped lang="scss">
.back-to-top {
  position: fixed;
  bottom: 50px;
  right: 50px;
  width: 55px;
  height: 55px;
  background: var(--primary-color);
  color: var(--text-white);
  border: none;
  border-radius: 50%;
  cursor: pointer;
  box-shadow: var(--shadow-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.6rem;
  font-weight: 700;
  transition: all 0.3s ease;
  z-index: 100;
  
  &:hover {
    background: var(--primary-dark, var(--primary-color));
    transform: translateY(-6px);
    box-shadow: var(--shadow-xl);
  }
  
  &:active {
    transform: translateY(-3px);
  }
  
  .arrow {
    line-height: 1;
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: scale(0.8) translateY(20px);
}

@media (max-width: 768px) {
  .back-to-top {
    bottom: 30px;
    right: 20px;
    width: 50px;
    height: 50px;
    font-size: 1.4rem;
  }
}
</style>
