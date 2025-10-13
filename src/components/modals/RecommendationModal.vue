<template>
  <BaseModal ref="modalRef" title="🤖 智能装备推荐" width="800px" max-height="90vh" :close-on-overlay-click="false"
    @close="handleClose">
    <div class="recommendation-settings">
      <h4>推荐设置</h4>
      <div class="setting-group">
        <label>活动类型：</label>
        <InputSelect v-model="prefs.activityType" :options="allActivityTypeOptions" category="activityType"
          placeholder="选择或输入活动类型" @update:modelValue="savePreferences" @addCustomOption="handleAddCustomOption" />
      </div>
      <div class="setting-group">
        <label>季节：</label>
        <InputSelect v-model="prefs.season" :options="allSeasonOptions" category="season" placeholder="选择或输入季节"
          @update:modelValue="savePreferences" @addCustomOption="handleAddCustomOption" />
      </div>
      <div class="setting-group">
        <label>天气条件：</label>
        <InputSelect v-model="prefs.weather" :options="allWeatherOptions" category="weather" placeholder="选择或输入天气条件"
          @update:modelValue="savePreferences" @addCustomOption="handleAddCustomOption" />
      </div>
      <div class="setting-group">
        <label>难度等级：</label>
        <InputSelect v-model="prefs.difficulty" :options="allDifficultyOptions" category="difficulty"
          placeholder="选择或输入难度等级" @update:modelValue="savePreferences" @addCustomOption="handleAddCustomOption" />
      </div>
      <div class="setting-group">
        <label>预算范围：</label>
        <InputSelect v-model="prefs.budget" :options="allBudgetOptions" category="budget" placeholder="选择或输入预算范围"
          @update:modelValue="savePreferences" @addCustomOption="handleAddCustomOption" />
      </div>
    </div>


    <div class="config-info">
      <strong>⚙️ 使用模型配置</strong>
      推荐功能将使用"⚙️ 模型配置"中保存的API设置。如需修改API配置，请点击顶部"⚙️ 模型配置"按钮。
    </div>

    <div class="recommendation-actions">
      <button class="btn btn-primary" @click="debouncedGetRecommendations" :disabled="isLoading">
        {{ isLoading ? '正在获取推荐...' : '获取推荐' }}
      </button>
      <button class="btn btn-secondary" @click="debouncedClose">取消</button>
    </div>

    <div v-if="showResults" class="recommendation-results">
      <h4>推荐结果</h4>
      <div v-if="isLoading" class="loading">
        正在分析您的装备清单并生成推荐...
      </div>
      <div v-else-if="error" class="error">
        {{ error }}
      </div>
      <div v-else-if="recommendations.length === 0" class="success">
        您的装备清单已经很完善了！
      </div>
      <div v-else class="recommendation-content">
        <!-- <div class="recommendation-actions add-to-list-actions">
              <button class="btn btn-primary" @click="addRecommendationsToEquipment">
                添加到清单
              </button>
            </div> -->
        <div v-for="(rec, index) in recommendations" :key="index" class="recommendation-item"
          :style="getItemStyle(rec.priority)">
          <div class="recommendation-header">
            <span class="recommendation-number">{{ index + 1 }}</span>
            <h5 class="recommendation-title">{{ rec.title }}</h5>
            <span class="priority-badge" :style="getBadgeStyle(rec.priority)">
              {{ getPriorityIcon(rec.priority) }} {{ getPriorityLabel(rec.priority) }}
            </span>
          </div>
          <p class="recommendation-description">{{ rec.description }}</p>
        </div>
      </div>
    </div>
  </BaseModal>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useModelConfigStore } from '../../stores/modelConfig'
import { useEquipmentStore } from '../../stores/equipment'
import { activityTypeOptions, seasonOptions, weatherOptions, difficultyOptions, budgetOptions } from '../../config/appConfig'
import InputSelect from '../common/form/InputSelect.vue'
import BaseModal from '../common/feedback/BaseModal.vue'
import { useDebounceFn } from '@vueuse/core';

const modelConfigStore = useModelConfigStore()
const equipmentStore = useEquipmentStore()

const modalRef = ref(null)
const showResults = ref(false)
const isLoading = ref(false)
const error = ref('')
const recommendations = ref([])

const prefs = computed(() => modelConfigStore.recommendationPreferences)
const customOptions = computed(() => modelConfigStore.customRecommendationOptions)

const allActivityTypeOptions = computed(() => [
  ...activityTypeOptions,
  ...customOptions.value.activityType
]);
const allSeasonOptions = computed(() => [
  ...seasonOptions,
  ...customOptions.value.season
]);
const allWeatherOptions = computed(() => [
  ...weatherOptions,
  ...customOptions.value.weather
]);
const allDifficultyOptions = computed(() => [
  ...difficultyOptions,
  ...customOptions.value.difficulty
]);
const allBudgetOptions = computed(() => [
  ...budgetOptions,
  ...customOptions.value.budget
]);

// Functions to handle custom options from InputSelect
function handleAddCustomOption(category, value, label) {
  modelConfigStore.addCustomOption(category, value, label);
}

// 优先级配置 - 使用CSS变量以支持主题切换
const priorityConfig = computed(() => {
  const style = getComputedStyle(document.documentElement)

  // 获取主题颜色，如果不存在则使用默认值
  const dangerColor = style.getPropertyValue('--danger-color').trim()
  const warningColor = style.getPropertyValue('--warning-color').trim()
  const successColor = style.getPropertyValue('--success-color').trim()
  const infoColor = style.getPropertyValue('--info-color').trim()

  return {
    'critical': {
      icon: '🔴',
      label: '必备',
      color: dangerColor,
      // 使用半透明背景，更符合主题
      bg: `${dangerColor}15`
    },
    'high': {
      icon: '🟠',
      label: '重要',
      color: warningColor,
      bg: `${warningColor}15`
    },
    'medium': {
      icon: '🟡',
      label: '建议',
      color: infoColor,
      bg: `${infoColor}15`
    },
    'low': {
      icon: '🟢',
      label: '可选',
      color: successColor,
      bg: `${successColor}15`
    }
  }
})

function show() {
  error.value = ''
  if (modelConfigStore.lastRecommendations.length > 0) {
    recommendations.value = modelConfigStore.lastRecommendations;
    showResults.value = true;
  } else {
    showResults.value = false;
  }
  modalRef.value?.show()
}

function close() {
  modalRef.value?.close()
}

function handleClose() {
  // 额外的关闭逻辑（如果需要）
}

function savePreferences() {
  modelConfigStore.savePreferences()
}

async function getRecommendations() {
  // 检查是否配置了模型
  if (!modelConfigStore.settings.apiKey && !modelConfigStore.settings.apiUrl.includes('localhost')) {
    showResults.value = true
    error.value = '未配置API\n\n请先在"⚙️ 模型配置"中配置API信息（URL、Key、模型名称）后再使用推荐功能。'
    return
  }

  isLoading.value = true
  showResults.value = true
  error.value = ''

  try {
    // 使用在线或离线推荐
    const hasApiConfig = modelConfigStore.settings.apiUrl && modelConfigStore.settings.apiKey

    if (!hasApiConfig) {
      // 离线模式
      recommendations.value = getOfflineRecommendations()
    } else {
      // 在线模式
      recommendations.value = await getOnlineRecommendations()
    }

    // 保存推荐结果
    modelConfigStore.saveRecommendations(recommendations.value);

    // AI推荐是查询操作，不记录日志
  } catch (err) {
    error.value = err.message || '获取推荐失败'
    console.error('获取推荐失败:', err)
  } finally {
    isLoading.value = false
  }
}

function getOfflineRecommendations() {
  const currentItems = equipmentStore.categories.flatMap(cat => cat.items)
  const itemNames = currentItems.map(item => item.name.toLowerCase())

  const recommendations = []

  // 基础必备装备检查
  const essentials = [
    { name: '登山鞋', title: '户外鞋/登山鞋', description: '适合路况的专业户外鞋，提供足够的支撑和防滑', priority: 'critical' },
    { name: '背包', title: '合适容量的背包', description: '根据活动天数选择合适容量的背包（一日10-20L，多日40-60L）', priority: 'critical' },
    { name: '饮水', title: '饮水系统', description: '水袋或水瓶，确保充足的水分补给', priority: 'critical' }
  ]

  essentials.forEach(essential => {
    if (!itemNames.some(name => name.includes(essential.name))) {
      recommendations.push(essential)
    }
  })

  // 根据季节推荐
  if (prefs.value.season === 'winter' && !itemNames.some(name => name.includes('保暖') || name.includes('羽绒'))) {
    recommendations.push({
      title: '保暖装备',
      description: '冬季户外需要羽绒服、保暖内衣等防寒装备',
      priority: 'high'
    })
  }

  // 根据天气推荐
  if ((prefs.value.weather === 'rainy' || prefs.value.weather === 'mixed') && !itemNames.some(name => name.includes('雨') || name.includes('防水'))) {
    recommendations.push({
      title: '防雨装备',
      description: '雨衣或防水外套、背包防雨罩，保护装备和保持干燥',
      priority: 'high'
    })
  }

  // 根据预算推荐
  if (prefs.value.budget === 'low') {
    recommendations.push({
      title: '预算优化建议',
      description: '考虑迪卡侬等平价品牌，关注二手装备市场，优先投资关键装备（鞋、背包）',
      priority: 'medium'
    })
  }

  return recommendations
}

async function getOnlineRecommendations() {
  const settings = modelConfigStore.settings
  const apiUrl = modelConfigStore.buildApiUrl(settings.apiUrl)

  // 构建当前装备清单信息
  const currentItems = equipmentStore.categories.flatMap(cat =>
    cat.items.map(item =>
      `类别: ${cat.name}, 名称: ${item.name}, 是否准备: ${item.prepared ? '是' : '否'}, 数量: ${item.quantity}${item.quantityUnit || '个'}, 重量: ${item.weight}${item.weightUnit || 'g'}, 备注: ${item.notes || '无'}`
    )
  )

  const prompt = `作为户外装备专家，请根据以下信息为户外装备清单提供专业推荐：

活动类型：${prefs.value.activityType}
季节：${prefs.value.season}
天气条件：${prefs.value.weather}
难度等级：${prefs.value.difficulty}
预算范围：${prefs.value.budget}

当前装备清单：
${currentItems.length > 0 ? currentItems.join('\n') : '暂无装备'}

请提供以下方面的推荐：
1. 缺少的必备装备
2. 根据季节和天气的装备建议
3. 根据难度等级的装备升级建议
4. 根据预算的装备选择建议
5. 装备使用和维护建议

请以JSON格式返回推荐结果，包含title、description、priority字段。`

  // 构建请求
  const requestBody = {
    model: settings.modelName,
    messages: [
      { role: 'system', content: '你是一位经验丰富的户外装备专家，擅长根据活动类型、季节、天气条件为用户推荐合适的装备。' },
      { role: 'user', content: prompt }
    ],
    max_tokens: settings.maxTokens || 1000,
    temperature: settings.temperature || 0.7,
    stream: false
  }

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${settings.apiKey}`
  }

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: headers,
    body: JSON.stringify(requestBody)
  })

  if (!response.ok) {
    throw new Error(`API请求失败: ${response.status} ${response.statusText}`)
  }

  const data = await response.json()
  const content = data.choices?.[0]?.message?.content || ''

  if (!content) {
    throw new Error('API返回了空内容，请检查配置和请求参数')
  }

  // 尝试解析JSON响应
  try {
    const parsed = JSON.parse(content)

    if (parsed.recommendations && Array.isArray(parsed.recommendations)) {
      return parsed.recommendations
    }

    if (Array.isArray(parsed)) {
      return parsed
    }

    return [parsed]
  } catch (e) {
    // 尝试提取JSON部分
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0])
        if (parsed.recommendations && Array.isArray(parsed.recommendations)) {
          return parsed.recommendations
        }
      } catch (e2) {
        // 解析失败
      }
    }

    // 如果都失败，返回文本内容
    return [{
      type: 'general',
      title: 'AI推荐',
      description: content,
      priority: 'medium'
    }]
  }
}

function getItemStyle(priority) {
  const config = priorityConfig.value[priority] || priorityConfig.value['medium']
  return {
    borderLeftColor: config.color,
    borderColor: config.color + '40', // 添加透明度
    backgroundColor: config.bg
  }
}

function getBadgeStyle(priority) {
  const config = priorityConfig.value[priority] || priorityConfig.value['medium']
  return {
    background: config.color
  }
}

function getPriorityIcon(priority) {
  return priorityConfig.value[priority]?.icon || '🟡'
}

function getPriorityLabel(priority) {
  return priorityConfig.value[priority]?.label || '建议'
}

const debouncedGetRecommendations = useDebounceFn(getRecommendations, 500); // Longer debounce for API calls
const debouncedClose = useDebounceFn(close, 300);

async function addRecommendationsToEquipment() {
  if (recommendations.value.length === 0) {
    return;
  }

  // 尝试为每个推荐项找到或创建分类并添加
  for (const rec of recommendations.value) {
    let targetCategoryName = '智能推荐'; // 默认分类名称

    // 尝试根据推荐标题或描述智能匹配现有分类
    // 注意：这里需要遍历现有分类，判断名称是否包含推荐标题或描述
    // 由于我们不能直接访问 equipmentStore.categories，所以我们先找到匹配的名称
    // 并在调用 addItem 之前通过 getOrCreateCategory 确保分类存在。
    const matchedCategory = equipmentStore.categories.find(cat =>
      rec.title.includes(cat.name) || rec.description.includes(cat.name)
    );
    if (matchedCategory) {
      targetCategoryName = matchedCategory.name;
    }

    // 获取或创建分类ID
    const categoryId = equipmentStore.getOrCreateCategory(targetCategoryName, '🤖'); // 使用机器人图标作为默认图标

    // 添加装备到 store，并标记为推荐
    equipmentStore.addItem(categoryId, {
      name: rec.title,
      description: rec.description,
      prepared: false,
      quantity: 1,
      weight: 0,
      weightUnit: 'g',
      isRecommended: true, // 新增标记
      priority: rec.priority, // 可以保留优先级信息
    });
  }

  // 添加成功后可以关闭模态框
  close();
}

defineExpose({ show, close })
</script>

<style scoped lang="scss">
.recommendation-settings {
  background: var(--bg-input);
  border-radius: var(--border-radius-lg);
  padding: 20px;
  margin-bottom: 20px;
}

.recommendation-settings h4 {
  margin: 0 0 15px 0;
  color: var(--text-primary);
}

.setting-group {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.setting-group:last-child {
  margin-bottom: 0;
}

.setting-group label {
  min-width: 100px;
  font-weight: 500;
  color: var(--text-secondary);
}

.config-info {
  padding: 15px;
  border-left: var(--border-width-lg) solid var(--primary-color);
  background: var(--bg-hover);
  border-radius: var(--border-radius);
  margin-bottom: 20px;
  line-height: 1.6;
}

.recommendation-actions {
  display: flex;
  gap: 10px;
  justify-content: center;
  margin-bottom: 20px;
}

.btn {
  padding: 12px 30px;
  border: none;
  border-radius: var(--border-radius-sm);
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
  color: var(--btn-primary-text, white);
}

.btn-secondary {
  background: var(--text-muted);
  color: var(--text-white);
}

.btn:not(:disabled):hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.recommendation-results {
  border-top: var(--border-width-lg) solid var(--border-color);
  padding-top: 20px;
}

.recommendation-results h4 {
  margin: 0 0 15px 0;
  color: var(--text-primary);
}

.loading,
.error,
.success {
  text-align: center;
  padding: 30px;
  border-radius: var(--border-radius);
}

.loading {
  color: var(--primary-color);
  background: var(--bg-input);
}

.error {
  color: var(--danger-color);
  background: var(--danger-light);
  white-space: pre-line;
}

.success {
  color: var(--success-color);
  background: var(--success-light);
}

.recommendation-content {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.add-to-list-actions {
  margin-bottom: 20px;
}

.recommendation-item {
  padding: 20px;
  border-left: var(--border-width-lg) solid;
  border-radius: var(--border-radius);
  transition: all 0.3s ease;
  border: var(--border-width) solid var(--border-color);
  backdrop-filter: blur(10px);
  // 显式添加底部边距
  margin-bottom: 15px;
}

.recommendation-item:last-child {
  // 最后一个不加底部边距，避免多余空间
  margin-bottom: 0;
}

.recommendation-item:hover {
  transform: translateX(5px);
  box-shadow: var(--shadow-lg);
  border-color: currentColor;
}

.recommendation-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 10px;
}

.recommendation-number {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 20px;
  background: var(--bg-input);
  color: var(--text-secondary);
  font-weight: 600;
  font-size: 1.1rem;
}

.recommendation-title {
  flex: 1;
  margin: 0;
  font-size: 1.1rem;
  color: var(--text-primary);
}

.priority-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-white);
  box-shadow: var(--shadow-sm);
}

.recommendation-description {
  margin: 0;
  line-height: 1.6;
  color: var(--text-secondary);
}

.input-select-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
}

.input-select-wrapper input {
  flex: 1;
  padding: 10px 15px;
  border: 2px solid var(--border-color);
  border-radius: 6px;
  font-size: 1rem;
  background: var(--bg-input);
  color: var(--text-primary);
  cursor: pointer;
  z-index: 1;
}

.input-select-wrapper input:focus {
  outline: none;
  border-color: var(--primary-color);
}

.suggestions-list {
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  max-height: 200px;
  overflow-y: auto;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  box-shadow: var(--shadow-lg);
  z-index: 10;
  margin-top: 5px;
  padding: 0;
  list-style: none;
}

.suggestions-list li {
  padding: 10px 15px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  color: var(--text-primary);
}

.suggestions-list li:hover {
  background-color: var(--primary-light);
}

.suggestions-list li.selected {
  background-color: var(--primary-light);
  font-weight: 500;
}

.suggestions-list li.add-new-option {
  color: var(--primary-color);
  font-weight: 500;
  cursor: pointer;
  padding: 10px 15px;
  text-align: center;
  border-top: 1px solid var(--border-color);
}

.suggestions-list li.add-new-option:hover {
  background-color: var(--primary-light);
}

@media (max-width: 768px) {
  .setting-group {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .setting-group label {
    min-width: auto;
  }

  .setting-group select {
    width: 100%;
  }
}
</style>
