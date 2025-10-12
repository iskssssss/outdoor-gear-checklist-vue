<template>
  <div class="markdown-page">
    <!-- 文档内容区域 -->
    <main class="markdown-main" ref="markdownMainRef">
      <div class="markdown-container">
        <MarkdownViewer ref="markdownViewerRef" :content="content" :loading="loading" :error="error" :show-toc="true"
          :has-cached-content="hasCachedContent" :scroll-container="markdownMainRef"
          :show-refresh-button="showRefreshButton" :cooldown-time="cooldownTime" @refresh="fetchContent(false)" />
      </div>
    </main>
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
const emit = defineEmits([])

const loading = ref(false)
const error = ref(null)
const content = ref('')
const hasCachedContent = ref(false)
const markdownMainRef = ref(null)
const markdownViewerRef = ref(null)

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
  // 通知 MarkdownViewer 处理滚动（用于目录高亮）
  if (markdownViewerRef.value && markdownViewerRef.value.handleScroll) {
    markdownViewerRef.value.handleScroll()
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
  position: relative;
  /* 为刷新按钮定位 */
  width: 100%;
  height: 100%;
  // background: var(--bg-main);
  display: flex;
  flex-direction: column;
}

// 主内容区
.markdown-main {
  flex: 1;
}

.markdown-container {
  max-width: 1320px;
  margin: 0 auto;
  background: var(--bg-card);
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-md);
  // 新增内边距以创建与页脚的间距
  padding: 20px 20px 40px;
  // 移除硬编码边框，由主题控制
}
</style>
