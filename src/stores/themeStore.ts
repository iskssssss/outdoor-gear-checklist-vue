/**
 * 主题管理Store
 * 使用 CSS class 切换管理应用的视觉风格
 */
import { defineStore } from 'pinia';
import { ref, watch, computed } from 'vue';
import { useStorage, usePreferredDark } from '@vueuse/core';

interface Theme {
  id: string;
  name: string;
  icon: string;
  description: string;
  colors?: {
    primary: string;
    background: string;
    accent: string;
  };
}

export const useThemeStore = defineStore('theme', () => {
  const themes = ref<Theme[]>([
    {
      id: 'default',
      name: '默认风格',
      icon: '🎨',
      description: '简洁现代的默认样式',
      colors: { primary: '#4a90e2', background: '#f5f7fa', accent: '#5dade2' }
    },
    {
      id: 'paper',
      name: '手绘风格',
      icon: '✏️',
      description: '手绘纸张风格，模拟手写效果',
      colors: { primary: '#2c3e50', background: '#fef9f3', accent: '#7f8c8d' }
    },
    {
      id: 'dark',
      name: '暗黑模式',
      icon: '🌙',
      description: '深色高对比度，保护眼睛',
      colors: { primary: '#64b5f6', background: '#1a1a2e', accent: '#42a5f5' }
    },
    {
      id: 'soft',
      name: '柔和风格',
      icon: '🌸',
      description: '马卡龙配色，温柔可爱',
      colors: { primary: '#e91e63', background: '#fef5f8', accent: '#f48fb1' }
    },
    {
      id: 'pixel',
      name: '像素风格',
      icon: '👾',
      description: '8位像素艺术风格，复古游戏体验',
      colors: { primary: '#00ff00', background: '#000000', accent: '#ff00ff' }
    },
    {
      id: 'minimal',
      name: '极简风格',
      icon: '⬜',
      description: '黑白灰极简设计，纯净简约',
      colors: { primary: '#000000', background: '#ffffff', accent: '#757575' }
    },
    {
      id: 'mountain-sunrise',
      name: '高山晨光',
      icon: '🌄',
      description: '明亮清新',
      colors: { primary: '#ff9800', background: '#fff8e1', accent: '#ffb74d' }
    },
    {
      id: 'forest-trek',
      name: '森林探险',
      icon: '🌲',
      description: '沉稳自然',
      colors: { primary: '#4caf50', background: '#1b5e20', accent: '#81c784' }
    },
    {
      id: 'snowpeak-aurora',
      name: '雪峰极光',
      icon: '🏔️',
      description: '寒冷专业',
      colors: { primary: '#00bcd4', background: '#e0f7fa', accent: '#4dd0e1' }
    },
    {
      id: 'desert-sunset',
      name: '沙漠日落',
      icon: '🌅',
      description: '温暖热情',
      colors: { primary: '#ff5722', background: '#fff3e0', accent: '#ff8a65' }
    },
    {
      id: 'rainforest-expedition',
      name: '雨林探秘',
      icon: '🌿',
      description: '深邃神秘',
      colors: { primary: '#00796b', background: '#004d40', accent: '#4db6ac' }
    },
    {
      id: 'highland-mist',
      name: '高原晨雾',
      icon: '🌫️',
      description: '清雅朦胧',
      colors: { primary: '#9e9e9e', background: '#f5f5f5', accent: '#bdbdbd' }
    },
    {
      id: 'volcano-adventure',
      name: '火山熔岩',
      icon: '🌋',
      description: '炽热激情',
      colors: { primary: '#d32f2f', background: '#ffebee', accent: '#ef5350' }
    },
    {
      id: 'polar-aurora',
      name: '北极光雪原',
      icon: '❄️',
      description: '冰雪纯净',
      colors: { primary: '#03a9f4', background: '#e1f5fe', accent: '#4fc3f7' }
    }
  ]);

  const currentTheme = useStorage('appTheme', 'default');
  const isDark = usePreferredDark();
  
  watch(
    currentTheme,
    (newTheme, oldTheme) => {
      if (newTheme) {
        applyTheme(newTheme, oldTheme);
      }
    },
    { immediate: true }
  );
  
  function switchTheme(themeId: string, event?: MouseEvent): void {
    const theme = themes.value.find((t) => t.id === themeId);
    if (!theme) {
      console.error('❌ 未找到主题:', themeId);
      return;
    }
    
    if (document.startViewTransition && event) {
      const x = event.clientX;
      const y = event.clientY;
      const endRadius = Math.hypot(
        Math.max(x, window.innerWidth - x),
        Math.max(y, window.innerHeight - y)
      );
      
      const transition = document.startViewTransition(() => {
        currentTheme.value = themeId;
      });
      
      transition.ready.then(() => {
        document.documentElement.animate(
          {
            clipPath: [
              `circle(0 at ${x}px ${y}px)`,
              `circle(${endRadius}px at ${x}px ${y}px)`,
            ],
          },
          {
            duration: 500,
            easing: 'ease-in-out',
            pseudoElement: '::view-transition-new(root)',
          }
        );
      });
    } else {
      currentTheme.value = themeId;
    }
  }

  function applyTheme(newTheme: string, oldTheme?: string): void {
    const html = document.documentElement;
    const body = document.body;
    
    if (oldTheme) {
      html.classList.remove(`theme-${oldTheme}`);
      body.classList.remove(`theme-${oldTheme}`);
    }
    
    html.classList.add(`theme-${newTheme}`);
    body.classList.add(`theme-${newTheme}`);
    console.log(`🎨 已应用主题 class: theme-${newTheme} 到 <html> 和 <body>`);
  }
  
  const getCurrentThemeInfo = computed(() => {
    return themes.value.find((t) => t.id === currentTheme.value) || themes.value[0];
  });
  
  return {
    themes,
    currentTheme,
    getCurrentThemeInfo,
    switchTheme,
    isDark,
  };
});

