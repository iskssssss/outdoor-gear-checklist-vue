<template>
  <div class="markdown-page">
    <!-- 顶部导航栏 -->
    <header class="markdown-header">
      <div class="markdown-header-content">
        <button class="back-btn" @click="$emit('close')" title="返回主页">
          <span class="back-icon">←</span>
          <span class="back-text">返回</span>
        </button>
        
        <h1 class="markdown-page-title">{{ title }}</h1>
        
        <div class="header-actions">
          <button 
            v-if="showRefreshButton"
            class="refresh-btn" 
            @click="fetchContent(false)"
            :disabled="loading || cooldownTime > 0"
            :title="loading ? '加载中...' : cooldownTime > 0 ? `请等待 ${cooldownTime} 秒后再刷新` : '刷新内容'"
          >
            <span :class="{ 'spinning': loading }">
              {{ cooldownTime > 0 ? cooldownTime : '🔄' }}
            </span>
          </button>
        </div>
      </div>
    </header>

    <!-- 文档内容区域 -->
    <main class="markdown-main" ref="markdownMainRef" @scroll="handleScroll">
      <div class="markdown-container">
        <MarkdownViewer 
          ref="markdownViewerRef"
          :content="content"
          :loading="loading"
          :error="error"
          :show-toc="true"
          :has-cached-content="hasCachedContent"
          :scroll-container="markdownMainRef"
        />
      </div>
    </main>

    <!-- 回到顶部按钮 -->
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
  </div>
</template>

<script setup>
import { ref, defineExpose, onMounted, onUnmounted } from 'vue'
import MarkdownViewer from '../common/MarkdownViewer.vue'

const props = defineProps({
  // 页面标题
  title: {
    type: String,
    required: true
  },
  // 内容源 URL（可以是本地路径或远程 URL）
  sourceUrl: {
    type: String,
    required: true
  },
  // 缓存键前缀
  cacheKeyPrefix: {
    type: String,
    required: true
  },
  // 是否显示刷新按钮
  showRefreshButton: {
    type: Boolean,
    default: true
  },
  // 刷新冷却时间（秒）
  cooldownDuration: {
    type: Number,
    default: 30
  }
})

// 定义事件
const emit = defineEmits(['close'])

const loading = ref(false)
const error = ref(null)
const content = ref('')
const hasCachedContent = ref(false)
const markdownMainRef = ref(null)
const markdownViewerRef = ref(null)
const showBackToTop = ref(false)

// 刷新冷却时间相关
const cooldownTime = ref(0)
let cooldownTimer = null

// 缓存配置
const CACHE_KEY = `${props.cacheKeyPrefix}-cache`
const CACHE_TIME_KEY = `${props.cacheKeyPrefix}-cache-time`

/**
 * 获取内容
 */
async function fetchContent(useCache = true) {
  if (useCache) {
    const cachedContent = localStorage.getItem(CACHE_KEY)
    const cachedTime = localStorage.getItem(CACHE_TIME_KEY)
    
    if (cachedContent && cachedTime) {
      const cacheAge = Date.now() - parseInt(cachedTime)
      if (cacheAge < 3600000) {
        content.value = cachedContent
        hasCachedContent.value = true
        console.log(`📄 使用缓存的${props.title}内容`)
        return
      }
    }
  }
  
  loading.value = true
  error.value = null
  
  try {
    console.log(`🌐 正在加载${props.title}...`, { URL: props.sourceUrl })
    
    const cacheBuster = useCache ? '' : `?t=${Date.now()}`
    const response = await fetch(props.sourceUrl + cacheBuster)
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    const text = await response.text()
    
    if (!text || text.trim().length === 0) {
      throw new Error('获取的内容为空')
    }
    
    content.value = text
    hasCachedContent.value = true
    localStorage.setItem(CACHE_KEY, text)
    localStorage.setItem(CACHE_TIME_KEY, Date.now().toString())
    
    console.log(`✅ ${props.title}已加载`)
    startCooldown()
  } catch (err) {
    console.error(`❌ 加载${props.title}失败:`, err)
    error.value = err.message
    
    const cachedContent = localStorage.getItem(CACHE_KEY)
    if (cachedContent) {
      content.value = cachedContent
      hasCachedContent.value = true
      console.log(`📄 使用缓存的${props.title}内容（降级）`)
    } else {
      content.value = `# ${props.title}\n\n无法加载内容。\n\n请检查网络连接或稍后重试。`
      hasCachedContent.value = false
    }
  } finally {
    loading.value = false
  }
}

/**
 * 启动刷新冷却
 */
function startCooldown() {
  cooldownTime.value = props.cooldownDuration
  
  cooldownTimer = setInterval(() => {
    cooldownTime.value--
    if (cooldownTime.value <= 0) {
      clearInterval(cooldownTimer)
      cooldownTimer = null
    }
  }, 1000)
}

/**
 * 处理滚动事件
 */
function handleScroll(event) {
  const scrollTop = event.target.scrollTop
  showBackToTop.value = scrollTop > 300
  
  // 通知 MarkdownViewer 处理滚动（用于目录高亮）
  if (markdownViewerRef.value && markdownViewerRef.value.handleScroll) {
    markdownViewerRef.value.handleScroll()
  }
}

/**
 * 回到顶部
 */
function scrollToTop() {
  if (markdownMainRef.value) {
    markdownMainRef.value.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

// 组件挂载时加载文档
onMounted(() => {
  const cachedContent = localStorage.getItem(CACHE_KEY)
  if (cachedContent) {
    content.value = cachedContent
    hasCachedContent.value = true
  }
  fetchContent(true)
})

// 组件卸载时清理
onUnmounted(() => {
  if (cooldownTimer) {
    clearInterval(cooldownTimer)
  }
})

defineExpose({ fetchContent })
</script>

<style scoped lang="scss">
// 页面容器
.markdown-page {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  background: var(--bg-main);
  z-index: 999;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

// 顶部导航栏
.markdown-header {
  background: var(--bg-header);
  border-bottom: 2px solid var(--border-color);
  box-shadow: var(--shadow-md);
  flex-shrink: 0;
  position: sticky;
  top: 0;
  z-index: 10;
}

.markdown-header-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px 30px;
  display: flex;
  align-items: center;
  gap: 20px;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: var(--primary-color);
  color: var(--text-white);
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: var(--primary-dark, var(--primary-color));
    transform: translateX(-3px);
    box-shadow: var(--shadow-lg);
  }
  
  .back-icon {
    font-size: 1.2rem;
    line-height: 1;
  }
}

.markdown-page-title {
  flex: 1;
  margin: 0;
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--text-primary);
  text-align: center;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.refresh-btn {
  padding: 10px 16px;
  background: var(--primary-color);
  color: var(--text-white);
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.3s ease;
  min-width: 40px;
  
  &:hover:not(:disabled) {
    background: var(--primary-dark, var(--primary-color));
    transform: translateY(-2px);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    background: var(--text-secondary);
  }
  
  .spinning {
    display: inline-block;
    animation: spin 1s linear infinite;
  }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

// 主内容区
.markdown-main {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  
  &::-webkit-scrollbar {
    width: 10px;
  }

  &::-webkit-scrollbar-track {
    background: var(--bg-input, #f5f5f5);
  }

  &::-webkit-scrollbar-thumb {
    background: var(--border-color, #ddd);
    border-radius: 5px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: var(--text-muted, #999);
  }
}

.markdown-container {
  max-width: 1600px;
  margin: 0 auto;
  padding: 40px 30px;
  min-height: 100%;
}

// 回到顶部按钮
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

// 淡入淡出动画
.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: scale(0.8) translateY(20px);
}

// 响应式
@media (max-width: 768px) {
  .markdown-header-content {
    padding: 15px 20px;
    gap: 15px;
  }
  
  .back-btn {
    padding: 8px 12px;
    font-size: 0.9rem;
    
    .back-text {
      display: none;
    }
  }
  
  .markdown-page-title {
    font-size: 1.3rem;
  }
  
  .markdown-container {
    padding: 30px 20px;
  }
  
  .back-to-top {
    bottom: 30px;
    right: 20px;
    width: 50px;
    height: 50px;
    font-size: 1.4rem;
  }
}
</style>

