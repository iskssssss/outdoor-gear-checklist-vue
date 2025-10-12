<template>
  <div class="header">
    <div class="container">
      <div 
        class="header-title-group"
      >
        <h1 class="header-icon">🏔️</h1>
        <h1 class="header-title-text">户外装备清单</h1>
      </div>
      <p class="header-slogan">为您的户外探险做好充分准备</p> <!-- 恢复 Slogan 内容 -->
      <div class="header-content-wrapper">
        <!-- 导航栏风格的功能菜单 -->
        <nav class="nav-menu">
          <!-- 模型配置 -->
          <a class="nav-link" @click="showModelConfig">
            ⚙️ 模型配置
          </a>
          
          <!-- 使用指南 -->
          <a class="nav-link" @click="showDoc">
            📚 使用指南
          </a>

          <!-- 更新日志 -->
          <a class="nav-link" @click="showChangelog">
            📝 更新日志
          </a>
          
          <!-- 联系我们（开发中） -->
          <a class="nav-link disabled">
            📧 联系我们
          </a>
        </nav>
      </div>
    </div>
  </div>
</template>

<script setup>
import { debounce } from '../../utils/debounce';

// 事件定义
const emit = defineEmits(['show-model-config', 'show-changelog', 'show-doc'])

const debouncedShowModelConfig = debounce(() => emit('show-model-config'), 300);
const debouncedShowDoc = debounce(() => emit('show-doc'), 300);
const debouncedShowChangelog = debounce(() => emit('show-changelog'), 300);

/**
 * 显示模型配置模态框
 */
function showModelConfig() {
  debouncedShowModelConfig();
}

/**
 * 显示更新日志模态框
 */
function showChangelog() {
  debouncedShowChangelog();
}

/**
 * 显示使用文档模态框
 */
function showDoc() {
  debouncedShowDoc();
}
</script>

<style scoped lang="scss">
// ==================== 标题栏主体样式 ====================
.header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: var(--bg-header);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1); // 恢复展开时的阴影
  margin-bottom: 30px;
  padding: 30px 0; // 恢复展开时的 padding
  transition: none; // 移除所有过渡效果
}

// ==================== 容器布局 ====================
.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  flex-direction: column; // 恢复展开时的布局
  justify-content: center; // 恢复展开时的布局
  align-items: center;
  transition: none; // 移除所有过渡效果
  overflow: visible; // 确保下拉菜单可见
}

.header-content-wrapper {
  width: 100%; // 恢复展开时的宽度
  display: flex;
  justify-content: center;
  align-items: center;
  transition: none; // 移除所有过渡效果
  overflow: visible; // 确保下拉菜单可见
  // flex-shrink: 1;
  // min-width: 0;
}

// ==================== 标题样式 ====================
h1 {
  margin: 0;
  color: var(--text-primary);
  flex-shrink: 0;
}

.header-icon {
  font-size: 2.25rem; // 恢复展开时的字体大小
  transition: none; // 移除所有过渡效果
}

.header-title-group {
  display: flex;
  justify-content: center; // 恢复展开时的布局
  align-items: center;
  transition: none; // 移除所有过渡效果
  flex-shrink: 0;
  gap: 8px;
}

.header-title-text {
  font-size: 2.5rem; // 恢复展开时的字体大小
  overflow: hidden;
  white-space: nowrap;
  max-width: 300px; // 恢复展开时的宽度
  opacity: 1; // 恢复展开时的透明度
  transform: translateX(0); // 恢复展开时的位置
  margin-left: 8px; // 恢复展开时的 margin
  transition: none; // 移除所有过渡效果
}

// ==================== 副标题（Slogan）样式 ====================
p {
  text-align: center;
  color: var(--text-secondary);
  font-size: 1.1rem;
  margin: 0;
}

.header-slogan {
  overflow: hidden;
  width: 100%;
  text-align: center;
  max-height: 50px; // 恢复展开时的高度
  opacity: 1; // 恢复展开时的透明度
  margin: 10px 0 15px 0; // 恢复展开时的 margin
  transition: none; // 移除所有过渡效果
}

// ==================== 导航栏样式 ====================
.nav-menu {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 12px 0;
  margin-top: 20px;
  flex-shrink: 1;
  min-width: 0;
  white-space: nowrap;
  overflow: visible; // 修改为 visible，确保下拉菜单可见
  -webkit-overflow-scrolling: touch;
  transition: none;
}

// 一级菜单链接
.nav-link {
  position: relative;
  padding: 8px 16px;
  font-size: 0.9rem;
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
  }

  .header-title-group {
    justify-content: center;
  }

  .header-icon {
    font-size: 2.25rem; // 移动端图标大小与桌面端一致
  }

  .header-title-text {
    font-size: 2rem; // 移动端标题字体大小
    transform: translateX(0); 
    opacity: 1;
    max-width: none; 
  }

  .nav-menu {
    gap: 10px;
    padding: 12px 0;
    margin-top: 20px;
    justify-content: center;
  }

  .nav-dropdown {
    flex-shrink: 0;
  }

  .nav-link {
    font-size: 0.85rem;
    padding: 6px 12px;
  }

  .dropdown-menu {
    left: 50%;
    transform: translateX(-50%);
    min-width: 160px;
  }

  .preview-image {
    width: 100%;
  }

  .btn {
    width: 100%;
  }
}
</style>
