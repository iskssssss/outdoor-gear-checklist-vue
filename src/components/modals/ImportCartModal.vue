<template>
  <BaseModal ref="modalRef" title="🛒 导入购物车商品" width="1600px" max-height="110vh" :close-on-overlay-click="false"
    :disable-body-scroll="isImporting" :before-close="handleBeforeClose" @after-close="resetState">
    <div class="import-cart-wrapper" :class="{ importing: isImporting }">
      <!-- 导入中遮罩 -->
      <div v-if="isImporting" class="importing-overlay">
        <div class="importing-spinner">
          <div class="spinner"></div>
          <p>正在导入商品到清单...</p>
          <p class="warning-text">⚠️ 请勿关闭此窗口</p>
        </div>
      </div>
      <div v-if="currentStep === 'input'" class="import-section">
        <h4>粘贴京东购物车分享信息</h4>
        <p class="help-text">
          <strong>📋 方式一（推荐）：</strong>直接粘贴京东分享文本<br>
          例如：【京东】https://3.cn/xxx-xxx 「我的购物清单」<br><br>
          <strong>📄 方式二：</strong>粘贴页面源代码<br>
          如果自动获取失败，打开链接 → 右键"查看网页源代码" → 全选复制 → 粘贴到此处
        </p>
        <textarea v-model="cartShareLink" placeholder="请粘贴京东购物车分享信息或完整HTML源代码" class="share-link-input"
          rows="10"></textarea>
        <div class="action-buttons">
          <button class="btn btn-primary" @click="parseLink"
            :disabled="!cartShareLink.trim() || isLoading || isImporting">
            {{ isLoading ? '正在处理...' : '解析商品' }}
          </button>
          <button class="btn btn-secondary" @click="clearLink" :disabled="isImporting">清空</button>
        </div>
      </div>

      <div v-if="currentStep === 'select'" class="parsed-items-section">
        <div class="parsed-items-header">
          <h4>解析到的商品 ({{ parsedItems.length }}件)</h4>
          <button class="btn btn-secondary btn-sm" @click="goBackToInput">← 返回</button>
        </div>
        <div class="select-all-controls">
          <input type="checkbox" id="selectAllItems" :checked="isAllSelected" @change="toggleSelectAll"
            :disabled="parsedItems.length === 0" />
          <label for="selectAllItems">全选/取消全选</label>
        </div>
        <div class="item-list">
          <div v-for="(item, index) in parsedItems" :key="item.id" class="parsed-item">
            <input type="checkbox" :id="`item-${item.id}`" :value="item.id" v-model="selectedItems"
              class="item-checkbox" />
            <label :for="`item-${item.id}`" class="item-content">
              <div class="item-name-and-price">
                <span class="item-name">{{ item.name }}</span>
                <span v-if="item.price !== null" class="item-price">￥{{ item.price.toFixed(2) }}</span>
              </div>
              <span class="item-quantity">x{{ item.quantity }}</span>
            </label>
          </div>
        </div>
        <div class="import-actions">
          <button class="btn btn-primary" @click="debouncedAnalyze"
            :disabled="isLoading || selectedItems.length === 0">
            {{ isLoading ? '正在分析...' : `分析选中商品 (${selectedItems.length}件)` }}
          </button>
        </div>
      </div>

      <!-- 新增：分析后可编辑的列表 -->
      <div v-if="currentStep === 'edit'" class="analyzed-items-section">
        <div class="analyzed-items-header">
          <h4>编辑商品信息 <span class="header-note">(可重新计算单价)</span></h4>
          <button class="btn btn-secondary btn-sm" @click="goBackToSelect">← 返回</button>
        </div>

        <table class="edit-table">
          <thead>
            <tr>
              <th>商品名</th>
              <th class="w-category">分类</th>
              <th class="w-quantity">数量</th>
              <th class="w-unit">单位</th>
              <th class="w-price">总价</th>
              <th class="w-price">单价</th>
              <th class="w-action">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in analyzedItems" :key="item.id">
              <td>
                <input v-model="item.name" class="editable-input" />
                <div v-if="item.note" class="item-note-edit">
                  {{ item.note }}
                </div>
              </td>
              <td>
                <input v-model="item.category" class="editable-input" />
              </td>
              <td class="text-center">
                <input type="number" v-model.number="item.quantity" min="1" class="editable-input quantity" />
              </td>
              <td>
                <input v-model="item.quantityUnit" class="editable-input unit" placeholder="件" />
              </td>
              <td class="text-center">
                <input type="number" v-model.number="item.totalPrice" :placeholder="item.price ? (item.price * item.quantity).toFixed(2) : '0.00'" min="0" step="0.01" class="editable-input price" />
              </td>
              <td class="text-center">
                <span class="font-medium">{{ item.price?.toFixed(2) ?? '—' }}</span>
              </td>
              <td class="text-center">
                <button @click="recalculatePrice(item)" class="btn-recalculate">
                  重新计算
                </button>
              </td>
            </tr>
          </tbody>
        </table>

        <div class="import-actions">
          <button @click="debouncedImport" :disabled="isImporting || analyzedItems.length === 0" class="btn btn-primary">
            导入选中商品
          </button>
        </div>
      </div>


      <div v-if="message" :class="['info-message', messageType]">{{ message }}</div>
    </div>
  </BaseModal>
</template>

<script setup>
import { ref, inject, watch, computed } from 'vue';
import BaseModal from '../common/BaseModal.vue';
import { useDebounceFn } from '@vueuse/core';
import { useEquipmentStore } from '../../stores/equipment';
import { useModelConfigStore } from '../../stores/modelConfig';
import { useOperationLogStore } from '../../stores/operationLog';
import { useJdParser } from '../../composables/useJdParser';
import { useModelAnalyzer } from '../../composables/useModelAnalyzer';
import { useImporter } from '../../composables/useImporter';

const equipmentStore = useEquipmentStore();
const modelConfigStore = useModelConfigStore();
const logStore = useOperationLogStore();

const showConfirm = inject('showConfirm');
const toast = inject('toast');

const modalRef = ref(null);

// 状态
const cartShareLink = ref('');
const parsedItems = ref([]);
const selectedItems = ref([]);
const analyzedItems = ref([]);
const currentStep = ref('input');
const isLoading = ref(false);
const isImporting = ref(false);
const message = ref('');
const messageType = ref('');
const isCancelled = ref(false);

// 计算属性
const isAllSelected = computed(() =>
  parsedItems.value.length > 0 &&
  selectedItems.value.length === parsedItems.value.length
);

// composables
const { parseJdContent } = useJdParser();
const { analyzeWithModel } = useModelAnalyzer(modelConfigStore, equipmentStore);
const { importAnalyzedItems } = useImporter(equipmentStore, logStore, toast);

watch(parsedItems, (newItems) => {
  selectedItems.value = newItems.map(i => i.id);
});

function resetState() {
  cartShareLink.value = '';
  parsedItems.value = [];
  selectedItems.value = [];
  analyzedItems.value = [];
  currentStep.value = 'input';
  isLoading.value = false;
  isImporting.value = false;
  isCancelled.value = false;
  message.value = '';
  messageType.value = '';
}

function show() {
  resetState();
  modalRef.value?.show();
}

function close() {
  modalRef.value?.close();
}

async function handleBeforeClose() {
  if (isImporting.value) {
    const confirmed = await showConfirm({
      title: '取消导入',
      message: '正在导入中，确定要强制关闭吗？',
      confirmButtonText: '确定取消',
      showDangerWarning: true,
    });
    if (confirmed) isCancelled.value = true;
    return confirmed;
  }
  return true;
}

function clearLink() {
  cartShareLink.value = '';
}

async function parseLink() {
  const input = cartShareLink.value.trim();
  if (!input) {
    message.value = '请输入京东购物车分享文本或HTML代码';
    messageType.value = 'error';
    return;
  }

  isLoading.value = true;
  message.value = '正在解析中...';
  messageType.value = 'info';

  try {
    const result = await parseJdContent(input);
    if (result.length === 0) {
      message.value = '未能解析出商品，请确认输入内容。';
      messageType.value = 'error';
    } else {
      parsedItems.value = result;
      currentStep.value = 'select';
      message.value = `成功解析到 ${result.length} 件商品`;
      messageType.value = 'success';
    }
  } catch (err) {
    message.value = `解析失败: ${err.message}`;
    messageType.value = 'error';
  } finally {
    isLoading.value = false;
  }
}

const debouncedAnalyze = useDebounceFn(async () => {
  if (selectedItems.value.length === 0) return;
  isLoading.value = true;
  message.value = '正在分析商品，请稍候...';
  try {
    const items = parsedItems.value.filter(i => selectedItems.value.includes(i.id));
    const results = await analyzeWithModel(items);
    // Add totalPrice to each item
    analyzedItems.value = results.map(item => ({
      ...item,
      totalPrice: (item.price && item.quantity) ? parseFloat((item.price * item.quantity).toFixed(2)) : null
    }));
    currentStep.value = 'edit';
    message.value = '分析完成，可手动编辑';
    messageType.value = 'success';
  } catch (err) {
    message.value = `分析失败: ${err.message}`;
    messageType.value = 'error';
  } finally {
    isLoading.value = false;
  }
}, 300);

const debouncedImport = useDebounceFn(async () => {
  if (analyzedItems.value.length === 0) return;
  try {
    await importAnalyzedItems(analyzedItems.value, isCancelled, isImporting);
    toast.success(`成功导入 ${analyzedItems.value.length} 件商品`);
    close();
  } catch (err) {
    message.value = err.message;
    messageType.value = 'error';
  }
}, 300);

function goBackToInput() {
  currentStep.value = 'input';
  parsedItems.value = [];
  selectedItems.value = [];
  analyzedItems.value = [];
  message.value = '';
  messageType.value = '';
}

function goBackToSelect() {
  currentStep.value = 'select';
  analyzedItems.value = [];
  message.value = `当前已解析 ${parsedItems.value.length} 件商品`;
  messageType.value = 'success';
}

function recalculatePrice(item) {
  if (item.totalPrice === null || item.totalPrice === undefined) {
    toast.warning('请先填写总价');
    return;
  }

  // Detect bundle quantity from name or use existing quantity
  const match = item.name.match(/(\d+|[一二三四五六七八九十]+)\s*(支|包|件|个|对|瓶|片|条|套)/u);
  let count = item.quantity;
  let unit = item.quantityUnit || '件';

  if (match) {
    let num = match[1];
    if (isNaN(num)) {
      const map = { '一': 1, '二': 2, '三': 3, '四': 4, '五': 5, '六': 6, '七': 7, '八': 8, '九': 9, '十': 10 };
      num = map[num] ?? 1;
    }
    count = Number(num);
    unit = match[2];
  }

  if (count <= 0) {
    toast.error('数量必须大于 0');
    return;
  }

  const unitPrice = item.totalPrice / count;
  item.price = parseFloat(unitPrice.toFixed(2));
  item.quantity = count; // Also update quantity
  item.quantityUnit = unit; // Update unit as well
  item.note = `(手动修正: ${count}${unit}套装单价)`;

  toast.success(`已重新计算单价为 ${item.price.toFixed(2)} 元`);
}

function toggleSelectAll() {
  selectedItems.value = isAllSelected.value
    ? []
    : parsedItems.value.map(i => i.id);
}

defineExpose({ show, close });
</script>

<style scoped lang="scss">
.import-cart-wrapper {
  position: relative;
  display: flex;
  // 新增：使用Flexbox布局
  flex-direction: column;
  // 新增：垂直堆叠子元素
  gap: 20px;
  // 新增：子元素之间的间距
}

.analyzed-items-section {
  background: var(--bg-input);
  border-radius: var(--border-radius-lg);
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 15px;

  .analyzed-items-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    h4 {
      margin: 0;
      color: var(--text-primary);
    }
    .header-note {
      font-size: 0.85rem;
      color: var(--text-secondary);
      font-weight: 400;
      margin-left: 8px;
    }
  }
}

.edit-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;

  th, td {
    padding: 10px 8px;
    border-bottom: var(--border-width) solid var(--border-color);
    text-align: left;
  }

  thead th {
    background-color: var(--bg-input);
    font-weight: 500;
  }

  tbody tr:hover {
    background-color: var(--bg-hover);
  }

  .w-category { width: 120px; }
  .w-quantity { width: 80px; }
  .w-unit { width: 80px; }
  .w-price { width: 100px; }
  .w-action { width: 100px; }
  .text-center { text-align: center; }
  .font-medium { font-weight: 500; }
}

.item-note-edit {
  font-size: 0.8rem;
  color: var(--warning-color);
  margin-top: 4px;
  font-style: italic;
}

.btn-recalculate {
  background: none;
  border: none;
  color: var(--primary-color);
  text-decoration: underline;
  cursor: pointer;
  font-size: 0.85rem;
  padding: 4px;

  &:hover {
    color: var(--primary-dark);
  }
}

.editable-item-list {
  max-height: 300px;
  overflow-y: auto;
}

.analyzed-item {
  display: grid;
  grid-template-columns: 2fr 1fr 0.5fr 0.5fr;
  gap: 10px;
  align-items: center;
  padding: 8px;
  border-bottom: var(--border-width) solid var(--border-color);

  &:last-child {
    border-bottom: none;
  }
}

.item-details {
  display: flex;
  flex-direction: column;
}

.item-note {
  font-size: 0.8rem;
  color: var(--text-muted);
  margin-top: 4px;
}

.editable-input {
  width: 100%;
  padding: 8px 10px;
  border: var(--border-width) solid var(--border-color);
  border-radius: var(--border-radius);
  background: var(--bg-card);
  color: var(--text-primary);
  font-size: 0.9rem;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px var(--primary-color-shadow);
  }

  &.quantity,
  &.price,
  &.unit {
    // 数量和价格输入框可以窄一些
    max-width: 80px;
  }
}

// 导入中遮罩层
.importing-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--bg-overlay, rgba(0, 0, 0, 0.75));
  backdrop-filter: blur(4px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease;
}

.importing-spinner {
  text-align: center;
  color: var(--text-white);

  p {
    margin: 15px 0 5px 0;
    font-size: 1.1rem;
    font-weight: 500;
  }

  .warning-text {
    font-size: 0.95rem;
    color: var(--warning-color);
    margin-top: 10px;
    font-weight: 600;
  }
}

// 旋转加载动画
.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid var(--bg-input);
  border-top-color: var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.import-section {
  background: var(--bg-input);
  border-radius: var(--border-radius-lg);
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.import-section h4 {
  margin: 0;
  color: var(--text-primary);
}

.help-text {
  font-size: 0.9rem;
  color: var(--text-secondary);
  line-height: 1.6;
  margin: 0;
  padding: 10px;
  background: var(--primary-light, rgba(102, 126, 234, 0.05));
  border-left: 3px solid var(--primary-color);
  border-radius: var(--border-radius-sm);
}

.share-link-input {
  width: 100%;
  padding: 12px 15px;
  border: 2px solid var(--border-color);
  border-radius: var(--border-radius-lg);
  font-size: 1rem;
  background: var(--bg-card);
  color: var(--text-primary);
  transition: all 0.3s ease;
  box-sizing: border-box;
  resize: vertical;
  // 允许 textarea 垂直调整大小
  min-height: 100px;
  // 最小高度
  line-height: 1.6;

  &:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px var(--primary-color-shadow);
  }
}

.action-buttons {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.btn {
  padding: 10px 24px;
  border: none;
  border-radius: var(--border-radius-sm);
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

.btn-primary {
  background: var(--primary-color);
  color: var(--text-white);

  &:not(:disabled):hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px var(--primary-color-shadow);
  }
}

.btn-secondary {
  background: var(--text-muted, #6c757d);
  color: var(--text-white, white);

  &:not(:disabled):hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
  }
}

.parsed-items-section {
  background: var(--bg-input);
  border-radius: var(--border-radius-lg);
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 15px;

  .parsed-items-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    // 允许换行
    gap: 10px;
    // 元素间距

    h4 {
      margin: 0;
      color: var(--text-primary);
    }
  }
}

.item-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 250px;
  overflow-y: auto;
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-sm);
  padding: 10px;
  background: var(--bg-card);
}

.select-all-controls {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 15px;
  padding-left: 5px;

  input[type="checkbox"] {
    cursor: pointer;
    width: 18px;
    height: 18px;
    accent-color: var(--primary-color);
    // 选中颜色使用主题色
  }

  label {
    font-size: 0.95rem;
    color: var(--text-primary);
    cursor: pointer;
  }
}

.item-checkbox {
  margin-right: 12px;
  cursor: pointer;
  width: 16px;
  height: 16px;
  accent-color: var(--primary-color);
  // 选中颜色使用主题色
}

.item-content {
  display: flex;
  flex-grow: 1;
  justify-content: space-between;
  align-items: center;
}

.parsed-item {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  background: var(--bg-card);
  border-radius: var(--border-radius-sm);
  border: 1px solid var(--border-color);
  transition: all 0.2s ease;

  &:hover {
    background: var(--bg-hover);
    border-color: var(--primary-color);
  }
}

.item-name {
  font-weight: 500;
  color: var(--text-primary);
  flex-grow: 1;
  // 允许名称占据更多空间
  margin-right: 10px;
  // 与数量的间距
}

.item-name-and-price {
  display: flex;
  align-items: baseline;
  flex-grow: 1;
  gap: 10px;
}

.item-price {
  color: var(--danger-color, #dc3545);
  font-weight: 600;
  white-space: nowrap;
}

.item-quantity {
  color: var(--text-secondary);
  // 明确设置次要文本颜色
  white-space: nowrap;
  // 防止数量换行
}

.import-actions {
  display: flex;
  justify-content: flex-end;
  // 修改为居右对齐
  margin-top: 10px;
  // 增加与商品列表的间距
}

.info-message {
  padding: 15px;
  border-radius: var(--border-radius-sm);
  text-align: center;
  font-weight: 500;
  line-height: 1.5;
}

.info-message.info {
  background: var(--info-light, #d1ecf1);
  color: var(--info-color, #17a2b8);
  border: 1px solid var(--info-color);
}

.info-message.success {
  background: var(--success-light, #d4edda);
  color: var(--success-color, #28a745);
  border: 1px solid var(--success-color);
}

.info-message.error {
  background: var(--danger-light, #f8d7da);
  color: var(--danger-color, #dc3545);
  border: 1px solid var(--danger-color);
}

.info-message.warning {
  background: var(--warning-light, #fff3cd);
  color: var(--warning-color, #ffc107);
  border: 1px solid var(--warning-color);
}

@media (max-width: 768px) {

  .action-buttons {
    flex-direction: column;

    .btn {
      width: 100%;
    }
  }

  .import-actions .btn {
    width: 100%;
  }
}
</style>