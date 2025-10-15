# 基础UI组件使用指南

## 📦 组件概述

为了实现风格统一化和提升代码复用性，我们创建了一套完整的基础UI组件库。所有组件都：

- ✅ 使用统一的设计Token系统
- ✅ 支持14个主题自动适配
- ✅ 符合WCAG AA可访问性标准
- ✅ 提供TypeScript类型支持 (已全面完善 JSDoc 和类型推断)
- ✅ 包含完整的交互状态

> **注意**: 基础组件正在进行全面的优化改造。您可以在 [基础组件改造计划文档](COMPONENT_TRANSFORMATION_PLAN.md) 中查看详细的改造明细和未完成项。

---

## 🎨 组件列表

### Others 其他组件 ⭐
| 组件 | 文件 | 用途 |
|------|------|------|
| **BackToTopButton** | `others/BackToTopButton.vue` | 返回顶部按钮 |
| **BaseDivider** | `others/BaseDivider.vue` | 分隔线 ⭐ |
| **BaseTooltip** | `others/BaseTooltip.vue` | 提示框 |

---

### Form 表单组件
| 组件 | 文件 | 用途 |
|------|------|------|
| **BaseButton** | `form/BaseButton.vue` | 统一按钮样式 (已优化) |
| **BaseButtonGroup** | `form/BaseButtonGroup.vue` | 按钮组 ⭐ |
| **BaseInput** | `form/BaseInput.vue` | 统一输入框样式 (已优化) |
| **BaseSelect** | `form/BaseSelect.vue` | 统一下拉框样式 (已优化) |
| **BaseTextarea** | `form/BaseTextarea.vue` | 统一文本域样式 |
| **BaseCheckbox** | `form/BaseCheckbox.vue` | 统一复选框样式 (已优化) |
| **BaseRadio** | `form/BaseRadio.vue` | 统一单选框样式 ⭐ |
| **BaseSwitch** | `form/BaseSwitch.vue` | 开关组件 ⭐ |
| **BaseForm** | `form/BaseForm.vue` | 表单容器 (已优化) |
| **BaseFormField** | `form/BaseFormField.vue` | 表单项包装器 ⭐ |
| **InputSelect** | `form/InputSelect.vue` | 输入选择器（已弃用） |

### Data 数据展示组件
| 组件 | 文件 | 用途 |
|------|------|------|
| **BaseCard** | `data/BaseCard.vue` | 统一卡片容器 (已优化) |
| **BaseTable** | `data/BaseTable.vue` | 统一表格样式 (已优化) |
| **BaseBadge** | `data/BaseBadge.vue` | 统一标签徽章 |
| **BaseStatCard** | `data/BaseStatCard.vue` | 统计卡片 ⭐ |
| **BaseAvatar** | `data/BaseAvatar.vue` | 头像组件 ⭐ |
| **MarkdownViewer** | `data/MarkdownViewer.vue` | Markdown 渲染器 ⭐ |

### Feedback 反馈组件
| 组件 | 文件 | 用途 |
|------|------|------|
| **BaseModal** | `feedback/BaseModal.vue` | 统一模态框 (已优化) |
| **BaseConfirm** | `feedback/BaseConfirm.vue` | 统一确认对话框 |
| **BaseEmpty** | `feedback/BaseEmpty.vue` | 统一空状态提示 ⭐ |
| **BaseLoading** | `feedback/BaseLoading.vue` | 统一加载状态 ⭐ |
| **BaseLoadingOverlay** | `feedback/BaseLoadingOverlay.vue` | 加载遮罩层 ⭐ |
| **BaseAlert** | `feedback/BaseAlert.vue` | 警告提示 ⭐ |
| **ToastNotification** | `feedback/ToastNotification.vue` | Toast 通知 ⭐ |

### Navigation 导航组件 ⭐
| 组件 | 文件 | 用途 |
|------|------|------|
| **BaseTabs** | `navigation/BaseTabs.vue` | 统一标签页切换 ⭐ |
| **BaseDropdown** | `navigation/BaseDropdown.vue` | 统一下拉菜单 ⭐ |
| **BaseDropdownItem** | `navigation/BaseDropdownItem.vue` | 下拉菜单项 ⭐ |
| **BaseDropdownSubmenu** | `navigation/BaseDropdownSubmenu.vue` | 下拉子菜单 ⭐ |
| **BaseMenuDropdown** | `navigation/BaseMenuDropdown.vue` | 菜单下拉组件 ⭐ |
| **BaseButtonDropdown** | `navigation/BaseButtonDropdown.vue` | 按钮下拉组件 ⭐ |

---

## 🔘 BaseButton - 按钮组件 (已优化)

> **注意**: 详细的 Props 参数和使用说明请查阅 [基础组件改造计划文档](COMPONENT_TRANSFORMATION_PLAN.md)。本节仅保留基础用法和迁移示例。

### 基础用法

```vue
<template>
  <BaseButton @click="handleClick">
    点击我
  </BaseButton>
</template>

<script setup lang="ts">
import BaseButton from '@/components/common/form/BaseButton.vue'

function handleClick() {
  console.log('按钮被点击')
}
</script>
```

### 样式特点

- ✅ 自动使用设计Token（`--accent-primary`、`--spacing-*`等）
- ✅ 悬浮时上移2px + 阴影增强
- ✅ 焦点时显示焦点环
- ✅ 加载时自动禁用 + 显示loading图标
- ✅ 支持所有主题自动适配

---

## 📝 BaseInput - 输入框组件 (已优化)

> **注意**: 详细的 Props 参数和使用说明请查阅 [基础组件改造计划文档](COMPONENT_TRANSFORMATION_PLAN.md)。本节仅保留基础用法和迁移示例。

### 基础用法

```vue
<template>
  <BaseInput
    v-model="username"
    label="用户名"
    placeholder="请输入用户名"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import BaseInput from '@/components/common/form/BaseInput.vue'

const username = ref('')
</script>
```

### 事件

| 事件 | 参数 | 说明 |
|------|------|------|
| `update:modelValue` | `value: string \| number` | 值变化 |
| `blur` | - | 失去焦点 |
| `focus` | - | 获得焦点 |
| `enter` | - | 按下回车 |
| `clear` | - | 点击清空 |

---

## 📋 BaseSelect - 下拉框组件 (已优化)

> **注意**: 详细的 Props 参数和使用说明请查阅 [基础组件改造计划文档](COMPONENT_TRANSFORMATION_PLAN.md)。本节仅保留基础用法和迁移示例。

### 基础用法

```vue
<template>
  <BaseSelect
    v-model="category"
    label="装备类型"
    :options="categoryOptions"
    placeholder="请选择装备类型"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import BaseSelect from '@/components/common/form/BaseSelect.vue'

const category = ref('')
const categoryOptions = [
  { label: '背包', value: 'backpack' },
  { label: '帐篷', value: 'tent' },
  { label: '睡袋', value: 'sleeping-bag' }
]
</script>
```

---

## ✅ BaseCheckbox - 复选框组件 (已优化)

> **注意**: 详细的 Props 参数和使用说明请查阅 [基础组件改造计划文档](COMPONENT_TRANSFORMATION_PLAN.md)。本节仅保留基础用法和迁移示例。

### 基础用法

```vue
<template>
  <BaseCheckbox v-model="agree">我已阅读并同意</BaseCheckbox>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import BaseCheckbox from '@/components/common/form/BaseCheckbox.vue'

const agree = ref(false)
</script>
```

---

## 📄 BaseTextarea - 文本域组件

> **注意**: 详细的 Props 参数和使用说明请查阅 [基础组件改造计划文档](COMPONENT_TRANSFORMATION_PLAN.md)。

### 基础用法

```vue
<template>
  <BaseTextarea
    v-model="description"
    label="装备描述"
    placeholder="请输入详细描述..."
    :rows="6"
    :maxlength="500"
    show-count
  />
</template>

<script setup>
import { ref } from 'vue'
import BaseTextarea from '@/components/common/BaseTextarea.vue'

const description = ref('')
</script>
```

---

## 🃏 BaseCard - 卡片组件 (已优化)

> **注意**: 详细的 Props 参数和使用说明请查阅 [基础组件改造计划文档](COMPONENT_TRANSFORMATION_PLAN.md)。本节仅保留基础用法和迁移示例。

### 基础用法

```vue
<template>
  <BaseCard title="装备清单" hoverable>
    <p>这是卡片内容</p>
    
    <template #footer>
      <BaseButton size="sm">编辑</BaseButton>
      <BaseButton variant="danger" size="sm">删除</BaseButton>
    </template>
  </BaseCard>
</template>

<script setup lang="ts">
import BaseCard from '@/components/common/data/BaseCard.vue'
import BaseButton from '@/components/common/form/BaseButton.vue'
</script>
```

### 插槽

| 插槽 | 说明 |
|------|------|
| `default` | 卡片主体内容 |
| `header` | 自定义头部 |
| `extra` | 头部右侧额外内容 |
| `footer` | 底部操作区 |
| `cover` | 封面内容 |
| `tags` | 标签内容 |

---

## 📊 BaseTable - 表格组件 (已优化)

> **注意**: 详细的 Props 参数和使用说明请查阅 [基础组件改造计划文档](COMPONENT_TRANSFORMATION_PLAN.md)。本节仅保留基础用法和迁移示例。

### 基础用法

```vue
<template>
  <BaseTable
    title="装备清单"
    :columns="columns"
    :data="tableData"
    hoverable
    striped
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import BaseTable from '@/components/common/data/BaseTable.vue'

const columns = [
  { key: 'name', label: '名称', width: '200px', sortable: true },
  { key: 'weight', label: '重量', align: 'right', sortable: true },
  { key: 'price', label: '价格', align: 'right' }
]

const tableData = ref([
  { name: '背包', weight: '2000g', price: '¥500' },
  { name: '帐篷', weight: '3500g', price: '¥800' }
])
</script>
```

---

## ⚪ BaseModal - 模态框组件 (已优化)

> **注意**: 详细的 Props 参数和使用说明请查阅 [基础组件改造计划文档](COMPONENT_TRANSFORMATION_PLAN.md)。本节仅保留基础用法和迁移示例。

### 基础用法

```vue
<template>
  <BaseModal v-model="showModal" title="提示" description="这是一个模态框。"></BaseModal>
  <BaseButton @click="showModal = true">打开模态框</BaseButton>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import BaseModal from '@/components/common/feedback/BaseModal.vue'
import BaseButton from '@/components/common/form/BaseButton.vue'

const showModal = ref(false)
</script>
```

---

## 🏷 BaseBadge - 标签徽章组件

> **注意**: 详细的 Props 参数和使用说明请查阅 [基础组件改造计划文档](COMPONENT_TRANSFORMATION_PLAN.md)。

### 基础用法

```vue
<template>
  <BaseBadge variant="success">已完成</BaseBadge>
  <BaseBadge variant="warning">待确认</BaseBadge>
  <BaseBadge variant="danger">缺失</BaseBadge>
</template>

<script setup>
import BaseBadge from '@/components/common/data/BaseBadge.vue'
</script>
```

---

## 💡 实际应用场景

### 场景1：表单页面

```vue
<template>
  <BaseCard title="添加装备" padding="lg">
    <BaseForm 
      v-model="form"
      :fields="formFields"
      @submit="handleSubmit"
    />
  </BaseCard>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import BaseCard from '@/components/common/data/BaseCard.vue'
import BaseForm from '@/components/common/form/BaseForm.vue'
import { FormField } from '@/components/common/form/BaseForm.vue'

const form = reactive({
  name: '',
  category: '',
  weight: null,
  description: '',
})

const formFields: FormField[] = [
  {
    name: 'name',
    label: '装备名称',
    type: 'text',
    placeholder: '例如：65L登山背包',
    required: true,
    hint: '请输入装备名称',
  },
  {
    name: 'category',
    label: '装备类型',
    type: 'select',
    options: [
      { label: '背包', value: 'backpack' },
      { label: '帐篷', value: 'tent' },
      { label: '睡袋', value: 'sleeping-bag' },
    ],
    required: true,
  },
  {
    name: 'weight',
    label: '重量（克）',
    type: 'number',
    suffixIcon: '⚖️',
    hint: '请输入装备的准确重量',
  },
  {
    name: 'description',
    label: '装备描述',
    type: 'textarea',
    placeholder: '装备的详细描述、使用场景、注意事项等...',
    rows: 6,
    maxlength: 1000,
    showCount: true,
  },
]

function handleSubmit(formData: Record<string, any>) {
  console.log('表单提交', formData)
  // 可以在这里集成 operationLog.ts 记录操作
}

function handleCancel() {
  console.log('取消')
}
</script>
```

### 场景2：状态展示

```vue
<template>
  <div class="equipment-list">
    <BaseCard
      v-for="item in equipment"
      :key="item.id"
      hoverable
      clickable
      @click="viewDetails(item)"
    >
      <div class="item-header">
        <h4>{{ item.name }}</h4>
        <BaseBadge :variant="getStatusVariant(item.status)">
          {{ item.status }}
        </BaseBadge>
      </div>
      <p>{{ item.description }}</p>
    </BaseCard>
  </div>
</template>
```

### 场景3：数据表格

```vue
<template>
  <BaseTable
    title="装备统计"
    :columns="columns"
    :data="data"
    row-clickable
    @row-click="handleRowClick"
  >
    <template #actions>
      <BaseButton size="sm" icon="+" @click="addNew">添加</BaseButton>
      <BaseButton size="sm" variant="outline" icon="↻">刷新</BaseButton>
    </template>
    
    <template #cell-status="{ row }">
      <BaseBadge :variant="row.completed ? 'success' : 'warning'">
        {{ row.completed ? '已完成' : '待准备' }}
      </BaseBadge>
    </template>
    
    <template #cell-actions="{ row }">
      <BaseButton size="sm" variant="text" @click.stop="edit(row)">编辑</BaseButton>
      <BaseButton size="sm" variant="text" @click.stop="remove(row)">删除</BaseButton>
    </template>
  </BaseTable>
</template>
```

---

## 🎨 主题适配

所有基础组件都使用设计Token，自动适配14个主题：

```vue
<style scoped lang="scss">
/* ✅ 组件内部使用Token */
.component {
  background: var(--bg-card);           /* 自动适配主题背景 */
  color: var(--text-primary);           /* 自动适配主题文本色 */
  padding: var(--spacing-md);           /* 自动适配主题间距 */
  border-radius: var(--radius-md);      /* 自动适配主题圆角 */
  box-shadow: var(--shadow-md);         /* 自动适配主题阴影 */
}

/* 统一的禁用透明度示例 */
.my-disabled-element {
  opacity: var(--opacity-disabled);
}
</style>
```

### 主题特色保留

- **Pixel主题**：自动应用0圆角、硬阴影
- **Dark主题**：自动应用荧光效果
- **Minimal主题**：自动应用极简样式
- **Paper主题**：自动应用手绘边框（通过全局样式）

---

## 📐 组件组合示例

### 完整表单示例

```vue
<template>
  <BaseCard title="装备信息" shadow="lg" padding="lg">
    <BaseForm
      v-model="form"
      :fields="formFields"
      @submit="handleSubmit"
      title="装备信息表单"
    />
  </BaseCard>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import BaseCard from '@/components/common/data/BaseCard.vue'
import BaseForm from '@/components/common/form/BaseForm.vue'
import { FormField } from '@/components/common/form/BaseForm.vue'

const form = reactive({
  name: '',
  category: '',
  weight: null,
  description: '',
  agreeTerms: false, // 新增 checkbox 字段
})

const categoryOptions = [
  { label: '背包', value: 'backpack' },
  { label: '帐篷', value: 'tent' },
  { label: '睡袋', value: 'sleeping-bag' },
]

const formFields: FormField[] = [
  {
    name: 'name',
    label: '装备名称',
    type: 'text',
    placeholder: '例如：65L登山背包',
    required: true,
    // error: '请输入装备名称', // 错误信息现在通过 status 属性传递
    hint: '请输入装备名称',
    clearable: true,
    status: 'normal', // 默认状态
  },
  {
    name: 'category',
    label: '装备类型',
    type: 'select',
    options: categoryOptions,
    required: true,
    // error: '请选择装备类型', // 错误信息现在通过 status 属性传递
    status: 'normal',
  },
  {
    name: 'weight',
    label: '重量（克）',
    type: 'number',
    suffixIcon: '⚖️',
    hint: '请输入装备的准确重量',
    status: 'normal',
  },
  {
    name: 'description',
    label: '装备描述',
    type: 'textarea',
    placeholder: '装备的详细描述、使用场景、注意事项等...',
    rows: 6,
    maxlength: 1000,
    showCount: true,
    status: 'normal',
  },
  {
    name: 'agreeTerms',
    type: 'checkbox',
    checkboxLabel: '我已阅读并同意用户协议',
    required: true,
    status: 'normal',
  }
]

function handleSubmit(formData: Record<string, any>) {
  console.log('表单提交', formData)
  // 可以在这里集成 operationLog.ts 记录操作
}

function handleCancel() {
  console.log('取消')
}
</script>

<style scoped lang="scss">
.equipment-form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-md);
}

.badge-group {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
}
</style>
```

---

## ✅ 组件优势

### 1. 风格统一

- 所有输入框、按钮、卡片样式完全一致
- 自动适配14个主题
- 交互行为标准化

### 2. 代码复用

```vue
<!-- ❌ 之前：每次都要写样式 -->
<button class="btn btn-primary" style="padding: 10px 20px">
  保存
</button>

<!-- ✅ 现在：直接使用组件 -->
<BaseButton variant="primary">
  保存
</BaseButton>
```

### 3. 类型安全

```typescript
// TypeScript自动提示和类型检查
<BaseButton
  variant="primary"  // ✅ 类型提示
  size="md"          // ✅ 类型提示
  loading={loading}  // ✅ 类型检查
>
```

### 4. 可访问性

所有组件都包含：
- ✅ 正确的ARIA属性
- ✅ 键盘导航支持
- ✅ 焦点状态清晰
- ✅ 对比度符合WCAG AA

---

## 🔄 迁移指南

### 从原生元素迁移到基础组件

#### Button迁移

```vue
<!-- 旧代码 -->
<button class="btn btn-primary" @click="save">保存</button>
<button class="btn btn-success" disabled>成功</button>

<!-- 新代码 -->
<BaseButton variant="primary" @click="save">保存</BaseButton>
<BaseButton variant="success" disabled>成功</BaseButton>
```

#### Input迁移

```vue
<!-- 旧代码 -->
<input 
  type="text"
  v-model="name"
  placeholder="请输入"
  class="form-control"
/>

<!-- 新代码 -->
<BaseInput
  v-model="name"
  placeholder="请输入"
  status="normal" // 默认状态
/>
```

#### Select迁移

```vue
<!-- 旧代码 -->
<select v-model="category" class="form-select">
  <option value="">请选择</option>
  <option value="1">选项1</option>
</select>

<!-- 新代码 -->
<BaseSelect
  v-model="category"
  :options="[
    { label: '选项1', value: '1' }
  ]"
  placeholder="请选择"
  status="normal" // 默认状态
  clearable
/>
```

#### Checkbox迁移

```vue
<!-- 旧代码 -->
<input type="checkbox" v-model="agree" id="agree-terms" />
<label for="agree-terms">我已阅读并同意</label>

<!-- 新代码 -->
<BaseCheckbox v-model="agree">我已阅读并同意</BaseCheckbox>
```

---

## 🎯 最佳实践

### 1. 统一使用基础组件

```vue
<!-- ✅ 推荐 -->
<BaseButton variant="primary">按钮</BaseButton>
<BaseInput v-model="value" />
<BaseCard>内容</BaseCard>
<BaseCheckbox v-model="checked" />

<!-- ❌ 避免 -->
<button class="custom-btn">按钮</button>
<input type="text" />
<div class="card">内容</div>
<input type="checkbox" />
```

### 2. 利用组合

```vue
<BaseCard>
  <BaseTable :data="data">
    <template #cell-actions>
      <BaseButton size="sm">编辑</BaseButton>
    </template>
  </BaseTable>
</BaseCard>
```

### 3. 保持一致性

```vue
<!-- ✅ 尺寸一致 -->
<BaseInput size="md" />
<BaseButton size="md" />

<!-- ❌ 避免不一致 -->
<BaseInput size="sm" />
<BaseButton size="lg" />
```

---

## 🚀 性能优化

### 1. 按需导入

```vue
<script setup lang="ts">
// ✅ 只导入需要的组件
import BaseButton from '@/components/common/form/BaseButton.vue'
import BaseInput from '@/components/common/form/BaseInput.vue'
</script>
```

### 2. 懒加载大型组件

```vue
<script setup lang="ts">
import { defineAsyncComponent } from 'vue'
// 对于复杂表格，使用异步加载
const BaseTable = defineAsyncComponent(() =>
  import('@/components/common/data/BaseTable.vue')
)
</script>
```

---

## 📝 组件扩展

### 创建业务组件

基于基础组件创建业务特定组件：

```vue
<!-- EquipmentInput.vue - 装备输入组件 -->
<template>
  <BaseInput
    v-model="modelValue"
    prefix-icon="🎒"
    placeholder="输入装备名称..."
    clearable
    @enter="handleAdd"
  />
</template>

<script setup lang="ts">
import BaseInput from '@/components/common/form/BaseInput.vue'
// ... 业务逻辑
</script>
```

---

## 🎓 设计原则

### 1. 单一职责

每个组件只负责一个UI元素的渲染和交互

### 2. 可组合性

组件可以互相嵌套和组合使用

### 3. 主题无关

组件只使用设计Token，不依赖特定主题

### 4. 可访问性优先

所有组件都符合WCAG AA标准

---

## 📊 组件覆盖率

| 原生元素 | 基础组件 | 状态 |
|---------|---------|------|
| `<button>` | `BaseButton` | ✅ 已优化 |
| `<input type="text">` | `BaseInput` | ✅ 已优化 |
| `<input type="checkbox">` | `BaseCheckbox` | ✅ 已优化 |
| `<input type="radio">` | `BaseRadio` | ✅ 已创建 ⭐ |
| `<input type="switch">` | `BaseSwitch` | ✅ 已创建 ⭐ |
| `<select>` | `BaseSelect` | ✅ 已优化 |
| `<textarea>` | `BaseTextarea` | ✅ 已创建 |
| `<form>` | `BaseForm` | ✅ 已优化 |
| `<table>` | `BaseTable` | ✅ 已优化 |
| `<div class="card">` | `BaseCard` | ✅ 已优化 |
| `<span class="badge">` | `BaseBadge` | ✅ 已创建 |
| `.tab-btn` | `BaseTabs` | ✅ 已创建 ⭐ |
| `.dropdown` | `BaseDropdown` | ✅ 已创建 ⭐ |
| `.empty-state` | `BaseEmpty` | ✅ 已创建 ⭐ |
| `.loading-spinner` | `BaseLoading` | ✅ 已创建 ⭐ |
| `<hr>` | `BaseDivider` | ✅ 已创建 ⭐ |
| `.toast` | `ToastNotification` | ✅ 已创建 ⭐ |
| `.alert` | `BaseAlert` | ✅ 已创建 ⭐ |

---

## 🔮 未来扩展

### 计划中的组件

以下是未来计划中需要进一步优化或实现的组件列表，详细改造说明请参考 [基础组件改造计划文档](COMPONENT_TRANSFORMATION_PLAN.md)。

- [ ] BaseCheckbox - 复选框 (已优化)
- [ ] BaseRadio - 单选框 (待优化)
- [ ] BaseSwitch - 开关 (待优化)
- [ ] BaseTabs - 标签页 (待优化)
- [ ] BaseDropdown - 下拉菜单 (待优化)
- [ ] BaseEmpty - 空状态 (待优化)
- [ ] BaseLoading - 加载状态 (待优化)
- [ ] BaseDivider - 分隔线 (待优化)
- [ ] BaseAlert - 警告提示 (待优化)
- [ ] ToastNotification - Toast 通知 (待优化)
- [ ] BaseButtonGroup - 按钮组 (待优化)
- [ ] BaseForm - 表单容器 (已优化)
- [ ] BaseFormField - 表单项包装器 (待优化)
- [ ] BaseStatCard - 统计卡片 (待优化)
- [ ] MarkdownViewer - Markdown 渲染器 (待优化)
- [ ] BaseTooltip - 提示框 (待优化)
- [ ] BasePagination - 分页器
- [ ] BaseProgress - 进度条
- [ ] BaseBreadcrumb - 面包屑
- [ ] BaseSteps - 步骤条

---

## 📞 技术支持

### 问题反馈

如遇组件问题，请提供：
1. 组件名称和版本
2. 使用的Props配置
3. 预期效果 vs 实际效果
4. 浏览器和主题信息

### 贡献指南

欢迎提交新组件或改进建议！

---

**文档版本**：v2.1.0  
**创建日期**：2025-10-13  
**最后更新**：2025-10-15  
**维护者**：OutdoorChecklist Team  

🎉 **基础组件库 - 让UI开发更简单、更统一！**

---

## 📝 更新记录

### v2.1.0 (2025-10-15)
- ✅ 全面优化基础组件：BaseButton, BaseInput, BaseSelect, BaseCheckbox, BaseForm, BaseCard, BaseTable。
- 强化了 TypeScript 类型安全，增加了详细的 JSDoc 注释。
- 优化了样式变量的语义化，增强了主题系统集成。
- 提升了组件的可配置性和可访问性。
- 发布了 [基础组件改造计划文档](COMPONENT_TRANSFORMATION_PLAN.md)。

### v2.0.0 (2025-10-13)
- ✅ 新增 Form 组件: BaseCheckbox, BaseRadio
- ✅ 新增 Feedback 组件: BaseEmpty, BaseLoading
- ✅ 新增 Navigation 分类: BaseTabs, BaseDropdown, BaseDropdownItem
- ✅ 新增 Others 组件: BaseDivider
- ✅ 重新组织目录结构,按类型分类存放
- ✅ 完善TypeScript类型定义
- ✅ 所有组件支持主题自动适配

### v1.0.0 (2025-10-13)
- 初始版本,包含 7 个基础组件

