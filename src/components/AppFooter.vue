<template>
  <footer class="app-footer">
    <div class="footer-content">
      <div class="footer-section">
        <div class="footer-logo">
          <span class="logo-icon">🏕️</span>
          <span class="logo-text">户外装备清单</span>
        </div>
        <p class="footer-description">专业的户外装备管理工具，让每次出行都有备无患</p>
      </div>

      <div class="footer-section">
        <h4 class="footer-title">快速链接</h4>
        <ul class="footer-links">
          <li><a href="#" @click.prevent="$emit('show-changelog')">使用指南</a></li>
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
        <p>© {{ currentYear }} <a href="https://nexttrail.top" target="_blank" rel="noopener">nexttrail.top</a> · 保留所有权利</p>
      </div>
      <div class="footer-meta">
        <span>Made with ❤️ for outdoor enthusiasts</span>
        <span class="version-tag">v1.0.0</span>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { computed } from 'vue'

// 定义事件
defineEmits(['show-changelog'])

const currentYear = computed(() => new Date().getFullYear())
</script>

<style scoped lang="scss">
.app-footer {
  background: var(--bg-card);
  border-top: var(--border-width, 1px) solid var(--border-color);
  margin-top: 60px;
  padding: 40px 20px 20px;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
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
  align-items: center;
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
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.5px;
}

/* ========== 主题适配 ========== */

/* 默认主题 */
body.theme-default .app-footer,
body:not([class*="theme-"]) .app-footer {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

  .logo-text {
    color: #ffffff;
  }

  .footer-description {
    color: rgba(255, 255, 255, 0.85);
  }

  .footer-title {
    color: #ffffff;
  }

  .footer-links li a {
    color: rgba(255, 255, 255, 0.85);
    
    &:hover {
      color: #ffffff;
      transform: translateX(4px);
    }
  }


  .copyright {
    color: rgba(255, 255, 255, 0.85);
  }

  .copyright a {
    color: #ffffff;
    font-weight: 700;
    
    &:hover {
      opacity: 0.8;
    }
  }

  .footer-meta {
    color: rgba(255, 255, 255, 0.7);
  }

  .version-tag {
    background: rgba(255, 255, 255, 0.15);
    border-color: rgba(255, 255, 255, 0.3);
    color: #ffffff;
  }
}

/* 暗黑主题 */
body.theme-dark .app-footer {
  background: linear-gradient(135deg, #1a1d29 0%, #0f1419 100%);
  box-shadow: 0 -4px 20px rgba(0, 217, 255, 0.1);

  .footer-links li a {
    color: var(--text-secondary);
    
    &:hover {
      color: var(--primary-color);
      text-shadow: 0 0 8px rgba(0, 217, 255, 0.3);
    }
  }

  .copyright a {
    color: var(--primary-color);
    
    &:hover {
      text-shadow: 0 0 8px rgba(0, 217, 255, 0.4);
      opacity: 1;
    }
  }
}

/* 手绘主题 */
body.theme-paper .app-footer {
  background: var(--bg-card);
  border-top: 2px solid var(--border-color);
  box-shadow: -5px -5px 0 rgba(0, 0, 0, 0.05);

  .footer-links li a {
    color: var(--text-primary);
    
    &:hover {
      color: var(--secondary-color);
      text-decoration: underline;
      text-decoration-style: wavy;
    }
  }

  .copyright a {
    color: var(--secondary-color);
    
    &:hover {
      opacity: 0.8;
      text-decoration: underline;
    }
  }
}

/* 柔和主题 */
body.theme-soft .app-footer {
  background: linear-gradient(135deg, rgba(255, 158, 205, 0.05) 0%, rgba(196, 176, 255, 0.05) 100%);
  border-top: 2px solid var(--border-color);

  .footer-links li a {
    color: var(--text-secondary);
    
    &:hover {
      color: var(--primary-color);
      transform: translateX(4px) scale(1.05);
    }
  }

  .copyright a {
    color: var(--primary-color);
    
    &:hover {
      opacity: 0.8;
      transform: scale(1.05);
    }
  }
}

/* 极简主题 */
body.theme-minimal .app-footer {
  background: transparent;
  border-top: 1px solid var(--border-color);
  box-shadow: none;

  .footer-links li a {
    color: var(--text-primary);
    
    &:hover {
      color: var(--text-primary);
      transform: none;
      text-shadow: none;
      text-decoration: underline;
    }
  }

  .copyright a {
    color: var(--primary-color);
    
    &:hover {
      opacity: 0.7;
      text-decoration: underline;
    }
  }

  .footer-logo,
  .footer-title {
    &:hover {
      transform: none;
      text-shadow: none;
    }
  }

  .footer-meta {
    color: #666666;
  }

  .version-tag {
    background: transparent;
    border-color: #cccccc;
    color: #666666;
  }
}

/* 像素主题 */
body.theme-pixel .app-footer {
  background: var(--bg-card);
  border-top: 2px solid var(--pixel-border-color);
  box-shadow: 0 -4px var(--pixel-shadow-color);

  .footer-links li a {
    color: var(--text-primary);
    
    &:hover {
      color: var(--primary-color);
      transform: translate(2px, -2px);
      text-shadow: 2px 2px var(--pixel-shadow-color);
    }
  }

  .copyright a {
    color: var(--primary-color);
    
    &:hover {
      opacity: 1;
      text-shadow: 2px 2px var(--pixel-shadow-color);
      transform: translate(1px, -1px);
    }
  }
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

