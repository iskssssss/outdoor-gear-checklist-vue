<template>
  <div class="base-chart" :style="{ height: height, width: width }">
    <v-chart 
      :option="chartOption" 
      :style="{ height: '100%', width: '100%' }"
      autoresize
      @click="handleChartClick"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { 
  PieChart, 
  BarChart, 
  LineChart,
  ScatterChart,
  RadarChart,
  FunnelChart,
  HeatmapChart
} from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  PolarComponent,
  RadarComponent,
  DataZoomComponent,
  VisualMapComponent
} from 'echarts/components'
import VChart from 'vue-echarts'
import { useChartTheme } from '@/composables/useChartTheme'

// 注册 ECharts 组件
use([
  CanvasRenderer,
  PieChart,
  BarChart,
  LineChart,
  ScatterChart,
  RadarChart,
  FunnelChart,
  HeatmapChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  PolarComponent,
  RadarComponent,
  DataZoomComponent,
  VisualMapComponent
])

/**
 * 基础图表组件
 * 支持多种图表类型，自动适配主题系统
 */

interface Props {
  /** 图表类型 */
  type: 'pie' | 'bar' | 'line' | 'scatter' | 'radar' | 'funnel' | 'heatmap'
  /** 图表数据 */
  data: any
  /** 图表配置选项 */
  options?: any
  /** 图表高度 */
  height?: string
  /** 图表宽度 */
  width?: string
  /** 是否显示标题 */
  showTitle?: boolean
  /** 标题文本 */
  title?: string
  /** 是否显示图例 */
  showLegend?: boolean
  /** 是否显示工具栏 */
  showToolbox?: boolean
  /** 是否响应式 */
  responsive?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  height: '300px',
  width: '100%',
  showTitle: false,
  title: '',
  showLegend: true,
  showToolbox: false,
  responsive: true
})

const emit = defineEmits<{
  click: [params: any]
}>()

// 使用图表主题
const { chartColors, chartTheme } = useChartTheme()

/**
 * 生成基础配置
 */
const baseConfig = computed(() => ({
  backgroundColor: 'transparent',
  textStyle: {
    color: chartColors.value.text,
    fontSize: 14
  },
  title: props.showTitle ? {
    text: props.title,
    left: 'center',
    textStyle: {
      color: chartColors.value.text,
      fontSize: 16,
      fontWeight: 'bold'
    }
  } : undefined,
  legend: props.showLegend ? {
    show: true,
    top: props.showTitle ? 'bottom' : 'top',
    textStyle: {
      color: chartColors.value.text,
      fontSize: 12
    },
    // 当分类过多时，使用滚动图例
    type: 'scroll',
    orient: 'horizontal',
    left: 'center',
    itemGap: 10,
    itemWidth: 14,
    itemHeight: 14
  } : { show: false },
  tooltip: {
    trigger: 'item',
    backgroundColor: chartColors.value.tooltipBg,
    borderColor: chartColors.value.border,
    textStyle: {
      color: chartColors.value.text
    },
    formatter: (params: any) => {
      if (props.type === 'pie') {
        return `${params.name}: ${params.value} (${params.percent}%)`
      }
      return `${params.seriesName}<br/>${params.name}: ${params.value}`
    }
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '3%',
    containLabel: true
  }
}))

/**
 * 根据图表类型生成配置
 */
const chartOption = computed(() => {
  const config = { ...baseConfig.value }
  
  switch (props.type) {
    case 'pie':
      // 根据数据项数量调整标签显示策略
      const dataLength = props.data?.length || 0
      const shouldShowLabels = dataLength <= 6 // 超过6个分类时不显示标签，避免重叠
      
      // 根据数据量调整饼图大小
      const getRadius = () => {
        if (dataLength <= 3) return ['45%', '75%']
        if (dataLength <= 6) return ['40%', '70%']
        if (dataLength <= 10) return ['35%', '65%']
        return ['30%', '60%']
      }
      
      return {
        ...config,
        series: [{
          type: 'pie',
          radius: getRadius(),
          center: ['50%', '50%'],
          data: props.data,
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          },
          itemStyle: {
            borderRadius: dataLength <= 6 ? 8 : 4, // 分类多时减少圆角
            borderColor: chartColors.value.bg,
            borderWidth: 2
          },
          label: {
            show: shouldShowLabels,
            formatter: '{b}: {c}',
            fontSize: dataLength <= 4 ? 12 : 10, // 根据分类数量调整字体大小
            fontWeight: 'normal',
            color: chartColors.value.text
          },
          labelLine: {
            show: shouldShowLabels,
            length: dataLength <= 4 ? 15 : 12,
            length2: dataLength <= 4 ? 10 : 8,
            smooth: true,
            lineStyle: {
              color: chartColors.value.border
            }
          },
          // 当分类过多时，启用图例显示
          legendHoverLink: true
        }]
      }
      
    case 'bar':
      return {
        ...config,
        xAxis: {
          type: 'category',
          data: props.data.categories || [],
          axisLine: {
            lineStyle: {
              color: chartColors.value.border
            }
          },
          axisLabel: {
            color: chartColors.value.text
          }
        },
        yAxis: {
          type: 'value',
          axisLine: {
            lineStyle: {
              color: chartColors.value.border
            }
          },
          axisLabel: {
            color: chartColors.value.text
          },
          splitLine: {
            lineStyle: {
              color: chartColors.value.border,
              opacity: 0.3
            }
          }
        },
        series: props.data.series?.map((series: any, index: number) => ({
          type: 'bar',
          name: series.name,
          data: series.data,
          itemStyle: {
            color: chartColors.value.series[index % chartColors.value.series.length]
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
        })) || []
      }
      
    case 'line':
      return {
        ...config,
        xAxis: {
          type: 'category',
          data: props.data.categories || [],
          axisLine: {
            lineStyle: {
              color: chartColors.value.border
            }
          },
          axisLabel: {
            color: chartColors.value.text
          }
        },
        yAxis: {
          type: 'value',
          axisLine: {
            lineStyle: {
              color: chartColors.value.border
            }
          },
          axisLabel: {
            color: chartColors.value.text
          },
          splitLine: {
            lineStyle: {
              color: chartColors.value.border,
              opacity: 0.3
            }
          }
        },
        series: props.data.series?.map((series: any, index: number) => ({
          type: 'line',
          name: series.name,
          data: series.data,
          smooth: true,
          lineStyle: {
            color: chartColors.value.series[index % chartColors.value.series.length]
          },
          itemStyle: {
            color: chartColors.value.series[index % chartColors.value.series.length]
          }
        })) || []
      }
      
    default:
      return config
  }
})

/**
 * 处理图表点击事件
 */
const handleChartClick = (params: any) => {
  emit('click', params)
}

// 监听主题变化，重新渲染图表
watch(chartTheme, () => {
  // 图表会自动重新渲染
}, { deep: true })
</script>

<style scoped lang="scss">
.base-chart {
  position: relative;
  border-radius: var(--border-radius-lg);
  overflow: hidden;
  
  // 确保图表容器正确显示
  :deep(.echarts) {
    width: 100% !important;
    height: 100% !important;
  }
}
</style>
