# 基础组件库

本目录包含项目中所有的基础UI组件，参照 `element-plus` 的组件化思想进行分类管理。

## 📂 目录结构

```
common/
├── form/           # 表单组件
├── data/           # 数据展示组件
├── feedback/       # 反馈组件
├── navigation/     # 导航组件
├── others/         # 其他组件
└── index.ts        # 统一导出入口
```

## 🎨 组件分类

### 1️⃣ Form 表单组件 (`form/`)

用于用户输入和表单交互的组件。

| 组件 | 文件 | 用途 |
|------|------|------|
| **BaseButton** | `BaseButton.vue` | 统一按钮样式 |
| **BaseInput** | `BaseInput.vue` | 统一输入框样式 |
| **BaseSelect** | `BaseSelect.vue` | 统一下拉框样式 |
| **BaseTextarea** | `BaseTextarea.vue` | 统一文本域样式 |
| **InputSelect** | `InputSelect.vue` | 输入选择组件 |

### 2️⃣ Data 数据展示组件 (`data/`)

用于展示和组织数据内容的组件。

| 组件 | 文件 | 用途 |
|------|------|------|
| **BaseBadge** | `BaseBadge.vue` | 标签徽章 |
| **BaseCard** | `BaseCard.vue` | 卡片容器 |
| **BaseTable** | `BaseTable.vue` | 表格展示 |
| **MarkdownViewer** | `MarkdownViewer.vue` | Markdown渲染器 |

### 3️⃣ Feedback 反馈组件 (`feedback/`)

用于用户反馈和提示的组件。

| 组件 | 文件 | 用途 |
|------|------|------|
| **BaseConfirm** | `BaseConfirm.vue` | 确认对话框 |
| **BaseModal** | `BaseModal.vue` | 模态框 |
| **ToastNotification** | `ToastNotification.vue` | 消息提示 |
| **BaseEmpty** | `BaseEmpty.vue` | 空状态提示 |
| **BaseLoading** | `BaseLoading.vue` | 加载状态 |

### 4️⃣ Navigation 导航组件 (`navigation/`)

用于页面导航和切换的组件。

| 组件 | 文件 | 用途 |
|------|------|------|
| **BaseTabs** | `BaseTabs.vue` | 标签页切换 |

### 5️⃣ Others 其他组件 (`others/`)

其他辅助性组件。

| 组件 | 文件 | 用途 |
|------|------|------|
| **BackToTopButton** | `BackToTopButton.vue` | 回到顶部按钮 |

## 📦 使用方式

### 方式一：从总入口导入（推荐）

```typescript
// 导入所有组件
import { BaseButton, BaseInput, BaseCard, BaseModal } from '@/components/common'
```

### 方式二：从分类入口导入

```typescript
// 只导入表单组件
import { BaseButton, BaseInput } from '@/components/common/form'

// 只导入反馈组件
import { BaseModal, ToastNotification } from '@/components/common/feedback'
```

### 方式三：直接导入单个组件

```typescript
import BaseButton from '@/components/common/form/BaseButton.vue'
import BaseModal from '@/components/common/feedback/BaseModal.vue'
```

## 🎯 设计原则

1. **单一职责**：每个组件只负责一个UI元素的渲染和交互
2. **可组合性**：组件可以互相嵌套和组合使用
3. **主题无关**：组件只使用设计Token，不依赖特定主题
4. **可访问性**：所有组件都符合WCAG AA标准
5. **类型安全**：使用TypeScript提供完整的类型支持

## 📝 组件开发规范

### 命名规范
- 组件文件名：PascalCase（如：`BaseButton.vue`）
- 组件导出名：PascalCase（如：`export default BaseButton`）
- Props命名：camelCase（如：`variant`, `isLoading`）

### 目录规范
- 新增表单类组件 → 放入 `form/`
- 新增数据展示组件 → 放入 `data/`
- 新增反馈类组件 → 放入 `feedback/`
- 新增导航类组件 → 放入 `navigation/`
- 其他辅助组件 → 放入 `others/`

### 导出规范
1. 在对应分类的 `index.ts` 中添加导出
2. 在总入口 `common/index.ts` 中添加导出

## 🔮 未来扩展计划

考虑添加以下组件：

- **navigation/** - 更多导航组件（面包屑、菜单、步骤条等）
- **layout/** - 布局组件（容器、栅格、分隔线等）
- **advanced/** - 高级组件（树形控件、级联选择、虚拟滚动等）

## 📚 参考文档

- [基础组件使用指南](../../../docs/guides/BASE_COMPONENTS_GUIDE.md)
- [主题使用指南](../../../docs/guides/THEME_USAGE_GUIDE.md)

---

**维护者**: OutdoorChecklist Team  
**最后更新**: 2025-10-13

