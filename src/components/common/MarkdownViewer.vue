<template>
  <div class="markdown-viewer">
    <!-- 加载状态 -->
    <div v-if="loading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>正在加载内容...</p>
    </div>

    <!-- 错误提示 -->
    <div v-else-if="error" class="error-state">
      <p>⚠️ 加载失败</p>
      <p class="error-message">{{ error }}</p>
      <p v-if="hasCachedContent" class="fallback-hint">使用本地缓存数据</p>
    </div>

    <!-- 内容区域 -->
    <div v-else class="markdown-layout">
      <!-- 左侧：文档内容 -->
      <div class="markdown-content-wrapper" ref="contentRef">
        <div class="markdown-content" @click="handleLinkClick">
          <div class="markdown-body" v-html="renderedContent"></div>
        </div>
      </div>

      <!-- 右侧：目录导航 -->
      <aside v-if="showToc && tableOfContents.length > 0" class="markdown-toc">
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
</template>

<script setup>
import { ref, computed, watch, nextTick, onUnmounted } from 'vue'

const props = defineProps({
  content: {
    type: String,
    default: ''
  },
  loading: {
    type: Boolean,
    default: false
  },
  error: {
    type: String,
    default: null
  },
  showToc: {
    type: Boolean,
    default: true
  },
  hasCachedContent: {
    type: Boolean,
    default: false
  },
  // 外部滚动容器（可选，如果不提供则使用内部滚动）
  scrollContainer: {
    type: Object,
    default: null
  }
})

const contentRef = ref(null)
const tableOfContents = ref([])
const activeHeadingId = ref('')

// 滚动锁机制：防止程序性滚动触发回调
let isProgrammaticScroll = false
let scrollUnlockTimer = null
let ticking = false

/**
 * 简单的字符串哈希函数
 */
function hashCode(str) {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return Math.abs(hash).toString(36).substring(0, 6)
}

/**
 * 提取目录结构并生成稳定的ID
 */
function extractTableOfContents() {
  if (!props.content) {
    tableOfContents.value = []
    return
  }
  
  // 规范化换行符，移除所有 \r
  const normalizedContent = props.content.replace(/\r\n/g, '\n').replace(/\r/g, '\n')
  const lines = normalizedContent.split('\n')
  const toc = []
  let idCounter = 0
  
  lines.forEach(line => {
    const trimmedLine = line.trim()
    const match = trimmedLine.match(/^(#{1,6})\s+(.+)$/)
    if (match) {
      const level = match[1].length
      const text = match[2].trim()
      const id = `heading-${hashCode(text)}-${idCounter++}`
      
      toc.push({ id, level, text, originalText: text })
    }
  })
  
  tableOfContents.value = toc
}

/**
 * 为所有标题元素设置ID
 */
function setupHeadingIds() {
  if (!contentRef.value) return
  
  const headings = contentRef.value.querySelectorAll('h1, h2, h3, h4, h5, h6')
  
  headings.forEach((heading, index) => {
    const text = heading.textContent.trim()
    const level = parseInt(heading.tagName.substring(1))
    
    const tocItem = tableOfContents.value.find(item => 
      item.text === text && item.level === level
    )
    
    if (tocItem) {
      heading.id = tocItem.id
    } else {
      heading.id = `heading-${hashCode(text)}-${index}`
    }
  })
}

/**
 * 获取滚动容器
 */
function getScrollContainer() {
  return props.scrollContainer || contentRef.value
}

/**
 * 点击目录滚动
 */
function scrollToHeading(headingId) {
  const wrapper = getScrollContainer()
  if (!wrapper) return
  
  const target = wrapper.querySelector ? wrapper.querySelector(`#${CSS.escape(headingId)}`) : document.querySelector(`#${CSS.escape(headingId)}`)
  
  if (!target) {
    console.warn('scrollToHeading: 未找到目标标题', headingId)
    return
  }

  isProgrammaticScroll = true
  if (scrollUnlockTimer) {
    clearTimeout(scrollUnlockTimer)
    scrollUnlockTimer = null
  }

  const wrapperRect = wrapper.getBoundingClientRect()
  const targetRect = target.getBoundingClientRect()
  const targetOffset = targetRect.top - wrapperRect.top + wrapper.scrollTop

  wrapper.scrollTo({
    top: Math.max(0, targetOffset - 80),
    behavior: 'smooth'
  })

  activeHeadingId.value = headingId
  highlightHeading(target)

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
 * 基于 scrollTop 计算当前高亮标题
 */
function handleScrollThrottled() {
  if (isProgrammaticScroll) return
  
  const wrapper = getScrollContainer()
  if (!wrapper) return

  const scrollTop = wrapper.scrollTop
  const headings = wrapper.querySelectorAll ? [...wrapper.querySelectorAll('h1, h2, h3, h4, h5, h6')] : [...document.querySelectorAll('.markdown-body h1, .markdown-body h2, .markdown-body h3, .markdown-body h4, .markdown-body h5, .markdown-body h6')]

  if (headings.length === 0) return

  let currentId = headings[0]?.id

  for (let i = 0; i < headings.length; i++) {
    const h = headings[i]
    if (h.offsetTop - 80 <= scrollTop) {
      currentId = h.id
    } else {
      break
    }
  }

  if (currentId && currentId !== activeHeadingId.value) {
    activeHeadingId.value = currentId
  }
}

/**
 * 处理滚动事件
 */
function handleScroll() {
  if (!ticking) {
    window.requestAnimationFrame(() => {
      handleScrollThrottled()
      ticking = false
    })
    ticking = true
  }
}

/**
 * 处理链接点击事件
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
 * 渲染 Markdown 内容
 */
const renderedContent = computed(() => {
  if (!props.content) return ''

  let html = props.content.replace(/\r\n/g, '\n')

  // 提取代码块
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

  // 转义 HTML
  html = html.replace(/&(?!amp;)/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

  // 图片和链接
  html = html.replace(/!\[([^\]]*)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)/g, '<img src="$2" alt="$1" title="$3" />')
  html = html.replace(/\[([^\]]+)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)/g, '<a href="$2" title="$3" target="_blank" rel="noopener noreferrer">$1</a>')

  // 标题
  for (let i = 6; i >= 1; i--) {
    const regex = new RegExp(`^#{${i}}\\s+(.+)$`, 'gim')
    html = html.replace(regex, `<h${i}>$1</h${i}>`)
  }

  // 水平线
  html = html.replace(/^(?:---|\*\*\*|___)$/gim, '<hr>')

  // 引用块
  html = html.replace(/(^&gt;[\s\S]+?(?=\n{2,}|$))/gm, (match) => {
    const lines = match.split('\n').map(line => line.replace(/^&gt;\s?/, '')).join('<br>')
    return `<blockquote>${lines}</blockquote>`
  })

  // 表格
  const tableRegex = /((?:^\|.*\|\s*$\n?)+)/gm
  html = html.replace(tableRegex, (match) => {
    const rows = match.trim().split('\n').map(row => row.trim().replace(/^\||\|$/g, '').split('|').map(cell => cell.trim()))
    if (rows.length < 2) return match
    const headerCells = rows[0].map(cell => `<th>${cell}</th>`).join('')
    const bodyRows = rows.slice(2).map(r => `<tr>${r.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')
    return `<table><thead><tr>${headerCells}</tr></thead><tbody>${bodyRows}</tbody></table>`
  })

  // 列表处理
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

  // 加粗、斜体、删除线
  html = html.replace(/\*\*\*([^\*\n]+?)\*\*\*/g, '<strong><em>$1</em></strong>')
  html = html.replace(/\*\*([^\*\n]+?)\*\*/g, '<strong>$1</strong>')
  html = html.replace(/\*([^\*\n]+?)\*/g, '<em>$1</em>')
  html = html.replace(/~~([^~\n]+?)~~/g, '<del>$1</del>')

  // 段落处理
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

  // 段落内换行
  html = html.replace(/<p(?:\s+class="[^"]*")?>([\s\S]*?)<\/p>/g, (m, c) => {
    const cls = m.match(/class="([^"]*)"/)?.[1] || ''
    const classAttr = cls ? ` class="${cls}"` : ''
    return `<p${classAttr}>${c.replace(/\n/g, '<br>')}</p>`
  })
  html = html.replace(/<li>([\s\S]*?)<\/li>/g, (m, c) => `<li>${c.replace(/\n/g, '<br>')}</li>`)

  // 恢复代码块和行内代码
  codeBlocks.forEach((code, idx) => {
    html = html.replace(new RegExp(`CODEBLOCK${idx}PLACEHOLDER`, 'g'), code)
  })
  inlineCodes.forEach((code, idx) => {
    html = html.replace(new RegExp(`INLINECODE${idx}PLACEHOLDER`, 'g'), code)
  })

  return html
})

// 监听内容变化
watch(() => props.content, () => {
  extractTableOfContents()
  nextTick(() => {
    setupHeadingIds()
    handleScrollThrottled()
  })
}, { immediate: true })

// 组件卸载时清理
onUnmounted(() => {
  if (scrollUnlockTimer) {
    clearTimeout(scrollUnlockTimer)
    scrollUnlockTimer = null
  }
  isProgrammaticScroll = false
  ticking = false
})

// 暴露方法给父组件
defineExpose({
  handleScroll
})
</script>

<style scoped lang="scss">
.markdown-viewer {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.markdown-layout {
  display: flex;
  gap: 30px;
  flex: 1;
  min-height: 0;
}

.markdown-content-wrapper {
  flex: 1;
  min-width: 0;
}

.markdown-content {
  padding: 0 20px 40px 0;
}

// 目录导航
.markdown-toc {
  width: 260px;
  flex-shrink: 0;
  position: sticky;
  top: 20px;
  align-self: flex-start;
  max-height: calc(100vh - 180px);
  overflow-y: auto;
  background: var(--bg-card);
  border: 2px solid var(--border-color);
  border-radius: var(--border-radius);
  padding: 16px;
  box-shadow: var(--shadow-sm);
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: var(--bg-input, #f5f5f5);
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: var(--border-color, #ddd);
    border-radius: 3px;
    
    &:hover {
      background: var(--text-muted, #999);
    }
  }
}

.toc-header {
  margin-bottom: 12px;
  padding-bottom: 10px;
  border-bottom: 2px solid var(--border-color);
  
  h3 {
    margin: 0;
    font-size: 1rem;
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
    margin: 3px 0;
    
    a {
      display: block;
      padding: 5px 8px;
      color: var(--text-secondary);
      text-decoration: none;
      border-radius: 4px;
      font-size: 0.85rem;
      line-height: 1.4;
      transition: all 0.2s ease;
      border-left: 2px solid transparent;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      
      &:hover {
        background: var(--bg-input);
        color: var(--text-primary);
        border-left-color: var(--primary-color);
        transform: translateX(2px);
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
  
  .toc-level-1 a {
    font-size: 0.9rem;
    font-weight: 600;
    padding-left: 8px;
  }
  
  .toc-level-2 a {
    padding-left: 16px;
    font-size: 0.85rem;
  }
  
  .toc-level-3 a {
    padding-left: 24px;
    font-size: 0.82rem;
  }
  
  .toc-level-4 a {
    padding-left: 32px;
    font-size: 0.8rem;
    color: var(--text-muted);
  }
  
  .toc-level-5 a,
  .toc-level-6 a {
    padding-left: 40px;
    font-size: 0.78rem;
    color: var(--text-muted);
  }
}

// 加载状态
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  color: var(--text-secondary);
  
  p {
    margin-top: 20px;
    font-size: 1rem;
  }
}

.loading-spinner {
  width: 50px;
  height: 50px;
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

// 错误状态
.error-state {
  text-align: center;
  padding: 60px 20px;
  color: var(--text-secondary);
  
  p {
    margin: 12px 0;
  }
  
  .error-message {
    color: var(--danger-color);
    font-size: 0.95rem;
    font-family: 'Courier New', monospace;
    background: var(--bg-hover);
    padding: 10px 16px;
    border-radius: 6px;
    display: inline-block;
  }
  
  .fallback-hint {
    color: var(--primary-color);
    font-size: 0.9rem;
    margin-top: 20px;
  }
}

// Markdown 样式
.markdown-body {
  color: var(--text-primary);
  line-height: 1.6;
  font-size: 1rem;
  word-wrap: break-word;
  
  :deep(h1), :deep(h2), :deep(h3), :deep(h4), :deep(h5), :deep(h6) {
    margin: 1.5em 0 0.6em;
    font-weight: 600;
    line-height: 1.3;
    color: var(--text-primary);
    
    &:first-child {
      margin-top: 0;
    }
  }
  
  :deep(h1) {
    font-size: 1.8em;
    padding-bottom: 0.3em;
    border-bottom: 2px solid var(--border-color);
  }
  
  :deep(h2) {
    font-size: 1.5em;
    padding-bottom: 0.3em;
    border-bottom: 1px solid var(--border-color);
  }
  
  :deep(h3) {
    font-size: 1.25em;
  }
  
  :deep(h4) {
    font-size: 1.1em;
  }
  
  :deep(p) {
    margin: 0.8em 0;
    line-height: 1.7;
    color: var(--text-primary);
  }
  
  :deep(a) {
    color: var(--primary-color);
    text-decoration: none;
    border-bottom: 1px dashed var(--primary-color);
    transition: all 0.2s ease;
    
    &:hover {
      background: var(--primary-color);
      color: white;
      border-bottom-style: solid;
    }
  }
  
  :deep(code) {
    background: var(--bg-input);
    padding: 2px 6px;
    border-radius: 3px;
    font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
    font-size: 0.9em;
    color: var(--danger-color, #dc3545);
    border: 1px solid var(--border-color);
  }
  
  :deep(pre) {
    background: var(--bg-input);
    padding: 12px;
    border-radius: 6px;
    overflow-x: auto;
    margin: 1em 0;
    border: 1px solid var(--border-color);
    
    code {
      background: none;
      padding: 0;
      color: var(--text-primary);
      font-size: 0.9em;
      border: none;
    }
  }
  
  :deep(ul), :deep(ol) {
    margin: 0.8em 0;
    padding-left: 2em;
    
    li {
      margin: 0.3em 0;
      line-height: 1.6;
      color: var(--text-primary);
    }
  }
  
  :deep(strong) {
    font-weight: 700;
    color: var(--text-primary);
  }
  
  :deep(em) {
    font-style: italic;
    color: var(--text-secondary);
  }
  
  :deep(del) {
    text-decoration: line-through;
    color: var(--text-muted);
    opacity: 0.7;
  }
  
  :deep(li.task-item) {
    list-style: none;
    margin-left: -1.5em;
    
    input[type="checkbox"] {
      margin-right: 0.5em;
      cursor: not-allowed;
    }
  }
  
  :deep(hr) {
    border: none;
    height: 1px;
    background: var(--border-color);
    margin: 1.5em 0;
  }
  
  :deep(blockquote) {
    border-left: 4px solid var(--primary-color);
    background: var(--bg-input);
    padding: 0.8em 1em;
    margin: 1em 0;
    color: var(--text-secondary);
    font-style: italic;
    border-radius: 0 4px 4px 0;
    
    p {
      margin: 0.4em 0;
    }
  }
  
  :deep(table) {
    width: 100%;
    border-collapse: collapse;
    margin: 1em 0;
    box-shadow: var(--shadow-sm);
    border-radius: 6px;
    overflow: hidden;
    
    th, td {
      padding: 8px 12px;
      border: 1px solid var(--border-color);
      text-align: left;
    }
    
    th {
      background: var(--primary-color);
      color: white;
      font-weight: 600;
    }
    
    tr:nth-child(even) {
      background: var(--bg-input);
    }
    
    tr:hover {
      background: var(--bg-hover);
    }
  }
  
  :deep(img) {
    max-width: 100%;
    height: auto;
    border-radius: 4px;
  }
}

// 响应式
@media (max-width: 992px) {
  .markdown-layout {
    flex-direction: column;
  }
  
  .markdown-toc {
    position: static;
    width: 100%;
    max-height: 300px;
    order: -1;
    margin-bottom: 20px;
  }
}
</style>

