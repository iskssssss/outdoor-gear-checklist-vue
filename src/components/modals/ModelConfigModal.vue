<template>
  <BaseModal
    ref="modalRef"
    title="⚙️ 模型配置"
    width="800px"
    max-height="90vh"
    :close-on-overlay-click="false"
    @close="handleClose"
  >
        <div class="config-tabs">
          <button 
            class="tab-btn" 
            :class="{ active: activeTab === 'basic' }"
            @click="activeTab = 'basic'"
          >
            基础配置
          </button>
          <button 
            class="tab-btn" 
            :class="{ active: activeTab === 'advanced' }"
            @click="activeTab = 'advanced'"
          >
            高级配置
          </button>
          <button 
            class="tab-btn" 
            :class="{ active: activeTab === 'test' }"
            @click="activeTab = 'test'"
          >
            连接测试
          </button>
        </div>

        <!-- 基础配置标签页 -->
        <div v-show="activeTab === 'basic'" class="config-tab">
          <div class="config-info">
            <strong>💾 自动保存到本地存储</strong>
            所有配置信息都会保存到浏览器本地缓存，刷新页面后自动恢复。
          </div>
          <div class="config-info warning">
            <strong>📘 OpenAI接口规范</strong>
            本应用遵循OpenAI标准API格式。所有API提供商（DeepSeek、OpenAI等）都应兼容OpenAI规范，使用标准的Bearer认证和messages格式。
          </div>
          <div class="config-section">
            <h4>基本配置</h4>
            <div class="setting-group">
              <label>API URL：</label>
              <input 
                type="text" 
                v-model="localSettings.apiUrl" 
                placeholder="https://api.deepseek.com/v1"
              >
              <small>基础URL，系统将自动拼接 /chat/completions</small>
            </div>
            <div class="setting-group">
              <label>API Key：</label>
              <input 
                type="password" 
                v-model="localSettings.apiKey" 
                placeholder="sk-xxxxxxxxxxxxxxxx"
              >
              <small>格式：sk-开头的密钥</small>
            </div>
            <div class="setting-group">
              <label>模型名称：</label>
              <input 
                type="text" 
                v-model="localSettings.modelName" 
                placeholder="deepseek-chat"
              >
              <small>如：deepseek-chat, gpt-3.5-turbo等</small>
            </div>
          </div>
        </div>

        <!-- 高级配置标签页 -->
        <div v-show="activeTab === 'advanced'" class="config-tab">
          <div class="config-section">
            <h4>请求参数</h4>
            <div class="setting-group">
              <label>最大Token：</label>
              <input 
                type="number" 
                v-model.number="localSettings.maxTokens" 
                placeholder="1000" 
                min="100" 
                max="4000"
              >
            </div>
            <div class="setting-group">
              <label>温度：</label>
              <input 
                type="number" 
                v-model.number="localSettings.temperature" 
                placeholder="0.7" 
                min="0" 
                max="2" 
                step="0.1"
              >
            </div>
            <div class="setting-group">
              <label>请求头：</label>
              <textarea 
                v-model="localSettings.customHeaders" 
                placeholder='{"Authorization": "Bearer your-key", "Content-Type": "application/json"}' 
                rows="3"
              ></textarea>
            </div>
            <div class="setting-group">
              <label>请求体模板：</label>
              <textarea 
                v-model="localSettings.requestTemplate" 
                placeholder='{"model": "{{model}}", "messages": [{"role": "user", "content": "{{prompt}}"}], "max_tokens": {{max_tokens}}, "temperature": {{temperature}}}' 
                rows="4"
              ></textarea>
            </div>
          </div>
          
          <div class="config-section">
            <h4>响应解析</h4>
            <div class="setting-group">
              <label>响应解析器：</label>
              <select v-model="localSettings.responseParser">
                <option value="openai">OpenAI格式</option>
                <option value="claude">Claude格式</option>
                <option value="custom">自定义解析</option>
              </select>
            </div>
            <div class="setting-group">
              <label>响应路径：</label>
              <input 
                type="text" 
                v-model="localSettings.responsePath" 
                placeholder="choices[0].message.content 或 content[0].text"
              >
            </div>
          </div>
        </div>

        <!-- 连接测试标签页 -->
        <div v-show="activeTab === 'test'" class="config-tab">
          <div class="config-section">
            <h4>连接测试</h4>
            <div class="test-area">
              <textarea 
                v-model="testPrompt" 
                placeholder="输入测试提示词..." 
                rows="3"
              ></textarea>
              <button 
                class="btn btn-primary" 
                @click="testConnection"
                :disabled="isTestingConnection"
              >
                {{ isTestingConnection ? '正在测试...' : '测试连接' }}
              </button>
              <div v-if="testResult" class="test-result" :class="testResultType">
                {{ testResult }}
              </div>
            </div>
          </div>
        </div>

        <div class="config-actions">
          <button class="btn btn-primary" @click="saveConfig" :disabled="!isChanged || isLoading">保存配置</button>
          <button class="btn btn-secondary" @click="resetConfig" :disabled="!isChanged || isLoading">重置配置</button>
          <button class="btn btn-secondary" @click="close">取消</button>
        </div>
  </BaseModal>
</template>

<script setup>
import { ref, reactive, inject, computed } from 'vue'
import { useModelConfigStore } from '../../stores/modelConfig'
import { defaultTestPrompt } from '../../config/appConfig'
import BaseModal from '../common/BaseModal.vue'
import { debounce } from '../../utils/debounce';

const modelConfigStore = useModelConfigStore()
const toast = inject('toast')

const modalRef = ref(null)
const activeTab = ref('basic')
const localSettings = ref({});
const localPreferences = ref({});

const isChanged = computed(() => {
  return JSON.stringify(localSettings.value) !== JSON.stringify(modelConfigStore.settings) ||
         JSON.stringify(localPreferences.value) !== JSON.stringify(modelConfigStore.recommendationPreferences)
});

function show() {
  localSettings.value = { ...modelConfigStore.settings };
  localPreferences.value = { ...modelConfigStore.recommendationPreferences };
  modalRef.value?.show();
}

function close() {
  modalRef.value?.close()
}

function handleClose() {
  // 额外的关闭逻辑（如果需要）
}

function saveConfig() {
  modelConfigStore.saveSettings(localSettings.value);
  modelConfigStore.savePreferences(localPreferences.value);
  toast?.success('模型配置和偏好设置已保存');
  
  setTimeout(() => {
    close();
  }, 300);
}

function resetConfig() {
  localSettings.value = { ...modelConfigStore.defaultSettings };
  localPreferences.value = { ...modelConfigStore.defaultRecommendationPreferences };
  toast?.info('本地配置已重置为默认值'); // 添加重置后的提示
}

async function testConnection() {
  if (!testPrompt.value.trim()) {
    testResultType.value = 'error'
    testResult.value = '请输入测试提示词'
    return
  }

  isTestingConnection.value = true
  testResultType.value = 'loading'
  testResult.value = '正在测试连接...\n\n正在发送请求...'

  try {
    // 临时应用当前设置
    const tempSettings = { ...modelConfigStore.settings };
    const currentSettings = { ...localSettings.value };
    
    const result = await modelConfigStore.testConnection(testPrompt.value, currentSettings);
    
    testResultType.value = 'success';
    testResult.value = `✅ 连接成功！\n\n🤖 模型响应：\n${result.content}\n\n━━━━━━━━━━━━━━━━━━\n📊 请求信息：\n• 基础URL: ${currentSettings.apiUrl}\n• 完整URL: ${result.apiUrl}\n• 模型: ${result.modelName}\n• 温度: ${result.temperature}\n• Max Tokens: ${result.maxTokens}`;
    
    Object.assign(modelConfigStore.settings, tempSettings);
  } catch (err) {
    testResultType.value = 'error'
    testResult.value = err.message || '连接失败'
  } finally {
    isTestingConnection.value = false
  }
}

defineExpose({ show, close })
</script>

<style scoped lang="scss">
.config-tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 25px;
  border-bottom: 2px solid var(--border-color);
}

.tab-btn {
  padding: 12px 24px;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  border-bottom: 3px solid transparent;
}

.tab-btn.active {
  color: var(--primary-color);
  border-bottom-color: var(--primary-color);
}

.tab-btn:hover {
  color: var(--primary-color);
}

.config-tab {
  animation: fadeIn 0.3s ease;
}

.config-info {
  padding: 15px;
  background: var(--bg-input);
  border-left: 4px solid var(--primary-color);
  border-radius: 6px;
  margin-bottom: 20px;
  line-height: 1.6;
}

.config-info.warning {
  background: var(--warning-light, #fff3cd);
  border-left-color: var(--warning-color, #ffc107);
  color: var(--warning-text, #856404);
}

.config-section {
  margin-bottom: 25px;
}

.config-section h4 {
  margin: 0 0 15px 0;
  color: var(--text-primary);
  font-size: 1.1rem;
}

.setting-group {
  margin-bottom: 20px;
}

.setting-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: var(--text-secondary);
}

.setting-group input,
.setting-group select,
.setting-group textarea {
  width: 100%;
  padding: 10px 15px;
  border: 2px solid var(--border-color);
  border-radius: 6px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: var(--bg-input);
  color: var(--text-primary);
}

.setting-group input:focus,
.setting-group select:focus,
.setting-group textarea:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.setting-group small {
  display: block;
  margin-top: 5px;
  color: var(--text-secondary);
  font-size: 0.85rem;
}

.test-area {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.test-area textarea {
  width: 100%;
  padding: 12px 15px;
  border: 2px solid var(--border-color);
  border-radius: 6px;
  font-size: 1rem;
  resize: vertical;
  background: var(--bg-input);
  color: var(--text-primary);
}

.test-result {
  padding: 20px;
  border-radius: 8px;
  white-space: pre-line;
  line-height: 1.6;
}

.test-result.loading {
  background: var(--bg-input);
  color: var(--primary-color);
}

.test-result.success {
  background: var(--success-light, #d4edda);
  color: var(--success-text, #155724);
}

.test-result.error {
  background: var(--danger-light, #f8d7da);
  color: var(--danger-text, #721c24);
}

.config-actions {
  display: flex;
  gap: 10px;
  justify-content: center;
  margin-top: 25px;
  padding-top: 25px;
  border-top: 2px solid var(--border-color);
}

.btn {
  padding: 12px 30px;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background: var(--primary-color);
  color: var(--text-white, white);
}

.btn-secondary {
  background: var(--text-muted, #6c757d);
  color: var(--text-white, white);
}

.btn:not(:disabled):hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

@media (max-width: 768px) {
  .config-tabs {
    flex-wrap: wrap;
  }
  
  .tab-btn {
    flex: 1;
    min-width: 100px;
  }
}
</style>

