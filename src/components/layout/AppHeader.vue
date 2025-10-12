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
import { debounce } from '../../utils/debounce';

// 事件定义
const emit = defineEmits(['show-model-config'])

const debouncedShowModelConfig = debounce(() => emit('show-model-config'), 300);

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
  padding: 4px 0;
  transition: box-shadow 0.3s ease;
}

// ==================== 容器布局 ====================
.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 20px;
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
  // 恢复展开时的高度
  max-height: 50px;
  // 恢复展开时的透明度
  opacity: 1;
  // 减小 margin
  margin: 4px 0 0 0;
  // 移除所有过渡效果
  transition: none;
}

// ==================== 导航栏样式 ====================
.nav-menu {
  display: flex;
  align-items: center;
  gap: 15px;
  // 减小 padding
  padding: 8px 0;
  // 减小 margin
  margin-top: 10px;
  flex-shrink: 1;
  min-width: 0;
  white-space: nowrap;
  // 修改为 visible，确保下拉菜单可见
  overflow: visible;
  -webkit-overflow-scrolling: touch;
  transition: none;
}

// 一级菜单链接
.nav-link {
  position: relative;
  // 减小内边距
  padding: 6px 12px;
  // 减小字体大小
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  border-bottom: 2px solid transparent;
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
    font-weight: 700;
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
    gap: 5px;
  }

  .nav-menu {
    justify-content: center;
  }
}
</style>
