// src/utils/eventBus.js
const listeners = {};

export const eventBus = {
  // 订阅事件
  on(event, callback) {
    if (!listeners[event]) {
      listeners[event] = [];
    }
    listeners[event].push(callback);
  },
  // 发射事件
  emit(event, data) {
    if (listeners[event]) {
      listeners[event].forEach(callback => callback(data));
    }
  },
  // 取消订阅
  off(event, callback) {
    if (listeners[event]) {
      listeners[event] = listeners[event].filter(cb => cb !== callback);
    }
  }
};
