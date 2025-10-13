<template>
  <BaseModal ref="modalRef" title="📋 操作日志" width="800px" max-height="90vh" @close="handleClose">
    <div class="log-controls">
      <button class="btn btn-danger btn-sm" @click="debouncedClearLogs">清空日志</button>
      <button class="btn btn-primary btn-sm" @click="debouncedExportLogs">导出日志</button>
      <button class="btn btn-success btn-sm" @click="debouncedQuickUndo" :disabled="logStore.undoableCount === 0">
        ⟲ 快速撤销
      </button>
      <span class="log-count">
        共 <span>{{ logStore.logCount }}</span> 条记录 |
        可撤销 <span class="undoable-count">{{ logStore.undoableCount }}</span> 条
      </span>
    </div>

    <div class="log-content">
      <div v-if="logStore.logs.length === 0" class="empty-log">
        暂无操作记录
      </div>

      <div v-for="log in logStore.logs" :key="log.id" class="log-item"
        :class="[getLogClass(log.type), { 'log-undone': log.undone }]">
        <div class="log-header">
          <span class="log-type">
            <span class="log-icon">{{ getLogIcon(log.type) }}</span>
            {{ getLogLabel(log.type) }}
            <span v-if="log.undone" class="undone-badge">已撤销</span>
          </span>
          <div class="log-actions">
            <span class="log-time">{{ logStore.formatTime(log.timestamp) }}</span>
            <button v-if="log.undoable && !log.undone && log.beforeState && log.beforeState.categories" class="btn-undo"
              @click="debouncedHandleUndo(log)" title="撤销此操作">
              ⟲ 撤销
            </button>
            <span v-else-if="log.undoable && !log.undone && !log.beforeState" class="old-log-tag" title="旧版本操作记录，不支持撤销">
              旧记录
            </span>
          </div>
        </div>
        <div class="log-description">{{ log.action }}</div>
        <div v-if="log.details" class="log-details">
          {{ logStore.formatDetails(log.details) }}
        </div>
      </div>
    </div>
  </BaseModal>
</template>

<script setup>
import { ref, inject } from 'vue'
import { useOperationLogStore } from '../../stores/operationLog'
import { useEquipmentStore } from '../../stores/equipment'
import BaseModal from '../common/feedback/BaseModal.vue'
import { useDebounceFn } from '@vueuse/core';

const logStore = useOperationLogStore()
const equipmentStore = useEquipmentStore()
const modalRef = ref(null)
const showConfirm = inject('showConfirm')

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
  'recommend': { icon: '🤖', label: 'AI推荐', class: 'log-config' },
  'undo': { icon: '⟲', label: '撤销', class: 'log-undo' }
}

function show() {
  modalRef.value?.show()
}

function close() {
  modalRef.value?.close()
}

function handleClose() {
  // 额外的关闭逻辑（如果需要）
}

async function clearLogs() {
  const confirmed = await showConfirm({
    title: '清空操作日志',
    message: '确定要清空所有操作日志吗？',
    confirmButtonText: '清空',
    showDangerWarning: true
  })

  if (confirmed) {
    logStore.clearLogs()
  }
}

function exportLogs() {
  logStore.exportLogs()
}

async function quickUndo() {
  const latestLog = equipmentStore.getLatestUndoableLog()
  if (!latestLog) {
    toast.info('没有可以撤销的操作')
    return
  }

  const confirmed = await showConfirm({
    title: '快速撤销',
    message: `确定要撤销以下操作吗？\n\n${latestLog.action}`,
    confirmButtonText: '确定撤销'
  })

  if (confirmed) {
    equipmentStore.quickUndo()
  }
}

async function handleUndo(log) {
  const confirmed = await showConfirm({
    title: '撤销操作',
    message: `确定要撤销以下操作吗？\n\n${log.action}`,
    confirmButtonText: '确定撤销'
  })

  if (confirmed) {
    equipmentStore.undoOperation(log.id)
  }
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

const debouncedQuickUndo = useDebounceFn(quickUndo, 300);
const debouncedExportLogs = useDebounceFn(exportLogs, 300);
const debouncedHandleUndo = useDebounceFn(handleUndo, 300);
const debouncedClose = useDebounceFn(close, 300);
const debouncedClearLogs = useDebounceFn(clearLogs, 300);

defineExpose({ show, close })
</script>

<style scoped lang="scss">
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

.log-count .undoable-count {
  color: var(--success-color, #28a745);
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

.btn-success {
  background: var(--success-color, #28a745);
  color: var(--text-white, white);
}

.btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: var(--shadow-sm);
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
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
  box-shadow: var(--shadow-sm);
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

.log-item.log-undo {
  border-left-color: var(--warning-color);
  background: var(--warning-light, #fff8e1);
}

.log-item.log-undone {
  opacity: 0.6;
  position: relative;
}

.log-item.log-undone::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 2px;
  background: var(--text-muted);
  transform: translateY(-50%);
  pointer-events: none;
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

.undone-badge {
  display: inline-block;
  padding: 2px 8px;
  margin-left: 8px;
  background: var(--text-muted);
  color: var(--text-white, white);
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
}

.log-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.log-time {
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.btn-undo {
  padding: 4px 10px;
  font-size: 0.8rem;
  background: var(--success-color, #28a745);
  color: var(--btn-success-text, white);
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 500;
}

.btn-undo:hover {
  background: var(--success-dark, #218838);
  transform: scale(1.05);
}

.old-log-tag {
  display: inline-block;
  padding: 3px 8px;
  background: var(--text-muted);
  color: var(--text-white, white);
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 500;
  opacity: 0.7;
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
