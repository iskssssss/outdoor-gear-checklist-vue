<template>
  <BaseModal ref="modalRef" title-tag="h2" width="900px" max-height="85vh" @close="handleClose">
    <template #header>
      <h2 class="changelog-title">📝 更新日志</h2>
      <div class="header-actions">
        <button class="close-btn" @click="close">✕</button>
      </div>
    </template>

    <template #default>
      <MarkdownViewer 
        :content="content"
        :loading="loading"
        :error="error"
        :show-toc="true"
        :has-cached-content="hasCachedContent"
      />
    </template>
  </BaseModal>
</template>

<script setup>
import { ref, defineExpose, onMounted } from 'vue'
import BaseModal from '../common/BaseModal.vue'
import MarkdownViewer from '../common/MarkdownViewer.vue'

const modalRef = ref(null)
const loading = ref(false)
const error = ref(null)
const content = ref('')
const hasCachedContent = ref(false)

const CACHE_KEY = 'outdoor-gear-changelog-cache'
const CACHE_TIME_KEY = 'outdoor-gear-changelog-cache-time'

/**
 * 从本地加载文档
 */
async function fetchChangelog(useCache = true) {
  // 尝试使用缓存
  if (useCache) {
    const cachedContent = localStorage.getItem(CACHE_KEY)
    const cachedTime = localStorage.getItem(CACHE_TIME_KEY)
    
    if (cachedContent && cachedTime) {
      const cacheAge = Date.now() - parseInt(cachedTime)
      // 缓存有效期1小时
      if (cacheAge < 3600000) {
        content.value = cachedContent
        hasCachedContent.value = true
        console.log('📝 使用缓存的更新日志内容')
        return
      }
    }
  }
  
  loading.value = true
  error.value = null
  
  try {
    console.log('🌐 正在加载更新日志...')
    
    const cacheBuster = useCache ? '' : `?t=${Date.now()}`
    const response = await fetch('/CHANGELOG.md' + cacheBuster)
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    const text = await response.text()
    
    if (!text || text.trim().length === 0) {
      throw new Error('获取的内容为空')
    }
    
    content.value = text
    hasCachedContent.value = true
    
    // 保存到缓存
    localStorage.setItem(CACHE_KEY, text)
    localStorage.setItem(CACHE_TIME_KEY, Date.now().toString())
    
    console.log('✅ 更新日志已加载')
  } catch (err) {
    console.error('❌ 加载更新日志失败:', err)
    error.value = err.message
    
    // 尝试使用缓存作为降级方案
    const cachedContent = localStorage.getItem(CACHE_KEY)
    if (cachedContent) {
      content.value = cachedContent
      hasCachedContent.value = true
      console.log('📝 使用缓存的更新日志内容（降级）')
    } else {
      content.value = `# 📝 更新日志\n\n无法加载更新日志内容。\n\n请检查网络连接或稍后重试。`
      hasCachedContent.value = false
    }
  } finally {
    loading.value = false
  }
}

/**
 * 显示模态框
 */
function show() {
  modalRef.value?.show()
}

/**
 * 关闭模态框
 */
function close() {
  modalRef.value?.close()
}

function handleClose() {
  // 额外的关闭逻辑（如果需要）
}

// 组件挂载时加载
onMounted(() => {
  // 先尝试从缓存加载
  const cachedContent = localStorage.getItem(CACHE_KEY)
  if (cachedContent) {
    content.value = cachedContent
    hasCachedContent.value = true
  }
  // 然后获取最新内容
  fetchChangelog(true)
})

// 暴露方法给父组件
defineExpose({
  show,
  close
})
</script>

<style scoped lang="scss">
.changelog-title {
  margin: 0;
  font-size: 1.5rem;
  color: var(--text-primary);
}

.header-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: var(--text-secondary);
  padding: 4px 8px;
  border-radius: 6px;
  transition: all 0.2s ease;

  &:hover {
    background: var(--bg-hover);
    color: var(--text-primary);
  }
}
</style>
