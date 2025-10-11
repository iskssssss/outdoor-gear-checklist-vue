/**
 * 操作日志Store
 * 管理用户操作日志
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useOperationLogStore = defineStore('operationLog', () => {
  // 状态
  const logs = ref([])

  // Getters
  const logCount = computed(() => logs.value.length)

  // Actions
  /**
   * 记录操作日志
   */
  function log(type, action, details = null) {
    const logEntry = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      type: type,
      action: action,
      details: details
    }

    logs.value.unshift(logEntry) // 新日志放在最前面

    // 只保留最近500条记录
    if (logs.value.length > 500) {
      logs.value.splice(500)
    }

    // 保存到localStorage
    try {
      localStorage.setItem('hikingOperationLogs', JSON.stringify(logs.value))
      console.log('📝 操作日志已保存', {
        操作类型: type,
        描述: action,
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
    const saved = localStorage.getItem('hikingOperationLogs')
    if (saved) {
      try {
        logs.value = JSON.parse(saved)
        console.log('📋 操作日志已加载', {
          日志总数: logs.value.length,
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
   */
  function clearLogs() {
    if (confirm('确定要清空所有操作日志吗？')) {
      logs.value = []
      localStorage.removeItem('hikingOperationLogs')
      log('clear', '清空了所有操作日志')
      return true
    }
    return false
  }

  /**
   * 导出操作日志
   */
  function exportLogs() {
    if (logs.value.length === 0) {
      alert('暂无日志可导出')
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

  // 页面加载时自动加载日志
  loadLogs()

  return {
    // 状态
    logs,
    // Getters
    logCount,
    // Actions
    log,
    loadLogs,
    clearLogs,
    exportLogs,
    formatDetails,
    formatTime
  }
})

