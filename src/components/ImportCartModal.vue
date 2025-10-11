<template>
  <BaseModal
    ref="modalRef"
    title="🛒 导入购物车商品"
    width="800px"
    max-height="90vh"
    :close-on-overlay-click="!isImporting"
    @close="handleClose"
  >
    <div class="import-cart-wrapper" :class="{ importing: isImporting }">
      <!-- 导入中遮罩 -->
      <div v-if="isImporting" class="importing-overlay">
        <div class="importing-spinner">
          <div class="spinner"></div>
          <p>正在导入商品到清单...</p>
          <p class="warning-text">⚠️ 请勿关闭此窗口</p>
        </div>
      </div>
          <div class="import-section">
            <h4>粘贴京东购物车分享信息</h4>
            <p class="help-text">
              <strong>📋 方式一（推荐）：</strong>直接粘贴京东分享文本<br>
              例如：【京东】https://3.cn/xxx-xxx 「我的购物清单」<br><br>
              <strong>📄 方式二：</strong>粘贴页面源代码<br>
              如果自动获取失败，打开链接 → 右键"查看网页源代码" → 全选复制 → 粘贴到此处
            </p>
            <textarea
              v-model="cartShareLink"
              placeholder="请粘贴京东购物车分享信息或完整HTML源代码"
              class="share-link-input"
              rows="10"
            ></textarea>
            <div class="action-buttons">
              <button class="btn btn-primary" @click="parseLink" :disabled="!cartShareLink.trim() || isLoading || isImporting">
                {{ isLoading ? '正在处理...' : '解析商品' }}
              </button>
              <button class="btn btn-secondary" @click="clearLink" :disabled="isImporting">清空</button>
            </div>
          </div>
  
          <div v-if="parsedItems.length > 0" class="parsed-items-section">
            <h4>解析到的商品 ({{ parsedItems.length }}件)</h4>
            <div class="item-list">
              <div v-for="(item, index) in parsedItems" :key="index" class="parsed-item">
                <span class="item-name">{{ item.name }}</span>
                <span class="item-quantity">x{{ item.quantity }}</span>
              </div>
            </div>
            <div class="import-actions">
              <button class="btn btn-primary" @click="debouncedImportCart" :disabled="isImporting">
                {{ isImporting ? '正在导入...' : '导入到清单' }}
              </button>
            </div>
          </div>
  
        <div v-if="message" :class="['info-message', messageType]">{{ message }}</div>
    </div>
  </BaseModal>
</template>
  
  <script setup>
  import { ref } from 'vue';
  import { useEquipmentStore } from '../stores/equipment';
  import { useModelConfigStore } from '../stores/modelConfig';
  import { useOperationLogStore } from '../stores/operationLog';
  import BaseModal from './BaseModal.vue';
  import { debounce } from '../utils/debounce';
  
  const equipmentStore = useEquipmentStore();
  const modelConfigStore = useModelConfigStore();
  const logStore = useOperationLogStore();
  
  const modalRef = ref(null);
  const cartShareLink = ref('');
  const parsedItems = ref([]);
  const isImporting = ref(false);
  const isLoading = ref(false);
  const message = ref('');
  const messageType = ref(''); // 'success', 'error', 'info'
  
  function show() {
    message.value = '';
    messageType.value = '';
    parsedItems.value = '';
    modalRef.value?.show();
  }
  
  /**
   * 处理关闭模态框（带导入中检查）
   */
  function handleClose() {
    if (isImporting.value) {
      // 如果正在导入，提示用户
      if (!confirm('正在导入商品，确定要取消吗？这可能导致导入不完整。')) {
        return;
      }
    }
    close();
  }

  /**
   * 关闭模态框
   */
  function close() {
    cartShareLink.value = '';
    parsedItems.value = [];
    message.value = '';
    messageType.value = '';
    modalRef.value?.close();
  }
  
  function clearLink() {
    if (isImporting.value) {
      return; // 导入中不允许清空
    }
    cartShareLink.value = '';
    parsedItems.value = [];
    message.value = '';
    messageType.value = '';
  }
  
  /**
   * 从文本中提取京东短链接
   */
  function extractJdShortLink(text) {
    // 匹配 https://3.cn/xxx 格式的短链接
    const shortLinkRegex = /https?:\/\/3\.cn\/[a-zA-Z0-9_-]+/i;
    const match = text.match(shortLinkRegex);
    return match ? match[0] : null;
  }

  /**
   * 通过代理或直接获取页面HTML
   * 注意：由于浏览器跨域限制，这里需要使用 CORS 代理或者让用户手动提供HTML
   */
  async function fetchPageHtml(url) {
    try {
      // 尝试使用 CORS 代理服务
      // 常用的公共代理：https://corsproxy.io/, https://api.allorigins.win/
      const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
      
      const response = await fetch(proxyUrl);
      if (!response.ok) {
        throw new Error(`HTTP错误: ${response.status}`);
      }
      
      const data = await response.json();
      return data.contents;
    } catch (error) {
      console.error('获取页面失败:', error);
      throw new Error('无法自动获取页面内容，请手动复制页面HTML源代码粘贴');
    }
  }

  async function parseLink() {
    isLoading.value = true;
    message.value = '正在解析...';
    messageType.value = 'info';
    parsedItems.value = [];
  
    const inputContent = cartShareLink.value.trim();
    if (!inputContent) {
      message.value = '请输入京东购物车分享信息或HTML源代码。';
      messageType.value = 'error';
      isLoading.value = false;
      return;
    }
  
    try {
      let htmlContent = inputContent;
      
      // 检查是否包含短链接
      const shortLink = extractJdShortLink(inputContent);
      
      if (shortLink) {
        // 如果找到短链接，尝试获取页面内容
        message.value = `找到链接 ${shortLink}，正在获取页面内容...`;
        messageType.value = 'info';
        
        try {
          htmlContent = await fetchPageHtml(shortLink);
          message.value = '页面内容获取成功，正在解析商品...';
        } catch (fetchError) {
          console.error('自动获取失败:', fetchError);
          message.value = `无法自动获取页面内容（跨域限制）。\n\n请按以下步骤操作：\n1️⃣ 打开链接：${shortLink}\n2️⃣ 在页面任意位置右键，选择"查看网页源代码"（或按 Ctrl+U / Cmd+Option+U）\n3️⃣ 全选源代码（Ctrl+A / Cmd+A），复制（Ctrl+C / Cmd+C）\n4️⃣ 将源代码粘贴到此处的输入框中，再次点击"解析商品"`;
          messageType.value = 'error';
          isLoading.value = false;
          return;
        }
      }
      
      // 解析HTML内容
      const extractedItems = extractItemsFromJdHtml(htmlContent);
  
      if (extractedItems.length === 0) {
        message.value = '未能从内容中解析出商品。\n如果您粘贴的是分享链接，请手动打开链接并复制完整的HTML源代码。';
        messageType.value = 'error';
      } else {
        parsedItems.value = extractedItems;
        message.value = `成功解析到 ${extractedItems.length} 件商品！`;
        messageType.value = 'success';
      }
  
    } catch (e) {
      console.error('解析失败:', e);
      message.value = `解析失败: ${e.message}`;
      messageType.value = 'error';
    } finally {
      isLoading.value = false;
    }
  }
  
  // 从京东HTML中提取商品信息的函数
  // 注意：这个函数直接从HTML字符串中提取，如果京东页面结构变化，可能需要更新
  function extractItemsFromJdHtml(htmlContent) {
    const items = [];
    // 匹配商品名称和数量的正则表达式
    // 匹配 h4 标签中的 span 内容作为商品名称，以及 num_input 的 value 作为数量
    // 改进的正则表达式，尝试更健壮地匹配商品信息
    const itemRegex = /<li[^>]*?>\s*<div class="right-spot">\s*<div class="right-wrapper">\s*<div class="short-description"[^>]*?>.*?<h4><span>([^<]+)<\/span><\/h4>.*?<input[^>]+id="num_\d+"[^>]+value="(\d+)"[^>]*?>.*?<\/li>/gs;
    let match;
  
    while ((match = itemRegex.exec(htmlContent)) !== null) {
      items.push({
        name: match[1].trim(),
        quantity: parseInt(match[2], 10),
      });
    }
    return items;
  }
  
  
  async function importItems() {
    if (parsedItems.value.length === 0) {
      message.value = '没有可导入的商品。';
      messageType.value = 'warning';
      return;
    }
  
    isImporting.value = true;
    message.value = '正在通过大模型分析并导入商品到清单...';
    messageType.value = 'info';
  
    try {
      // 调用大模型进行分类
      const categorizedItems = await callModelToCategorize(parsedItems.value);
  
      for (const item of categorizedItems) {
        let category = equipmentStore.categories.find(cat => cat.name === item.category);
  
        // 如果分类不存在，则创建新分类
        if (!category) {
          equipmentStore.addCategory(item.category, item.categoryIcon || '🛍️'); // 假设大模型会返回或我们有默认图标
          category = equipmentStore.categories.find(cat => cat.name === item.category); // 重新查找新创建的分类
        }
  
        if (category) {
          // 添加商品到分类
          equipmentStore.addItem(category.id, {
            name: item.name,
            quantity: item.quantity,
            quantityUnit: item.quantityUnit || '件',
            weight: item.weight || 0,
            weightUnit: item.weightUnit || 'g',
          });
        }
      }
  
      message.value = `成功导入 ${parsedItems.value.length} 件商品。`;
      messageType.value = 'success';
      logStore.log('import-cart', `导入了 ${parsedItems.value.length} 件购物车商品`, {
        items: parsedItems.value.map(i => i.name).join(', ')
      });
  
    } catch (e) {
      console.error('导入商品失败:', e);
      message.value = `导入商品失败: ${e.message}`;
      messageType.value = 'error';
    } finally {
      isImporting.value = false;
      // 延迟关闭模态框，让用户看到结果
      setTimeout(close, 2000);
    }
  }
  
  // 模拟调用大模型进行分类的函数
  // 实际实现会调用 modelConfigStore.testConnection 或类似的API
  async function callModelToCategorize(items) {
    // 检查是否配置了模型
    if (!modelConfigStore.settings.apiKey && !modelConfigStore.settings.apiUrl.includes('localhost')) {
      throw new Error('未配置API，请先在"⚙️ 模型配置"中配置API信息。');
    }

    const itemNames = items.map(item => item.name).join('; ');
    // 获取现有分类名称
    const existingCategories = equipmentStore.categories.map(cat => cat.name);
    const categoriesHint = existingCategories.length > 0 ? `现有分类包括：${existingCategories.join('、')}。请优先使用这些分类，如果都不适用再建议新分类。` : '';
    const prompt = `请将以下户外用品列表进行分类。对于每个商品，请给出最合适的户外装备分类（如果不存在，请建议新分类，但尽量使用常见的户外分类如"背负系统"、"睡眠系统"、"服装系统"等）。${categoriesHint}在返回的每个商品的'name'字段中，请根据产品属性保留必要的信息，例如品牌、产品名称、型号等，去除其他冗余信息。同时，如果提供的信息中不存在数量(quantity)和重量(weight)，请将这些字段留空（即设置为null或不包含）。请以JSON数组格式返回结果，每个对象包含 name, category, quantity, quantityUnit, weight, weightUnit 字段。商品列表：${itemNames}`;

    try {
        // 这里的实现需要根据实际的大模型API进行调整
        // 假设 modelConfigStore 有一个 testConnection 方法，并且它能够处理并返回结构化的JSON
        const result = await modelConfigStore.testConnection(prompt);
        const rawContent = result.content; // 假设 content 是带有markdown代码块的字符串
      let contentToParse = rawContent;

      // 尝试去除最外层的双引号，以防大模型返回的是一个被包裹在字符串字面量中的JSON
      if (contentToParse.startsWith('"```json') && contentToParse.endsWith('```"')) {
        contentToParse = contentToParse.substring(1, contentToParse.length - 1); // 移除最外层的双引号
      } else if (contentToParse.startsWith('"') && contentToParse.endsWith('"')) {
        contentToParse = contentToParse.substring(1, contentToParse.length - 1); // 移除最外层的双引号
      }

      let parsedContent;

      try {
        // 1. 尝试直接解析
        parsedContent = JSON.parse(contentToParse);
      } catch (e1) {
        // 2. 尝试从Markdown代码块中提取JSON字符串并解析
        const jsonMatch = contentToParse.match(/```json\n([\s\S]*?)\n```/);
        if (jsonMatch && jsonMatch[1]) {
          try {
            parsedContent = JSON.parse(jsonMatch[1]);
          } catch (e2) {
            // 3. 如果markdown中的JSON解析失败，尝试从第一个{}块中提取
            const braceMatch = contentToParse.match(/\{[\s\S]*\}/);
            if (braceMatch && braceMatch[0]) {
              parsedContent = JSON.parse(braceMatch[0]);
            }
          }
        } else {
          // 3. 如果没有markdown代码块，直接尝试从第一个{}块中提取
          const braceMatch = contentToParse.match(/\{[\s\S]*\}/);
          if (braceMatch && braceMatch[0]) {
            parsedContent = JSON.parse(braceMatch[0]);
          }
        }
      }

      // 确保解析结果是数组，并且包含必要的字段
      if (!Array.isArray(parsedContent)) {
        throw new Error('大模型返回的格式不正确，期望一个JSON数组。');
      }
      return parsedContent.map(item => ({
        name: item.name,
        category: item.category || '未分类', // 默认分类
        quantity: item.quantity === undefined ? null : item.quantity, // 如果大模型未提供，则为null
        quantityUnit: item.quantityUnit || null, // 如果大模型未提供，则为null
        weight: item.weight === undefined ? null : item.weight, // 如果大模型未提供，则为null
        weightUnit: item.weightUnit || null, // 如果大模型未提供，则为null
        categoryIcon: item.categoryIcon, // 允许大模型返回图标
      }));

    } catch (e) {
      console.error('调用大模型失败:', e);
      throw new Error(`大模型分析失败: ${e.message}`);
    }
  }
  
  const debouncedImportCart = debounce(importItems, 300);
  const debouncedClose = debounce(close, 300);

  defineExpose({ show, close });
  </script>
  
  <style scoped lang="scss">
  .import-cart-wrapper {
    position: relative;
  }

  // 导入中遮罩层
  .importing-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.75);
    backdrop-filter: blur(4px);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    animation: fadeIn 0.3s ease;
  }

  .importing-spinner {
    text-align: center;
    color: white;
    
    p {
      margin: 15px 0 5px 0;
      font-size: 1.1rem;
      font-weight: 500;
    }
    
    .warning-text {
      font-size: 0.95rem;
      color: #ffc107;
      margin-top: 10px;
      font-weight: 600;
    }
  }

  // 旋转加载动画
  .spinner {
    width: 50px;
    height: 50px;
    border: 4px solid rgba(255, 255, 255, 0.3);
    border-top-color: var(--primary-color, #667eea);
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
    border-radius: 10px;
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
    background: rgba(102, 126, 234, 0.05);
    border-left: 3px solid var(--primary-color);
    border-radius: 4px;
  }
  
  .share-link-input {
    width: 100%;
    padding: 12px 15px;
    border: 2px solid var(--border-color);
    border-radius: 8px;
    font-size: 1rem;
    background: var(--bg-card);
    color: var(--text-primary);
    transition: all 0.3s ease;
    box-sizing: border-box;
    resize: vertical; /* 允许 textarea 垂直调整大小 */
    min-height: 100px; /* 最小高度 */
    line-height: 1.6;

    &:focus {
      outline: none;
      border-color: var(--primary-color);
      box-shadow: 0 0 0 3px rgba(var(--primary-color-rgb), 0.1);
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
    border-radius: 8px;
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
    color: var(--text-white, white);
  
    &:not(:disabled):hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(var(--primary-color-rgb), 0.2);
    }
  }
  
  .btn-secondary {
    background: var(--text-muted, #6c757d);
    color: var(--text-white, white);
  
    &:not(:disabled):hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    }
  }
  
  .parsed-items-section {
    background: var(--bg-input);
    border-radius: 10px;
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 15px;
  
    h4 {
      margin: 0;
      color: var(--text-primary);
    }
  }
  
  .item-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
    max-height: 250px;
    overflow-y: auto;
    border: 1px solid var(--border-color);
    border-radius: 6px;
    padding: 10px;
    background: var(--bg-card);
  }
  
  .parsed-item {
    display: flex;
    justify-content: space-between;
    padding: 8px 12px;
    background: var(--bg-main);
    border-radius: 6px;
    border: 1px solid var(--border-color);
  }
  
  .item-name {
    font-weight: 500;
  }
  
  .item-quantity {
    color: var(--text-secondary);
  }
  
  .import-actions {
    display: flex;
    justify-content: center;
  }
  
  .info-message {
    padding: 15px;
    border-radius: 8px;
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