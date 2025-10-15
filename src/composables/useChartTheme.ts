/**
 * 图表主题管理
 * 自动适配项目的主题系统
 */
import { computed } from 'vue'
import { useThemeStore } from '@/stores/themeStore'

/**
 * 获取 CSS 变量值
 */
function getCSSVariable(property: string): string {
  return getComputedStyle(document.documentElement)
    .getPropertyValue(property)
    .trim()
}

/**
 * 图表主题管理
 */
export function useChartTheme() {
  const themeStore = useThemeStore()
  
  /**
   * 图表颜色配置
   */
  const chartColors = computed(() => {
    const primary = getCSSVariable('--accent-primary') || '#3b82f6'
    const success = getCSSVariable('--accent-success') || '#10b981'
    const warning = getCSSVariable('--accent-warning') || '#f59e0b'
    const danger = getCSSVariable('--accent-danger') || '#ef4444'
    const info = getCSSVariable('--accent-info') || '#06b6d4'
    
    const bg = getCSSVariable('--bg-card') || '#ffffff'
    const text = getCSSVariable('--text-primary') || '#1f2937'
    const border = getCSSVariable('--border-color') || '#e5e7eb'
    const tooltipBg = getCSSVariable('--bg-input') || '#f9fafb'
    
    return {
      // 主色调
      primary,
      success,
      warning,
      danger,
      info,
      
      // 背景和文字
      bg,
      text,
      border,
      tooltipBg,
      
      // 系列颜色（用于多系列图表）
      series: [primary, success, warning, danger, info],
      
      // 渐变色
      gradients: {
        primary: `linear-gradient(135deg, ${primary}, ${success})`,
        success: `linear-gradient(135deg, ${success}, ${info})`,
        warning: `linear-gradient(135deg, ${warning}, ${danger})`
      }
    }
  })
  
  /**
   * 图表主题配置
   */
  const chartTheme = computed(() => ({
    color: chartColors.value.series,
    backgroundColor: 'transparent',
    textStyle: {
      color: chartColors.value.text,
      fontFamily: 'inherit'
    },
    title: {
      textStyle: {
        color: chartColors.value.text,
        fontSize: 16,
        fontWeight: 'bold'
      }
    },
    legend: {
      textStyle: {
        color: chartColors.value.text
      }
    },
    tooltip: {
      backgroundColor: chartColors.value.tooltipBg,
      borderColor: chartColors.value.border,
      textStyle: {
        color: chartColors.value.text
      }
    },
    grid: {
      borderColor: chartColors.value.border
    },
    categoryAxis: {
      axisLine: {
        lineStyle: {
          color: chartColors.value.border
        }
      },
      axisLabel: {
        textStyle: {
          color: chartColors.value.text
        }
      },
      splitLine: {
        lineStyle: {
          color: chartColors.value.border,
          opacity: 0.3
        }
      }
    },
    valueAxis: {
      axisLine: {
        lineStyle: {
          color: chartColors.value.border
        }
      },
      axisLabel: {
        textStyle: {
          color: chartColors.value.text
        }
      },
      splitLine: {
        lineStyle: {
          color: chartColors.value.border,
          opacity: 0.3
        }
      }
    }
  }))
  
  /**
   * 响应式配置
   */
  const responsiveConfig = computed(() => ({
    mobile: {
      textStyle: {
        fontSize: 12
      },
      grid: {
        left: '10%',
        right: '10%',
        top: '10%',
        bottom: '10%'
      }
    },
    desktop: {
      textStyle: {
        fontSize: 14
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      }
    }
  }))
  
  return {
    chartColors,
    chartTheme,
    responsiveConfig
  }
}
