<template>
  <BaseModal ref="modalRef" title="⚙️ 模型配置" width="800px" max-height="90vh" :close-on-overlay-click="false"
    @close="handleClose">
    <BaseTabs v-model="activeTab" :tabs="tabs" />

    <!-- 基础配置标签页 -->
    <div v-show="activeTab === 'basic'" class="config-tab">
      <BaseAlert type="info" title="💾 自动保存到本地存储">
        所有配置信息都会保存到浏览器本地缓存，刷新页面后自动恢复。
      </BaseAlert>
      <BaseAlert type="warning" title="📘 OpenAI接口规范">
        本应用遵循OpenAI标准API格式。所有API提供商（DeepSeek、OpenAI等）都应兼容OpenAI规范，使用标准的Bearer认证和messages格式。
      </BaseAlert>
      <div class="config-section">
        <h4>基本配置</h4>
        <div class="setting-group">
          <BaseInput v-model="localSettings.apiUrl" label="API URL：" 
            placeholder="https://api.deepseek.com/v1" 
            hint="基础URL，系统将自动拼接 /chat/completions"
            prefixIcon="🔗"
            clearable />
        </div>
        <div class="setting-group">
          <BaseInput type="password" v-model="localSettings.apiKey" label="API Key：" 
            placeholder="sk-xxxxxxxxxxxxxxxx" 
            hint="格式：sk-开头的密钥"
            prefixIcon="🔑"
            clearable />
        </div>
        <div class="setting-group">
          <BaseInput v-model="localSettings.modelName" label="模型名称：" 
            placeholder="deepseek-chat" 
            hint="如：deepseek-chat, gpt-3.5-turbo等"
            prefixIcon="🤖"
            clearable />
        </div>
      </div>
    </div>

    <!-- 高级配置标签页 -->
    <div v-show="activeTab === 'advanced'" class="config-tab">
      <div class="config-section">
        <h4>请求参数</h4>
        <div class="setting-group">
          <BaseInput type="number" v-model.number="localSettings.maxTokens" label="最大Token：" 
            placeholder="1000"
            prefixIcon="📊"
            hint="建议范围: 100-4000" />
        </div>
        <div class="setting-group">
          <BaseInput type="number" v-model.number="localSettings.temperature" label="温度：" 
            placeholder="0.7"
            prefixIcon="🌡️"
            hint="范围: 0-2，越高越随机" />
        </div>
        <div class="setting-group">
          <BaseTextarea v-model="localSettings.customHeaders" label="请求头："
            placeholder='{"Authorization": "Bearer your-key", "Content-Type": "application/json"}' 
            :rows="3"
            :maxlength="500"
            :showCount="true"
            hint="JSON 格式的自定义请求头" />
        </div>
        <div class="setting-group">
          <BaseTextarea v-model="localSettings.requestTemplate" label="请求体模板："
            placeholder='{"model": "{{model}}", "messages": [{"role": "user", "content": "{{prompt}}"}], "max_tokens": {{max_tokens}}, "temperature": {{temperature}}}'
            :rows="4"
            :maxlength="1000"
            :showCount="true"
            hint="支持变量: {{model}}, {{prompt}}, {{max_tokens}}, {{temperature}}" />
        </div>
      </div>

      <div class="config-section">
        <h4>响应解析</h4>
        <div class="setting-group">
          <BaseSelect v-model="localSettings.responseParser" label="响应解析器："
            :options="[
              { label: 'OpenAI格式', value: 'openai' },
              { label: 'Claude格式', value: 'claude' },
              { label: '自定义解析', value: 'custom' }
            ]" />
        </div>
        <div class="setting-group">
          <BaseInput v-model="localSettings.responsePath" label="响应路径："
            placeholder="choices[0].message.content 或 content[0].text"
            prefixIcon="📍"
            clearable
            hint="用于从响应中提取内容的路径" />
        </div>
      </div>
    </div>

    <!-- 连接测试标签页 -->
    <div v-show="activeTab === 'test'" class="config-tab">
      <div class="config-section">
        <h4>连接测试</h4>
        <div class="test-area">
          <BaseTextarea v-model="testPrompt" placeholder="输入测试提示词..." 
            :rows="3"
            :maxlength="500"
            :showCount="true"
            hint="输入任意测试内容验证API连接" />
          <BaseButton variant="primary" :loading="isTestingConnection" @click="testConnection" :disabled="isTestingConnection">
            {{ isTestingConnection ? '正在测试...' : '测试连接' }}
          </BaseButton>
          <div v-if="testResult" class="test-result" :class="testResultType">
            {{ testResult }}
          </div>
        </div>
      </div>
    </div>

    <!-- 配置操作按钮组（数据驱动） -->
    <div class="config-actions">
      <BaseButtonGroup :buttons="configActionButtons" justify="end" />
    </div>
  </BaseModal>
</template>

<script setup>
import { ref, inject, computed } from 'vue'
import { useModelConfigStore } from '@/stores/modelConfig.js'
import { BaseModal, BaseTabs, BaseButton, BaseInput, BaseTextarea, BaseSelect, BaseAlert, BaseButtonGroup } from '@/components/common'

const modelConfigStore = useModelConfigStore()
const toast = inject('toast')

const modalRef = ref(null)
const activeTab = ref('basic')
const localSettings = ref({});
const localPreferences = ref({});
const testPrompt = ref('')
const isTestingConnection = ref(false)
const testResult = ref('')
const testResultType = ref('')
const isLoading = ref(false)

const tabs = [
  { label: '基础配置', value: 'basic' },
  { label: '高级配置', value: 'advanced' },
  { label: '连接测试', value: 'test' }
];

const isChanged = computed(() => {
  return JSON.stringify(localSettings.value) !== JSON.stringify(modelConfigStore.settings) ||
    JSON.stringify(localPreferences.value) !== JSON.stringify(modelConfigStore.recommendationPreferences)
})

// ==================== 数据驱动的按钮组配置 ====================

// 配置操作按钮组
const configActionButtons = computed(() => [
  {
    value: 'save',
    label: '保存配置',
    variant: 'primary',
    disabled: !isChanged.value || isLoading.value,
    loading: isLoading.value,
    handler: saveConfig
  },
  {
    value: 'reset',
    label: '重置配置',
    variant: 'secondary',
    disabled: !isChanged.value || isLoading.value,
    handler: resetConfig
  },
  {
    value: 'close',
    label: '取消',
    variant: 'secondary',
    handler: close
  }
])

// ==================== 数据驱动配置结束 ====================;

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
  // 添加重置后的提示
  toast?.info('本地配置已重置为默认值');
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
  border-radius: var(--border-radius-sm);
  margin-bottom: 20px;
  line-height: 1.6;
}

.config-info.warning {
  background: var(--warning-light);
  border-left-color: var(--warning-color);
  color: var(--warning-text);
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
  border-radius: var(--border-radius-sm);
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
  box-shadow: 0 0 0 3px var(--primary-color-shadow);
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
  border-radius: var(--border-radius-sm);
  font-size: 1rem;
  resize: vertical;
  background: var(--bg-input);
  color: var(--text-primary);
}

.test-result {
  padding: 20px;
  border-radius: var(--border-radius);
  white-space: pre-line;
  line-height: 1.6;
}

.test-result.loading {
  background: var(--bg-input);
  color: var(--primary-color);
}

.test-result.success {
  background: var(--success-light);
  color: var(--success-text);
}

.test-result.error {
  background: var(--danger-light);
  color: var(--danger-text);
}

.config-actions {
  display: flex;
  gap: 10px;
  justify-content: center;
  margin-top: 25px;
  padding-top: 25px;
  border-top: 2px solid var(--border-color);
}

// BaseButton 已接管所有按钮样式

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
