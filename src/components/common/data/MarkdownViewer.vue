<template>
  <div class="markdown-viewer">
    <div class="markdown-layout">
      <!-- 左侧：文档内容 -->
      <div class="markdown-content-wrapper" ref="contentRef">
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

        <!-- 内容 -->
        <div v-else class="markdown-content" @click="handleLinkClick">
          <div class="markdown-body" v-html="renderedContent"></div>
        </div>
      </div>

      <!-- 右侧：目录导航 -->
      <aside v-if="showToc && tableOfContents.length > 0" class="markdown-toc">
        <div class="toc-header">
          <h3>📑 目录</h3>
          <button v-if="showRefreshButton" class="refresh-btn" @click="$emit('refresh')"
            :disabled="loading || cooldownTime > 0"
            :title="loading ? '加载中...' : cooldownTime > 0 ? `请等待 ${cooldownTime} 秒后再刷新` : '刷新内容'">
            <span :class="{ 'spinning': loading }">
              {{ cooldownTime > 0 ? cooldownTime : '🔄' }}
            </span>
          </button>
        </div>
        <nav class="toc-nav">
          <ul class="toc-list">
            <li v-for="(item, index) in tableOfContents" :key="index"
              :class="['toc-item', `toc-level-${item.level}`, { active: activeHeadingId === item.id }]">
              <a :href="`#${item.id}`" @click.prevent="scrollToHeading(item.id)" :title="item.text">
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
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
// 1. 导入 eventBus
import { eventBus } from '@/utils/eventBus.js';

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
  showRefreshButton: {
    type: Boolean,
    default: true
  },
  cooldownTime: {
    type: Number,
    default: 0
  },
  // 外部滚动容器（可选，如果不提供则使用内部滚动）
  scrollContainer: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['refresh']);

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
  return props.scrollContainer || window
}

/**
 * 点击目录滚动
 */
function scrollToHeading(headingId) {
  // ID 在文档中是唯一的，所以直接从 document 查找
  const target = document.getElementById(headingId);
  if (!target) {
    console.warn('scrollToHeading: 未找到目标标题', headingId);
    return;
  }

  isProgrammaticScroll = true;
  if (scrollUnlockTimer) {
    clearTimeout(scrollUnlockTimer);
  }

  const container = getScrollContainer();
  let top = 0;

  if (container === window) {
    // 对于 window 滚动，需要结合 getBoundingClientRect 和 window.scrollY 来计算绝对位置
    top = target.getBoundingClientRect().top + window.scrollY - 80;
  } else {
    // 对于元素内滚动，计算相对于该元素的偏移
    const containerRect = container.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    top = targetRect.top - containerRect.top + container.scrollTop - 80;
  }

  container.scrollTo({
    top: Math.max(0, top),
    behavior: 'smooth',
  });

  activeHeadingId.value = headingId;
  highlightHeading(target);

  scrollUnlockTimer = setTimeout(() => {
    isProgrammaticScroll = false;
  }, 600);
}

/**
 * 高亮显示标题
 */
function highlightHeading(heading) {
  heading.style.transition = 'all 0.3s ease'
  heading.style.backgroundColor = 'var(--primary-color)'
  heading.style.color = 'var(--btn-primary-text, white)'
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
  if (isProgrammaticScroll || !contentRef.value) return;

  const headings = [...contentRef.value.querySelectorAll('h1, h2, h3, h4, h5, h6')];
  if (headings.length === 0) return;

  let currentActiveId = '';
  const topOffset = 81; // 顶部偏移量

  // 查找最后一个顶部在视口参考线之上的标题
  // getBoundingClientRect().top 是元素顶部相对于视口顶部的距离
  for (const heading of headings) {
    if (heading.getBoundingClientRect().top <= topOffset) {
      currentActiveId = heading.id;
    } else {
      // 一旦有标题在参考线之下，后面的肯定都在下面，直接中断循环
      break;
    }
  }

  if (activeHeadingId.value !== currentActiveId) {
    activeHeadingId.value = currentActiveId;
  }
}

/**
 * 处理滚动事件
 */
function handleScroll() {
  if (!ticking) {
    window.requestAnimationFrame(() => {
      handleScrollThrottled();
      ticking = false;
    });
    ticking = true;
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

  // 移除可能存在的 ## 目录 标题
  html = html.replace(/^##\s+目录\s*$/gim, '');

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
    // 立即执行一次以设置初始状态
    handleScrollThrottled()
  })
}, { immediate: true })

// 2. 在组件挂载时订阅事件
onMounted(() => {
  eventBus.on('scroll', handleScroll);
});

// 组件卸载时清理
onUnmounted(() => {
  eventBus.off('scroll', handleScroll); // 3. 取消订阅

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
  gap: var(--spacing-xl);  /* 内容与目录之间的较大间隙 */
  flex: 1;
  min-height: 0;
}

.markdown-content-wrapper {
  flex: 1;
  min-width: 0;
}

.markdown-content {
  padding: 0 var(--spacing-lg) var(--spacing-3xl) 0;  /* 右侧和底部充足留白 */
}

// 目录导航
.markdown-toc {
  width: 260px;  /* 目录固定宽度，保证可读性 */
  flex-shrink: 0;
  position: sticky;
  top: 88px;  /* 固定偏移量避开Header，不使用token */
  align-self: flex-start;
  max-height: calc(100vh - 180px);  /* 动态计算高度 */
  overflow-y: auto;
  background: var(--bg-card);
  border: var(--border-width) solid var(--border-color);
  border-radius: var(--radius-md);
  padding: var(--spacing-md);  /* 目录内边距 */
  box-shadow: var(--shadow-sm);
}

.toc-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);  /* 标题与列表的间距 */
  padding-bottom: var(--spacing-sm);  /* 标题底部内边距 */
  border-bottom: var(--border-width) solid var(--border-color);

  h3 {
    margin: 0;
    font-size: 1rem;
    font-weight: var(--font-weight-bold);
    color: var(--text-primary);
  }
}

.refresh-btn {
  padding: var(--spacing-xs) var(--spacing-sm);  /* 小按钮紧凑内边距 */
  background: transparent;
  color: var(--text-secondary);
  border: var(--border-width) solid var(--border-color);
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.3s ease;

  &:hover:not(:disabled) {
    background: var(--bg-hover);
    color: var(--primary-color);
    border-color: var(--primary-color);
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

@keyframes spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

.toc-nav {
  .toc-list {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .toc-item {
    margin: var(--spacing-xs) 0;  /* 目录项间小间距 */

    a {
      display: block;
      padding: var(--spacing-xs) var(--spacing-sm);  /* 目录链接内边距 */
      color: var(--text-secondary);
      text-decoration: none;
      border-radius: var(--radius-sm);
      font-size: 0.85rem;
      line-height: 1.4;
      transition: all 0.2s ease;
      border-left: 2px solid transparent;  /* 强调边框固定宽度 */
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;

      &:hover {
        background: var(--bg-input);
        color: var(--text-primary);
        border-left-color: var(--primary-color);
        transform: translateX(2px);  /* 悬浮动画距离固定 */
      }
    }

    &.active a {
      background: var(--primary-color);
      color: var(--btn-primary-text);
      font-weight: var(--font-weight-bold);
      border-left-color: var(--primary-color);
      transform: translateX(0);
    }
  }

  /* 目录层级缩进 - 使用spacing创建层次感 */
  .toc-level-1 a {
    font-size: 0.9rem;
    font-weight: var(--font-weight-bold);
    padding-left: var(--spacing-sm);  /* 一级标题：8px */
  }

  .toc-level-2 a {
    padding-left: var(--spacing-md);  /* 二级标题：16px */
    font-size: 0.85rem;
  }

  .toc-level-3 a {
    padding-left: var(--spacing-lg);  /* 三级标题：24px */
    font-size: 0.82rem;
  }

  .toc-level-4 a {
    padding-left: var(--spacing-xl);  /* 四级标题：32px */
    font-size: 0.8rem;
    color: var(--text-muted);
  }

  .toc-level-5 a,
  .toc-level-6 a {
    padding-left: calc(var(--spacing-xl) + var(--spacing-sm));  /* 五六级：40px */
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
  padding: var(--spacing-3xl) var(--spacing-lg);  /* 加载状态大内边距 */
  color: var(--text-secondary);
  min-height: 300px;  /* 保证最小高度固定 */

  p {
    margin-top: var(--spacing-lg);  /* 文本与图标间距 */
    font-size: 1rem;
  }
}

.loading-spinner {
  width: 50px;  /* 加载图标固定尺寸 */
  height: 50px;
  border: 4px solid var(--bg-hover);
  border-top-color: var(--primary-color);
  border-radius: var(--radius-full);
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
  padding: var(--spacing-3xl) var(--spacing-lg);  /* 错误状态大内边距 */
  color: var(--text-secondary);

  p {
    margin: var(--spacing-md) 0;  /* 段落间标准间距 */
  }

  .error-message {
    color: var(--danger-color);
    font-size: 0.95rem;
    font-family: 'Courier New', monospace;
    background: var(--bg-hover);
    padding: var(--spacing-sm) var(--spacing-md);  /* 错误消息内边距 */
    border-radius: var(--radius-sm);
    display: inline-block;
  }

  .fallback-hint {
    color: var(--primary-color);
    font-size: 0.9rem;
    margin-top: var(--spacing-lg);  /* 提示文本顶部间距 */
  }
}

// Markdown 样式
.markdown-body {
  color: var(--text-primary);
  line-height: 1.6;
  font-size: 1rem;
  word-wrap: break-word;

  :deep(h1),
  :deep(h2),
  :deep(h3),
  :deep(h4),
  :deep(h5),
  :deep(h6) {
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
    border-bottom: var(--border-width) solid var(--border-color);
  }

  :deep(h2) {
    font-size: 1.5em;
    padding-bottom: 0.3em;
    border-bottom: var(--border-width) solid var(--border-color);
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
    border-bottom: var(--border-width) dashed var(--primary-color);
    transition: all 0.2s ease;

    &:hover {
      background: var(--primary-color);
      color: var(--btn-primary-text);
      border-bottom-style: solid;
    }
  }

  :deep(code) {
    background: var(--bg-input);
    padding: 2px var(--spacing-xs);  /* 行内代码小内边距 */
    border-radius: var(--radius-sm);
    font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
    font-size: 0.9em;
    color: var(--danger-color);
    border: var(--border-width) solid var(--border-color);
  }

  :deep(pre) {
    background: var(--bg-input);
    padding: var(--spacing-md);  /* 代码块标准内边距 */
    border-radius: var(--radius-md);
    overflow-x: auto;
    margin: 1em 0;
    border: var(--border-width) solid var(--border-color);

    code {
      background: none;
      padding: 0;
      color: var(--text-primary);
      font-size: 0.9em;
      border: none;
    }
  }

  :deep(ul),
  :deep(ol) {
    margin: 0.8em 0;
    padding-left: 2em;

    li {
      margin: 0.3em 0;
      line-height: 1.6;
      color: var(--text-primary);
    }
  }

  :deep(strong) {
    font-weight: var(--font-weight-bold);
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
    height: 1px;  /* 分隔线固定高度 */
    background: var(--border-color);
    margin: 1.5em 0;
  }

  :deep(blockquote) {
    border-left: 4px solid var(--primary-color);  /* 引用块强调边框固定宽度 */
    background: var(--bg-input);
    padding: 0.8em 1em;
    margin: 1em 0;
    color: var(--text-secondary);
    font-style: italic;
    border-radius: 0 var(--radius-sm) var(--radius-sm) 0;

    p {
      margin: 0.4em 0;
    }
  }

  :deep(table) {
    width: 100%;
    border-collapse: collapse;
    margin: 1em 0;
    box-shadow: var(--shadow-sm);
    border-radius: var(--radius-md);
    overflow: hidden;

    th,
    td {
      padding: var(--spacing-sm) var(--spacing-md);  /* 表格单元格内边距 */
      border: var(--border-width) solid var(--border-color);
      text-align: left;
    }

    th {
      background: var(--primary-color);
      color: var(--btn-primary-text);
      font-weight: var(--font-weight-bold);
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
    border-radius: var(--radius-md);
    transition: all 0.3s ease;
  }

  :deep(img:not([src*="shields.io"]):not([src*="badge"])) {
    border-radius: var(--radius-md);
    transition: all 0.3s ease;
  }

  :deep(p.badge-row) {
    border-radius: var(--radius-sm);
  }
}

// 响应式 - 移动端目录移至顶部
@media (max-width: 992px) {
  .markdown-layout {
    flex-direction: column;
  }

  .markdown-toc {
    position: static;
    width: 100%;
    max-height: 300px;  /* 移动端目录最大高度固定 */
    order: -1;
    margin-bottom: var(--spacing-lg);  /* 目录与内容的间距 */
  }
}
</style>
