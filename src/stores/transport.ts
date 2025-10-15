/**
 * 交通模块状态管理
 * @fileoverview 使用 Pinia 管理交通相关的状态和操作
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { v4 as uuidv4 } from 'uuid'
import type { 
  TransportRoute, 
  TransportSegment, 
  TransportBudget, 
  TransportReminder,
  TransportStats,
  TransportType,
  TransportCost
} from '../types/transport'
import { localStorageKeys } from '../config/appConfig'
import { toast } from '../utils/toast'

export const useTransportStore = defineStore('transport', () => {
  // 状态
  const routes = ref<TransportRoute[]>([])
  const budgets = ref<TransportBudget[]>([])
  const reminders = ref<TransportReminder[]>([])
  const currentRoute = ref<TransportRoute | null>(null)
  const isLoading = ref(false)

  // 计算属性
  const totalRoutes = computed(() => routes.value.length)
  
  const totalCost = computed(() => 
    routes.value.reduce((sum, route) => sum + (route.totalCost?.totalCost || 0), 0)
  )
  
  const totalDistance = computed(() => 
    routes.value.reduce((sum, route) => sum + route.totalDistance, 0)
  )
  
  const totalDuration = computed(() => 
    routes.value.reduce((sum, route) => sum + route.totalDuration, 0)
  )

  const favoriteRoutes = computed(() => 
    routes.value.filter(route => route.isFavorite)
  )

  const transportStats = computed((): TransportStats => {
    const breakdown = new Map<TransportType, { count: number; totalCost: number; totalDistance: number }>()
    
    routes.value.forEach(route => {
      route.segments.forEach(segment => {
        const existing = breakdown.get(segment.transportType) || { count: 0, totalCost: 0, totalDistance: 0 }
        breakdown.set(segment.transportType, {
          count: existing.count + 1,
          totalCost: existing.totalCost + segment.cost.totalCost,
          totalDistance: existing.totalDistance + (segment.distance || 0)
        })
      })
    })

    const mostUsedTransport = Array.from(breakdown.entries())
      .sort((a, b) => b[1].count - a[1].count)[0]?.[0] || TransportType.OTHER

    return {
      totalRoutes: totalRoutes.value,
      totalCost: totalCost.value,
      mostUsedTransport,
      averageCostPerKm: totalDistance.value > 0 ? totalCost.value / totalDistance.value : 0,
      totalDistance: totalDistance.value,
      totalDuration: totalDuration.value,
      transportBreakdown: Array.from(breakdown.entries()).map(([type, stats]) => ({
        type,
        ...stats
      }))
    }
  })

  // 路线管理
  const addRoute = (route: Omit<TransportRoute, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newRoute: TransportRoute = {
      ...route,
      id: uuidv4(),
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    // 确保路线总计正确计算
    updateRouteTotals(newRoute)
    
    routes.value.push(newRoute)
    saveToStorage()
    calculateBudgetUsage() // 重新计算预算使用情况
    toast.success('路线添加成功')
    return newRoute
  }

  const updateRoute = (id: string, updates: Partial<TransportRoute>) => {
    const index = routes.value.findIndex(route => route.id === id)
    if (index !== -1) {
      routes.value[index] = {
        ...routes.value[index],
        ...updates,
        updatedAt: new Date()
      }
      
      // 如果更新了路线段，重新计算总计
      if (updates.segments) {
        updateRouteTotals(routes.value[index])
      }
      
      saveToStorage()
      calculateBudgetUsage() // 重新计算预算使用情况
      toast.success('路线更新成功')
      return routes.value[index]
    }
    return null
  }

  const deleteRoute = (id: string) => {
    const index = routes.value.findIndex(route => route.id === id)
    if (index !== -1) {
      routes.value.splice(index, 1)
      saveToStorage()
      toast.success('路线删除成功')
      return true
    }
    return false
  }

  const toggleFavorite = (id: string) => {
    const route = routes.value.find(route => route.id === id)
    if (route) {
      route.isFavorite = !route.isFavorite
      route.updatedAt = new Date()
      saveToStorage()
      toast.success(route.isFavorite ? '已添加到收藏' : '已取消收藏')
      return route.isFavorite
    }
    return false
  }

  // 路线段管理
  const addSegment = (routeId: string, segment: Omit<TransportSegment, 'id'>) => {
    const route = routes.value.find(r => r.id === routeId)
    if (route) {
      const newSegment: TransportSegment = {
        ...segment,
        id: uuidv4()
      }
      
      route.segments.push(newSegment)
      updateRouteTotals(route)
      route.updatedAt = new Date()
      saveToStorage()
      calculateBudgetUsage() // 重新计算预算使用情况
      toast.success('路线段添加成功')
      return newSegment
    }
    return null
  }

  const updateSegment = (routeId: string, segmentId: string, updates: Partial<TransportSegment>) => {
    const route = routes.value.find(r => r.id === routeId)
    if (route) {
      const segmentIndex = route.segments.findIndex(s => s.id === segmentId)
      if (segmentIndex !== -1) {
        route.segments[segmentIndex] = {
          ...route.segments[segmentIndex],
          ...updates
        }
        updateRouteTotals(route)
        route.updatedAt = new Date()
        saveToStorage()
        calculateBudgetUsage() // 重新计算预算使用情况
        toast.success('路线段更新成功')
        return route.segments[segmentIndex]
      }
    }
    return null
  }

  const deleteSegment = (routeId: string, segmentId: string) => {
    const route = routes.value.find(r => r.id === routeId)
    if (route) {
      const segmentIndex = route.segments.findIndex(s => s.id === segmentId)
      if (segmentIndex !== -1) {
        route.segments.splice(segmentIndex, 1)
        updateRouteTotals(route)
        route.updatedAt = new Date()
        saveToStorage()
        calculateBudgetUsage() // 重新计算预算使用情况
        toast.success('路线段删除成功')
        return true
      }
    }
    return false
  }

  // 更新路线总计
  const updateRouteTotals = (route: TransportRoute) => {
    route.totalDuration = route.segments.reduce((sum, segment) => sum + segment.duration, 0)
    route.totalDistance = route.segments.reduce((sum, segment) => sum + (segment.distance || 0), 0)
    
    const totalCost = route.segments.reduce((sum, segment) => sum + segment.cost.totalCost, 0)
    route.totalCost = {
      ...route.segments[0]?.cost || { baseCost: 0, totalCost: 0, currency: 'CNY' },
      totalCost
    }
  }

  // 预算管理
  const addBudget = (budget: Omit<TransportBudget, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newBudget: TransportBudget = {
      ...budget,
      id: uuidv4(),
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    budgets.value.push(newBudget)
    saveToStorage()
    toast.success('预算添加成功')
    return newBudget
  }

  const updateBudget = (id: string, updates: Partial<TransportBudget>) => {
    const index = budgets.value.findIndex(budget => budget.id === id)
    if (index !== -1) {
      budgets.value[index] = {
        ...budgets.value[index],
        ...updates,
        updatedAt: new Date()
      }
      saveToStorage()
      toast.success('预算更新成功')
      return budgets.value[index]
    }
    return null
  }

  const deleteBudget = (id: string) => {
    const index = budgets.value.findIndex(budget => budget.id === id)
    if (index !== -1) {
      budgets.value.splice(index, 1)
      saveToStorage()
      toast.success('预算删除成功')
      return true
    }
    return false
  }

  // 计算预算使用情况
  const calculateBudgetUsage = () => {
    budgets.value.forEach(budget => {
      let totalUsed = 0
      
      // 重置所有分类的使用金额
      budget.categories.forEach(category => {
        category.used = 0
      })
      
      // 根据路线数据计算已使用金额
      routes.value.forEach(route => {
        route.segments.forEach(segment => {
          // 检查是否匹配预算的交通工具类型
          const category = budget.categories.find(cat => cat.type === segment.transportType)
          if (category) {
            category.used += segment.cost.totalCost
            totalUsed += segment.cost.totalCost
          }
        })
      })
      
      // 更新已使用金额和剩余金额
      budget.usedAmount = totalUsed
      budget.remainingAmount = budget.totalBudget - totalUsed
    })
    
    saveToStorage()
  }

  // 提醒管理
  const addReminder = (reminder: Omit<TransportReminder, 'id' | 'createdAt'>) => {
    const newReminder: TransportReminder = {
      ...reminder,
      id: uuidv4(),
      createdAt: new Date()
    }
    
    reminders.value.push(newReminder)
    saveToStorage()
    return newReminder
  }

  const updateReminder = (id: string, updates: Partial<TransportReminder>) => {
    const index = reminders.value.findIndex(reminder => reminder.id === id)
    if (index !== -1) {
      reminders.value[index] = {
        ...reminders.value[index],
        ...updates
      }
      saveToStorage()
      return reminders.value[index]
    }
    return null
  }

  const deleteReminder = (id: string) => {
    const index = reminders.value.findIndex(reminder => reminder.id === id)
    if (index !== -1) {
      reminders.value.splice(index, 1)
      saveToStorage()
      return true
    }
    return false
  }

  // 存储管理
  const saveToStorage = () => {
    try {
      localStorage.setItem(localStorageKeys.transportRoutes, JSON.stringify(routes.value))
      localStorage.setItem(localStorageKeys.transportBudgets, JSON.stringify(budgets.value))
      localStorage.setItem(localStorageKeys.transportReminders, JSON.stringify(reminders.value))
    } catch (error) {
      console.error('保存交通数据失败:', error)
      toast.error('保存数据失败')
    }
  }

  const loadFromStorage = () => {
    try {
      const routesData = localStorage.getItem(localStorageKeys.transportRoutes)
      if (routesData) {
        routes.value = JSON.parse(routesData).map((route: any) => ({
          ...route,
          createdAt: new Date(route.createdAt),
          updatedAt: new Date(route.updatedAt),
          segments: route.segments.map((segment: any) => ({
            ...segment,
            departureTime: new Date(segment.departureTime),
            arrivalTime: new Date(segment.arrivalTime)
          }))
        }))
        
        // 确保所有路线都有正确的总计字段
        routes.value.forEach(route => {
          if (!route.totalCost || !route.totalDuration || !route.totalDistance) {
            updateRouteTotals(route)
          }
        })
      }

      const budgetsData = localStorage.getItem(localStorageKeys.transportBudgets)
      if (budgetsData) {
        budgets.value = JSON.parse(budgetsData).map((budget: any) => ({
          ...budget,
          createdAt: new Date(budget.createdAt),
          updatedAt: new Date(budget.updatedAt)
        }))
      }

      const remindersData = localStorage.getItem(localStorageKeys.transportReminders)
      if (remindersData) {
        reminders.value = JSON.parse(remindersData).map((reminder: any) => ({
          ...reminder,
          createdAt: new Date(reminder.createdAt),
          reminderTime: new Date(reminder.reminderTime)
        }))
      }
    } catch (error) {
      console.error('加载交通数据失败:', error)
      toast.error('加载数据失败')
    }
  }

  // 初始化
  const initialize = () => {
    loadFromStorage()
  }

  return {
    // 状态
    routes,
    budgets,
    reminders,
    currentRoute,
    isLoading,
    
    // 计算属性
    totalRoutes,
    totalCost,
    totalDistance,
    totalDuration,
    favoriteRoutes,
    transportStats,
    
    // 路线管理
    addRoute,
    updateRoute,
    deleteRoute,
    toggleFavorite,
    
    // 路线段管理
    addSegment,
    updateSegment,
    deleteSegment,
    
    // 预算管理
    addBudget,
    updateBudget,
    deleteBudget,
    calculateBudgetUsage,
    
    // 提醒管理
    addReminder,
    updateReminder,
    deleteReminder,
    
    // 存储管理
    saveToStorage,
    loadFromStorage,
    initialize
  }
})
