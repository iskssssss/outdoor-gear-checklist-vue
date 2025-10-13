/**
 * 防抖函数
 * @param {Function} func 要执行的函数
 * @param {number} wait 延迟时间 (ms)
 * @returns {Function} 返回一个新的防抖函数
 */
export function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null;

  return function executedFunction(this: ThisParameterType<T>, ...args: Parameters<T>): void {
    const later = () => {
      clearTimeout(timeout as ReturnType<typeof setTimeout>);
      func.apply(this, args);
    };

    clearTimeout(timeout as ReturnType<typeof setTimeout>);
    timeout = setTimeout(later, wait);
  };
}
