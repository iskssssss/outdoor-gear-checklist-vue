<template>
  <div v-if="isVisible" class="modal" @click="close">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h3>📋 操作日志</h3>
        <span class="close" @click="close">&times;</span>
      </div>
      <div class="modal-body scroll-area">
        <div class="log-controls">
          <button class="btn btn-danger btn-sm" @click="clearLogs">清空日志</button>
          <button class="btn btn-primary btn-sm" @click="exportLogs">导出日志</button>
          <span class="log-count">共 <span>{{ logStore.logCount }}</span> 条记录</span>
        </div>
        
        <div class="log-content">
          <div v-if="logStore.logs.length === 0" class="empty-log">
            暂无操作记录
          </div>
          
          <div 
            v-for="log in logStore.logs" 
            :key="log.id"
            class="log-item"
            :class="getLogClass(log.type)"
          >
            <div class="log-header">
              <span class="log-type">
                <span class="log-icon">{{ getLogIcon(log.type) }}</span>
                {{ getLogLabel(log.type) }}
              </span>
              <span class="log-time">{{ logStore.formatTime(log.timestamp) }}</span>
            </div>
            <div class="log-description">{{ log.action }}</div>
            <div v-if="log.details" class="log-details">
              {{ logStore.formatDetails(log.details) }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useOperationLogStore } from '../stores/operationLog'

const logStore = useOperationLogStore()
const isVisible = ref(false)
let openCount = 0
let scrollPosition = 0

// 日志类型配置
const typeConfig = {
  'add': { icon: '➕', label: '添加', class: 'log-add' },
  'delete': { icon: '🗑️', label: '删除', class: 'log-delete' },
  'edit': { icon: '✏️', label: '修改', class: 'log-edit' },
  'toggle': { icon: '🔄', label: '状态', class: 'log-edit' },
  'export': { icon: '📤', label: '导出', class: 'log-export' },
  'import': { icon: '📥', label: '导入', class: 'log-import' },
  'clear': { icon: '🗑️', label: '清空', class: 'log-delete' },
  'config': { icon: '⚙️', label: '配置', class: 'log-config' },
  'recommend': { icon: '🤖', label: 'AI推荐', class: 'log-config' }
}

function show() {
  isVisible.value = true
  openCount++
  if (openCount === 1) {
    scrollPosition = window.scrollY
    document.body.style.top = `-${scrollPosition}px`
    document.body.classList.add('no-scroll')
  }
}

function close() {
  isVisible.value = false
  openCount = Math.max(0, openCount - 1)
  if (openCount === 0) {
    document.body.classList.remove('no-scroll')
    document.body.style.top = ''
    window.scrollTo(0, scrollPosition)
  }
}

function clearLogs() {
  logStore.clearLogs()
}

function exportLogs() {
  logStore.exportLogs()
}

function getLogIcon(type) {
  return typeConfig[type]?.icon || '📝'
}

function getLogLabel(type) {
  return typeConfig[type]?.label || '操作'
}

function getLogClass(type) {
  return typeConfig[type]?.class || ''
}

defineExpose({ show })
</script>

<style scoped lang="scss">
.modal {
  display: flex;
  align-items: center;
  justify-content: center;
  position: fixed;
  z-index: 1000;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background-color: var(--modal-overlay-bg, rgba(0,0,0,0.5));
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-content {
  background: var(--bg-card);
  border-radius: 12px;
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from { transform: translateY(-50px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 25px 30px;
  border-bottom: 2px solid var(--border-color);
  border-radius: 12px 12px 0 0;
  flex-shrink: 0;
  background: var(--bg-card);
  position: sticky;
  top: 0;
  z-index: 1;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.5rem;
}

.close {
  font-size: 2rem;
  font-weight: 300;
  cursor: pointer;
  color: var(--text-white, white);
  opacity: 0.8;
  transition: opacity 0.3s;
}

.close:hover {
  opacity: 1;
}

.modal-body {
  padding: 30px;
  overflow-y: auto;
  flex: 1;
  min-height: 0;
}

/* 美化滚动条 */
.modal-body::-webkit-scrollbar {
  width: 8px;
}

.modal-body::-webkit-scrollbar-track {
  background: var(--bg-input);
  border-radius: 4px;
}

.modal-body::-webkit-scrollbar-thumb {
  background: var(--border-color);
  border-radius: 4px;
}

.modal-body::-webkit-scrollbar-thumb:hover {
  background: var(--text-muted);
}

.log-controls {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 2px solid var(--border-color);
}

.log-count {
  margin-left: auto;
  font-weight: 500;
  color: var(--text-secondary);
}

.log-count span {
  color: var(--primary-color);
  font-weight: 700;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-sm {
  padding: 6px 12px;
  font-size: 0.85rem;
}

.btn-primary {
  background: var(--primary-color);
  color: var(--text-white, white);
}

.btn-danger {
  background: var(--danger-color, #dc3545);
  color: var(--text-white, white);
}

.btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.2);
}

.log-content {
  /* 移除 max-height 和 overflow-y，使用父级 .modal-body 的滚动 */
}

.empty-log {
  text-align: center;
  padding: 60px 20px;
  color: var(--text-muted);
  font-size: 1.1rem;
}

.log-item {
  padding: 15px;
  margin-bottom: 12px;
  border-radius: 8px;
  border-left: 4px solid var(--border-color);
  background: var(--bg-input);
  transition: all 0.3s ease;
}

.log-item:hover {
  transform: translateX(5px);
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.log-item.log-add {
  border-left-color: var(--success-color);
  background: var(--success-light, #d4edda);
}

.log-item.log-delete {
  border-left-color: var(--danger-color);
  background: var(--danger-light, #f8d7da);
}

.log-item.log-edit {
  border-left-color: var(--warning-color);
  background: var(--warning-light, #fff8e1);
}

.log-item.log-export,
.log-item.log-import {
  border-left-color: var(--info-color, #17a2b8);
  background: var(--info-light, #d1ecf1);
}

.log-item.log-config {
  border-left-color: var(--text-muted, #6c757d);
  background: var(--bg-input, #e2e3e5);
}

.log-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.log-type {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: var(--text-primary);
}

.log-icon {
  font-size: 1.2rem;
}

.log-time {
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.log-description {
  margin-bottom: 5px;
  color: var(--text-primary);
  line-height: 1.5;
}

.log-details {
  font-size: 0.85rem;
  color: var(--text-secondary);
  padding-top: 8px;
  border-top: 1px dashed var(--border-color);
  margin-top: 8px;
}

@media (max-width: 768px) {
  .modal-content {
    width: 95%;
    max-height: 95vh;
  }
  
  .modal-header,
  .modal-body {
    padding: 20px;
  }
  
  .log-controls {
    flex-wrap: wrap;
  }
  
  .log-count {
    width: 100%;
    margin-left: 0;
    text-align: center;
    padding-top: 10px;
  }
}
</style>

