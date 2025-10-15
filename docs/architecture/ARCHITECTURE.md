# 🏗️ 架构设计文档

> 本文档详细说明了"户外装备清单"项目的架构设计、技术选型和核心模块。近期，我们正在对基础组件进行全面的优化改造，以提升其通用性、类型安全和主题集成能力。

## 📋 目录

- [技术栈](#技术栈)
- [项目结构](#项目结构)
- [核心模块](#核心模块)
- [数据流](#数据流)
- [主题系统](#主题系统)
- [状态管理](#状态管理)
- [技术决策](#技术决策)

---

## 🛠️ 技术栈

### 核心框架

| 技术 | 版本 | 用途 |
|------|------|------|
| Vue 3 | 3.5.22 | 渐进式前端框架 |
| TypeScript | 5.x | 类型安全 |
| Vite | 5.x | 构建工具 |
| Pinia | 2.x | 状态管理 |
| Vue Router | 4.x | 路由管理 |
| ECharts | 6.x | 数据可视化图表库 |
| vue-echarts | 8.x | ECharts Vue 组件封装 |

### UI 与样式

| 技术 | 用途 |
|------|------|
| SCSS | CSS 预处理器 |
| CSS Variables | 动态主题切换 |
| html2canvas | 图片导出 |

### 工具库

| 库 | 用途 |
|------|------|
| @vueuse/core | Vue Composition API 工具集（如滚动锁定等） |
| uuid | 唯一标识符生成 |
| html2canvas | 页面截图导出 |

### 开发工具

| 工具 | 用途 |
|------|------|
| vue-tsc | TypeScript 类型检查 |
| vite-plugin-compression | 构建压缩 |

---

## 📁 项目结构

```
hiking-checklist-vue/
├── docs/                          # 📚 项目文档
│   ├── CHANGELOG.md              # 更新日志
│   ├── USAGE.md                  # 使用文档
│   ├── CONTRIBUTING.md           # 贡献指南
│   ├── ARCHITECTURE.md           # 架构文档（本文档）
│   ├── guides/COMPONENT_TRANSFORMATION_PLAN.md # 基础组件改造计划文档
│   └── ...                       # 其他文档
│
├── src/                          # 💻 源代码
│   ├── assets/                   # 🎨 静态资源
│   │   ├── main.scss            # 全局样式入口
│   │   └── styles/              # 主题样式系统
│   │       ├── _base.scss       # 基础样式
│   │       ├── _mixins.scss     # SCSS 混合
│   │       ├── _utilities.scss  # 工具类
│   │       ├── _theme-*.scss    # 各主题样式
│   │       └── themes.scss      # 主题入口
│   │
│   ├── components/              # 🧩 Vue 组件
│   │   ├── common/             # 通用基础组件（正在进行全面优化改造，详见 COMPONENT_TRANSFORMATION_PLAN.md）
│   │   │   ├── BackToTopButton.vue    # 返回顶部
│   │   │   ├── BaseConfirm.vue        # 确认框
│   │   │   ├── BaseModal.vue          # 模态框基类
│   │   │   ├── InputSelect.vue        # 下拉选择
│   │   │   ├── MarkdownViewer.vue     # Markdown 渲染
│   │   │   └── ToastNotification.vue  # 提示通知
│   │   │
│   │   ├── layout/             # 布局组件
│   │   │   ├── AppFooter.vue          # 页脚
│   │   │   ├── AppHeader.vue          # 页头
│   │   │   └── WaterfallLayout.vue    # 瀑布流布局
│   │   │
│   │   ├── modals/             # 弹窗组件
│   │   │   ├── CategorySortModal.vue      # 分类排序
│   │   │   ├── ImportCartModal.vue        # 购物车导入
│   │   │   ├── ModelConfigModal.vue       # 模型配置
│   │   │   ├── OperationLogModal.vue      # 操作日志
│   │   │   └── RecommendationModal.vue    # 智能推荐
│   │   │
│   │   └── views/              # 视图组件
│   │       ├── CategoryItem.vue           # 分类卡片
│   │       ├── CategoryList.vue           # 分类列表
│   │       ├── CategoryTableView.vue      # 表格视图
│   │       ├── ChangelogPage.vue          # 更新日志（支持页面/模态框双模式）
│   │       ├── EquipmentItem.vue          # 装备项
│   │       ├── StatsPanel.vue             # 统计面板
│   │       └── ...                        # 其他视图
│   │
│   ├── composables/            # 🔧 组合式函数
│   │   ├── useConfirm.ts              # 确认框钩子
│   │   ├── useImporter.ts             # 导入功能
│   │   ├── useJdParser.ts             # 京东解析
│   │   ├── useModelAnalyzer.ts        # 模型分析
│   │   └── useResponsiveMenu.ts       # 响应式菜单
│   │
│   ├── stores/                 # 🗄️ Pinia 状态管理
│   │   ├── equipment.ts               # 装备数据
│   │   ├── modelConfig.ts             # 模型配置
│   │   ├── operationLog.ts            # 操作日志
│   │   └── themeStore.ts              # 主题管理
│   │
│   ├── router/                 # 🛣️ 路由配置
│   │   └── index.ts                   # 路由定义
│   │
│   ├── config/                 # ⚙️ 配置文件
│   │   └── appConfig.ts               # 应用配置
│   │
│   ├── utils/                  # 🛠️ 工具函数
│   │   ├── eventBus.ts                # 事件总线
│   │   └── toast.ts                   # 提示工具
│   │
│   ├── App.vue                 # 🏠 根组件
│   ├── main.ts                 # 🚀 应用入口
│   └── shims-vue.d.ts          # 📝 TypeScript 声明
│
├── public/                     # 🌍 公共资源
├── dist/                       # 📦 构建输出
├── .gitignore                  # 🚫 Git 忽略配置
├── index.html                  # 📄 HTML 模板
├── package.json                # 📋 项目配置
├── tsconfig.json               # 🔧 TypeScript 配置
├── vite.config.ts              # ⚡ Vite 配置
├── LICENSE                     # 📜 开源许可证
└── README.md                   # 📖 项目说明
```

---

## 🧩 核心模块

### 1. 装备管理模块

**核心组件**：
- `CategoryList.vue` - 分类列表容器
- `CategoryItem.vue` - 单个分类卡片
- `EquipmentItem.vue` - 装备项组件
- `CategoryTableView.vue` - 表格视图

**状态管理**：`stores/equipment.ts`

**核心功能**：
- 分类 CRUD（创建、读取、更新、删除）
- 装备 CRUD
- 拖拽排序
- 状态切换（已准备/待准备）
- 批量操作

**数据结构**：
```typescript
interface Category {
  id: number;
  name: string;
  icon: string;
  collapsed: boolean;
  items: Equipment[];
}

interface Equipment {
  id: number;
  name: string;
  quantity: number;
  quantityUnit: string;
  weight: number;
  weightUnit: string;
  price?: number;
  priceUnit?: string;
  completed: boolean;
}
```

### 2. 数据导入导出模块

**核心组件**：
- `ImportCartModal.vue` - 购物车导入弹窗
- `ExportPreview.vue` - 导出预览

**组合式函数**：
- `useImporter.ts` - 导入逻辑
- `useJdParser.ts` - 京东购物车解析

**功能**：
- JSON 导入/导出
- 图片导出（html2canvas）
- 京东购物车导入
- AI 自动分类

### 3. AI 智能推荐模块

**核心组件**：
- `RecommendationModal.vue` - 推荐弹窗
- `ModelConfigModal.vue` - 模型配置

**状态管理**：`stores/modelConfig.ts`

**组合式函数**：
- `useModelAnalyzer.ts` - 模型分析

**功能**：
- OpenAI 兼容 API 调用
- 参数化推荐（活动类型、季节、天气等）
- 推荐结果解析
- 一键导入推荐

### 4. 主题系统

**核心文件**：
- `stores/themeStore.ts` - 主题状态管理
- `assets/styles/` - 主题样式文件

**主题列表**：
- 默认风格 (`_theme-default.scss`)
- 暗黑模式 (`_theme-dark.scss`)
- 纸质风格 (`_theme-paper.scss`)
- 像素风格 (`_theme-pixel.scss`)
- 极简风格 (`_theme-minimal.scss`)
- 柔和风格 (`_theme-soft.scss`)
- 户外系列（雪山、森林、火山等）

**实现原理**：
- CSS Variables 动态切换
- SCSS 主题变量体系
- localStorage 持久化

### CSS Variables 体系 (补充)
随着基础组件的优化，我们引入了更多语义化的 CSS Variables，以实现更细粒度的样式控制和更强大的主题兼容性。以下是一些新增的通用变量示例：

```scss
// 组件状态相关
--opacity-disabled          // 禁用状态透明度
--bg-overlay-light          // 浅色遮罩层背景
--shadow-selected-primary   // 主色调选中状态阴影

// 按钮和文本颜色
--accent-primary            // 主强调色（用于按钮、标签等）
--text-on-accent            // 在强调色背景上的文本颜色
--bg-button-secondary       // 次要按钮背景色
--text-button-secondary     // 次要按钮文本色
--bg-danger                 // 危险状态背景色
--text-on-danger            // 在危险色背景上的文本颜色

// 表格相关
--bg-table-header           // 表格头部背景色
--text-on-table-header      // 表格头部文本色
--bg-table-header-hover     // 表格头部悬浮背景色

// 焦点与轮廓
--outline-focus             // 焦点轮廓颜色

// 动画过渡
--transition-duration-normal  // 正常过渡时长
--transition-ease-out         // 缓出过渡函数
```

这些变量应在 `assets/styles/themes.scss` 或具体主题文件中进行定义，并被组件广泛使用。

### 5. 操作日志模块

**核心组件**：
- `OperationLogModal.vue` - 日志查看

**状态管理**：`stores/operationLog.ts`

**功能**：
- 记录所有操作
- 操作回滚/撤销
- 日志导出
- 日志清理（最多 500 条）

**日志类型**：
```typescript
enum OperationType {
  ADD_CATEGORY = 'add_category',
  DELETE_CATEGORY = 'delete_category',
  EDIT_CATEGORY = 'edit_category',
  ADD_EQUIPMENT = 'add_equipment',
  DELETE_EQUIPMENT = 'delete_equipment',
  EDIT_EQUIPMENT = 'edit_equipment',
  TOGGLE_STATUS = 'toggle_status',
  IMPORT = 'import',
  EXPORT = 'export'
}
```

---

## 🔄 数据流

### 单向数据流

```
┌──────────────┐
│  User Action │  用户操作
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  Component   │  组件触发事件
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Pinia Store  │  状态管理器更新状态
└──────┬───────┘
       │
       ├──────────────┐
       │              │
       ▼              ▼
┌──────────────┐  ┌──────────────┐
│ localStorage │  │ Operation Log│  持久化 & 日志
└──────────────┘  └──────────────┘
       │
       ▼
┌──────────────┐
│ Component    │  组件响应状态变化
│ Re-render    │
└──────────────┘
```

### 数据持久化

**localStorage 键值对**：
```typescript
{
  'outdoorChecklist': Category[],              // 装备清单
  'outdoorApiSettings': ModelConfig,           // AI 配置
  'outdoorRecommendationPreferences': Prefs,   // 推荐偏好
  'outdoorOperationLogs': OperationLog[],      // 操作日志
  'outdoorCustomRecommendationOptions': {},    // 自定义选项
  'appTheme': string                           // 当前主题
}
```

### 跨标签同步

使用 `window.storage` 事件实现：

```typescript
window.addEventListener('storage', (e) => {
  if (e.key === 'outdoorChecklist') {
    store.loadFromStorage();
  }
});
```

---

## 🎨 主题系统

### 架构设计

```
主题系统架构
├── themeStore.ts          # 主题状态管理
├── _base.scss             # 基础样式（共享）
├── _mixins.scss           # SCSS 混合工具
├── _utilities.scss        # 工具类
├── _outdoor-mixins.scss   # 户外主题专用混合
├── _theme-*.scss          # 各主题定义
└── themes.scss            # 主题入口
```

### CSS Variables 体系

每个主题定义一套完整的变量：

```scss
// 颜色变量
--bg-primary          // 主背景色
--bg-secondary        // 次背景色
--text-primary        // 主文字色
--text-secondary      // 次文字色
--accent-primary      // 主强调色
--accent-secondary    // 次强调色

// 间距变量
--spacing-xs          // 极小间距
--spacing-sm          // 小间距
--spacing-md          // 中间距
--spacing-lg          // 大间距
--spacing-xl          // 特大间距

// 圆角变量
--border-radius-sm    // 小圆角
--border-radius-md    // 中圆角
--border-radius-lg    // 大圆角

// 阴影变量
--shadow-sm           // 小阴影
--shadow-md           // 中阴影
--shadow-lg           // 大阴影
```

### 主题切换流程

```
1. 用户点击主题按钮
   ↓
2. themeStore.setTheme(themeName)
   ↓
3. 更新 <body> 的 data-theme 属性
   ↓
4. CSS Variables 自动切换
   ↓
5. 保存到 localStorage
   ↓
6. 所有组件样式自动更新
```

---

## 🗄️ 状态管理

### Pinia Store 架构

#### equipment.ts - 装备数据

**State**：
```typescript
{
  categories: Category[],      // 分类列表
  useWaterfallLayout: boolean, // 是否使用瀑布流
  useSplitView: boolean,       // 是否使用分栏
  useTableView: boolean        // 是否使用表格视图
}
```

**Actions**：
- `addCategory()` - 添加分类
- `deleteCategory()` - 删除分类
- `updateCategory()` - 更新分类
- `addEquipment()` - 添加装备
- `deleteEquipment()` - 删除装备
- `updateEquipment()` - 更新装备
- `toggleEquipmentStatus()` - 切换状态
- `saveToStorage()` - 保存到 localStorage
- `loadFromStorage()` - 从 localStorage 加载

**Getters**：
- `totalWeight` - 总重量
- `totalPrice` - 总价格
- `completedCount` - 已完成数量
- `totalCount` - 总装备数

#### themeStore.ts - 主题管理

**State**：
```typescript
{
  currentTheme: string,  // 当前主题名称
  themes: Theme[]        // 可用主题列表
}
```

**Actions**：
- `setTheme()` - 设置主题
- `loadTheme()` - 加载主题
- `saveTheme()` - 保存主题

#### modelConfig.ts - AI 配置

**State**：
```typescript
{
  apiKey: string,
  apiUrl: string,
  modelName: string,
  maxTokens: number,
  temperature: number
}
```

#### operationLog.ts - 操作日志

**State**：
```typescript
{
  logs: OperationLog[],  // 日志列表
  maxLogs: 500           // 最大保存数量
}
```

**Actions**：
- `addLog()` - 添加日志
- `clearLogs()` - 清空日志
- `rollbackOperation()` - 回滚操作

---

## 🎯 技术决策

### 为什么选择 Vue 3？

✅ **优势**：
- Composition API 提供更好的逻辑复用
- TypeScript 支持完善
- 性能优秀（Virtual DOM + 编译优化）
- 生态成熟（Pinia、Vue Router）
- 渐进式架构，易于上手

### 为什么使用 TypeScript？

✅ **优势**：
- 类型安全，减少运行时错误
- 更好的 IDE 支持和代码提示
- 重构更安全
- 文档即类型

### 为什么选择 Pinia？

✅ **优势**：
- Vue 3 官方推荐
- TypeScript 支持优秀
- API 简洁直观
- DevTools 支持
- 模块化设计

### 为什么使用 SCSS？

✅ **优势**：
- 变量、嵌套、混合等强大功能
- 主题系统开发更方便
- 代码组织更清晰
- 生态成熟

### 为什么选择 localStorage？

✅ **优势**：
- 简单易用，无需后端
- 浏览器原生支持
- 容量足够（5-10MB）
- 同步 API，性能好

⚠️ **局限**：
- 数据仅在本地
- 无法跨设备同步
- 清除浏览器数据会丢失

### 为什么不使用数据库？

**原因**：
- 项目定位是纯前端工具
- 无需用户注册登录
- 保护用户隐私
- 降低使用门槛
- 离线可用

---

### 组件优化如何强化技术决策？
本次基础组件的全面优化，进一步强化了我们在技术选型上的优势：
- **TypeScript**: 通过为每个组件的 Props、Emits 和内部状态提供详尽的类型定义，显著提升了代码的健壮性和开发效率。
- **Composition API**: 所有组件逻辑都以组合式函数的方式重构或增强，提升了逻辑复用性和可维护性。
- **SCSS 与 CSS Variables**: 样式层面的语义化变量替换，使得主题系统更加强大灵活，组件能够更好地适应多种视觉风格。
本次优化实践证明了当前技术栈在构建高质量、高可维护性前端应用方面的卓越表现。

## 📊 性能优化

### 1. 构建优化

- **Vite** - 快速冷启动和热更新
- **Tree-shaking** - 自动移除未使用代码
- **代码分割** - 路由级别的懒加载
- **压缩** - Gzip 和 Brotli 压缩

### 2. 运行时优化

- **虚拟滚动** - 大列表性能优化（计划中）
- **防抖节流** - 输入和滚动事件优化
- **懒加载** - 图片和组件按需加载
- **缓存** - 计算结果缓存

### 3. 样式优化

- **CSS Variables** - 动态主题切换无需重新渲染
- **Critical CSS** - 关键样式内联
- **按需加载** - 主题样式按需引入

---

## 🔮 未来规划

### 短期（v1.5）
- [ ] PWA 支持（离线使用）
- [ ] 数据导出优化（PDF、Excel）
- [ ] 更多主题
- [ ] 性能优化

### 中期（v2.0）
- [ ] 云端同步（可选）
- [ ] 团队协作功能
- [ ] 移动端原生应用
- [ ] 更多 AI 功能

### 长期
- [ ] 插件系统
- [ ] 社区分享
- [ ] 多语言支持
- [ ] 装备数据库

---

## 📚 参考资源

- [Vue 3 文档](https://cn.vuejs.org/)
- [TypeScript 手册](https://www.typescriptlang.org/docs/)
- [Pinia 文档](https://pinia.vuejs.org/zh/)
- [Vite 文档](https://cn.vitejs.dev/)
- [SCSS 文档](https://sass-lang.com/documentation/)

---

**架构设计是项目成功的基础。让我们持续优化和改进！** 🚀

**Last Updated**: 2025-10-15

