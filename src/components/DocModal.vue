<template>
  <BaseModal
    ref="modalRef"
    title-tag="h2"
    width="900px"
    max-height="85vh"
    @close="handleClose"
  >
    <template #header>
      <h2 class="doc-title">📚 使用指南</h2>
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
        <button class="close-btn" @click="close">✕</button>
      </div>
    </template>

    <template #default>
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
      <div v-else class="doc-content" ref="docContentRef" @click="handleLinkClick">
        <div class="markdown-body" v-html="renderedContent"></div>
        
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
  </BaseModal>
</template>

<script setup>
import { ref, computed, defineExpose, onMounted, onUnmounted, nextTick } from 'vue'
import BaseModal from './BaseModal.vue'

const modalRef = ref(null)
const loading = ref(false)
const error = ref(null)
const rawContent = ref('')
const docContentRef = ref(null)
const showBackToTop = ref(false)

// 刷新冷却时间相关
const cooldownTime = ref(0)
const COOLDOWN_DURATION = 30
let cooldownTimer = null

// GitHub仓库配置
// 将 https://github.com/owner/repo/blob/branch/file.md
// 转换为 https://raw.githubusercontent.com/owner/repo/branch/file.md
const GITHUB_REPO = 'iskssssss/outdoor-gear-checklist'
const GITHUB_BRANCH = 'main'
const GITHUB_DOC_PATH = 'USAGE.md'  // 使用详细的使用文档
const GITHUB_DOC_URL = `https://raw.githubusercontent.com/${GITHUB_REPO}/${GITHUB_BRANCH}/${GITHUB_DOC_PATH}`
const CACHE_KEY = 'outdoor-gear-doc-cache'
const CACHE_TIME_KEY = 'outdoor-gear-doc-cache-time'

/**
 * Markdown渲染器
 * 遵循 CommonMark 和 GitHub Flavored Markdown (GFM) 规范
 * 采用占位符+分块处理策略，支持嵌套列表和完整表格
 * 改进：支持列表项间空行、更健壮的嵌套解析
 */
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
    // 需要至少两行（表头+分隔）才被认定为表格
    if (rows.length < 2) return match
    // rows[1] 可能是分隔符，跳过它
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

    // helper to detect list item
    const itemMatch = (ln) => ln.match(/^(\s*)([-*+]|\d+\.)\s+(\[([ xX])\]\s*)?(.*)$/)

    while (i < len) {
      const m = itemMatch(lines[i])
      if (!m) {
        // skip non-matching (shouldn't happen if called correctly)
        i++
        continue
      }

      const [, spaces, bullet, , taskMark, rest] = m
      const indent = spaces.length

      // collect sub-lines that are part of this item (paragraph continuation / indented sublist)
      const contentLines = [rest]
      i++
      while (i < len) {
        // peek next
        const next = lines[i]
        const nextMatch = itemMatch(next)

        // 如果下行是更高缩进（表示嵌套子列表）或是被缩进的段落内容，归为当前 item 的子块
        if (next.trim() === '') {
          // 若是单空行：需要看后面第一个非空行是否还是列表项
          // 为了兼容"列表项之间有单空行但仍属同一列表"的情况，我们把单空行临时收集
          // 再在外层决定是否合并
          contentLines.push('') 
          i++
          continue
        }

        const nextIndent = (next.match(/^(\s*)/))[0].length

        if (nextMatch && nextIndent > indent) {
          // 嵌套子列表：收集从这里开始的连续高缩进行，递归解析
          const nestedLines = []
          const subIndent = nextIndent
          while (i < len && ((lines[i].match(/^(\s*)/))[0].length >= subIndent)) {
            // 剥离公共缩进
            nestedLines.push(lines[i].slice(subIndent))
            i++
          }
          const nestedHtml = parseList(nestedLines, 0)
          contentLines.push(nestedHtml)
          continue
        }

        // 如果下一行是普通连续内容（未匹配为列表项），并且缩进 > 当前项缩进，视为该项的段落延续
        if (!nextMatch && nextIndent > indent) {
          contentLines.push(next.trim())
          i++
          continue
        }

        // 否则，结束当前 item
        break
      }

      // 拼装 li content
      const rawContent = contentLines.filter(Boolean).join('\n')
      if (taskMark !== undefined) {
        items.push(`<li class="task-item"><input type="checkbox" ${/x/i.test(taskMark) ? 'checked' : ''} disabled> ${rawContent}</li>`)
      } else {
        items.push(`<li>${rawContent}</li>`)
      }
    }

    // 判断 ordered vs unordered by looking first non-empty original line
    const firstNonEmpty = lines.find(l => l.trim() !== '')
    const ordered = firstNonEmpty ? /^\s*\d+\./.test(firstNonEmpty) : false
    return ordered ? `<ol>${items.join('')}</ol>` : `<ul>${items.join('')}</ul>`
  }

  // 主体：扫描所有行，把"列表块"收集（允许单空行间隔仍属于同一列表）
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

    // 如果当前不是 list 行，但 buff 非空并且是单空行：查看后续最近的非空行是否仍为 list 项
    if (buff.length > 0 && line.trim() === '') {
      // lookahead to find next non-empty line
      let j = idx + 1
      while (j < rawLines.length && rawLines[j].trim() === '') j++
      const nextLine = rawLines[j] || ''
      if (/^\s*([-*+]|\d+\.)\s+/.test(nextLine)) {
        // treat this blank as part of list (allows single blank between list items)
        buff.push('') // keep blank to preserve intended spacing inside li
        idx++
        continue
      } else {
        // blank + next non-list => flush list
        processed.push(parseList(buff))
        buff = []
        // continue without consuming current line (so it will be processed below)
        continue
      }
    }

    // 遇到非列表行且当前没有缓冲：直接 push
    if (buff.length > 0) {
      // flush buffer
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

    // 徽章行检测（保持原样居中）
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
 * 使用 GitHub Raw Content URL 直接获取文件内容
 */
async function fetchDocFromGitHub(useCache = true) {
  // 检查缓存
  if (useCache) {
    const cachedContent = localStorage.getItem(CACHE_KEY)
    const cachedTime = localStorage.getItem(CACHE_TIME_KEY)
    
    if (cachedContent && cachedTime) {
      const cacheAge = Date.now() - parseInt(cachedTime)
      // 如果缓存未超过1小时，使用缓存
      if (cacheAge < 3600000) {
        rawContent.value = cachedContent
        console.log('📚 使用缓存的文档内容', {
          URL: GITHUB_DOC_URL,
          缓存时长: `${Math.round(cacheAge / 60000)}分钟`
        })
        return
      }
    }
  }
  
  loading.value = true
  error.value = null
  
  try {
    console.log('🌐 正在从GitHub获取文档...', {
      URL: GITHUB_DOC_URL,
      仓库: GITHUB_REPO,
      分支: GITHUB_BRANCH,
      文件: GITHUB_DOC_PATH
    })
    
    // 使用简单请求避免CORS preflight
    // 不添加自定义headers，raw.githubusercontent.com支持CORS
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
    
    // 缓存内容
    localStorage.setItem(CACHE_KEY, content)
    localStorage.setItem(CACHE_TIME_KEY, Date.now().toString())
    
    console.log('✅ 文档已从GitHub加载', {
      字符数: content.length,
      行数: content.split('\n').length
    })
    
    // 启动冷却计时
    startCooldown()
  } catch (err) {
    console.error('❌ 获取文档失败:', err)
    error.value = err.message
    
    // 尝试使用缓存
    const cachedContent = localStorage.getItem(CACHE_KEY)
    if (cachedContent) {
      rawContent.value = cachedContent
      console.log('📚 使用缓存的文档内容（降级）')
    } else {
      // 如果没有缓存，显示错误提示
      rawContent.value = `# 📚 使用文档\n\n无法加载文档内容。\n\n请检查网络连接或稍后重试。\n\n文档地址：[${GITHUB_DOC_URL}](${GITHUB_DOC_URL})`
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
 * 显示模态框
 */
function show() {
  modalRef.value?.show()
  // 首次打开时尝试加载
  if (!rawContent.value) {
    fetchDocFromGitHub(true)
  }
  
  // 绑定滚动事件到BaseModal的body元素
  nextTick(() => {
    const modalBody = document.querySelector('.base-modal-body')
    if (modalBody) {
      modalBody.addEventListener('scroll', handleScroll)
    }
  })
}

/**
 * 关闭模态框
 */
function close() {
  // 移除滚动事件监听
  const modalBody = document.querySelector('.base-modal-body')
  if (modalBody) {
    modalBody.removeEventListener('scroll', handleScroll)
  }
  
  modalRef.value?.close()
  showBackToTop.value = false
}

/**
 * 处理关闭事件
 */
function handleClose() {
  // 额外的关闭逻辑
}

/**
 * 处理链接点击事件（实现锚点平滑滚动）
 */
function handleLinkClick(event) {
  const target = event.target
  
  // 检查是否是锚点链接
  if (target.tagName === 'A' && target.getAttribute('href')?.startsWith('#')) {
    event.preventDefault() // 阻止默认跳转行为
    
    const targetId = target.getAttribute('href').substring(1)
    
    // 在文档内容中查找对应的标题
    const headings = docContentRef.value.querySelectorAll('h1, h2, h3, h4, h5, h6')
    
    for (const heading of headings) {
      const headingText = heading.textContent.trim()
      // 匹配标题文本（移除emoji和特殊字符进行模糊匹配）
      const cleanTargetId = targetId.toLowerCase().replace(/[^a-z0-9\u4e00-\u9fa5]/g, '')
      const cleanHeadingText = headingText.toLowerCase().replace(/[^a-z0-9\u4e00-\u9fa5]/g, '')
      
      if (cleanHeadingText.includes(cleanTargetId) || cleanTargetId.includes(cleanHeadingText)) {
        // 平滑滚动到目标位置
        heading.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        })
        
        // 添加高亮效果
        heading.style.transition = 'all 0.3s ease'
        heading.style.backgroundColor = 'var(--primary-color)'
        heading.style.color = 'white'
        heading.style.padding = '0.5em'
        heading.style.marginLeft = '-0.5em'
        heading.style.marginRight = '-0.5em'
        heading.style.borderRadius = '4px'
        
        // 2秒后移除高亮
        setTimeout(() => {
          heading.style.backgroundColor = ''
          heading.style.color = ''
          heading.style.padding = ''
          heading.style.marginLeft = ''
          heading.style.marginRight = ''
        }, 2000)
        
        break
      }
    }
  }
}

/**
 * 处理滚动事件（显示/隐藏回到顶部按钮）
 */
function handleScroll(event) {
  const scrollTop = event.target.scrollTop
  // 滚动超过300px时显示按钮
  showBackToTop.value = scrollTop > 300
}

/**
 * 回到顶部
 */
function scrollToTop() {
  const modalBody = document.querySelector('.base-modal-body')
  if (modalBody) {
    modalBody.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }
}

// 组件挂载时加载缓存
onMounted(() => {
  const cachedContent = localStorage.getItem(CACHE_KEY)
  if (cachedContent) {
    rawContent.value = cachedContent
  }
})

// 组件卸载时清理计时器和事件监听
onUnmounted(() => {
  if (cooldownTimer) {
    clearInterval(cooldownTimer)
  }
  
  // 清理滚动事件监听
  const modalBody = document.querySelector('.base-modal-body')
  if (modalBody) {
    modalBody.removeEventListener('scroll', handleScroll)
  }
})

defineExpose({ show, close })
</script>

<style scoped lang="scss">
.doc-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
  display: flex;
  align-items: center;
  gap: 10px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.refresh-btn {
  padding: 8px 12px;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.3s ease;
  min-width: 40px;
  
  &:hover:not(:disabled) {
    background: var(--primary-dark, #5568d3);
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

.close-btn {
  padding: 8px 12px;
  background: var(--text-secondary);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1.2rem;
  line-height: 1;
  transition: all 0.3s ease;
  
  &:hover {
    background: var(--danger-color);
    transform: translateY(-2px);
  }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

// 加载状态
.loading-state {
  text-align: center;
  padding: 60px 20px;
  color: var(--text-secondary);
}

.loading-spinner {
  width: 50px;
  height: 50px;
  margin: 0 auto 20px;
  border: 4px solid var(--border-color);
  border-top-color: var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

// 错误状态
.error-state {
  text-align: center;
  padding: 40px 20px;
  color: var(--text-secondary);
  
  p {
    margin: 10px 0;
  }
  
  .error-message {
    color: var(--danger-color);
    font-size: 0.9rem;
  }
  
  .fallback-hint {
    color: var(--text-muted);
    font-size: 0.85rem;
  }
}

// 文档内容
.doc-content {
  padding: 20px 0;
  position: relative;
}

.markdown-body {
  color: var(--text-primary);
  line-height: 1.6;
  font-size: 1rem;
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
      color: white;
      border-bottom-style: solid;
      border-radius: 2px;
    }
    
    // 内部锚点链接样式（目录跳转）
    &[href^="#"] {
      border-bottom-style: solid;
      
      &:hover {
        background: var(--primary-color);
        color: white;
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
    border-radius: 8px;
    overflow-x: auto;
    margin: 1em 0;
    border: 1px solid var(--border-color);
    box-shadow: 0 2px 6px rgba(0,0,0,0.08);
    
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
    
    // shields.io徽章样式（来自img.shields.io的图片）
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
      border-radius: 8px;
      margin: 1.2em auto;
      box-shadow: 0 4px 12px rgba(0,0,0,0.12);
      border: 2px solid var(--border-color);
      
      &:hover {
        transform: scale(1.02);
        box-shadow: 0 6px 20px rgba(0,0,0,0.18);
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
    border-radius: 0 6px 6px 0;
    box-shadow: 0 2px 6px rgba(0,0,0,0.06);
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
  
  // 表格样式（如果需要）
  :deep(table) {
    width: 100%;
    border-collapse: collapse;
    margin: 1em 0;
    box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    border-radius: 8px;
    overflow: hidden;
    
    th, td {
      padding: 10px 14px;
      border: 1px solid var(--border-color);
      text-align: left;
      line-height: 1.5;
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
      background: var(--bg-hover, rgba(102, 126, 234, 0.05));
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .doc-title {
    font-size: 1.2rem;
  }
  
  .markdown-body {
    font-size: 0.95rem;
    
    :deep(h1) {
      font-size: 1.6rem;
      
      &::before {
        font-size: 1.2rem;
      }
    }
    
    :deep(h2) {
      font-size: 1.35rem;
    }
    
    :deep(h3) {
      font-size: 1.15rem;
    }
    
    :deep(h4) {
      font-size: 1.05rem;
    }
    
    :deep(ul), :deep(ol) {
      padding-left: 1.5em;
    }
    
    :deep(pre) {
      padding: 12px;
      font-size: 0.85rem;
    }
    
    :deep(blockquote) {
      padding: 0.8em 1em;
      margin: 1em 0;
    }
  }
  
  // 移动端回到顶部按钮
  .back-to-top {
    bottom: 80px;
    right: 20px;
    width: 45px;
    height: 45px;
    font-size: 1.3rem;
  }
}

// 回到顶部按钮（使用fixed定位在视口右下角）
.back-to-top {
  position: fixed;
  bottom: 100px;  // 避免被页面底部遮挡
  right: 50px;
  width: 50px;
  height: 50px;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: 700;
  transition: all 0.3s ease;
  z-index: 1100;  // 确保在模态框之上（模态框z-index是1000）
  
  &:hover {
    background: var(--primary-dark, var(--primary-color));
    transform: translateY(-4px);
    box-shadow: 0 8px 20px rgba(0,0,0,0.3);
  }
  
  &:active {
    transform: translateY(-2px);
  }
  
  .arrow {
    line-height: 1;
  }
}

// 按钮淡入淡出动画
.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: scale(0.8) translateY(10px);
}

// 打印样式
@media print {
  .header-actions,
  .back-to-top {
    display: none;
  }
  
  .markdown-body {
    :deep(a) {
      color: #000;
      border-bottom-color: #000;
      
      &::after {
        content: " (" attr(href) ")";
        font-size: 0.8em;
        color: #666;
      }
    }
    
    :deep(pre) {
      border: 1px solid #ccc;
      page-break-inside: avoid;
    }
    
    :deep(h1), :deep(h2), :deep(h3) {
      page-break-after: avoid;
    }
  }
}
</style>

