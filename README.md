# 🏔️ 户外装备清单

> 基于 Vue 3 + Vite + Pinia 的现代化户外装备清单管理系统

[![Vue](https://img.shields.io/badge/Vue-3.5.22-brightgreen.svg)](https://vuejs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.x-646CFF.svg)](https://vitejs.dev/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

## ✨ 功能特性

### 核心功能
- 📋 **装备分类管理** - 自定义分类，支持图标选择
- ✅ **装备项目管理** - 添加、编辑、删除、状态切换
- 📊 **实时统计** - 总重量、完成进度、装备数量统计
- 💾 **数据持久化** - 基于 localStorage 的本地存储
- 🔄 **多标签同步** - 多个浏览器标签页数据实时同步

### 数据导入导出
- 📥 **JSON 导入** - 导入完整的装备清单数据
- 📤 **JSON 导出** - 导出装备清单为 JSON 文件
- 🖼️ **图片导出** - 高质量 PNG 图片导出（支持自定义尺寸）
- 🛒 **购物车导入** - 支持京东购物车分享链接自动解析

### AI 智能功能
- 🤖 **智能推荐** - 基于大模型的装备推荐（支持 DeepSeek、OpenAI 等）
- 🧠 **自动分类** - AI 自动将购物车商品分类到对应装备类别
- ⚙️ **模型配置** - 灵活配置 API 地址、密钥、模型参数

### 主题系统
- 🎨 **10+款精美主题** - 默认、暗色、以及多种户外风格主题（雪山、森林、火山等）。
- 🌈 **主题切换** - 通过右下角浮动按钮一键切换，自动保存偏好。
- 💅 **完整适配** - 所有组件均支持主题切换。

### 用户体验
- 📱 **响应式设计** - 完美支持桌面端和移动端
- 🎯 **二级菜单** - 节省空间的下拉菜单设计
- 🔒 **防误操作** - 导入过程保护机制
- 📝 **操作日志** - 详细记录所有操作历史

## 🚀 快速开始

### 环境要求

- Node.js >= 16.0.0
- npm >= 8.0.0

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

访问 `http://localhost:5173` 查看应用

### 构建生产版本

```bash
npm run build
```

构建产物将输出到 `dist` 目录

### 预览生产构建

```bash
npm run preview
```

## 📖 使用指南

### 基础操作

#### 1. 创建装备分类
- 点击 "➕ 添加分类" 按钮
- 输入分类名称（如：背负系统、睡眠系统）
- 选择分类图标

#### 2. 添加装备
- 在分类卡片中点击 "➕ 添加装备"
- 填写装备信息：
  - 名称：装备名称
  - 重量：数值 + 单位（g/kg/斤/磅）
  - 数量：数值 + 单位（个/件/双/套/瓶）
- 点击 "✓ 确认添加"

#### 3. 管理装备
- **完成/取消完成**：点击装备项切换状态
- **修改**：悬停装备项，点击 ⋯ 菜单 → ✏️ 修改
- **删除**：悬停装备项，点击 ⋯ 菜单 → 🗑️ 删除

### 导航功能

#### 📥 导入
- **导入 JSON**：导入之前导出的清单文件
- **导入购物车**：
  1. 复制京东购物车分享链接
  2. 粘贴到输入框
  3. 系统自动获取商品列表
  4. AI 智能分类到对应装备类别

#### 📤 导出
- **导出 JSON**：保存完整清单数据
- **导出图片**：生成高质量装备清单图片

#### 📂 分类管理
- **✨ 初始化分类**：导入预设的 8 种常用分类
- **🗑️ 清空所有数据**：删除所有分类和装备（需二次确认）

#### 🤖 AI 工具
- **💡 智能推荐**：
  1. 选择出行类型（登山/徒步/露营等）
  2. 设置出行天数
  3. 选择季节和人数
  4. AI 生成推荐装备清单
- **⚙️ 模型配置**：
  - 配置 API 地址
  - 设置 API 密钥
  - 选择模型（如 deepseek-chat）
  - 调整模型参数

#### ⋯ 更多
- **📋 操作日志**：查看所有操作历史
- **📚 使用文档**：（开发中）
- **📧 联系我们**：（开发中）

### 购物车导入详解

支持两种方式导入京东购物车：

**方式一（推荐）：直接粘贴分享文本**
```
【京东】https://3.cn/xxx-xxx 「我的购物清单」
点击链接直接打开
```

**方式二：粘贴 HTML 源代码**
1. 打开分享链接
2. 右键 → "查看网页源代码"（Ctrl+U / Cmd+Option+U）
3. 全选（Ctrl+A / Cmd+A）→ 复制（Ctrl+C / Cmd+C）
4. 粘贴到输入框

系统会自动：
- 提取商品名称和数量
- 调用 AI 分析商品属性
- 智能分类到对应装备类别
- 自动创建不存在的分类

## 🎨 主题系统

### 可用主题

| 主题 | 特点 | 适用场景 |
|------|------|----------|
| 🎨 **默认** | 现代简洁，紫色渐变 | 日常使用 |
| 🌙 **暗色** | 深色护眼，霓虹效果 | 夜间使用 |
| ✨ **极简** | 纯白极简，高对比度 | 专注模式 |
| 📄 **纸质** | 手绘风格，纸张质感 | 文艺场景 |
| 🎮 **像素** | 像素艺术，复古风格 | 个性化 |
| 🌸 **柔和** | 马卡龙色，温柔可爱 | 轻松场景 |
| 🏔️ **雪山极光** | 冰雪与极光的碰撞 | 冷峻、科技感 |
| 🌲 **森林跋涉** | 深入丛林的沉浸感 | 自然、静谧 |
| ... | *更多主题待你发现* | |

### 主题切换

点击页面右下角的 "🎨" 浮动按钮，在弹出的菜单中选择喜欢的主题即可。

主题设置会自动保存，下次访问时自动应用。

## 📁 项目结构

```
outdoor-gear-checklist/
├── src/
│   ├── assets/                 # 静态资源
│   │   ├── main.scss          # 全局样式
│   │   └── styles/            # 主题样式
│   │       ├── _base.scss     # 基础样式
│   │       ├── _mixins.scss   # SCSS 混合
│   │       ├── _theme-*.scss  # 各主题样式
│   │       └── themes.scss    # 主题入口
│   ├── components/            # Vue 组件
│   │   ├── common/            # 通用基础组件
│   │   ├── layout/            # 布局组件
│   │   ├── modals/            # 弹窗组件
│   │   └── views/             # 视图组件
│   ├── config/                # 配置文件
│   │   └── appConfig.js       # 应用配置
│   ├── stores/                # Pinia 状态管理
│   │   ├── equipment.js       # 装备数据
│   │   ├── modelConfig.js     # 模型配置
│   │   ├── operationLog.js    # 操作日志
│   │   └── themeStore.js      # 主题管理
│   ├── App.vue                # 根组件
│   └── main.js                # 应用入口
├── public/                    # 公共资源
├── dist/                      # 构建输出（git忽略）
├── .gitignore                 # Git 忽略配置
├── .gitattributes             # Git 属性配置
├── index.html                 # HTML 模板
├── package.json               # 项目配置
├── vite.config.js             # Vite 配置
└── README.md                  # 项目文档
```

## 🛠️ 技术栈

### 核心框架
- **Vue 3.5.22** - 渐进式 JavaScript 框架
- **Vite 5.x** - 下一代前端构建工具
- **Pinia 2.x** - Vue 官方状态管理库

### UI 与样式
- **SCSS** - CSS 预处理器
- **CSS Variables** - 动态主题切换
- **html2canvas** - Canvas 截图库（图片导出）

### 开发工具
- **ESLint** - 代码质量检查（已配置）
- **Git** - 版本控制
- **npm** - 包管理器

## 💾 数据存储

应用使用 `localStorage` 存储数据，键名如下：

| 键名 | 说明 | 数据格式 |
|------|------|----------|
| `outdoorChecklist` | 装备清单数据 | JSON 数组 |
| `outdoorApiSettings` | 模型配置 | JSON 对象 |
| `outdoorRecommendationPreferences` | 推荐偏好 | JSON 对象 |
| `outdoorOperationLogs` | 操作日志 | JSON 数组 |
| `outdoorCustomRecommendationOptions` | 自定义推荐选项 | JSON 对象 |
| `appTheme` | 当前主题 | 字符串 |

### 数据结构示例

```javascript
// outdoorChecklist
[
  {
    id: 1699999999999,
    name: "背负系统",
    icon: "🎒",
    collapsed: false,
    items: [
      {
        id: 1699999999998,
        name: "登山包",
        quantity: 1,
        quantityUnit: "个",
        weight: 1500,
        weightUnit: "g",
        completed: false
      }
    ]
  }
]
```

## 🤝 贡献指南

欢迎贡献代码！请遵循以下步骤：

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 提交 Pull Request

### 提交规范

遵循 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

- `feat:` 新功能
- `fix:` 修复 Bug
- `docs:` 文档更新
- `style:` 代码格式调整
- `refactor:` 重构
- `perf:` 性能优化
- `test:` 测试相关
- `chore:` 构建/工具相关

## 🐛 问题反馈

如果遇到问题或有功能建议，请：

1. 查看 [Issues](../../issues) 是否已有相关问题
2. 如果没有，创建新的 Issue
3. 详细描述问题或建议

## 📝 更新日志

详细的更新历史请参见 [CHANGELOG.md](CHANGELOG.md)。

## 📄 许可证

本项目采用 [MIT](LICENSE) 许可证。

---

**Made with ❤️ by iskssss**

如果这个项目对你有帮助，请给个 ⭐️ Star 支持一下！
