/**
 * 图表数据处理
 * 将业务数据转换为图表所需的数据格式
 */
import { computed } from 'vue'
import { useEquipmentStore } from '@/stores/equipment'
import { useOperationLogStore } from '@/stores/operationLog'
import type { 
  PieChartData, 
  BarChartData, 
  LineChartData, 
  ScatterChartData,
  EquipmentStatsData,
  OperationLogData
} from '@/types/chart'

/**
 * 装备统计图表数据处理
 */
export function useEquipmentChartData() {
  const equipmentStore = useEquipmentStore()
  
  /**
   * 完成率数据（环形图）
   */
  const completionData = computed<PieChartData[]>(() => [
    {
      name: '已完成',
      value: equipmentStore.completedItems,
      icon: '✅',
      color: 'var(--accent-success)'
    },
    {
      name: '待完成',
      value: equipmentStore.remainingItems,
      icon: '⏳',
      color: 'var(--accent-warning)'
    }
  ])
  
  /**
   * 分类分布数据（饼图）
   */
  const categoryDistributionData = computed<PieChartData[]>(() => 
    equipmentStore.categories
      .filter(cat => cat.items.length > 0) // 只显示有装备的分类
      .map(cat => ({
        name: cat.name,
        value: cat.items.length,
        icon: cat.icon,
        color: undefined // 使用默认颜色
      }))
  )
  
  /**
   * 计算分类总重量
   */
  const calculateCategoryWeight = (category: any): number => {
    return category.items.reduce((sum: number, item: any) => {
      let weightInGrams = item.weight || 0
      // 单位转换
      switch (item.weightUnit) {
        case 'kg': weightInGrams = item.weight * 1000; break
        case '斤': weightInGrams = item.weight * 500; break
        case '磅': weightInGrams = item.weight * 453.592; break
        default: weightInGrams = item.weight || 0 // g
      }
      return sum + weightInGrams * item.quantity
    }, 0) / 1000 // 转换为 kg
  }
  
  /**
   * 计算分类总价格
   */
  const calculateCategoryPrice = (category: any): number => {
    return category.items.reduce((sum: number, item: any) => {
      let priceInYuan = item.price || 0
      // 单位转换到人民币
      switch (item.priceUnit) {
        case '美元': priceInYuan = (item.price || 0) * 7; break
        case '英镑': priceInYuan = (item.price || 0) * 9; break
        case '日元': priceInYuan = (item.price || 0) * 0.05; break
        default: priceInYuan = item.price || 0 // 人民币
      }
      return sum + priceInYuan * item.quantity
    }, 0)
  }
  
  /**
   * 重量分布数据（柱状图）
   */
  const weightDistributionData = computed<BarChartData>(() => {
    const categories = equipmentStore.categories
      .filter(cat => cat.items.length > 0)
      .map(cat => cat.name)
    
    const weights = equipmentStore.categories
      .filter(cat => cat.items.length > 0)
      .map(cat => calculateCategoryWeight(cat))
    
    return {
      categories,
      series: [{
        name: '重量(kg)',
        data: weights
      }]
    }
  })
  
  /**
   * 价格分布数据（柱状图）
   */
  const priceDistributionData = computed<BarChartData>(() => {
    const categories = equipmentStore.categories
      .filter(cat => cat.items.length > 0)
      .map(cat => cat.name)
    
    const prices = equipmentStore.categories
      .filter(cat => cat.items.length > 0)
      .map(cat => calculateCategoryPrice(cat))
    
    return {
      categories,
      series: [{
        name: '价格(¥)',
        data: prices
      }]
    }
  })
  
  /**
   * 重量vs价格散点图数据
   */
  const weightPriceScatterData = computed<ScatterChartData>(() => {
    const scatterPoints: Array<[number, number]> = []
    
    equipmentStore.categories.forEach(category => {
      category.items.forEach(item => {
        if (item.weight > 0 && item.price > 0) {
          let weightInKg = item.weight
          let priceInYuan = item.price
          
          // 重量单位转换
          switch (item.weightUnit) {
            case 'kg': weightInKg = item.weight; break
            case '斤': weightInKg = item.weight * 0.5; break
            case '磅': weightInKg = item.weight * 0.453592; break
            default: weightInKg = item.weight / 1000 // g to kg
          }
          
          // 价格单位转换
          switch (item.priceUnit) {
            case '美元': priceInYuan = item.price * 7; break
            case '英镑': priceInYuan = item.price * 9; break
            case '日元': priceInYuan = item.price * 0.05; break
            default: priceInYuan = item.price
          }
          
          scatterPoints.push([weightInKg, priceInYuan])
        }
      })
    })
    
    return {
      series: [{
        name: '装备',
        data: scatterPoints
      }]
    }
  })
  
  /**
   * 完整的装备统计图表数据
   */
  const equipmentStatsData = computed<EquipmentStatsData>(() => ({
    completion: completionData.value,
    categoryDistribution: categoryDistributionData.value,
    weightDistribution: weightDistributionData.value,
    priceDistribution: priceDistributionData.value,
    weightPriceScatter: weightPriceScatterData.value
  }))
  
  return {
    completionData,
    categoryDistributionData,
    weightDistributionData,
    priceDistributionData,
    weightPriceScatterData,
    equipmentStatsData,
    calculateCategoryWeight,
    calculateCategoryPrice
  }
}

/**
 * 操作日志图表数据处理
 */
export function useOperationLogChartData() {
  const operationLogStore = useOperationLogStore()
  
  /**
   * 操作趋势数据（按天统计）
   */
  const operationTrendData = computed<LineChartData>(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - i)
      return date.toISOString().split('T')[0]
    }).reverse()
    
    const operationCounts = last7Days.map(date => {
      return operationLogStore.logs.filter(log => 
        log.timestamp.startsWith(date)
      ).length
    })
    
    return {
      categories: last7Days.map(date => 
        new Date(date).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
      ),
      series: [{
        name: '操作次数',
        data: operationCounts
      }]
    }
  })
  
  /**
   * 操作类型分布数据
   */
  const operationTypeDistributionData = computed<PieChartData[]>(() => {
    const typeCounts: Record<string, number> = {}
    
    operationLogStore.logs.forEach(log => {
      typeCounts[log.type] = (typeCounts[log.type] || 0) + 1
    })
    
    return Object.entries(typeCounts).map(([type, count]) => ({
      name: getOperationTypeLabel(type),
      value: count,
      icon: getOperationTypeIcon(type)
    }))
  })
  
  /**
   * 获取操作类型标签
   */
  const getOperationTypeLabel = (type: string): string => {
    const labels: Record<string, string> = {
      'add': '添加',
      'edit': '编辑',
      'delete': '删除',
      'toggle': '切换',
      'import': '导入',
      'export': '导出',
      'sort': '排序',
      'clear': '清空'
    }
    return labels[type] || type
  }
  
  /**
   * 获取操作类型图标
   */
  const getOperationTypeIcon = (type: string): string => {
    const icons: Record<string, string> = {
      'add': '➕',
      'edit': '✏️',
      'delete': '🗑️',
      'toggle': '🔄',
      'import': '📥',
      'export': '📤',
      'sort': '🔢',
      'clear': '🧹'
    }
    return icons[type] || '📝'
  }
  
  /**
   * 完整的操作日志图表数据
   */
  const operationLogData = computed<OperationLogData>(() => ({
    operationTrend: operationTrendData.value,
    operationHeatmap: [], // 暂时为空，后续实现
    operationTypeDistribution: operationTypeDistributionData.value
  }))
  
  return {
    operationTrendData,
    operationTypeDistributionData,
    operationLogData
  }
}
