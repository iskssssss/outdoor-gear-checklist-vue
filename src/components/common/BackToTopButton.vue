<template>
  <transition name="fade">
    <button v-show="showBackToTop" class="back-to-top" @click="scrollToTop" title="回到顶部">
      <span class="arrow">↑</span>
    </button>
  </transition>
</template>

<script setup>
import { computed } from 'vue';
import { useScroll } from '@vueuse/core';

const props = defineProps({
  scrollContainer: {
    type: [Object, Window],
    default: () => window,
  },
  debug: {
    type: Boolean,
    default: false,
  },
});

const { y: scrollTop } = useScroll(props.scrollContainer);

const showBackToTop = computed(() => {
  if (props.debug) {
    console.log('[BackToTopButton Debug] Scroll Top:', scrollTop.value);
  }
  return scrollTop.value > 300;
});

function scrollToTop() {
  const target = props.scrollContainer || window;
  if (target instanceof Window) {
    target.scrollTo({ top: 0, behavior: 'smooth' });
  } else if (target instanceof HTMLElement) {
    target.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
</script>

<style scoped lang="scss">
.back-to-top {
  /* 移除了 position, bottom, right, z-index 以便由 FAB Group 控制 */
  width: 50px;
  height: 50px;
  // 使用主题变量
  background: var(--bg-card);
  // 使用主题变量
  color: var(--text-primary);
  // 添加边框以匹配 FAB 风格
  border: 2px solid var(--border-color);
  border-radius: 50%;
  cursor: pointer;
  box-shadow: var(--shadow-md);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.6rem;
  font-weight: 700;
  transition: all 0.3s ease;

  &:hover {
    // 与 FAB Group 统一的悬停效果
    transform: scale(1.1);
    box-shadow: var(--shadow-lg);
  }

  &:active {
    transform: scale(1.05);
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
    /* 尺寸由 fab-item 控制，此处无需额外设置 */
    font-size: 1.4rem;
  }
}
</style>
