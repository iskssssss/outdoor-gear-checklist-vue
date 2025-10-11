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
  function switchTheme(themeId) {
    const theme = themes.value.find(t => t.id === themeId)
    if (!theme) {
      console.error('❌ 未找到主题:', themeId)
      return
    }

    currentTheme.value = themeId
    applyTheme(themeId)
    
    // 保存到 localStorage
    localStorage.setItem('appTheme', themeId)
    console.log('✅ 已切换主题:', theme.name)
  }

  /**
   * 应用主题样式 - 通过切换 body 的 class
   * @param {string} themeId - 主题ID
   */
  function applyTheme(themeId) {
    const body = document.body
    
    // 移除所有主题 class
    themes.value.forEach(theme => {
      body.classList.remove(`theme-${theme.id}`)
    })
    
    // 添加新主题 class
    body.classList.add(`theme-${themeId}`)
    
    console.log(`🎨 已应用主题 class: theme-${themeId}`)
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

