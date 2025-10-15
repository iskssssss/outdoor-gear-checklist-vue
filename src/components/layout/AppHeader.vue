<template>
  <div class="header">
    <div class="container">
      <div class="header-left">
        <h1 class="header-icon">🏔️</h1>
      </div>
      <div class="header-right">
        <!-- 导航栏风格的功能菜单 -->
        <nav class="nav-menu">
          <!-- 装备管理 -->
          <router-link to="/" class="nav-link">
            🗂️ 装备管理
          </router-link>

          <!-- 交通规划 -->
          <router-link to="/transport" class="nav-link">
            🚗 交通规划
          </router-link>

          <!-- 使用指南 -->
          <router-link to="/doc" class="nav-link">
            📚 使用指南
          </router-link>

          <!-- 更新日志 -->
          <router-link to="/changelog" class="nav-link">
            📝 更新日志
          </router-link>

          <!-- 联系我们（开发中） -->
          <a class="nav-link disabled">
            📧 联系我们
          </a>
          
          <!-- 模型配置 -->
          <a class="nav-link" @click="showModelConfig">
            ⚙️ 模型配置
          </a>
        </nav>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useDebounceFn } from '@vueuse/core';

// 事件定义
const emit = defineEmits(['show-model-config'])

const debouncedShowModelConfig = useDebounceFn(() => emit('show-model-config'), 300);

/**
 * 显示模型配置模态框
 */
function showModelConfig() {
  debouncedShowModelConfig();
}
</script>

<style scoped lang="scss">
// ==================== 标题栏主体样式 ====================
.header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: var(--bg-header);
  box-shadow: var(--shadow-md);
  padding: var(--spacing-xs) 0;  /* Header垂直内边距较小 */
  transition: box-shadow 0.3s ease;
}

// ==================== 容器布局 ====================
.container {
  max-width: 1400px;  /* 容器最大宽度固定，保持设计一致性 */
  margin: 0 auto;
  padding: 0 var(--spacing-lg);  /* 容器水平内边距 */
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left,
.header-right {
  display: flex;
  align-items: center;
}

.header-left {
  /* 样式可根据需要添加 */
}

.header-right {
  /* 样式可根据需要添加 */
}

// ==================== 标题样式 ====================
h1 {
  margin: 0;
  color: var(--text-primary);
  flex-shrink: 0;
}

.header-icon {
  font-size: 1.75rem;
  transition: none;
}

// ==================== 副标题（Slogan）样式 ====================
.header-slogan {
  overflow: hidden;
  width: 100%;
  text-align: center;
  max-height: 50px;  /* Slogan最大高度固定 */
  opacity: 1;
  margin: var(--spacing-xs) 0 0 0;  /* 副标题顶部小间距 */
  transition: none;
}

// ==================== 导航栏样式 ====================
.nav-menu {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);  /* 导航链接间标准间距 */
  padding: var(--spacing-sm) 0;  /* 导航栏垂直内边距 */
  margin-top: var(--spacing-sm);  /* 导航栏顶部间距 */
  flex-shrink: 1;
  min-width: 0;
  white-space: nowrap;
  overflow: visible;  /* 确保下拉菜单可见 */
  -webkit-overflow-scrolling: touch;
  transition: none;
}

// 一级菜单链接
.nav-link {
  position: relative;
  padding: var(--spacing-xs) var(--spacing-md);  /* 链接紧凑内边距 */
  font-size: 0.85rem;
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all 0.3s ease;
  border-bottom: 2px solid transparent;  /* 激活指示器固定宽度 */
  text-decoration: none;
  white-space: nowrap;
  display: inline-block;
  color: var(--text-primary);

  &:hover:not(.disabled) {
    border-bottom-color: var(--primary-color);
    color: var(--primary-color);
  }

  &.router-link-active {
    color: var(--primary-color);
    border-bottom-color: var(--primary-color);
    font-weight: var(--font-weight-bold);
  }

  &.disabled {
    color: var(--text-secondary);
    cursor: not-allowed;
    opacity: 0.5;

    &:hover {
      border-bottom-color: transparent;
    }
  }
}

// ==================== 响应式设计 ====================
@media (max-width: 768px) {
  .container {
    flex-direction: column;
    align-items: center;
    gap: var(--spacing-xs);  /* 移动端垂直布局间小间距 */
  }

  .nav-menu {
    justify-content: center;
  }
}
</style>
