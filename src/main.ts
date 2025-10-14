import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './assets/main.scss'
import './assets/styles/themes.scss' // 引入主题样式

// 注册 ECharts 组件
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

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')

