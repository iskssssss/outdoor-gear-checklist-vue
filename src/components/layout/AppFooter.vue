<template>
  <footer class="app-footer">
    <div class="footer-content">
      <div class="footer-section">
        <div class="footer-logo">
          <span class="logo-icon">🏔️</span>
          <span class="logo-text">户外装备清单</span>
        </div>
        <p class="footer-description">专业的户外装备管理工具，让每次出行都有备无患</p>
      </div>

      <div class="footer-section">
        <h4 class="footer-title">快速链接</h4>
        <ul class="footer-links">
          <li><a href="#" @click.prevent="$emit('show-doc')">使用指南</a></li>
        </ul>
      </div>

      <div class="footer-section">
        <h4 class="footer-title">关于我们</h4>
        <ul class="footer-links">
          <li><a href="https://nexttrail.top" target="_blank" rel="noopener">nexttrail.top</a></li>
          <li><a href="#" @click.prevent>联系我们</a></li>
          <li><a href="#" @click.prevent>隐私政策</a></li>
        </ul>
      </div>
    </div>

    <div class="footer-bottom">
      <div class="copyright">
        <p>© {{ currentYear }} <a href="https://nexttrail.top" target="_blank" rel="noopener">nexttrail.top</a> · 保留所有权利
        </p>
      </div>
      <div class="footer-meta">
        <span>Made with ❤️ for outdoor enthusiasts</span>
        <span class="version-tag">v{{ APP_VERSION }}</span>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { computed } from 'vue'

// 定义事件
defineEmits(['show-changelog', 'show-doc'])

const currentYear = computed(() => new Date().getFullYear())
// 版本号从 Vite 注入（来自 package.json）
const APP_VERSION = __APP_VERSION__
</script>

<style scoped lang="scss">
.app-footer {
  background: var(--bg-card);
  border-radius: var(--radius-xl) var(--radius-xl) 0 0;  /* Footer顶部大圆角 */
  padding: var(--spacing-lg);  /* Footer主内边距 */
  text-align: center;
  box-shadow: 0 -2px 6px rgba(0, 0, 0, 0.08);  /* 向上阴影效果固定 */
}

.footer-content {
  max-width: 1400px;  /* 内容最大宽度固定，与Header保持一致 */
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--spacing-3xl);  /* Footer分区间的大间距 */
  margin-bottom: var(--spacing-xl);  /* 内容底部间距 */
}

.footer-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);  /* Section内标准间距 */
}

.footer-logo {
  display: flex;
  align-items: baseline;
  gap: var(--spacing-sm);  /* Logo元素间小间距 */
  margin-bottom: var(--spacing-sm);  /* Logo底部间距 */
}

.logo-icon {
  font-size: 1.8rem;
}

.logo-text {
  font-size: 1.2rem;
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
  position: relative;
  top: 3px;  /* Logo文字微调，保持基线对齐 */
}

.footer-description {
  color: var(--text-secondary);
  font-size: 0.9rem;
  line-height: 1.6;
  margin: 0;
}

.footer-title {
  font-size: 1rem;
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
  margin: 0 0 var(--spacing-md) 0;  /* 标题底部间距 */
}

.footer-links {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);  /* 链接间小间距 */
}

.footer-links li a {
  color: var(--text-secondary);
  text-decoration: none;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  display: inline-block;

  &:hover {
    color: var(--primary-color);
    transform: translateX(4px);  /* 悬浮动画距离固定 */
  }
}

.footer-bottom {
  max-width: 1400px;  /* 底部内容最大宽度固定 */
  margin: 0 auto;
  padding-top: var(--spacing-lg);  /* 底部顶部间距 */
  border-top: var(--border-width) solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--spacing-md);  /* 底部元素间标准间距 */
}

.copyright {
  color: var(--text-secondary);
  font-size: 0.9rem;

  p {
    margin: 0;
  }

  a {
    color: var(--primary-color);
    text-decoration: none;
    font-weight: var(--font-weight-bold);
    transition: opacity 0.3s ease;

    &:hover {
      opacity: 0.8;
    }
  }
}

.footer-meta {
  color: var(--text-muted);
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  gap: var(--spacing-md);  /* Meta信息间标准间距 */
  flex-wrap: wrap;
}

.version-tag {
  padding: var(--spacing-xs) var(--spacing-sm);  /* 版本标签紧凑内边距 */
  background: var(--bg-input);
  border: var(--border-width) solid var(--border-color);
  border-radius: var(--radius-lg);  /* 版本标签圆角 */
  font-size: 0.75rem;
  font-weight: var(--font-weight-bold);
  letter-spacing: 0.5px;
  color: var(--text-secondary);
}

/* 响应式设计 - 移动端调整 */
@media (max-width: 768px) {
  .app-footer {
    padding: var(--spacing-xl) var(--spacing-md) var(--spacing-md);  /* 移动端减小内边距 */
  }

  .footer-content {
    grid-template-columns: 1fr;  /* 移动端单列布局 */
    gap: var(--spacing-xl);  /* 移动端Section间距 */
  }

  .footer-bottom {
    flex-direction: column;
    text-align: center;
  }

  .footer-logo {
    justify-content: center;
  }

  .footer-links {
    align-items: center;
  }
}
</style>
