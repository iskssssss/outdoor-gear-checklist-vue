# 基础UI组件使用指南

## 📦 组件概述

为了实现风格统一化和提升代码复用性，我们创建了一套完整的基础UI组件库。所有组件都：

- ✅ 使用统一的设计Token系统
- ✅ 支持14个主题自动适配
- ✅ 符合WCAG AA可访问性标准
- ✅ 提供TypeScript类型支持
- ✅ 包含完整的交互状态

---

## 🎨 组件列表

### Others 其他组件 ⭐
| 组件 | 文件 | 用途 |
|------|------|------|
| **BackToTopButton** | `others/BackToTopButton.vue` | 返回顶部按钮 |
| **BaseDivider** | `others/BaseDivider.vue` | 分隔线 ⭐ |

---

### Form 表单组件
| 组件 | 文件 | 用途 |
|------|------|------|
| **BaseButton** | `form/BaseButton.vue` | 统一按钮样式 |
| **BaseButtonGroup** | `form/BaseButtonGroup.vue` | 按钮组 ⭐ |
| **BaseInput** | `form/BaseInput.vue` | 统一输入框样式 |
| **BaseSelect** | `form/BaseSelect.vue` | 统一下拉框样式 |
| **BaseTextarea** | `form/BaseTextarea.vue` | 统一文本域样式 |
| **BaseCheckbox** | `form/BaseCheckbox.vue` | 统一复选框样式 ⭐ |
| **BaseRadio** | `form/BaseRadio.vue` | 统一单选框样式 ⭐ |
| **BaseSwitch** | `form/BaseSwitch.vue` | 开关组件 ⭐ |
| **BaseForm** | `form/BaseForm.vue` | 表单容器 ⭐ |
| **BaseFormField** | `form/BaseFormField.vue` | 表单项包装器 ⭐ |
| **InputSelect** | `form/InputSelect.vue` | 输入选择器（已弃用） |

### Data 数据展示组件
| 组件 | 文件 | 用途 |
|------|------|------|
| **BaseCard** | `data/BaseCard.vue` | 统一卡片容器 |
| **BaseTable** | `data/BaseTable.vue` | 统一表格样式 |
| **BaseBadge** | `data/BaseBadge.vue` | 统一标签徽章 |
| **BaseStatCard** | `data/BaseStatCard.vue` | 统计卡片 ⭐ |
| **MarkdownViewer** | `data/MarkdownViewer.vue` | Markdown 渲染器 ⭐ |

### Feedback 反馈组件
| 组件 | 文件 | 用途 |
|------|------|------|
| **BaseModal** | `feedback/BaseModal.vue` | 统一模态框 |
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

## 🔘 BaseButton - 按钮组件

### 基础用法

```vue
<template>
  <BaseButton @click="handleClick">
    点击我
  </BaseButton>
</template>

<script setup>
import BaseButton from '@/components/common/BaseButton.vue'

function handleClick() {
  console.log('按钮被点击')
}
</script>
```

### Props参数

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `variant` | `'primary' \| 'success' \| 'warning' \| 'danger' \| 'info' \| 'secondary' \| 'outline' \| 'text'` | `'primary'` | 按钮类型 |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | 按钮尺寸 |
| `type` | `'button' \| 'submit' \| 'reset'` | `'button'` | 原生type |
| `disabled` | `boolean` | `false` | 禁用状态 |
| `loading` | `boolean` | `false` | 加载状态 |
| `icon` | `string` | `''` | 图标 |
| `iconPosition` | `'left' \| 'right'` | `'left'` | 图标位置 |
| `block` | `boolean` | `false` | 块级按钮 |
| `rounded` | `boolean` | `false` | 圆角按钮 |

### 使用示例

```vue
<template>
  <!-- 不同类型 -->
  <BaseButton variant="primary">主要按钮</BaseButton>
  <BaseButton variant="success">成功按钮</BaseButton>
  <BaseButton variant="warning">警告按钮</BaseButton>
  <BaseButton variant="danger">危险按钮</BaseButton>
  <BaseButton variant="outline">边框按钮</BaseButton>
  
  <!-- 不同尺寸 -->
  <BaseButton size="sm">小按钮</BaseButton>
  <BaseButton size="md">中按钮</BaseButton>
  <BaseButton size="lg">大按钮</BaseButton>
  
  <!-- 带图标 -->
  <BaseButton icon="🔍" icon-position="left">搜索</BaseButton>
  <BaseButton icon="→" icon-position="right">下一步</BaseButton>
  
  <!-- 状态 -->
  <BaseButton disabled>禁用按钮</BaseButton>
  <BaseButton loading>加载中...</BaseButton>
  
  <!-- 修饰符 -->
  <BaseButton block>块级按钮</BaseButton>
  <BaseButton rounded>圆形按钮</BaseButton>
</template>
```

### 样式特点

- ✅ 自动使用设计Token（`--primary-color`、`--spacing-*`等）
- ✅ 悬浮时上移2px + 阴影增强
- ✅ 焦点时显示焦点环
- ✅ 加载时自动禁用 + 显示loading图标
- ✅ 支持所有主题自动适配

---

## 📝 BaseInput - 输入框组件

### 基础用法

```vue
<template>
  <BaseInput
    v-model="username"
    label="用户名"
    placeholder="请输入用户名"
  />
</template>

<script setup>
import { ref } from 'vue'
import BaseInput from '@/components/common/BaseInput.vue'

const username = ref('')
</script>
```

### Props参数

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `modelValue` | `string \| number` | `''` | 输入值 |
| `type` | `string` | `'text'` | 输入类型 |
| `label` | `string` | `''` | 标签文本 |
| `placeholder` | `string` | `''` | 占位符 |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | 尺寸 |
| `disabled` | `boolean` | `false` | 禁用 |
| `readonly` | `boolean` | `false` | 只读 |
| `required` | `boolean` | `false` | 必填标记 |
| `clearable` | `boolean` | `false` | 可清空 |
| `maxlength` | `number` | - | 最大长度 |
| `prefixIcon` | `string` | `''` | 前缀图标 |
| `suffixIcon` | `string` | `''` | 后缀图标 |
| `hint` | `string` | `''` | 提示文本 |
| `error` | `string` | `''` | 错误信息 |

### 使用示例

```vue
<template>
  <!-- 基础输入 -->
  <BaseInput
    v-model="form.name"
    label="装备名称"
    placeholder="请输入装备名称"
    required
  />
  
  <!-- 带图标 -->
  <BaseInput
    v-model="form.search"
    prefix-icon="🔍"
    placeholder="搜索..."
    clearable
  />
  
  <!-- 带提示 -->
  <BaseInput
    v-model="form.weight"
    type="number"
    label="重量（克）"
    hint="请输入装备重量"
    suffix-icon="⚖️"
  />
  
  <!-- 错误状态 -->
  <BaseInput
    v-model="form.price"
    label="价格"
    :error="priceError"
  />
  
  <!-- 不同尺寸 -->
  <BaseInput size="sm" placeholder="小尺寸" />
  <BaseInput size="md" placeholder="中尺寸" />
  <BaseInput size="lg" placeholder="大尺寸" />
</template>
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

## 📋 BaseSelect - 下拉框组件

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

<script setup>
import { ref } from 'vue'
import BaseSelect from '@/components/common/BaseSelect.vue'

const category = ref('')
const categoryOptions = [
  { label: '背包', value: 'backpack' },
  { label: '帐篷', value: 'tent' },
  { label: '睡袋', value: 'sleeping-bag' }
]
</script>
```

### Props参数

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `modelValue` | `string \| number` | `''` | 选中值 |
| `options` | `SelectOption[]` | `[]` | 选项列表 |
| `label` | `string` | `''` | 标签文本 |
| `placeholder` | `string` | `''` | 占位符 |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | 尺寸 |
| `disabled` | `boolean` | `false` | 禁用 |
| `required` | `boolean` | `false` | 必填标记 |
| `hint` | `string` | `''` | 提示文本 |
| `error` | `string` | `''` | 错误信息 |

### SelectOption类型

```typescript
interface SelectOption {
  label: string        // 显示文本
  value: string | number  // 选项值
  disabled?: boolean   // 是否禁用
}
```

---

## 📄 BaseTextarea - 文本域组件

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

### Props参数

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `modelValue` | `string` | `''` | 文本值 |
| `label` | `string` | `''` | 标签文本 |
| `placeholder` | `string` | `''` | 占位符 |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | 尺寸 |
| `rows` | `number` | `4` | 行数 |
| `disabled` | `boolean` | `false` | 禁用 |
| `readonly` | `boolean` | `false` | 只读 |
| `required` | `boolean` | `false` | 必填标记 |
| `maxlength` | `number` | - | 最大长度 |
| `showCount` | `boolean` | `false` | 显示字符计数 |
| `hint` | `string` | `''` | 提示文本 |
| `error` | `string` | `''` | 错误信息 |

---

## 🃏 BaseCard - 卡片组件

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

<script setup>
import BaseCard from '@/components/common/BaseCard.vue'
import BaseButton from '@/components/common/BaseButton.vue'
</script>
```

### Props参数

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `title` | `string` | `''` | 卡片标题 |
| `hoverable` | `boolean` | `false` | 可悬浮效果 |
| `clickable` | `boolean` | `false` | 可点击 |
| `bordered` | `boolean` | `true` | 显示边框 |
| `shadow` | `'none' \| 'sm' \| 'md' \| 'lg' \| 'xl'` | `'md'` | 阴影深度 |
| `padding` | `'none' \| 'sm' \| 'md' \| 'lg'` | `'md'` | 内边距 |

### 插槽

| 插槽 | 说明 |
|------|------|
| `default` | 卡片主体内容 |
| `header` | 自定义头部 |
| `extra` | 头部右侧额外内容 |
| `footer` | 底部操作区 |

### 使用示例

```vue
<template>
  <!-- 基础卡片 -->
  <BaseCard>
    简单内容
  </BaseCard>
  
  <!-- 带标题和操作 -->
  <BaseCard title="我的装备">
    <template #extra>
      <BaseButton variant="text" size="sm">更多</BaseButton>
    </template>
    
    <p>装备列表...</p>
    
    <template #footer>
      <BaseButton>保存</BaseButton>
    </template>
  </BaseCard>
  
  <!-- 可悬浮卡片 -->
  <BaseCard 
    title="森林探险装备" 
    hoverable 
    clickable
    @click="viewDetails"
  >
    点击查看详情
  </BaseCard>
  
  <!-- 无阴影卡片 -->
  <BaseCard shadow="none" :bordered="false">
    扁平风格
  </BaseCard>
</template>
```

---

## 📊 BaseTable - 表格组件

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

<script setup>
import { ref } from 'vue'
import BaseTable from '@/components/common/BaseTable.vue'

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

### Props参数

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `title` | `string` | `''` | 表格标题 |
| `columns` | `TableColumn[]` | `[]` | 列配置 |
| `data` | `any[]` | `[]` | 表格数据 |
| `bordered` | `boolean` | `true` | 显示边框 |
| `striped` | `boolean` | `true` | 斑马纹 |
| `hoverable` | `boolean` | `true` | 可悬浮 |
| `rowClickable` | `boolean` | `false` | 行可点击 |
| `scrollable` | `boolean` | `false` | 可滚动 |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | 尺寸 |

### TableColumn类型

```typescript
interface TableColumn {
  key: string          // 数据字段名
  label: string        // 列标题
  width?: string       // 列宽度
  align?: 'left' | 'center' | 'right'  // 对齐方式
  sortable?: boolean   // 是否可排序
}
```

### 高级用法 - 自定义单元格

```vue
<template>
  <BaseTable :columns="columns" :data="data">
    <!-- 自定义名称列 -->
    <template #cell-name="{ row }">
      <strong>{{ row.name }}</strong>
    </template>
    
    <!-- 自定义状态列 -->
    <template #cell-status="{ row }">
      <BaseBadge :variant="getStatusVariant(row.status)">
        {{ row.status }}
      </BaseBadge>
    </template>
    
    <!-- 自定义操作列 -->
    <template #cell-actions="{ row }">
      <BaseButton size="sm" variant="text" @click="edit(row)">编辑</BaseButton>
      <BaseButton size="sm" variant="text" @click="delete(row)">删除</BaseButton>
    </template>
  </BaseTable>
</template>
```

---

## 🏷 BaseBadge - 标签徽章组件

### 基础用法

```vue
<template>
  <BaseBadge variant="success">已完成</BaseBadge>
  <BaseBadge variant="warning">待确认</BaseBadge>
  <BaseBadge variant="danger">缺失</BaseBadge>
</template>

<script setup>
import BaseBadge from '@/components/common/BaseBadge.vue'
</script>
```

### Props参数

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `variant` | `'primary' \| 'success' \| 'warning' \| 'danger' \| 'info' \| 'secondary' \| 'neutral'` | `'primary'` | 徽章类型 |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | 尺寸 |
| `closable` | `boolean` | `false` | 可关闭 |
| `icon` | `string` | `''` | 图标 |
| `dot` | `boolean` | `false` | 圆点样式 |
| `rounded` | `boolean` | `false` | 圆形 |

### 使用示例

```vue
<template>
  <!-- 不同类型 -->
  <BaseBadge variant="primary">蓝色</BaseBadge>
  <BaseBadge variant="success">成功</BaseBadge>
  <BaseBadge variant="warning">警告</BaseBadge>
  <BaseBadge variant="danger">危险</BaseBadge>
  
  <!-- 带图标 -->
  <BaseBadge icon="✓" variant="success">已验证</BaseBadge>
  
  <!-- 可关闭 -->
  <BaseBadge closable @close="handleClose">标签</BaseBadge>
  
  <!-- 圆点 -->
  <BaseBadge dot variant="danger" />
  
  <!-- 圆形 -->
  <BaseBadge rounded>99+</BaseBadge>
</template>
```

---

## 💡 实际应用场景

### 场景1：表单页面

```vue
<template>
  <BaseCard title="添加装备" padding="lg">
    <form @submit.prevent="handleSubmit">
      <BaseInput
        v-model="form.name"
        label="装备名称"
        placeholder="请输入装备名称"
        required
        :error="errors.name"
      />
      
      <BaseSelect
        v-model="form.category"
        label="装备类型"
        :options="categories"
        required
        :error="errors.category"
      />
      
      <BaseInput
        v-model="form.weight"
        type="number"
        label="重量（克）"
        suffix-icon="⚖️"
        hint="请输入装备的准确重量"
      />
      
      <BaseTextarea
        v-model="form.description"
        label="装备描述"
        :rows="6"
        :maxlength="500"
        show-count
      />
      
      <template #footer>
        <BaseButton type="submit" variant="primary">提交</BaseButton>
        <BaseButton variant="secondary" @click="handleCancel">取消</BaseButton>
      </template>
    </form>
  </BaseCard>
</template>
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
<style scoped>
/* ✅ 组件内部使用Token */
.component {
  background: var(--bg-card);           /* 自动适配主题背景 */
  color: var(--text-primary);           /* 自动适配主题文本色 */
  padding: var(--spacing-md);           /* 自动适配主题间距 */
  border-radius: var(--radius-md);      /* 自动适配主题圆角 */
  box-shadow: var(--shadow-md);         /* 自动适配主题阴影 */
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
    <form class="equipment-form" @submit.prevent="handleSubmit">
      <!-- 基本信息 -->
      <div class="form-section">
        <h4>基本信息</h4>
        
        <BaseInput
          v-model="form.name"
          label="装备名称"
          placeholder="例如：65L登山背包"
          required
          :error="errors.name"
          clearable
        />
        
        <BaseSelect
          v-model="form.category"
          label="装备类型"
          :options="categoryOptions"
          required
          :error="errors.category"
        />
        
        <div class="form-row">
          <BaseInput
            v-model="form.weight"
            type="number"
            label="重量（克）"
            suffix-icon="⚖️"
            size="md"
          />
          
          <BaseInput
            v-model="form.price"
            type="number"
            label="价格（元）"
            prefix-icon="¥"
            size="md"
          />
        </div>
      </div>
      
      <!-- 详细描述 -->
      <div class="form-section">
        <h4>详细描述</h4>
        
        <BaseTextarea
          v-model="form.description"
          placeholder="装备的详细描述、使用场景、注意事项等..."
          :rows="6"
          :maxlength="1000"
          show-count
        />
      </div>
      
      <!-- 状态标签 -->
      <div class="form-section">
        <h4>状态</h4>
        
        <div class="badge-group">
          <BaseBadge 
            v-for="tag in form.tags"
            :key="tag"
            variant="primary"
            closable
            @close="removeTag(tag)"
          >
            {{ tag }}
          </BaseBadge>
        </div>
      </div>
    </form>
    
    <template #footer>
      <BaseButton type="submit" variant="primary" :loading="submitting">
        保存装备
      </BaseButton>
      <BaseButton variant="secondary" @click="handleCancel">
        取消
      </BaseButton>
    </template>
  </BaseCard>
</template>

<style scoped>
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
/>
```

---

## 🎯 最佳实践

### 1. 统一使用基础组件

```vue
<!-- ✅ 推荐 -->
<BaseButton variant="primary">按钮</BaseButton>
<BaseInput v-model="value" />
<BaseCard>内容</BaseCard>

<!-- ❌ 避免 -->
<button class="custom-btn">按钮</button>
<input type="text" />
<div class="card">内容</div>
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
<script setup>
// ✅ 只导入需要的组件
import BaseButton from '@/components/common/BaseButton.vue'
import BaseInput from '@/components/common/BaseInput.vue'
</script>
```

### 2. 懒加载大型组件

```vue
<script setup>
// 对于复杂表格，使用异步加载
const BaseTable = defineAsyncComponent(() =>
  import('@/components/common/BaseTable.vue')
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

<script setup>
import BaseInput from '@/components/common/BaseInput.vue'
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
| `<button>` | `BaseButton` | ✅ 已创建 |
| `<input type="text">` | `BaseInput` | ✅ 已创建 |
| `<input type="checkbox">` | `BaseCheckbox` | ✅ 已创建 ⭐ |
| `<input type="radio">` | `BaseRadio` | ✅ 已创建 ⭐ |
| `<input type="switch">` | `BaseSwitch` | ✅ 已创建 ⭐ |
| `<select>` | `BaseSelect` | ✅ 已创建 |
| `<textarea>` | `BaseTextarea` | ✅ 已创建 |
| `<form>` | `BaseForm` | ✅ 已创建 ⭐ |
| `<table>` | `BaseTable` | ✅ 已创建 |
| `<div class="card">` | `BaseCard` | ✅ 已创建 |
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

- [x] BaseCheckbox - 复选框 ✅
- [x] BaseRadio - 单选框 ✅
- [x] BaseSwitch - 开关 ✅
- [x] BaseTabs - 标签页 ✅
- [x] BaseDropdown - 下拉菜单 ✅
- [x] BaseEmpty - 空状态 ✅
- [x] BaseLoading - 加载状态 ✅
- [x] BaseDivider - 分隔线 ✅
- [x] BaseAlert - 警告提示 ✅
- [x] ToastNotification - Toast 通知 ✅
- [x] BaseButtonGroup - 按钮组 ✅
- [x] BaseForm - 表单容器 ✅
- [x] BaseFormField - 表单项包装器 ✅
- [x] BaseStatCard - 统计卡片 ✅
- [x] MarkdownViewer - Markdown 渲染器 ✅
- [ ] BaseTooltip - 提示框
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

**文档版本**：v2.0.0  
**创建日期**：2025-10-13  
**最后更新**：2025-10-13  
**维护者**：OutdoorChecklist Team  

🎉 **基础组件库 - 让UI开发更简单、更统一！**

---

## 📝 更新记录

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

