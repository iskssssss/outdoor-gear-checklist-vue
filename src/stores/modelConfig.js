/**
 * 模型配置Store
 * 管理AI模型的配置信息
 */
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { defaultModelSettings, defaultRecommendationPreferences, localStorageKeys } from '../config/appConfig'

export const useModelConfigStore = defineStore('modelConfig', () => {
  // 状态
  const settings = ref({ ...defaultModelSettings })
  const recommendationPreferences = ref({ ...defaultRecommendationPreferences })
  const customRecommendationOptions = ref({
    activityType: [],
    season: [],
    weather: [],
    difficulty: [],
    budget: []
  })

  // Actions
  /**
   * 加载配置
   */
  function loadSettings() {
    // 加载模型配置
    const modelSettings = localStorage.getItem(localStorageKeys.modelSettings)
    if (modelSettings) {
      try {
        settings.value = { ...settings.value, ...JSON.parse(modelSettings) }
      } catch (e) {
        console.error('加载模型配置失败:', e)
      }
    }

    // 加载推荐偏好
    const prefs = localStorage.getItem(localStorageKeys.recommendationPreferences)
    if (prefs) {
      try {
        recommendationPreferences.value = { ...recommendationPreferences.value, ...JSON.parse(prefs) }
      } catch (e) {
        console.error('加载推荐偏好设置失败:', e)
      }
    }

    // 加载自定义推荐选项
    const customOptions = localStorage.getItem(localStorageKeys.customRecommendationOptions)
    if (customOptions) {
      try {
        Object.assign(customRecommendationOptions.value, JSON.parse(customOptions))
      } catch (e) {
        console.error('加载自定义推荐选项失败:', e)
      }
    }
  }

  /**
   * 保存模型配置
   * （系统配置操作，不记录日志）
   */
  function saveSettings() {
    try {
      localStorage.setItem(localStorageKeys.modelSettings, JSON.stringify(settings.value))
      
      console.log('✅ 模型配置已保存')
      return true
    } catch (e) {
      console.error('❌ 模型配置保存失败:', e)
      return false
    }
  }

  /**
   * 保存推荐偏好
   */
  function savePreferences() {
    try {
      localStorage.setItem(localStorageKeys.recommendationPreferences, JSON.stringify(recommendationPreferences.value))
      localStorage.setItem(localStorageKeys.customRecommendationOptions, JSON.stringify(customRecommendationOptions.value))
      console.log('✅ 推荐偏好和自定义选项已保存')
      return true
    } catch (e) {
      console.error('❌ 推荐偏好和自定义选项保存失败:', e)
      return false
    }
  }

  /**
   * 添加自定义选项
   * @param {string} categoryName - 类别名称 (e.g., 'activityType')
   * @param {{value: string, label: string}} option - 新的选项对象
   */
  function addCustomOption(categoryName, value, label) {
    if (customRecommendationOptions.value[categoryName]) {
      // 避免重复添加
      if (!customRecommendationOptions.value[categoryName].some(item => item.value === value)) {
        customRecommendationOptions.value[categoryName].push({ value, label })
        savePreferences()
      }
    }
  }

  /**
   * 移除自定义选项
   * @param {string} categoryName - 类别名称
   * @param {string} value - 要移除的选项值
   */
  function removeCustomOption(categoryName, value) {
    if (customRecommendationOptions.value[categoryName]) {
      const index = customRecommendationOptions.value[categoryName].findIndex(item => item.value === value)
      if (index !== -1) {
        customRecommendationOptions.value[categoryName].splice(index, 1)
        savePreferences()
      }
    }
  }

  /**
   * 构建完整的API URL
   */
  function buildApiUrl(baseUrl) {
    let url = baseUrl.trim().replace(/\/+$/, '')
    if (url.endsWith('/chat/completions')) {
      return url
    }
    return url + '/chat/completions'
  }

  /**
   * 测试API连接
   */
  async function testConnection(testPrompt) {
    if (!testPrompt || !testPrompt.trim()) {
      throw new Error('请输入测试提示词')
    }

    const { apiKey, apiUrl, modelName, maxTokens, temperature, customHeaders, requestTemplate } = settings.value

    if (!apiKey && !apiUrl.includes('localhost')) {
      throw new Error('请输入API Key')
    }

    if (!apiUrl) {
      throw new Error('请输入API URL')
    }

    if (!modelName) {
      throw new Error('请输入模型名称')
    }

    const fullApiUrl = buildApiUrl(apiUrl)

    // 构建请求体
    let requestBody
    try {
      if (requestTemplate) {
        const template = requestTemplate
          .replace(/\{\{model\}\}/g, modelName)
          .replace(/\{\{prompt\}\}/g, JSON.stringify(testPrompt).slice(1, -1))
          .replace(/\{\{max_tokens\}\}/g, maxTokens.toString())
          .replace(/\{\{temperature\}\}/g, temperature.toString())
        
        requestBody = JSON.parse(template)
      } else {
        requestBody = {
          model: modelName,
          messages: [
            { role: 'system', content: '你是一个有帮助的AI助手。' },
            { role: 'user', content: testPrompt }
          ],
          max_tokens: maxTokens,
          temperature: temperature,
          stream: false
        }
      }
    } catch (e) {
      throw new Error(`请求体构建失败：${e.message}`)
    }

    // 构建请求头
    let headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    }

    try {
      if (customHeaders) {
        const customHeadersObj = JSON.parse(customHeaders)
        Object.assign(headers, customHeadersObj)
        
        Object.keys(headers).forEach(key => {
          if (typeof headers[key] === 'string') {
            headers[key] = headers[key].replace('{{apiKey}}', apiKey)
          }
        })
      }
    } catch (e) {
      throw new Error(`请求头解析失败：${e.message}`)
    }

    // 发送请求
    const response = await fetch(fullApiUrl, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(requestBody)
    })

    const responseText = await response.text()
    let data

    try {
      data = JSON.parse(responseText)
    } catch (e) {
      throw new Error(`响应解析失败\n\nHTTP状态: ${response.status}\n响应内容:\n${responseText.substring(0, 500)}`)
    }

    if (!response.ok) {
      let errorMsg = `API请求失败 (${response.status} ${response.statusText})\n\n`
      
      switch(response.status) {
        case 401:
          errorMsg += '认证失败 - API Key不正确或已过期'
          break
        case 404:
          errorMsg += `资源未找到\n当前URL: ${fullApiUrl}\n请检查API URL是否正确`
          break
        case 429:
          errorMsg += '请求速率达到上限，请稍后重试'
          break
        default:
          if (data.error) {
            errorMsg += '\n错误详情：\n' + (typeof data.error === 'string' ? data.error : JSON.stringify(data.error, null, 2))
          }
      }
      
      throw new Error(errorMsg)
    }

    // 解析响应内容
    let content = ''
    const { responseParser, responsePath } = settings.value
    
    try {
      if (responseParser === 'custom' && responsePath) {
        const pathParts = responsePath.split('.')
        let result = data
        for (const part of pathParts) {
          if (part.includes('[') && part.includes(']')) {
            const key = part.substring(0, part.indexOf('['))
            const index = parseInt(part.substring(part.indexOf('[') + 1, part.indexOf(']')))
            result = result[key][index]
          } else {
            result = result[part]
          }
        }
        content = result || ''
      } else {
        content = data.choices?.[0]?.message?.content || ''
      }
      
      if (!content) {
        content = '响应解析成功，但未找到内容\n\n完整响应：\n' + JSON.stringify(data, null, 2)
      }
    } catch (e) {
      content = '响应内容解析失败\n\n错误：' + e.message + '\n\n完整响应：\n' + JSON.stringify(data, null, 2)
    }

    return {
      success: true,
      content,
      apiUrl: fullApiUrl,
      modelName,
      temperature,
      maxTokens
    }
  }

  return {
    // 状态
    settings,
    recommendationPreferences,
    customRecommendationOptions,
    // Actions
    loadSettings,
    saveSettings,
    savePreferences,
    addCustomOption,
    removeCustomOption,
    buildApiUrl,
    testConnection
  }
})

