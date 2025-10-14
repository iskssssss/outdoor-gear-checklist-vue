/**
 * 图表类型定义
 * 定义各种图表的数据结构和配置
 */

/**
 * 饼图数据
 */
export interface PieChartData {
  name: string
  value: number
  icon?: string
  color?: string
}

/**
 * 柱状图数据
 */
export interface BarChartData {
  categories: string[]
  series: ChartSeries[]
}

/**
 * 折线图数据
 */
export interface LineChartData {
  categories: string[]
  series: ChartSeries[]
}

/**
 * 散点图数据
 */
export interface ScatterChartData {
  series: ScatterSeries[]
}

/**
 * 图表系列数据
 */
export interface ChartSeries {
  name: string
  data: number[]
  color?: string
}

/**
 * 散点图系列数据
 */
export interface ScatterSeries {
  name: string
  data: Array<[number, number]>
  color?: string
}

/**
 * 图表配置选项
 */
export interface ChartOptions {
  title?: string
  showTitle?: boolean
  showLegend?: boolean
  showToolbox?: boolean
  height?: string
  width?: string
  responsive?: boolean
}

/**
 * 装备统计图表数据
 */
export interface EquipmentStatsData {
  // 完成率数据
  completion: PieChartData[]
  
  // 分类分布数据
  categoryDistribution: PieChartData[]
  
  // 重量分布数据
  weightDistribution: BarChartData
  
  // 价格分布数据
  priceDistribution: BarChartData
  
  // 重量vs价格散点图数据
  weightPriceScatter: ScatterChartData
}

/**
 * 操作日志图表数据
 */
export interface OperationLogData {
  // 操作趋势数据
  operationTrend: LineChartData
  
  // 操作热力图数据
  operationHeatmap: any[]
  
  // 操作类型分布
  operationTypeDistribution: PieChartData[]
}
