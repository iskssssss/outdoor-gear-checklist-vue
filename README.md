# 户外装备清单 - Vue 3版本

基于Vue 3.5.22 + Vite + Pinia的户外装备清单管理系统

## 功能特性

- 装备分类管理
- 装备项目管理（添加、编辑、删除、状态切换）
- 数据导入导出（JSON和图片格式）
- AI智能推荐（支持DeepSeek和OpenAI）
- 模型配置管理
- 操作日志记录
- **🎨 主题风格切换（默认风格/手绘风格）**
- 本地存储（localStorage）
- 多标签页数据同步

## 技术栈

- Vue 3.5.22
- Vite 5.x
- Pinia 2.x（状态管理）
- html2canvas（图片导出）
- Paper.css 1.8.3（手绘风格主题）

## 开发指南

### 安装依赖

\`\`\`bash
npm install
\`\`\`

### 启动开发服务器

\`\`\`bash
npm run dev
\`\`\`

### 构建生产版本

\`\`\`bash
npm run build
\`\`\`

### 预览生产构建

\`\`\`bash
npm run preview
\`\`\`

## 项目结构

\`\`\`
src/
├── assets/          # 静态资源
├── components/      # Vue组件
│   ├── AppHeader.vue          # 头部组件
│   ├── CategoryList.vue       # 分类列表组件
│   ├── CategoryItem.vue       # 单个分类组件
│   ├── StatsPanel.vue         # 统计面板组件
│   ├── RecommendationModal.vue # AI推荐模态框
│   ├── ModelConfigModal.vue    # 模型配置模态框
│   └── OperationLogModal.vue   # 操作日志模态框
├── stores/          # Pinia状态管理
│   ├── equipment.js           # 装备数据store
│   ├── modelConfig.js         # 模型配置store
│   ├── operationLog.js        # 操作日志store
│   └── themeStore.js          # 主题管理store
├── App.vue          # 根组件
└── main.js          # 入口文件
\`\`\`

## 数据存储

所有数据使用localStorage存储：

- `hikingChecklist`: 装备清单数据
- `hikingApiSettings`: 模型配置
- `hikingRecommendationPreferences`: 推荐偏好
- `hikingOperationLogs`: 操作日志
- `appTheme`: 当前选中的主题风格

## 主题系统

应用支持多种视觉风格，可通过头部的"风格"选择器切换：

- **默认风格** 🎨：简洁现代的默认样式，圆润流畅的设计
- **手绘风格** ✏️：参考 Paper.css 的手绘纸张风格，不规则边框模拟真实手绘效果（默认）
- **暗黑模式** 🌙：深色高对比度配色，霓虹发光效果，保护眼睛
- **柔和风格** 🌸：马卡龙配色，温柔可爱的弹性动画

### 主题特点详解

#### 默认风格 🎨
- 简洁现代的渐变背景（紫色系）
- 流畅的圆角设计
- 标准阴影效果
- 适合正式场景

#### 手绘风格 ✏️（参考 Paper.css）
手绘风格完整模拟了 Paper.css 的特征：
- **6 种不规则边框**：每个卡片和按钮都有独特的手绘边框变化
- **手写字体**：使用 Neucha 和 Patrick Hand 字体
- **纸张质感**：米黄色渐变背景，模拟真实纸张
- **纸张阴影**：不规则的投影效果
- **手绘动画**：hover 时轻微旋转和位移
- **双层边框**：模拟纸张厚度的视觉效果
- **墨水色彩**：柔和的色彩搭配

#### 暗黑模式 🌙
- 深色背景，降低眼睛疲劳
- 霓虹色系（青色、紫色）
- 发光效果的 hover 动画
- 高对比度文字
- 适合夜间使用

#### 柔和风格 🌸
- 马卡龙配色（粉色、紫色、蓝色）
- 大圆角设计
- 弹性动画效果
- 温柔可爱的视觉风格
- 适合轻松场景

### 主题覆盖范围

所有 UI 元素都会随主题变化：
- ✅ 页面背景渐变
- ✅ 卡片背景和边框
- ✅ 分类标题栏颜色
- ✅ 装备项背景
- ✅ 统计面板样式
- ✅ 所有按钮颜色
- ✅ 输入框和选择器
- ✅ 文字颜色
- ✅ 阴影和边框效果
- ✅ hover 和焦点状态

主题设置会自动保存到 localStorage，刷新页面后保持选择。

## 许可证

MIT

