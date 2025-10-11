<template>
  <div class="modal-overlay" v-if="visible" @click.self="close">
    <div class="modal-content changelog-modal">
      <div class="modal-header">
        <h2>📝 更新日志</h2>
        <div class="header-actions">
          <button 
            class="refresh-btn" 
            @click="fetchCommitsFromGitHub(false)"
            :disabled="loading || cooldownTime > 0"
            :title="loading ? '加载中...' : cooldownTime > 0 ? `请等待 ${cooldownTime} 秒后再刷新` : '刷新更新记录'"
          >
            <span :class="{ 'spinning': loading }">
              {{ cooldownTime > 0 ? cooldownTime : '🔄' }}
            </span>
          </button>
          <button class="close-btn" @click="close">✕</button>
        </div>
      </div>
      
      <div class="modal-body">
        <!-- 加载状态 -->
        <div v-if="loading" class="loading-state">
          <div class="loading-spinner"></div>
          <p>正在从GitHub加载更新记录...</p>
        </div>
        
        <!-- 错误提示 -->
        <div v-else-if="error" class="error-state">
          <p>⚠️ 无法从GitHub获取最新记录</p>
          <p class="error-message">{{ error }}</p>
          <p class="fallback-hint">使用本地缓存数据</p>
        </div>
        
        <!-- 提交记录列表 -->
        <div v-else class="changelog-list">
          <div v-for="(group, date) in groupedCommits" :key="date" class="date-group">
            <div class="date-header">{{ date }}</div>
            <div 
              v-for="(commit, index) in group" 
              :key="commit.hash"
              class="changelog-item"
              :class="getCommitTypeClass(commit.message)"
            >
              <div class="commit-header">
                <span class="commit-number">{{ commit.number }}</span>
                <span class="commit-type-badge">{{ getCommitTypeLabel(commit.message) }}</span>
              </div>
              <div class="commit-message">{{ getCommitMessage(commit.message) }}</div>
              <div v-if="commit.body" class="commit-body">
                <ul>
                  <li v-for="(line, idx) in getCommitBodyLines(commit.body)" :key="idx">
                    {{ line }}
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, defineExpose, onMounted, onUnmounted } from 'vue'

const visible = ref(false)
const loading = ref(false)
const error = ref(null)

// 刷新冷却时间相关
const cooldownTime = ref(0) // 剩余冷却时间（秒）
const COOLDOWN_DURATION = 30 // 冷却持续时间（秒）
let cooldownTimer = null

// GitHub仓库配置
const GITHUB_REPO = 'iskssssss/outdoor-gear-checklist' // 修改为您的GitHub用户名/仓库名
const GITHUB_API = `https://api.github.com/repos/${GITHUB_REPO}/commits`

// Git提交记录数据（从GitHub API动态获取）
const commits = ref([])

/**
 * 按日期分组提交记录
 */
const groupedCommits = computed(() => {
  // 为每个提交添加序号（从1到n，最早的是1）
  const commitsWithNumber = commits.value.map((commit, index) => ({
    ...commit,
    number: commits.value.length - index // 倒序编号：最新的是最大号
  }))
  
  // 按日期分组（保持原顺序，最新的在前）
  const groups = {}
  commitsWithNumber.forEach(commit => {
    if (!groups[commit.date]) {
      groups[commit.date] = []
    }
    groups[commit.date].push(commit)
  })
  
  return groups
})

/**
 * 从GitHub API获取提交记录
 */
function startCooldown() {
  cooldownTime.value = COOLDOWN_DURATION
  console.log(`🔒 开始冷却倒计时: ${COOLDOWN_DURATION} 秒`)
  
  // 清除之前的定时器
  if (cooldownTimer) {
    clearInterval(cooldownTimer)
  }
  
  // 开始倒计时
  cooldownTimer = setInterval(() => {
    cooldownTime.value--
    console.log(`⏱️ 冷却中: ${cooldownTime.value} 秒`)
    if (cooldownTime.value <= 0) {
      clearInterval(cooldownTimer)
      cooldownTimer = null
      console.log(`✅ 冷却结束，可以再次刷新`)
    }
  }, 1000)
}

async function fetchCommitsFromGitHub(isInitialLoad = false) {
  console.log(`🔍 fetchCommitsFromGitHub 调用 - isInitialLoad: ${isInitialLoad}, cooldownTime: ${cooldownTime.value}`)
  
  // 检查是否在冷却时间内（首次加载除外）
  if (!isInitialLoad && cooldownTime.value > 0) {
    console.warn(`⏱️ 刷新冷却中，请等待 ${cooldownTime.value} 秒`)
    return
  }
  
  loading.value = true
  error.value = null
  
  try {
    const response = await fetch(`${GITHUB_API}?per_page=50`, {
      headers: {
        'Accept': 'application/vnd.github.v3+json'
      }
    })
    
    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`)
    }
    
    const data = await response.json()
    
    // 转换GitHub API数据格式为我们的格式
    const fetchedCommits = data.map(commit => {
      const message = commit.commit.message.split('\n')[0] // 第一行作为message
      const body = commit.commit.message.split('\n').slice(1).join('\n').trim() // 其余作为body
      const date = new Date(commit.commit.author.date).toISOString().split('T')[0]
      
      return {
        hash: commit.sha.substring(0, 7),
        date: date,
        message: message,
        body: body,
        author: commit.commit.author.name
      }
    })
    
    commits.value = fetchedCommits
    console.log('✅ 成功从GitHub获取提交记录:', fetchedCommits.length, '条')
    
    // 只有非首次加载才启动冷却倒计时
    if (!isInitialLoad) {
      console.log('🚀 准备启动冷却倒计时...')
      startCooldown()
    } else {
      console.log('⏭️ 首次加载，跳过冷却')
    }
  } catch (err) {
    console.warn('⚠️ 从GitHub获取提交记录失败，使用本地数据:', err.message)
    error.value = err.message
    // 保持使用本地默认数据
  } finally {
    loading.value = false
  }
}

/**
 * 显示模态框
 */
function show() {
  visible.value = true
}

/**
 * 关闭模态框
 */
function close() {
  visible.value = false
}

// 组件挂载时尝试从GitHub获取数据（首次加载不启动冷却）
onMounted(() => {
  fetchCommitsFromGitHub(true)
})

// 组件卸载时清理定时器
onUnmounted(() => {
  if (cooldownTimer) {
    clearInterval(cooldownTimer)
    cooldownTimer = null
    console.log('🧹 清理冷却定时器')
  }
})

/**
 * 根据提交信息获取类型标签
 */
function getCommitTypeLabel(message) {
  if (message.startsWith('feat:')) return '✨ 新功能'
  if (message.startsWith('fix:')) return '🐛 修复'
  if (message.startsWith('docs:')) return '📝 文档'
  if (message.startsWith('refactor:')) return '♻️ 重构'
  if (message.startsWith('chore:')) return '🔧 配置'
  if (message.startsWith('style:')) return '💄 样式'
  if (message.startsWith('perf:')) return '⚡ 性能'
  if (message.startsWith('test:')) return '✅ 测试'
  return '📦 其他'
}

/**
 * 根据提交类型获取CSS类名
 */
function getCommitTypeClass(message) {
  if (message.startsWith('feat:')) return 'type-feat'
  if (message.startsWith('fix:')) return 'type-fix'
  if (message.startsWith('docs:')) return 'type-docs'
  if (message.startsWith('refactor:')) return 'type-refactor'
  if (message.startsWith('chore:')) return 'type-chore'
  return 'type-other'
}

/**
 * 提取提交信息（去除类型前缀）
 */
function getCommitMessage(message) {
  const colonIndex = message.indexOf(':')
  if (colonIndex > 0) {
    return message.substring(colonIndex + 1).trim()
  }
  return message
}

/**
 * 将提交body拆分成行数组
 */
function getCommitBodyLines(body) {
  if (!body) return []
  return body.split('\n').filter(line => line.trim())
}

// 暴露方法给父组件
defineExpose({
  show,
  close
})
</script>

<style scoped lang="scss">
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.changelog-modal {
  width: 90%;
  max-width: 800px;
  max-height: 80vh;
  background: var(--bg-card);
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0,0,0,0.3);
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 28px;
  border-bottom: 1px solid var(--border-color);

  h2 {
    margin: 0;
    font-size: 24px;
    color: var(--text-primary);
  }

  .header-actions {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  .refresh-btn {
    background: none;
    border: none;
    font-size: 20px;
    cursor: pointer;
    color: var(--text-secondary);
    padding: 4px 8px;
    border-radius: 6px;
    transition: all 0.2s ease;
    
    &:hover:not(:disabled) {
      background: var(--bg-hover);
      color: var(--primary-color);
    }
    
    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    
    .spinning {
      display: inline-block;
      animation: spin 1s linear infinite;
    }
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
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 20px 28px;
}

.changelog-list {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.date-group {
  margin-bottom: 32px;
  
  &:last-child {
    margin-bottom: 0;
  }
}

.date-header {
  font-size: 18px;
  font-weight: 600;
  color: var(--primary-color);
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 2px solid var(--primary-color);
  position: sticky;
  top: -20px;
  background: var(--bg-primary);
  z-index: 10;
}

.changelog-item {
  margin-bottom: 16px;
  background: var(--bg-input);
  border-radius: 12px;
  padding: 16px 20px;
  border-left: 4px solid var(--primary-color);
  transition: all 0.3s ease;
  
  &:last-child {
    margin-bottom: 0;
  }

  &:hover {
    transform: translateX(4px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  }

  &.type-feat {
    border-left-color: #52c41a; // 绿色 - 新功能
  }

  &.type-fix {
    border-left-color: #f5222d; // 红色 - 修复
  }

  &.type-docs {
    border-left-color: #1890ff; // 蓝色 - 文档
  }

  &.type-refactor {
    border-left-color: #faad14; // 橙色 - 重构
  }

  &.type-chore {
    border-left-color: #722ed1; // 紫色 - 配置
  }

  &.type-other {
    border-left-color: #8c8c8c; // 灰色 - 其他
  }
}

.commit-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.commit-type-badge {
  font-size: 13px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 6px;
  background: var(--bg-card);
  color: var(--text-primary);
  white-space: nowrap;
}

.commit-message {
  font-size: 15px;
  color: var(--text-primary);
  margin-bottom: 8px;
  line-height: 1.5;
  font-weight: 500;
}

.commit-body {
  margin: 12px 0;
  padding: 12px;
  background: var(--bg-card);
  border-radius: 8px;
  
  ul {
    margin: 0;
    padding-left: 20px;
    list-style-type: none;
    
    li {
      position: relative;
      font-size: 14px;
      color: var(--text-secondary);
      line-height: 1.8;
      padding-left: 8px;
      
      &::before {
        content: '•';
        position: absolute;
        left: -12px;
        color: var(--primary-color);
        font-weight: bold;
      }
    }
  }
}

.commit-number {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 28px;
  height: 28px;
  padding: 0 8px;
  font-size: 14px;
  font-weight: 600;
  color: var(--bg-primary);
  background: var(--primary-color);
  border-radius: 50%;
  margin-right: 8px;
}

/* 加载状态 */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: var(--text-secondary);
  
  p {
    margin-top: 16px;
    font-size: 14px;
  }
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid var(--bg-hover);
  border-top-color: var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* 错误状态 */
.error-state {
  text-align: center;
  padding: 40px 20px;
  color: var(--text-secondary);
  
  p {
    margin: 8px 0;
  }
  
  .error-message {
    font-size: 12px;
    color: #f5222d;
    font-family: 'Courier New', monospace;
    background: var(--bg-hover);
    padding: 8px 12px;
    border-radius: 6px;
    display: inline-block;
  }
  
  .fallback-hint {
    margin-top: 16px;
    font-size: 13px;
    color: var(--primary-color);
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .changelog-modal {
    width: 95%;
    max-height: 85vh;
  }

  .modal-header {
    padding: 20px;
    
    h2 {
      font-size: 20px;
    }
  }

  .modal-body {
    padding: 16px 20px;
  }

  .changelog-item {
    padding: 12px 16px;
  }

  .commit-header {
    flex-wrap: wrap;
  }

  .commit-date {
    margin-left: 0;
    width: 100%;
  }
}
</style>

