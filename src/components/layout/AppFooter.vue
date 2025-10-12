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
import { APP_VERSION } from '../../config/appConfig'

// 定义事件
defineEmits(['show-changelog', 'show-doc'])

const currentYear = computed(() => new Date().getFullYear())
</script>

<style scoped lang="scss">
.app-footer {
  background: var(--bg-card);
  border-top: var(--border-width, 1px) solid var(--border-color);
  padding: 40px 20px 20px;
  box-shadow: var(--shadow-sm);
  /* 模拟向上阴影 */
  box-shadow: 0 -2px 6px rgba(0, 0, 0, 0.08);
}

.footer-content {
  max-width: 1400px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 40px;
  margin-bottom: 30px;
}

.footer-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.footer-logo {
  display: flex;
  // 改为 baseline 对齐
  align-items: baseline;
  gap: 10px;
  margin-bottom: 8px;
}

.logo-icon {
  font-size: 1.8rem;
}

.logo-text {
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--text-primary);
  position: relative;
  // 向下微调 3px
  top: 3px;
}

.footer-description {
  color: var(--text-secondary);
  font-size: 0.9rem;
  line-height: 1.6;
  margin: 0;
}

.footer-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 12px 0;
}

.footer-links {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.footer-links li a {
  color: var(--text-secondary);
  text-decoration: none;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  display: inline-block;

  &:hover {
    color: var(--primary-color);
    transform: translateX(4px);
  }
}

.footer-bottom {
  max-width: 1400px;
  margin: 0 auto;
  padding-top: 20px;
  border-top: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
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
    font-weight: 600;
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
  gap: 16px;
  flex-wrap: wrap;
}

.version-tag {
  padding: 4px 10px;
  background: var(--bg-input);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.5px;
  color: var(--text-secondary);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .app-footer {
    padding: 30px 15px 15px;
  }

  .footer-content {
    grid-template-columns: 1fr;
    gap: 30px;
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
