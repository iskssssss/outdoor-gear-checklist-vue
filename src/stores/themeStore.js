/**
 * 主题管理Store
 * 使用 CSS class 切换管理应用的视觉风格
 */
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useThemeStore = defineStore('theme', () => {
  // 可用的主题列表
  const themes = ref([
    {
      id: 'default',
      name: '默认风格',
      icon: '🎨',
      description: '简洁现代的默认样式'
    },
    {
      id: 'paper',
      name: '手绘风格',
      icon: '✏️',
      description: '手绘纸张风格，模拟手写效果'
    },
    {
      id: 'dark',
      name: '暗黑模式',
      icon: '🌙',
      description: '深色高对比度，保护眼睛'
    },
    {
      id: 'soft',
      name: '柔和风格',
      icon: '🌸',
      description: '马卡龙配色，温柔可爱'
    },
    {
      id: 'pixel',
      name: '像素风格',
      icon: '👾',
      description: '8位像素艺术风格，复古游戏体验'
    },
    {
      id: 'minimal',
      name: '极简风格',
      icon: '⬜',
      description: '黑白灰极简设计，纯净简约'
    }
  ])

  // 当前激活的主题 (默认为手绘风格)
  const currentTheme = ref('paper')

  /**
   * 从 localStorage 加载主题设置
   */
  function loadTheme() {
    const saved = localStorage.getItem('appTheme')
    if (saved && themes.value.some(t => t.id === saved)) {
      currentTheme.value = saved
    }
    console.log('🎨 已加载主题设置:', currentTheme.value)

    // 应用主题
    applyTheme(currentTheme.value)
  }

  /**
   * 切换到指定主题
   * @param {string} themeId - 主题ID
   */
  function switchTheme(themeId, event) {
    const theme = themes.value.find(t => t.id === themeId)
    if (!theme) {
      console.error('❌ 未找到主题:', themeId)
      return
    }

    // 判断浏览器是否支持 View Transitions API
    if (!document.startViewTransition) {
      // 不支持 View Transitions API，直接切换主题
      currentTheme.value = themeId
      applyTheme(themeId)
      // 保存到 localStorage
      localStorage.setItem('appTheme', themeId)
      console.log('✅ 已切换主题:', theme.name)
      return
    }

    // 获取点击位置
    const x = event?.clientX ?? window.innerWidth
    const y = event?.clientY ?? window.innerHeight

    // 计算到最远角的距离
    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    )

    // 使用 View Transitions API 实现平滑过渡
    const transition = document.startViewTransition(() => {
      currentTheme.value = themeId
      applyTheme(themeId)
    })

    // 监听伪元素创建
    transition.ready.then(() => {
      // 新视图的动画
      document.documentElement.animate(
        {
          clipPath: [
            `circle(0 at ${x}px ${y}px)`,
            `circle(${endRadius}px at ${x}px ${y}px)`
          ]
        },
        {
          duration: 500,
          easing: 'ease-in-out',
          pseudoElement: '::view-transition-new(root)'
        }
      )
    })

    // 保存到 localStorage
    localStorage.setItem('appTheme', themeId)
    console.log('✅ 已切换主题:', theme.name)
  }

  /**
   * 应用主题样式 - 通过切换 body 的 class
   * @param {string} themeId - 主题ID
   */
  function applyTheme(themeId) {
    // 获取 <html> 元素
    const html = document.documentElement;
    const body = document.body;

    // 移除所有主题 class
    themes.value.forEach(theme => {
      html.classList.remove(`theme-${theme.id}`);
      body.classList.remove(`theme-${theme.id}`);
    })

    // 添加新主题 class
    html.classList.add(`theme-${themeId}`);
    body.classList.add(`theme-${themeId}`);

    console.log(`🎨 已应用主题 class: theme-${themeId} 到 <html> 和 <body>`);
  }

  /**
   * 获取当前主题信息
   */
  const getCurrentThemeInfo = () => {
    return themes.value.find(t => t.id === currentTheme.value) || themes.value[0]
  }

  return {
    // State
    themes,
    currentTheme,

    // Getters
    getCurrentThemeInfo,

    // Actions
    loadTheme,
    switchTheme,
    applyTheme
  }
})

