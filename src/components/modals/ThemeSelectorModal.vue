<template>
  <BaseModal v-model="isVisible" @close="close" title="🎨 选择主题" width="1200px">
    <div class="theme-selector-content">
      <!-- 当前主题预览 -->
      <div class="current-theme-preview">
        <div class="preview-label">当前主题</div>
        <div class="current-theme-card">
          <span class="theme-icon">{{ currentTheme.icon }}</span>
          <div class="theme-info">
            <h3>{{ currentTheme.name }}</h3>
            <p>{{ currentTheme.description }}</p>
            <!-- 当前主题颜色预览 -->
            <div v-if="currentTheme.colors" class="current-color-preview">
              <div class="color-item">
                <div class="color-circle" :style="{ backgroundColor: currentTheme.colors.primary }"></div>
                <span class="color-label">主色</span>
              </div>
              <div class="color-item">
                <div class="color-circle" :style="{ backgroundColor: currentTheme.colors.background }"></div>
                <span class="color-label">背景</span>
              </div>
              <div class="color-item">
                <div class="color-circle" :style="{ backgroundColor: currentTheme.colors.accent }"></div>
                <span class="color-label">强调</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 主题网格 -->
      <div class="themes-grid">
        <button
          v-for="theme in themeStore.themes"
          :key="theme.id"
          class="theme-card"
          :class="{ active: theme.id === themeStore.currentTheme }"
          @click="selectTheme(theme.id, $event)"
          :title="theme.description"
        >
          <span class="theme-icon">{{ theme.icon }}</span>
          <div class="theme-name">{{ theme.name }}</div>
          <div class="theme-desc">{{ theme.description }}</div>
          
          <!-- 颜色预览 -->
          <div v-if="theme.colors" class="color-preview">
            <div class="color-dot" :style="{ backgroundColor: theme.colors.primary }" :title="`主色: ${theme.colors.primary}`"></div>
            <div class="color-dot" :style="{ backgroundColor: theme.colors.background }" :title="`背景: ${theme.colors.background}`"></div>
            <div class="color-dot" :style="{ backgroundColor: theme.colors.accent }" :title="`强调色: ${theme.colors.accent}`"></div>
          </div>
          
          <!-- 选中标记 -->
          <div v-if="theme.id === themeStore.currentTheme" class="selected-badge">
            <span>✓</span>
          </div>
        </button>
      </div>

      <!-- 底部操作按钮 -->
      <div class="modal-actions">
        <button class="btn btn-secondary" @click="close">
          关闭
        </button>
      </div>
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import BaseModal from '../common/feedback/BaseModal.vue';
import { useThemeStore } from '../../stores/themeStore';

const themeStore = useThemeStore();
const isVisible = ref(false);

// 获取当前主题信息
const currentTheme = computed(() => {
  return themeStore.themes.find(t => t.id === themeStore.currentTheme) || themeStore.themes[0];
});

/**
 * 显示模态框
 */
function show() {
  isVisible.value = true;
}

/**
 * 关闭模态框
 */
function close() {
  isVisible.value = false;
}

/**
 * 选择主题
 */
function selectTheme(themeId: string, event: MouseEvent) {
  themeStore.switchTheme(themeId, event);
  // 延迟关闭，让用户看到切换效果
  setTimeout(() => {
    close();
  }, 300);
}

// 暴露方法供父组件调用
defineExpose({
  show,
  close,
});
</script>

<style scoped lang="scss">
.theme-selector-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 8px 0;
}

// ==================== 当前主题预览 ====================
.current-theme-preview {
  .preview-label {
    font-size: 0.85rem;
    color: var(--text-secondary);
    margin-bottom: 8px;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
}

.current-theme-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
  /* 使用主题的主色和背景色创建渐变 */
  background: linear-gradient(135deg, 
    var(--primary-color), 
    var(--accent-primary, var(--primary-color))
  );
  border-radius: var(--border-radius-lg, 16px);
  color: var(--btn-primary-text, white);
  box-shadow: var(--shadow-xl, 0 8px 24px rgba(0, 0, 0, 0.15));

  .theme-icon {
    font-size: 2.5rem;
    flex-shrink: 0;
  }

  .theme-info {
    flex: 1;

    h3 {
      margin: 0 0 4px 0;
      font-size: 1.25rem;
      font-weight: 600;
    }

    p {
      margin: 0 0 12px 0;
      font-size: 0.9rem;
      opacity: 0.9;
    }
  }

  .current-color-preview {
    display: flex;
    gap: 16px;
    margin-top: 12px;
    flex-wrap: wrap;
  }

  .color-item {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .color-circle {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    border: 2px solid var(--card-border, rgba(255, 255, 255, 0.5));
    box-shadow: var(--shadow-sm, 0 2px 6px rgba(0, 0, 0, 0.2));
  }

  .color-label {
    font-size: 0.85rem;
    color: var(--btn-primary-text, white);
    opacity: 0.95;
    font-weight: 500;
  }
}

// ==================== 主题网格 ====================
.themes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 16px;
  max-height: 50vh;
  overflow-y: auto;
  /* 添加足够的内边距，防止 hover 效果（阴影24px + 上浮4px）被裁剪 */
  padding: 16px 12px;
  /* 使用负边距抵消额外的内边距，保持整体布局 */
  margin: -16px -12px;
  
  /* 自定义滚动条 */
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: var(--bg-secondary);
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: var(--border-color);
    border-radius: 4px;
    
    &:hover {
      background: var(--text-secondary);
    }
  }
}

.theme-card {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 20px 12px;
  background: var(--bg-card);
  border: 2px solid var(--border-color);
  border-radius: var(--border-radius-lg, 16px);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  text-align: center;
  
  /* 拟态效果 - 使用主题变量 */
  box-shadow: var(--shadow-md, 0 2px 8px rgba(0, 0, 0, 0.08));

  .theme-icon {
    font-size: 2rem;
    transition: transform 0.3s ease;
  }

  .theme-name {
    font-size: 0.95rem;
    font-weight: 600;
    color: var(--text-primary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    width: 100%;
  }

  .theme-desc {
    font-size: 0.8rem;
    color: var(--text-secondary);
    line-height: 1.3;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .color-preview {
    display: flex;
    gap: 6px;
    margin-top: 8px;
    justify-content: center;
    align-items: center;
  }

  .color-dot {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    border: 2px solid var(--card-border, rgba(255, 255, 255, 0.8));
    box-shadow: var(--shadow-sm, 0 2px 4px rgba(0, 0, 0, 0.2));
    transition: all 0.3s ease;
    cursor: help;
    
    &:hover {
      transform: scale(1.2);
      box-shadow: var(--shadow-md, 0 4px 8px rgba(0, 0, 0, 0.3));
    }
  }

  .selected-badge {
    position: absolute;
    top: 8px;
    right: 8px;
    width: 24px;
    height: 24px;
    background: var(--primary-color);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--btn-primary-text, white);
    font-size: 0.85rem;
    font-weight: bold;
    box-shadow: var(--shadow-md, 0 2px 8px rgba(0, 0, 0, 0.2));
  }

  /* 悬停效果 */
  &:hover {
    border-color: var(--primary-color);
    transform: translateY(-4px) scale(1.02);
    box-shadow: var(--shadow-lg, 0 8px 24px rgba(0, 0, 0, 0.12));

    .theme-icon {
      transform: scale(1.15) rotate(5deg);
    }
  }

  /* 激活状态 */
  &.active {
    background: var(--bg-hover, var(--bg-card));
    border-color: var(--primary-color);
    border-width: 3px;
    box-shadow: var(--shadow-xl, 0 8px 24px rgba(0, 0, 0, 0.15));

    .theme-name {
      color: var(--primary-color);
      font-weight: 700;
    }
  }

  /* 按下效果 */
  &:active {
    transform: translateY(-2px) scale(0.98);
  }
}

// ==================== 底部操作按钮 ====================
.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid var(--border-color);
}

.btn {
  padding: 10px 24px;
  border-radius: var(--border-radius-md);
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  border: none;
  transition: all 0.3s ease;

  &.btn-secondary {
    background: var(--bg-secondary);
    color: var(--text-primary);
    border: 1px solid var(--border-color);

    &:hover {
      background: var(--bg-hover, var(--bg-input));
      transform: translateY(-1px);
      box-shadow: var(--shadow-sm, 0 2px 8px rgba(0, 0, 0, 0.1));
    }
  }
}

// ==================== 响应式适配 ====================
@media (max-width: 768px) {
  .themes-grid {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 10px;
    /* 移动端也保持足够的内边距 */
    padding: 12px 8px;
    margin: -12px -8px;
  }

  .theme-card {
    padding: 16px 10px;

    .theme-icon {
      font-size: 1.75rem;
    }

    .theme-name {
      font-size: 0.9rem;
    }

    .theme-desc {
      font-size: 0.75rem;
    }
  }

  .current-theme-card {
    padding: 14px 16px;

    .theme-icon {
      font-size: 2rem;
    }

    .theme-info h3 {
      font-size: 1.1rem;
    }

    .theme-info p {
      font-size: 0.85rem;
    }
  }
}
</style>

