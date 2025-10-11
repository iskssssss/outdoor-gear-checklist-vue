<template>
  <div class="doc-page">
    <!-- 顶部导航栏 -->
    <header class="doc-header">
      <div class="doc-header-content">
        <button class="back-btn" @click="$emit('close')" title="返回主页">
          <span class="back-icon">←</span>
          <span class="back-text">返回</span>
        </button>
        
        <h1 class="doc-page-title">📚 使用指南</h1>
        
        <div class="header-actions">
          <button 
            class="refresh-btn" 
            @click="fetchDocFromGitHub(false)"
            :disabled="loading || cooldownTime > 0"
            :title="loading ? '加载中...' : cooldownTime > 0 ? `请等待 ${cooldownTime} 秒后再刷新` : '刷新文档内容'"
          >
            <span :class="{ 'spinning': loading }">
              {{ cooldownTime > 0 ? cooldownTime : '🔄' }}
            </span>
          </button>
        </div>
      </div>
    </header>

    <!-- 文档内容区域 -->
    <main class="doc-main" ref="docMainRef" @scroll="handleScroll">
      <div class="doc-container">
        <div class="doc-layout">
          <!-- 左侧：文档内容 -->
          <div class="doc-content-wrapper">
            <!-- 加载状态 -->
            <div v-if="loading" class="loading-state">
              <div class="loading-spinner"></div>
              <p>正在从GitHub加载文档...</p>
            </div>
            
            <!-- 错误提示 -->
            <div v-else-if="error" class="error-state">
              <p>⚠️ 无法从GitHub获取文档</p>
              <p class="error-message">{{ error }}</p>
              <p class="fallback-hint">使用本地缓存数据</p>
            </div>
            
            <!-- 文档内容 -->
            <div v-else class="doc-content" @click="handleLinkClick">
              <div class="markdown-body" v-html="renderedContent"></div>
            </div>
          </div>

          <!-- 右侧：目录导航 -->
          <aside v-if="!loading && !error && tableOfContents.length > 0" class="doc-toc">
            <div class="toc-header">
              <h3>📑 目录</h3>
            </div>
            <nav class="toc-nav">
              <ul class="toc-list">
                <li 
                  v-for="(item, index) in tableOfContents" 
                  :key="index"
                  :class="['toc-item', `toc-level-${item.level}`, { active: activeHeadingId === item.id }]"
                >
                  <a 
                    :href="`#${item.id}`" 
                    @click.prevent="scrollToHeading(item.id)"
                    :title="item.text"
                  >
                    {{ item.text }}
                  </a>
                </li>
              </ul>
            </nav>
          </aside>
        </div>
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
import { ref, computed, defineExpose, onMounted, onUnmounted, nextTick, watch } from 'vue'

// 定义事件
const emit = defineEmits(['close'])

const loading = ref(false)
const error = ref(null)
const rawContent = ref('')
const docMainRef = ref(null)
const showBackToTop = ref(false)
const tableOfContents = ref([])
const activeHeadingId = ref('')

// IntersectionObserver 相关（已弃用，改用 scrollTop 计算）
let headingObserver = null

// 滚动锁机制：防止程序性滚动触发回调
let isProgrammaticScroll = false
let scrollUnlockTimer = null

// 节流标记：防止快速滚动时频繁更新
let ticking = false

// 刷新冷却时间相关
const cooldownTime = ref(0)
const COOLDOWN_DURATION = 30
let cooldownTimer = null

// GitHub仓库配置
const GITHUB_REPO = 'iskssssss/outdoor-gear-checklist'
const GITHUB_BRANCH = 'main'
const GITHUB_DOC_PATH = 'USAGE.md'
const GITHUB_DOC_URL = `https://raw.githubusercontent.com/${GITHUB_REPO}/${GITHUB_BRANCH}/${GITHUB_DOC_PATH}`
const CACHE_KEY = 'outdoor-gear-doc-cache'
const CACHE_TIME_KEY = 'outdoor-gear-doc-cache-time'

// 导入渲染器（复用DocModal的渲染逻辑）
// 这里直接复制渲染逻辑
const renderedContent = computed(() => {
  if (!rawContent.value) return ''

  // 规范换行（统一 \r\n 为 \n，避免 Windows 换行导致正则不匹配）
  let html = rawContent.value.replace(/\r\n/g, '\n')

  // ------------------------------
  // 1. 提取代码块（```）和行内代码（`code`）
  // ------------------------------
  const codeBlocks = []
  html = html.replace(/```(\w+)?\s*\n([\s\S]*?)```/g, (match, lang, code) => {
    const placeholder = `CODEBLOCK${codeBlocks.length}PLACEHOLDER`
    codeBlocks.push(`<pre><code class="language-${lang || 'plaintext'}">${code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>`)
    return placeholder
  })

  const inlineCodes = []
  html = html.replace(/`([^`\n]+)`/g, (match, code) => {
    const placeholder = `INLINECODE${inlineCodes.length}PLACEHOLDER`
    inlineCodes.push(`<code>${code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code>`)
    return placeholder
  })

  // ------------------------------
  // 2. 转义 HTML 特殊字符（保护占位符）
  // ------------------------------
  html = html.replace(/&(?!amp;)/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

  // ------------------------------
  // 3. 图片和链接
  // ------------------------------
  html = html.replace(/!\[([^\]]*)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)/g, '<img src="$2" alt="$1" title="$3" />')
  html = html.replace(/\[([^\]]+)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)/g, '<a href="$2" title="$3" target="_blank" rel="noopener noreferrer">$1</a>')

  // ------------------------------
  // 4. 标题
  // ------------------------------
  for (let i = 6; i >= 1; i--) {
    const regex = new RegExp(`^#{${i}}\\s+(.+)$`, 'gim')
    html = html.replace(regex, `<h${i}>$1</h${i}>`)
  }

  // ------------------------------
  // 5. 水平线
  // ------------------------------
  html = html.replace(/^(?:---|\*\*\*|___)$/gim, '<hr>')

  // ------------------------------
  // 6. 引用块（连续行合并）
  // ------------------------------
  html = html.replace(/(^&gt;[\s\S]+?(?=\n{2,}|$))/gm, (match) => {
    const lines = match.split('\n').map(line => line.replace(/^&gt;\s?/, '')).join('<br>')
    return `<blockquote>${lines}</blockquote>`
  })

  // ------------------------------
  // 7. 表格（GFM 完整表头+表体，保守实现）
  // ------------------------------
  const tableRegex = /((?:^\|.*\|\s*$\n?)+)/gm
  html = html.replace(tableRegex, (match) => {
    const rows = match.trim().split('\n').map(row => row.trim().replace(/^\||\|$/g, '').split('|').map(cell => cell.trim()))
    if (rows.length < 2) return match
    const headerCells = rows[0].map(cell => `<th>${cell}</th>`).join('')
    const bodyRows = rows.slice(2).map(r => `<tr>${r.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')
    return `<table><thead><tr>${headerCells}</tr></thead><tbody>${bodyRows}</tbody></table>`
  })

  // ------------------------------
  // 8. 列表和任务列表（改进：支持空行内断但仍属于同一列表、支持嵌套）
  // ------------------------------
  function parseList(lines, baseIndent = 0) {
    const items = []
    const len = lines.length
    let i = 0

    const itemMatch = (ln) => ln.match(/^(\s*)([-*+]|\d+\.)\s+(\[([ xX])\]\s*)?(.*)$/)

    while (i < len) {
      const m = itemMatch(lines[i])
      if (!m) {
        i++
        continue
      }

      const [, spaces, bullet, , taskMark, rest] = m
      const indent = spaces.length

      const contentLines = [rest]
      i++
      while (i < len) {
        const next = lines[i]
        const nextMatch = itemMatch(next)

        if (next.trim() === '') {
          contentLines.push('') 
          i++
          continue
        }

        const nextIndent = (next.match(/^(\s*)/))[0].length

        if (nextMatch && nextIndent > indent) {
          const nestedLines = []
          const subIndent = nextIndent
          while (i < len && ((lines[i].match(/^(\s*)/))[0].length >= subIndent)) {
            nestedLines.push(lines[i].slice(subIndent))
            i++
          }
          const nestedHtml = parseList(nestedLines, 0)
          contentLines.push(nestedHtml)
          continue
        }

        if (!nextMatch && nextIndent > indent) {
          contentLines.push(next.trim())
          i++
          continue
        }

        break
      }

      const rawContent = contentLines.filter(Boolean).join('\n')
      if (taskMark !== undefined) {
        items.push(`<li class="task-item"><input type="checkbox" ${/x/i.test(taskMark) ? 'checked' : ''} disabled> ${rawContent}</li>`)
      } else {
        items.push(`<li>${rawContent}</li>`)
      }
    }

    const firstNonEmpty = lines.find(l => l.trim() !== '')
    const ordered = firstNonEmpty ? /^\s*\d+\./.test(firstNonEmpty) : false
    return ordered ? `<ol>${items.join('')}</ol>` : `<ul>${items.join('')}</ul>`
  }

  const rawLines = html.split('\n')
  const processed = []
  let buff = []
  let idx = 0

  while (idx < rawLines.length) {
    const line = rawLines[idx]
    const isListLine = /^\s*([-*+]|\d+\.)\s+/.test(line)
    if (isListLine) {
      buff.push(line)
      idx++
      continue
    }

    if (buff.length > 0 && line.trim() === '') {
      let j = idx + 1
      while (j < rawLines.length && rawLines[j].trim() === '') j++
      const nextLine = rawLines[j] || ''
      if (/^\s*([-*+]|\d+\.)\s+/.test(nextLine)) {
        buff.push('')
        idx++
        continue
      } else {
        processed.push(parseList(buff))
        buff = []
        continue
      }
    }

    if (buff.length > 0) {
      processed.push(parseList(buff))
      buff = []
    }
    processed.push(line)
    idx++
  }
  if (buff.length > 0) processed.push(parseList(buff))
  html = processed.join('\n')

  // ------------------------------
  // 9. 加粗、斜体、删除线（在列表/其他块处理后再处理）
  // ------------------------------
  html = html.replace(/\*\*\*([^\*\n]+?)\*\*\*/g, '<strong><em>$1</em></strong>')
  html = html.replace(/\*\*([^\*\n]+?)\*\*/g, '<strong>$1</strong>')
  html = html.replace(/\*([^\*\n]+?)\*/g, '<em>$1</em>')
  html = html.replace(/~~([^~\n]+?)~~/g, '<del>$1</del>')

  // ------------------------------
  // 10. 段落处理（跳过已有元素和占位符）
  // ------------------------------
  const blockRegex = /^(<h\d>|<ul>|<ol>|<pre>|<hr>|<blockquote>|<table>|<img>|CODEBLOCK|INLINECODE)/i
  html = html.split(/\n{2,}/).map(block => {
    const trimmed = block.trim()
    if (!trimmed) return ''
    if (blockRegex.test(trimmed)) return block

    if (trimmed.match(/^(?:<a[^>]*>)?<img[^>]+src="[^"]*(?:shields\.io|badge)[^"]*"[^>]*>(?:<\/a>)?(?:\s*(?:<a[^>]*>)?<img[^>]+>(?:<\/a>)?)*$/)) {
      return `<p class="badge-row">${block}</p>`
    }
    return `<p>${block}</p>`
  }).filter(Boolean).join('\n\n')

  // ------------------------------
  // 11. 段落内换行处理（仅段落与列表项内部）
  // ------------------------------
  html = html.replace(/<p(?:\s+class="[^"]*")?>([\s\S]*?)<\/p>/g, (m, c) => {
    const cls = m.match(/class="([^"]*)"/)?.[1] || ''
    const classAttr = cls ? ` class="${cls}"` : ''
    return `<p${classAttr}>${c.replace(/\n/g, '<br>')}</p>`
  })
  html = html.replace(/<li>([\s\S]*?)<\/li>/g, (m, c) => `<li>${c.replace(/\n/g, '<br>')}</li>`)

  // ------------------------------
  // 12. 恢复代码块和行内代码
  // ------------------------------
  codeBlocks.forEach((code, idx) => {
    html = html.replace(new RegExp(`CODEBLOCK${idx}PLACEHOLDER`, 'g'), code)
  })
  inlineCodes.forEach((code, idx) => {
    html = html.replace(new RegExp(`INLINECODE${idx}PLACEHOLDER`, 'g'), code)
  })

  return html
})

/**
 * 从GitHub获取文档
 */
async function fetchDocFromGitHub(useCache = true) {
  if (useCache) {
    const cachedContent = localStorage.getItem(CACHE_KEY)
    const cachedTime = localStorage.getItem(CACHE_TIME_KEY)
    
    if (cachedContent && cachedTime) {
      const cacheAge = Date.now() - parseInt(cachedTime)
      if (cacheAge < 3600000) {
        rawContent.value = cachedContent
        console.log('📚 使用缓存的文档内容')
        return
      }
    }
  }
  
  loading.value = true
  error.value = null
  
  try {
    console.log('🌐 正在从GitHub获取文档...', { URL: GITHUB_DOC_URL })
    
    const cacheBuster = useCache ? '' : `?t=${Date.now()}`
    const response = await fetch(GITHUB_DOC_URL + cacheBuster)
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    const content = await response.text()
    
    if (!content || content.trim().length === 0) {
      throw new Error('获取的文档内容为空')
    }
    
    rawContent.value = content
    localStorage.setItem(CACHE_KEY, content)
    localStorage.setItem(CACHE_TIME_KEY, Date.now().toString())
    
    console.log('✅ 文档已从GitHub加载')
    startCooldown()
  } catch (err) {
    console.error('❌ 获取文档失败:', err)
    error.value = err.message
    
    const cachedContent = localStorage.getItem(CACHE_KEY)
    if (cachedContent) {
      rawContent.value = cachedContent
      console.log('📚 使用缓存的文档内容（降级）')
    } else {
      rawContent.value = `# 📚 使用指南\n\n无法加载文档内容。\n\n请检查网络连接或稍后重试。`
    }
  } finally {
    loading.value = false
  }
}

/**
 * 启动刷新冷却
 */
function startCooldown() {
  cooldownTime.value = COOLDOWN_DURATION
  
  cooldownTimer = setInterval(() => {
    cooldownTime.value--
    if (cooldownTime.value <= 0) {
      clearInterval(cooldownTimer)
      cooldownTimer = null
    }
  }, 1000)
}

/**
 * 处理链接点击事件（修复版）
 */
function handleLinkClick(event) {
  const target = event.target
  
  if (target.tagName === 'A' && target.getAttribute('href')?.startsWith('#')) {
    event.preventDefault()
    
    const targetId = target.getAttribute('href').substring(1)
    scrollToHeading(targetId)
  }
}

/**
 * 简单的字符串哈希函数
 */
function hashCode(str) {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36).substring(0, 6)
}

/**
 * 提取目录结构并生成稳定的ID
 */
function extractTableOfContents() {
  if (!rawContent.value) {
    tableOfContents.value = []
    return
  }
  
  const lines = rawContent.value.split('\n')
  const toc = []
  let idCounter = 0
  
  lines.forEach(line => {
    const match = line.match(/^(#{1,6})\s+(.+)$/)
    if (match) {
      const level = match[1].length
      const text = match[2].trim()
      // 生成更稳定的ID：基于文本内容的哈希
      const id = `heading-${hashCode(text)}-${idCounter++}`
      
      toc.push({
        id,
        level,
        text,
        originalText: text
      })
    }
  })
  
  tableOfContents.value = toc
}

/**
 * 为所有标题元素设置ID
 */
function setupHeadingIds() {
  if (!docMainRef.value) return
  
  const headings = docMainRef.value.querySelectorAll('h1, h2, h3, h4, h5, h6')
  
  headings.forEach((heading, index) => {
    const text = heading.textContent.trim()
    const level = parseInt(heading.tagName.substring(1))
    
    // 查找对应的目录项
    const tocItem = tableOfContents.value.find(item => 
      item.text === text && item.level === level
    )
    
    if (tocItem) {
      heading.id = tocItem.id
    } else {
      // 如果没有匹配的目录项，生成一个ID
      heading.id = `heading-${hashCode(text)}-${index}`
    }
  })
}

/**
 * 点击目录滚动（稳定版 - 双保险机制）
 */
function scrollToHeading(headingId) {
  if (!docMainRef?.value) return
  
  const wrapper = docMainRef.value
  const target = wrapper.querySelector(`#${CSS.escape(headingId)}`)
  
  if (!target) {
    console.warn('scrollToHeading: 未找到目标标题', headingId)
    return
  }

  // 🔒 标记为程序性滚动（observer 和 scroll 事件暂停响应）
  isProgrammaticScroll = true
  if (scrollUnlockTimer) {
    clearTimeout(scrollUnlockTimer)
    scrollUnlockTimer = null
  }

  // 计算相对于 wrapper 的滚动目标位置（保留顶部 80px 空间）
  const wrapperRect = wrapper.getBoundingClientRect()
  const targetRect = target.getBoundingClientRect()
  const targetOffset = targetRect.top - wrapperRect.top + wrapper.scrollTop

  wrapper.scrollTo({
    top: Math.max(0, targetOffset - 80),
    behavior: 'smooth'
  })

  // 立即把目录高亮设置为点击项（避免等待 observer）
  activeHeadingId.value = headingId
  
  // 添加视觉高亮效果
  highlightHeading(target)

  // 🔓 在滚动稳定后解锁（600ms 保守值）
  scrollUnlockTimer = setTimeout(() => {
    isProgrammaticScroll = false
    scrollUnlockTimer = null
  }, 600)
}

/**
 * 高亮显示标题
 */
function highlightHeading(heading) {
  heading.style.transition = 'all 0.3s ease'
  heading.style.backgroundColor = 'var(--primary-color)'
  heading.style.color = 'white'
  heading.style.padding = '0.5em'
  heading.style.marginLeft = '-0.5em'
  heading.style.marginRight = '-0.5em'
  heading.style.borderRadius = '4px'
  
  setTimeout(() => {
    heading.style.backgroundColor = ''
    heading.style.color = ''
    heading.style.padding = ''
    heading.style.marginLeft = ''
    heading.style.marginRight = ''
  }, 2000)
}

/**
 * 基于 scrollTop 计算当前高亮标题（精准且稳定）
 */
function handleScrollThrottled() {
  if (isProgrammaticScroll) return
  if (!docMainRef?.value) return

  const wrapper = docMainRef.value
  const scrollTop = wrapper.scrollTop
  const headings = [...wrapper.querySelectorAll('h1, h2, h3, h4, h5, h6')]

  if (headings.length === 0) return

  let currentId = headings[0]?.id

  // 找到滚动位置越过的最后一个标题
  for (let i = 0; i < headings.length; i++) {
    const h = headings[i]
    // 加一个偏移量（80px）来对齐视觉高亮
    if (h.offsetTop - 80 <= scrollTop) {
      currentId = h.id
    } else {
      break
    }
  }

  // 只在需要时更新，避免不必要的重渲染
  if (currentId && currentId !== activeHeadingId.value) {
    activeHeadingId.value = currentId
  }
}

/**
 * 节流的滚动处理（使用 requestAnimationFrame）
 */
function onScroll() {
  if (!ticking) {
    window.requestAnimationFrame(() => {
      handleScrollThrottled()
      ticking = false
    })
    ticking = true
  }
}

/**
 * 设置滚动监听（简化版 - 完全基于 scrollTop 计算）
 */
function setupHeadingObserver() {
  // 清理旧监听
  if (headingObserver) {
    headingObserver.disconnect()
    headingObserver = null
  }
  
  if (!docMainRef?.value) return

  const rootEl = docMainRef.value

  // 使用节流的滚动事件监听，而不是 IntersectionObserver
  rootEl.addEventListener('scroll', onScroll, { passive: true })
  
  // 初始化时计算一次当前高亮
  nextTick(() => {
    handleScrollThrottled()
  })
}

/**
 * 当 activeHeadingId 变更时，让 TOC 面板滚动以显示当前项（仅在非程序性滚动时）
 */
function updateTocScrollToActive() {
  if (!docMainRef?.value) return
  if (isProgrammaticScroll) return

  nextTick(() => {
    const toc = document.querySelector('.doc-toc') || document.querySelector('.toc-nav') || document.querySelector('.toc')
    if (!toc) return
    
    const activeEl = toc.querySelector('.toc-item.active') || toc.querySelector('li.active')
    if (!activeEl) return

    const tocRect = toc.getBoundingClientRect()
    const activeRect = activeEl.getBoundingClientRect()

    if (activeRect.top < tocRect.top || activeRect.bottom > tocRect.bottom) {
      toc.scrollTop += activeRect.top - tocRect.top - tocRect.height / 2 + (activeRect.height / 2)
    }
  })
}

/**
 * 清理事件监听和定时器
 */
function teardownHeadingObserver() {
  if (headingObserver) {
    headingObserver.disconnect()
    headingObserver = null
  }
  if (docMainRef?.value) {
    docMainRef.value.removeEventListener('scroll', onScroll)
  }
  if (scrollUnlockTimer) {
    clearTimeout(scrollUnlockTimer)
    scrollUnlockTimer = null
  }
  isProgrammaticScroll = false
  ticking = false
}

/**
 * 处理滚动事件
 */
function handleScroll(event) {
  const scrollTop = event.target.scrollTop
  showBackToTop.value = scrollTop > 300
  
  // IntersectionObserver 会自动处理标题的可见性
  // 不需要手动更新
}

/**
 * 回到顶部
 */
function scrollToTop() {
  if (docMainRef.value) {
    docMainRef.value.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

// 监听内容变化，更新目录和观察器
watch(rawContent, () => {
  extractTableOfContents()
  // 延迟设置ID和observer，等待DOM渲染完成
  nextTick(() => {
    setupHeadingIds()       // 先设置ID
    setupHeadingObserver()  // 再设置观察器
  })
})

// 组件挂载时加载文档
onMounted(() => {
  const cachedContent = localStorage.getItem(CACHE_KEY)
  if (cachedContent) {
    rawContent.value = cachedContent
    extractTableOfContents()
    // 延迟设置
    nextTick(() => {
      setupHeadingIds()
      setupHeadingObserver()
    })
  }
  fetchDocFromGitHub(true)
})

// 监听活动标题变化，同步目录滚动
watch(activeHeadingId, () => {
  updateTocScrollToActive()
})

// 组件卸载时清理
onUnmounted(() => {
  if (cooldownTimer) {
    clearInterval(cooldownTimer)
  }
  
  // 清理 Observer 和定时器
  teardownHeadingObserver()
})

defineExpose({ fetchDocFromGitHub })
</script>

<style scoped lang="scss">
// 页面容器
.doc-page {
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
.doc-header {
  background: var(--bg-header);
  border-bottom: 2px solid var(--border-color);
  box-shadow: var(--shadow-md);
  flex-shrink: 0;
  position: sticky;
  top: 0;
  z-index: 10;
}

.doc-header-content {
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

.doc-page-title {
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
.doc-main {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
}

.doc-container {
  max-width: 1600px;
  margin: 0 auto;
  padding: 40px 30px;
  min-height: 100%;
}

.doc-layout {
  display: flex;
  gap: 40px;
  position: relative;
}

.doc-content-wrapper {
  flex: 1;
  min-width: 0;
}

// 加载状态
.loading-state {
  text-align: center;
  padding: 100px 20px;
  color: var(--text-secondary);
}

.loading-spinner {
  width: 60px;
  height: 60px;
  margin: 0 auto 30px;
  border: 4px solid var(--border-color);
  border-top-color: var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

// 错误状态
.error-state {
  text-align: center;
  padding: 80px 20px;
  color: var(--text-secondary);
  
  p {
    margin: 15px 0;
  }
  
  .error-message {
    color: var(--danger-color);
    font-size: 1rem;
  }
  
  .fallback-hint {
    color: var(--text-muted);
    font-size: 0.9rem;
  }
}

// 文档内容
.doc-content {
  position: relative;
}

// 目录导航
.doc-toc {
  width: 280px;
  flex-shrink: 0;
  position: sticky;
  top: 40px;
  align-self: flex-start;
  max-height: calc(100vh - 160px);
  overflow-y: auto;
  background: var(--bg-card);
  border: 2px solid var(--border-color);
  border-radius: var(--border-radius);
  padding: 20px;
  box-shadow: var(--shadow-sm);
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: var(--bg-input);
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: var(--border-color);
    border-radius: 3px;
    
    &:hover {
      background: var(--text-muted);
    }
  }
}

.toc-header {
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 2px solid var(--border-color);
  
  h3 {
    margin: 0;
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--text-primary);
  }
}

.toc-nav {
  .toc-list {
    list-style: none;
    padding: 0;
    margin: 0;
  }
  
  .toc-item {
    margin: 4px 0;
    
    a {
      display: block;
      padding: 6px 10px;
      color: var(--text-secondary);
      text-decoration: none;
      border-radius: 6px;
      font-size: 0.9rem;
      line-height: 1.4;
      transition: all 0.2s ease;
      border-left: 3px solid transparent;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      
      &:hover {
        background: var(--bg-input);
        color: var(--text-primary);
        border-left-color: var(--primary-color);
        transform: translateX(3px);
      }
    }
    
    &.active a {
      background: var(--primary-color);
      color: var(--text-white);
      font-weight: 600;
      border-left-color: var(--primary-color);
      transform: translateX(0);
    }
  }
  
  // 不同级别标题的缩进
  .toc-level-1 {
    font-weight: 600;
    
    a {
      font-size: 0.95rem;
      padding-left: 10px;
    }
  }
  
  .toc-level-2 {
    a {
      padding-left: 20px;
      font-size: 0.88rem;
    }
  }
  
  .toc-level-3 {
    a {
      padding-left: 30px;
      font-size: 0.85rem;
    }
  }
  
  .toc-level-4 {
    a {
      padding-left: 40px;
      font-size: 0.83rem;
      color: var(--text-muted);
    }
  }
  
  .toc-level-5,
  .toc-level-6 {
    a {
      padding-left: 50px;
      font-size: 0.8rem;
      color: var(--text-muted);
    }
  }
}

// Markdown样式（完整复制自DocModal）
.markdown-body {
  color: var(--text-primary);
  line-height: 1.6;
  font-size: 1.05rem;
  word-wrap: break-word;
  
  // 标题样式
  :deep(h1) {
    font-size: 2rem;
    font-weight: 700;
    margin: 1.5em 0 0.6em;
    padding-bottom: 0.3em;
    border-bottom: 3px solid var(--primary-color);
    color: var(--text-primary);
    position: relative;
    
    &:first-child {
      margin-top: 0;
    }
    
    &::before {
      content: '📖';
      margin-right: 0.5em;
      opacity: 0.8;
    }
  }
  
  :deep(h2) {
    font-size: 1.5rem;
    font-weight: 600;
    margin: 1.2em 0 0.5em;
    padding-bottom: 0.2em;
    padding-left: 0.5em;
    border-left: 4px solid var(--primary-color);
    border-bottom: 2px solid var(--border-color);
    color: var(--text-primary);
  }
  
  :deep(h3) {
    font-size: 1.25rem;
    font-weight: 600;
    margin: 1em 0 0.5em;
    padding-left: 0.8em;
    border-left: 3px solid var(--success-color);
    color: var(--text-primary);
  }
  
  :deep(h4) {
    font-size: 1.1rem;
    font-weight: 600;
    margin: 0.9em 0 0.4em;
    color: var(--text-primary);
  }
  
  :deep(h5) {
    font-size: 1.05rem;
    font-weight: 600;
    margin: 0.8em 0 0.4em;
    color: var(--text-primary);
  }
  
  :deep(h6) {
    font-size: 1rem;
    font-weight: 600;
    margin: 0.8em 0 0.4em;
    color: var(--text-secondary);
  }
  
  // 段落样式
  :deep(p) {
    margin: 0.8em 0;
    line-height: 1.7;
    text-align: justify;
  }
  
  // 链接样式
  :deep(a) {
    color: var(--primary-color);
    text-decoration: none;
    font-weight: 500;
    border-bottom: 1px dashed var(--primary-color);
    transition: all 0.3s ease;
    padding: 0 2px;
    cursor: pointer;
    
    &:hover {
      background: var(--primary-color);
      color: var(--text-white);
      border-bottom-style: solid;
      border-radius: 2px;
    }
    
    // 内部锚点链接样式（目录跳转）
    &[href^="#"] {
      border-bottom-style: solid;
      
      &:hover {
        background: var(--primary-color);
        color: var(--text-white);
        transform: translateX(3px);
      }
    }
  }
  
  // 行内代码
  :deep(code) {
    background: var(--bg-input);
    padding: 3px 8px;
    border-radius: 4px;
    font-family: 'Consolas', 'Monaco', 'Courier New', 'monospace';
    font-size: 0.88em;
    color: var(--danger-color, #dc3545);
    border: 1px solid var(--border-color);
    font-weight: 500;
    white-space: nowrap;
  }
  
  // 代码块
  :deep(pre) {
    background: var(--bg-input);
    padding: 16px;
    border-radius: var(--border-radius);
    overflow-x: auto;
    margin: 1em 0;
    border: 1px solid var(--border-color);
    box-shadow: var(--shadow-sm);
    
    code {
      background: none;
      padding: 0;
      color: var(--text-primary);
      font-size: 0.9rem;
      border: none;
      white-space: pre;
      line-height: 1.5;
      font-weight: normal;
    }
  }
  
  // 列表样式
  :deep(ul), :deep(ol) {
    margin: 0.8em 0;
    padding-left: 2em;
    
    li {
      margin: 0.3em 0;
      line-height: 1.6;
      position: relative;
      
      &::marker {
        color: var(--primary-color);
        font-weight: 600;
      }
    }
    
    // 嵌套列表
    ul, ol {
      margin: 0.3em 0;
      padding-left: 1.5em;
    }
  }
  
  :deep(ul) {
    list-style-type: disc;
    
    li::marker {
      font-size: 0.8em;
    }
  }
  
  :deep(ol) {
    list-style-type: decimal;
  }
  
  // 加粗和斜体
  :deep(strong) {
    font-weight: 700;
    color: var(--text-primary);
    position: relative;
    padding: 0 3px;
    
    // 使用半透明背景高亮，确保所有主题下都有良好对比度
    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 40%;
      background: var(--primary-color);
      opacity: 0.25;
      z-index: -1;
      border-radius: 2px;
    }
  }
  
  :deep(em) {
    font-style: italic;
    color: var(--text-secondary);
  }
  
  :deep(strong em),
  :deep(em strong) {
    font-weight: 700;
    font-style: italic;
    color: var(--text-primary);
    
    &::after {
      opacity: 0.3;
    }
  }
  
  // 删除线（GFM扩展）
  :deep(del) {
    text-decoration: line-through;
    color: var(--text-muted);
    opacity: 0.7;
  }
  
  // 任务列表（GFM扩展）
  :deep(li.task-item) {
    list-style: none;
    margin-left: -1.5em;
    
    input[type="checkbox"] {
      margin-right: 0.5em;
      cursor: not-allowed;
    }
  }
  
  // 图片样式
  :deep(img) {
    max-width: 100%;
    height: auto;
    margin: 0.3em 0.2em;
    vertical-align: middle;
    
    // shields.io徽章样式
    &[src*="shields.io"],
    &[src*="badge"],
    &[src*="img.shields"] {
      display: inline-block;
      margin: 0.2em 0.3em;
      border: none;
      box-shadow: none;
      border-radius: 3px;
      transition: all 0.2s ease;
      
      &:hover {
        transform: translateY(-1px);
        opacity: 0.85;
      }
    }
    
    // 普通图片样式
    &:not([src*="shields.io"]):not([src*="badge"]) {
      display: block;
      border-radius: var(--border-radius);
      margin: 1.2em auto;
      box-shadow: var(--shadow-md);
      border: 2px solid var(--border-color);
      
      &:hover {
        transform: scale(1.02);
        box-shadow: var(--shadow-lg);
      }
    }
  }
  
  // 徽章行样式
  :deep(p.badge-row) {
    text-align: center;
    margin: 1.5em 0;
    line-height: 2.5;
  }
  
  // 徽章链接样式
  :deep(a:has(img[src*="shields.io"])),
  :deep(a:has(img[src*="badge"])) {
    display: inline-block;
    border: none;
    padding: 0;
    margin: 0.2em 0.3em;
    
    &:hover {
      background: none;
      border: none;
    }
  }
  
  // 水平线
  :deep(hr) {
    border: none;
    height: 2px;
    background: linear-gradient(to right, transparent, var(--primary-color), transparent);
    margin: 1.5em 0;
    opacity: 0.6;
  }
  
  // 引用块
  :deep(blockquote) {
    border-left: 4px solid var(--primary-color);
    background: var(--bg-input);
    padding: 0.8em 1em;
    margin: 1em 0;
    color: var(--text-secondary);
    font-style: italic;
    border-radius: 0 var(--border-radius) var(--border-radius) 0;
    box-shadow: var(--shadow-sm);
    position: relative;
    
    &::before {
      content: '"';
      position: absolute;
      top: -0.2em;
      left: 0.3em;
      font-size: 2.5em;
      color: var(--primary-color);
      opacity: 0.2;
      font-family: Georgia, serif;
    }
    
    p {
      margin: 0.4em 0;
      
      &:first-child {
        margin-top: 0;
      }
      
      &:last-child {
        margin-bottom: 0;
      }
    }
  }
  
  // 表格样式
  :deep(table) {
    width: 100%;
    border-collapse: collapse;
    margin: 1em 0;
    box-shadow: var(--shadow-sm);
    border-radius: var(--border-radius);
    overflow: hidden;
    
    th, td {
      padding: 10px 14px;
      border: 1px solid var(--border-color);
      text-align: left;
      line-height: 1.5;
    }
    
    th {
      background: var(--primary-color);
      color: var(--text-white);
      font-weight: 600;
    }
    
    tr:nth-child(even) {
      background: var(--bg-input);
    }
    
    tr:hover {
      background: var(--bg-hover);
    }
  }
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
  border-radius: 50%;  // 始终保持圆形
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
@media (max-width: 1200px) {
  .doc-toc {
    width: 240px;
  }
}

@media (max-width: 992px) {
  .doc-layout {
    flex-direction: column;
  }
  
  .doc-toc {
    position: static;
    width: 100%;
    max-height: 400px;
    order: -1;
    margin-bottom: 20px;
  }
}

@media (max-width: 768px) {
  .doc-header-content {
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
  
  .doc-page-title {
    font-size: 1.3rem;
  }
  
  .doc-container {
    padding: 30px 20px;
  }
  
  .doc-layout {
    gap: 20px;
  }
  
  .doc-toc {
    max-height: 300px;
    padding: 15px;
    
    .toc-header h3 {
      font-size: 1rem;
    }
  }
  
  .back-to-top {
    bottom: 30px;
    right: 20px;
    width: 50px;
    height: 50px;
    font-size: 1.4rem;
  }
}

// 美化滚动条
.doc-main::-webkit-scrollbar {
  width: 10px;
}

.doc-main::-webkit-scrollbar-track {
  background: var(--bg-input);
}

.doc-main::-webkit-scrollbar-thumb {
  background: var(--border-color);
  border-radius: 5px;
}

.doc-main::-webkit-scrollbar-thumb:hover {
  background: var(--text-muted);
}
</style>

