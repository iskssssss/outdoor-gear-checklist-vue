/**
 * 全局 Toast 通知服务
 */
class ToastService {
  constructor() {
    this.toastInstance = null
  }

  /**
   * 设置 Toast 实例
   */
  setInstance(instance) {
    this.toastInstance = instance
  }

  /**
   * 成功通知
   */
  success(message, duration = 3000) {
    if (this.toastInstance) {
      this.toastInstance.success(message, duration)
    }
  }

  /**
   * 错误通知
   */
  error(message, duration = 3000) {
    if (this.toastInstance) {
      this.toastInstance.error(message, duration)
    }
  }

  /**
   * 警告通知
   */
  warning(message, duration = 3000) {
    if (this.toastInstance) {
      this.toastInstance.warning(message, duration)
    }
  }

  /**
   * 信息通知
   */
  info(message, duration = 3000) {
    if (this.toastInstance) {
      this.toastInstance.info(message, duration)
    }
  }
}

// 导出单例
export const toast = new ToastService()

