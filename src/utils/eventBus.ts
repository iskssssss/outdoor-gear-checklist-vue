// src/utils/eventBus.js
interface EventListeners {
  [event: string]: Function[];
}

const listeners: EventListeners = {};

export const eventBus = {
  // 订阅事件
  on(event: string, callback: Function): void {
    if (!listeners[event]) {
      listeners[event] = [];
    }
    listeners[event].push(callback);
  },
  // 发射事件
  emit(event: string, data?: any): void {
    if (listeners[event]) {
      listeners[event].forEach(callback => callback(data));
    }
  },
  // 取消订阅
  off(event: string, callback: Function): void {
    if (listeners[event]) {
      listeners[event] = listeners[event].filter(cb => cb !== callback);
    }
  }
};
