# 户外装备清单 - 基础组件改造文档

## 引言
本文档旨在为“户外装备清单”项目剩余未完成改造的基础组件提供详细的改造说明和建议。改造将遵循 Ant Design 和 Element Plus 的设计理念，结合项目现有架构约定，以提升组件的通用性、可配置性、类型安全、可访问性和主题集成能力。

## 改造原则概述
在组件改造过程中，我们将遵循以下核心原则：
1.  **类型安全优先**：所有组件及其 Props、Emits、Slots 和内部状态均应使用 TypeScript 进行严格类型定义和 JSDoc 注释。
2.  **Composition API 优先**：组件逻辑必须使用 Vue 3 的组合式 API 实现。
3.  **主题系统集成**：所有组件样式应充分利用 CSS Variables，实现无缝主题切换。
4.  **可配置性与通用性**：提供丰富的 Props 选项，使组件能够适应不同场景的需求。
5.  **可访问性 (Accessibility)**：确保组件符合无障碍标准，提供语义化的 HTML 结构和 `aria-*` 属性。
6.  **状态统一**：对于表单类组件，统一引入 `status: 'normal' | 'error' | 'success' | 'warning'` 属性。
7.  **模块化与解耦**：复杂逻辑应抽象为独立的组合式函数 (`composables/`) 或 Pinia Store (`stores/`)。
8.  **操作日志**：在涉及重要用户操作的业务逻辑中，应考虑集成 `stores/operationLog.ts` 进行操作记录。

## 改造明细

### 📁 src/components/common/others/

#### `BackToTopButton.vue`
*   **Props 和类型**: 完善 Props 的 JSDoc 注释，细化 `target`、`visibilityHeight`、`right`、`bottom`、`duration` 等属性的类型。
*   **SCSS 语义化**: 检查并替换硬编码的动画时间、颜色、阴影等为 CSS Variables，如 `var(--transition-duration-normal)`、`var(--bg-primary)`、`var(--shadow-md)`。
*   **功能增强**: 考虑增加 `slot` 用于自定义返回顶部按钮的内容。

#### `BaseDivider.vue`
*   **Props 和类型**: 完善 Props 的 JSDoc 注释，细化 `direction` (`horizontal` | `vertical`)、`contentPosition` (`left` | `center` | `right`)、`dashed` (boolean) 等属性的类型。
*   **SCSS 语义化**: 检查并替换硬编码的颜色、间距、线宽等为 CSS Variables，如 `var(--border-color)`、`var(--spacing-md)`、`var(--border-width)`。
*   **功能增强**: 考虑增加 `slot` 用于在分割线中插入文本或图标。

#### `BaseTooltip.vue`
*   **Props 和类型**: 完善 Props 的 JSDoc 注释，细化 `content` (string)、`placement` (如 `top` | `bottom` | `left` | `right`)、`trigger` (如 `hover` | `click` | `focus`)、`disabled` (boolean)、`visible` (boolean)、`offset` (number)、`duration` (number) 等属性的类型。
*   **SCSS 语义化**: 检查并替换硬编码的颜色、间距、动画时间、阴影等为 CSS Variables，如 `var(--bg-tooltip)`、`var(--text-on-tooltip)`、`var(--shadow-sm)`、`var(--transition-duration-normal)`。
*   **功能增强**:
    *   增加 `slot` 用于自定义 Tooltip 内容和触发器。
    *   考虑使用 `@vueuse/core` 中的 `useFloating` 或 `usePopper` 等更健壮的组合式函数来处理定位和交互逻辑，以提升鲁棒性。

### 📁 src/components/common/data/

#### `BaseAvatar.vue`
*   **Props 和类型**: 完善 Props 的 JSDoc 注释，细化 `src` (string)、`alt` (string)、`size` (`small` | `medium` | `large`)、`shape` (`circle` | `square`)、`icon` (string，用于字体图标)、`text` (string，用于文本头像) 等属性的类型。
*   **SCSS 语义化**: 检查并替换硬编码的尺寸、颜色、圆角、字体大小等为 CSS Variables，如 `var(--avatar-size-md)`、`var(--bg-avatar)`、`var(--text-on-avatar)`、`var(--border-radius-full)`。
*   **功能增强**: 考虑增加 `slot` 用于自定义头像内容，支持图片加载失败的 Fallback 机制（例如显示默认图标或首字母）。

#### `BaseBadge.vue`
*   **Props 和类型**: 完善 Props 的 JSDoc 注释，细化 `value` (string | number)、`max` (number，最大显示值)、`isDot` (boolean，是否显示为小红点)、`type` (`primary` | `success` | `warning` | `danger` | `info`)、`showZero` (boolean)、`offset` (数组 `[x, y]`) 等属性的类型。
*   **SCSS 语义化**: 检查并替换硬编码的颜色、尺寸、定位等为 CSS Variables，如 `var(--bg-badge-danger)`、`var(--text-on-badge)`、`var(--badge-size)`。
*   **功能增强**: 考虑增加 `slot` 用于自定义徽章内容，或将徽章作为 `slot` 的修饰。

#### `BaseStatCard.vue`
*   **Props 和类型**: 完善 Props 的 JSDoc 注释，细化 `title` (string)、`value` (string | number)、`icon` (string)、`description` (string)、`type` (`primary` | `success` | `warning` | `danger` | `info`)、`loading` (boolean) 等属性的类型。
*   **SCSS 语义化**: 检查并替换硬编码的颜色、间距、字体大小、阴影等为 CSS Variables，如 `var(--bg-stat-card-primary)`、`var(--text-stat-card-title)`、`var(--shadow-md)`。
*   **功能增强**: 考虑增加 `slot` 用于自定义卡片内容和图标，支持 `loading` 状态（包括骨架屏或加载动画）。

#### `BaseTag.vue`
*   **Props 和类型**: 完善 Props 的 JSDoc 注释，细化 `type` (`primary` | `success` | `warning` | `danger` | `info`)、`size` (`small` | `medium` | `large`)、`closable` (boolean)、`effect` (`light` | `plain` | `dark`)、`round` (boolean) 等属性的类型。
*   **SCSS 语义化**: 检查并替换硬编码的颜色、尺寸、圆角等为 CSS Variables，如 `var(--bg-tag-primary)`、`var(--text-on-tag)`、`var(--border-radius-md)`。
*   **功能增强**:
    *   增加 `close` 事件。
    *   考虑增加 `slot` 用于自定义标签内容（例如包含图标）。

#### `MarkdownViewer.vue`
*   **Props 和类型**: 完善 Props 的 JSDoc 注释，细化 `content` (string)、`theme` (string，如果支持多主题渲染) 等属性的类型。
*   **SCSS 语义化**: 检查并替换内部 Markdown 渲染的样式为 CSS Variables，确保与主题系统兼容。可能需要覆盖第三方库的默认样式。
*   **功能增强**: 考虑引入第三方 Markdown 渲染库（如果目前是自定义实现，或者当前库功能不足），支持代码高亮、目录生成、数学公式渲染等高级功能。

### 📁 src/components/common/navigation/

#### `BaseButtonDropdown.vue`
*   **Props 和类型**: 完善 Props 的 JSDoc 注释，细化 `label` (string)、`options` (Array<{ label: string; value: any; divided?: boolean; disabled?: boolean; }>)、`placement`、`trigger`、`disabled` 等属性的类型。
*   **SCSS 语义化**: 检查并替换硬编码的颜色、间距、阴影等为 CSS Variables，如 `var(--bg-dropdown-menu)`、`var(--shadow-md)`。
*   **功能增强**:
    *   与 `BaseDropdown` 等组件共享逻辑或抽象出 `useDropdown` 组合式函数。
    *   增加 `slot` 用于自定义按钮内容和下拉菜单项。
    *   考虑支持 `BaseDropdownItem` 的子组件插槽。

#### `BaseDropdown.vue`
*   **Props 和类型**: 完善 Props 的 JSDoc 注释，细化 `placement`、`trigger`、`visible`、`offset`、`hideOnClick` (boolean) 等属性的类型。
*   **SCSS 语义化**: 检查并替换硬编码的颜色、间距、阴影、动画等为 CSS Variables，如 `var(--bg-dropdown-panel)`、`var(--shadow-lg)`。
*   **功能增强**:
    *   增加 `slot` 用于自定义触发器和下拉内容。
    *   考虑使用 `@vueuse/core` 中的 `useFloating` 来处理定位和自动关闭。
    *   实现焦点管理，确保键盘导航的无障碍性。

#### `BaseDropdownItem.vue`
*   **Props 和类型**: 完善 Props 的 JSDoc 注释，细化 `label` (string)、`value` (any)、`disabled` (boolean)、`divided` (boolean)、`icon` (string) 等属性的类型。
*   **SCSS 语义化**: 检查并替换硬编码的颜色、间距、激活状态样式等为 CSS Variables，如 `var(--text-dropdown-item)`、`var(--bg-dropdown-item-hover)`。
*   **功能增强**:
    *   增加 `click` 事件。
    *   增加 `slot` 用于自定义项目内容。

#### `BaseDropdownSubmenu.vue`
*   **Props 和类型**: 完善 Props 的 JSDoc 注释，细化 `label` (string)、`placement`、`disabled` 等属性的类型。
*   **SCSS 语义化**: 检查并替换硬编码的颜色、间距、阴影等为 CSS Variables。
*   **功能增强**: 增加 `slot` 用于自定义子菜单触发器和内容。与 `BaseDropdown` 联动，支持多级嵌套。

#### `BaseMenuDropdown.vue`
*   **Props 和类型**: 完善 Props 的 JSDoc 注释，细化 `menu` (菜单项结构，可嵌套)、`placement`、`trigger`、`disabled` 等属性的类型。
*   **SCSS 语义化**: 检查并替换硬编码的颜色、间距、阴影等为 CSS Variables。
*   **功能增强**:
    *   定义清晰的 `MenuItem` 接口，支持嵌套菜单、图标、分隔线等。
    *   增加 `select` 事件。
    *   可以作为 `BaseDropdown` 的一个特定封装。

#### `BaseTabs.vue`
*   **Props 和类型**: 完善 Props 的 JSDoc 注释，细化 `modelValue` (string | number，当前激活标签的 name)、`tabs` (Array<{ label: string; name: string; disabled?: boolean; }>)、`type` (`card` | `border-card` | `line`)、`position` (`top` | `bottom` | `left` | `right`)、`closable` (boolean) 等属性的类型。
*   **SCSS 语义化**: 检查并替换硬编码的颜色、间距、边框、激活状态样式等为 CSS Variables，如 `var(--bg-tab-header)`、`var(--text-tab-active)`、`var(--border-color)`、`var(--primary-color)`。
*   **功能增强**:
    *   定义清晰的 `TabItem` 接口。
    *   增加 `tab-click`、`tab-change`、`tab-remove` 等事件。
    *   支持动态添加/移除标签页。
    *   增加 `slot` 用于自定义标签页内容和标签头。

### 📁 src/components/common/form/

#### `BaseButtonGroup.vue`
*   **Props 和类型**: 完善 Props 的 JSDoc 注释，细化 `buttons` (Array<ButtonConfig>)、`justify` (`start` | `center` | `end` | `between`)、`size` (`sm` | `md` | `lg`)、`vertical` (boolean) 等属性的类型。
*   **SCSS 语义化**: 检查并替换硬编码的间距、边框等为 CSS Variables，如 `var(--spacing-sm)`。
*   **功能增强**: 确保与 `BaseButton` 的样式和行为一致性，并能正确处理按钮组中的 `BaseButton` 属性。

#### `BaseRadio.vue`
*   **Props 和类型**: 完善 Props 的 JSDoc 注释，细化 `modelValue` (string | number | boolean)、`label` (string)、`value` (string | number | boolean)、`disabled` (boolean)、`size` (`sm` | `md` | `lg`)、`status` (`normal` | `error` | `success` | `warning`) 等属性的类型。
*   **统一 `status` 属性**: 引入 `status: 'error' | 'success' | 'warning' | 'normal'` 属性，并在样式中体现。
*   **SCSS 语义化**: 检查并替换硬编码的颜色、尺寸、圆角、禁用样式、焦点样式等为 CSS Variables，如 `var(--bg-radio-checked)`、`var(--border-color)`、`var(--text-primary)`、`var(--opacity-disabled)`、`var(--outline-focus)`。
*   **可访问性**: 确保 `input` 元素的 `id` 与 `label` 的 `for` 属性正确关联。

#### `BaseSwitch.vue`
*   **Props 和类型**: 完善 Props 的 JSDoc 注释，细化 `modelValue` (boolean | string | number)、`label` (string)、`disabled` (boolean)、`size` (`sm` | `md` | `lg`)、`activeValue` (any)、`inactiveValue` (any)、`activeText` (string)、`inactiveText` (string) 等属性的类型。
*   **统一 `status` 属性**: 引入 `status: 'error' | 'success' | 'warning' | 'normal'` 属性，并在样式中体现。
*   **SCSS 语义化**: 检查并替换硬编码的颜色、尺寸、圆角、禁用样式、动画时间、激活/非激活状态颜色等为 CSS Variables，如 `var(--bg-switch-active)`、`var(--bg-switch-inactive)`、`var(--transition-duration-normal)`、`var(--outline-focus)`。
*   **可访问性**: 确保 `input` 元素的 `id` 与 `label` 的 `for` 属性正确关联，并添加 `role="switch"` 和 `aria-checked` 属性。

#### `BaseTextarea.vue`
*   **Props 和类型**: 完善 Props 的 JSDoc 注释，细化 `modelValue` (string)、`placeholder` (string)、`disabled` (boolean)、`readonly` (boolean)、`maxlength` (number)、`rows` (number)、`showCount` (boolean)、`size` (`sm` | `md` | `lg`)、`status` (`normal` | `error` | `success` | `warning`) 等属性的类型。
*   **统一 `status` 属性**: 引入 `status: 'error' | 'success' | 'warning' | 'normal'` 属性，并移除 `error`。
*   **SCSS 语义化**: 检查并替换硬编码的颜色、间距、圆角、禁用/只读样式、焦点样式、计数器样式等为 CSS Variables，如 `var(--bg-input)`、`var(--border-color)`、`var(--text-primary)`、`var(--shadow-sm-primary)`、`var(--text-muted)`。
*   **功能增强**: 实现 `showCount` 逻辑（如果未实现的话，通常包括计算当前字数和显示在文本框下方）。

#### `InputSelect.vue` (这是一个组合组件，可能是 `Input` 和 `Select` 的结合)
*   **Props 和类型**: 完善 Props 的 JSDoc 注释，细化其内部 `BaseInput` 和 `BaseSelect` 的相关属性。考虑将其 Props 接口组合自 `BaseInput` 和 `BaseSelect` 的 Props。
*   **SCSS 语义化**: 检查并替换硬编码的颜色、间距、圆角等为 CSS Variables。
*   **组件拆解/重构**: 考虑到它可能是 `BaseInput` 和 `BaseSelect` 的结合，可以考虑将其功能整合到 `BaseInput` 或 `BaseSelect` 的 `slot` 中，或者作为示例组件保留，并在文档中说明其作为组合组件的用途。如果其功能可以被 `BaseInput` 的 `slot` 或 `component` 属性替代，则可以考虑移除。

### 📁 src/components/common/feedback/

#### `BaseAlert.vue`
*   **Props 和类型**: 完善 Props 的 JSDoc 注释，细化 `type` (`info` | `success` | `warning` | `danger`)、`message` (string)、`description` (string)、`showIcon` (boolean)、`closable` (boolean)、`center` (boolean)、`closeText` (string) 等属性的类型。
*   **SCSS 语义化**: 检查并替换硬编码的颜色、间距、图标尺寸等为 CSS Variables，如 `var(--bg-alert-info)`、`var(--text-alert-info)`、`var(--alert-icon-size)`。
*   **功能增强**:
    *   增加 `close` 事件。
    *   支持 `slot` 用于自定义内容。

#### `BaseConfirm.vue`
*   **Props 和类型**: 完善 Props 的 JSDoc 注释，细化 `title` (string)、`message` (string)、`confirmButtonText` (string)、`cancelButtonText` (string)、`showCancelButton` (boolean)、`type` (`default` | `info` | `success` | `warning` | `danger`) 等属性的类型。
*   **SCSS 语义化**: 检查并替换硬编码的颜色、间距、按钮样式等为 CSS Variables。
*   **功能增强**:
    *   与 `BaseModal` 结合使用，或者作为 `BaseModal` 的一个特定 `type` 封装。
    *   支持 Promise API，使其可以像 `window.confirm` 一样使用。

#### `BaseEmpty.vue`
*   **Props 和类型**: 完善 Props 的 JSDoc 注释，细化 `description` (string)、`image` (string，图片 URL) 等属性的类型。
*   **SCSS 语义化**: 检查并替换硬编码的颜色、间距、字体大小等为 CSS Variables，如 `var(--text-muted)`、`var(--spacing-md)`。
*   **功能增强**: 增加 `slot` 用于自定义空状态内容或图片。

#### `BaseLoading.vue`
*   **Props 和类型**: 完善 Props 的 JSDoc 注释，细化 `type` (`spinner` | `dots` | `bars` 等，表示加载动画类型)、`size` (`small` | `medium` | `large`)、`color` (string，颜色名称或 CSS 变量)、`text` (string，加载文本) 等属性的类型。
*   **SCSS 语义化**: 检查并替换硬编码的颜色、尺寸、动画时间等为 CSS Variables，如 `var(--loading-spinner-color)`、`var(--loading-text-color)`、`var(--transition-duration-normal)`。
*   **功能增强**: 考虑增加 `slot` 用于自定义加载文本或图标。

#### `BaseLoadingOverlay.vue`
*   **Props 和类型**: 完善 Props 的 JSDoc 注释，细化 `visible` (boolean)、`fullScreen` (boolean)、`target` (HTMLElement | string，目标元素选择器)、`text` (string)、`spinner` (string，加载图标类型) 等属性的类型。
*   **SCSS 语义化**: 检查并替换硬编码的颜色、尺寸、动画时间等为 CSS Variables，如 `var(--bg-overlay-light)`、`var(--loading-spinner-color)`。
*   **功能增强**:
    *   增加 `slot` 用于自定义加载内容。
    *   考虑使用 `@vueuse/core` 中的 `useLoading` 或类似方案进行更健壮的实现。

#### `ToastNotification.vue`
*   **Props 和类型**: 完善 Props 的 JSDoc 注释，细化 `message` (string)、`type` (`info` | `success` | `warning` | `danger`)、`duration` (number，自动关闭时长)、`position` (`top-left` | `top-right` | `bottom-left` | `bottom-right` 等)、`showIcon` (boolean)、`closable` (boolean) 等属性的类型。
*   **SCSS 语义化**: 检查并替换硬编码的颜色、间距、动画时间、阴影、图标尺寸等为 CSS Variables，如 `var(--bg-toast-info)`、`var(--text-toast-info)`、`var(--shadow-md)`。
*   **功能增强**:
    *   集成 `utils/eventBus.ts` 或提供组合式函数 `useToast` 进行调用。
    *   增加 `slot` 用于自定义通知内容。

---
**文档创建时间**: 2025-10-15
