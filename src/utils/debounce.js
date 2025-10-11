/**
 * 防抖函数
 * @param {Function} func 要执行的函数
 * @param {number} wait 延迟时间 (ms)
 * @returns {Function} 返回一个新的防抖函数
 */
export function debounce(func, wait) {
  let timeout;

  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func.apply(this, args);
    };

    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}
