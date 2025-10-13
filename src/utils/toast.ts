interface ToastInstance {
  success(message: string, duration?: number): void;
  error(message: string, duration?: number): void;
  warning(message: string, duration?: number): void;
  info(message: string, duration?: number): void;
}

/**
 * 全局 Toast 通知服务
 */
class ToastService {
  private toastInstance: ToastInstance | null = null;

  constructor() {
    this.toastInstance = null;
  }

  /**
   * 设置 Toast 实例
   */
  setInstance(instance: ToastInstance) {
    this.toastInstance = instance;
  }

  /**
   * 成功通知
   */
  success(message: string, duration: number = 3000): void {
    if (this.toastInstance) {
      this.toastInstance.success(message, duration);
    }
  }

  /**
   * 错误通知
   */
  error(message: string, duration: number = 3000): void {
    if (this.toastInstance) {
      this.toastInstance.error(message, duration);
    }
  }

  /**
   * 警告通知
   */
  warning(message: string, duration: number = 3000): void {
    if (this.toastInstance) {
      this.toastInstance.warning(message, duration);
    }
  }

  /**
   * 信息通知
   */
  info(message: string, duration: number = 3000): void {
    if (this.toastInstance) {
      this.toastInstance.info(message, duration);
    }
  }
}

// 导出单例
export const toast = new ToastService();

