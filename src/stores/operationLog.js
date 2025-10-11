/**
 * 操作日志Store
 * 管理用户操作日志
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { localStorageKeys } from '../config/appConfig'
import { toast } from '../utils/toast'

export const useOperationLogStore = defineStore('operationLog', () => {
  // 状态
  const logs = ref([])

  // Getters
  const logCount = computed(() => logs.value.length)
  
  // 计算可撤销的操作数量（只计算有状态数据的）
  const undoableCount = computed(() => 
    logs.value.filter(log => log.undoable && !log.undone && log.beforeState && log.beforeState.categories).length
  )

  // Actions
  /**
   * 记录操作日志
   */
  function log(type, action, details = null, beforeState = null, undoable = true) {
    const logEntry = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      type: type,
      action: action,
      details: details,
      beforeState: beforeState, // 操作前的状态快照
      undoable: undoable, // 是否可以撤销
      undone: false // 是否已撤销
    }

    logs.value.unshift(logEntry) // 新日志放在最前面

    // 只保留最近500条记录
    if (logs.value.length > 500) {
      logs.value.splice(500)
    }

    // 保存到localStorage
    try {
      localStorage.setItem(localStorageKeys.operationLogs, JSON.stringify(logs.value))
      console.log('📝 操作日志已保存', {
        操作类型: type,
        描述: action,
        可撤销: undoable,
        日志总数: logs.value.length
      })
    } catch (e) {
      console.warn('❌ 操作日志保存失败:', e)
    }
  }

  /**
   * 加载操作日志
   */
  function loadLogs() {
    const saved = localStorage.getItem(localStorageKeys.operationLogs)
    if (saved) {
      try {
        const loadedLogs = JSON.parse(saved)
        
        // 处理旧版本日志数据，确保新字段存在
        logs.value = loadedLogs.map(log => ({
          ...log,
          beforeState: log.beforeState || null,
          undoable: log.undoable !== undefined ? log.undoable : (log.beforeState ? true : false),
          undone: log.undone || false
        }))
        
        console.log('📋 操作日志已加载', {
          日志总数: logs.value.length,
          可撤销: logs.value.filter(l => l.undoable && !l.undone && l.beforeState).length,
          最新操作: logs.value.length > 0 ? logs.value[0].action : '无'
        })
      } catch (e) {
        console.error('❌ 日志加载失败:', e)
        logs.value = []
      }
    } else {
      console.log('📋 暂无操作日志')
      logs.value = []
    }
  }

  /**
   * 清空操作日志
   * （日志管理操作，不记录日志）
   */
  function clearLogs() {
    if (confirm('确定要清空所有操作日志吗？')) {
      logs.value = []
      localStorage.removeItem(localStorageKeys.operationLogs)
      return true
    }
    return false
  }

  /**
   * 导出操作日志
   */
  function exportLogs() {
    if (logs.value.length === 0) {
      toast.info('暂无日志可导出')
      return false
    }

    const dataStr = JSON.stringify(logs.value, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)

    const link = document.createElement('a')
    link.href = url
    link.download = `operation-log-${new Date().toISOString().split('T')[0]}.json`
    link.click()

    URL.revokeObjectURL(url)

    log('export', '导出了操作日志', { count: logs.value.length })
    return true
  }

  /**
   * 格式化日志详细信息
   */
  function formatDetails(details) {
    if (typeof details === 'string') {
      return details
    }

    if (typeof details === 'object' && details !== null) {
      return Object.entries(details)
        .map(([key, value]) => `${key}: ${value}`)
        .join(' | ')
    }

    return JSON.stringify(details)
  }

  /**
   * 格式化时间
   */
  function formatTime(timestamp) {
    const time = new Date(timestamp)
    return `${time.getMonth()+1}/${time.getDate()} ${time.getHours()}:${String(time.getMinutes()).padStart(2, '0')}:${String(time.getSeconds()).padStart(2, '0')}`
  }

  /**
   * 标记日志为已撤销
   */
  function markAsUndone(logId) {
    const log = logs.value.find(l => l.id === logId)
    if (log) {
      log.undone = true
      try {
        localStorage.setItem(localStorageKeys.operationLogs, JSON.stringify(logs.value))
        console.log('✅ 操作已标记为撤销', { logId, action: log.action })
      } catch (e) {
        console.warn('❌ 撤销标记保存失败:', e)
      }
    }
  }

  /**
   * 获取最近的可撤销操作（必须有状态数据）
   */
  function getLatestUndoableLog() {
    return logs.value.find(log => log.undoable && !log.undone && log.beforeState && log.beforeState.categories)
  }

  // 页面加载时自动加载日志
  loadLogs()

  return {
    // 状态
    logs,
    // Getters
    logCount,
    undoableCount,
    // Actions
    log,
    loadLogs,
    clearLogs,
    exportLogs,
    formatDetails,
    formatTime,
    markAsUndone,
    getLatestUndoableLog
  }
})

