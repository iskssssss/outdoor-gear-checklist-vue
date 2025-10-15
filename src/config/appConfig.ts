interface ModelSettings {
  apiKey: string;
  apiUrl: string;
  modelName: string;
  maxTokens: number;
  temperature: number;
  customHeaders: string;
  requestTemplate: string;
  responseParser: 'openai' | 'custom';
  responsePath: string;
}

/**
 * 默认模型设置
 * 包含API密钥、URL、模型名称、最大Token、温度等
 */
export const defaultModelSettings: ModelSettings = {
  apiKey: '',
  apiUrl: 'https://api.deepseek.com/v1',
  modelName: 'deepseek-chat',
  maxTokens: 8192,
  temperature: 0.7,
  customHeaders: '',
  requestTemplate: '',
  responseParser: 'openai',
  responsePath: ''
};

interface RecommendationPreferences {
  activityType: string;
  season: string;
  weather: string;
  difficulty: string;
  budget: string;
}

/**
 * 默认推荐偏好设置
 * 包含活动类型、季节、天气、难度、预算等
 */
export const defaultRecommendationPreferences: RecommendationPreferences = {
  activityType: 'day-hiking',
  season: 'spring',
  weather: 'sunny',
  difficulty: 'easy',
  budget: 'medium'
};

interface DefaultCategory {
  name: string;
  icon: string;
}

/**
 * 默认装备分类
 * 包含名称和图标，用于初始化清单
 */
export const defaultCategories: DefaultCategory[] = [
  { name: '背负系统', icon: '🎒' },
  { name: '睡眠系统', icon: '😴' },
  { name: '服装系统', icon: '👕' },
  { name: '必备工具', icon: '🛠️' },
  { name: '餐厨锅具', icon: '🍳' },
  { name: '路餐食材', icon: '🍎' },
  { name: '求生系统', icon: '🆘' },
  { name: '洗漱工具', icon: '🛁' }
];

interface LocalStorageKeys {
  modelSettings: string;
  recommendationPreferences: string;
  equipmentChecklist: string;
  customRecommendationOptions: string;
  operationLogs: string;
  lastRecommendations: string;
  transportRoutes: string;
  transportBudgets: string;
  transportReminders: string;
}

/**
 * localStorage中使用的键名
 * 用于持久化存储各种配置和数据
 */
export const localStorageKeys: LocalStorageKeys = {
  modelSettings: 'outdoorApiSettings',
  recommendationPreferences: 'outdoorRecommendationPreferences',
  equipmentChecklist: 'outdoorChecklist',
  customRecommendationOptions: 'outdoorCustomRecommendationOptions',
  operationLogs: 'outdoorOperationLogs',
  lastRecommendations: 'outdoorLastRecommendations',
  transportRoutes: 'outdoorTransportRoutes',
  transportBudgets: 'outdoorTransportBudgets',
  transportReminders: 'outdoorTransportReminders'
};

interface Option {
  value: string;
  label: string;
}

/**
 * 默认的测试提示语
 * 用于模型连接测试
 */
export const defaultTestPrompt: string = '请简单介绍一下户外装备的重要性';

/**
 * 活动类型选项
 */
export const activityTypeOptions: Option[] = [
  { value: 'day-hiking', label: '一日户外' },
  { value: 'multi-day-hiking', label: '多日户外' },
  { value: 'camping', label: '露营' },
  { value: 'mountaineering', label: '登山' },
  { value: 'backpacking', label: '背包旅行' }
];

/**
 * 季节选项
 */
export const seasonOptions: Option[] = [
  { value: 'spring', label: '春季' },
  { value: 'summer', label: '夏季' },
  { value: 'autumn', label: '秋季' },
  { value: 'winter', label: '冬季' }
];

/**
 * 天气条件选项
 */
export const weatherOptions: Option[] = [
  { value: 'sunny', label: '晴天' },
  { value: 'cloudy', label: '多云' },
  { value: 'rainy', label: '雨天' },
  { value: 'snowy', label: '雪天' },
  { value: 'mixed', label: '多变天气' }
];

/**
 * 难度等级选项
 */
export const difficultyOptions: Option[] = [
  { value: 'easy', label: '简单' },
  { value: 'moderate', label: '中等' },
  { value: 'hard', label: '困难' },
  { value: 'expert', label: '专业' }
];

/**
 * 预算范围选项
 */
export const budgetOptions: Option[] = [
  { value: 'low', label: '经济型 (500元以下)' },
  { value: 'medium', label: '中等 (500-2000元)' },
  { value: 'high', label: '高端 (2000元以上)' }
];

interface ImageExportConfig {
  scale: number;
  dpi: number;
  exportWidth: number;
  quality: number;
  format: string;
  imageTimeout: number;
  renderDelay: number;
}

/**
 * 图片导出配置
 * 用于配置导出图片的质量和尺寸
 */
export const imageExportConfig: ImageExportConfig = {
  scale: 4, // 缩放比例，越高质量越好（建议 2-5）
  dpi: 384, // DPI 设置，越高越清晰（建议 192-600）
  exportWidth: 2000, // 导出宽度（像素）
  quality: 1.0, // 图片质量 0-1
  format: 'image/png', // 图片格式
  imageTimeout: 10000, // 图片加载超时时间（毫秒）
  renderDelay: 200 // 渲染延迟，确保样式完全加载（毫秒）
};
