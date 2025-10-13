# 💻 开发指南

> 本文档提供详细的开发环境配置、开发流程和最佳实践。

## 📋 目录

- [环境配置](#环境配置)
- [开发命令](#开发命令)
- [开发流程](#开发流程)
- [代码规范](#代码规范)
- [组件开发](#组件开发)
- [主题开发](#主题开发)
- [调试技巧](#调试技巧)
- [常见问题](#常见问题)

---

## ⚙️ 环境配置

### 前置要求

- **Node.js** >= 16.0.0
- **npm** >= 8.0.0
- **Git**
- **VS Code**（推荐）

### 安装 Node.js

```bash
# 使用 nvm (推荐)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 16
nvm use 16

# 或直接下载
# https://nodejs.org/
```

### 克隆项目

```bash
git clone https://github.com/iskssssss/hiking-checklist-vue.git
cd hiking-checklist-vue
```

### 安装依赖

```bash
npm install
```

如果遇到网络问题：

```bash
# 使用国内镜像
npm config set registry https://registry.npmmirror.com
npm install
```

### VS Code 配置

#### 推荐插件

在项目根目录创建 `.vscode/extensions.json`：

```json
{
  "recommendations": [
    "Vue.volar",
    "Vue.vscode-typescript-vue-plugin",
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "stylelint.vscode-stylelint",
    "bradlc.vscode-tailwindcss"
  ]
}
```

#### 工作区设置

创建 `.vscode/settings.json`：

```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "vue.inlayHints.optionsWrapper": true,
  "vue.inlayHints.inlineHandlerLeading": true
}
```

---

## 🚀 开发命令

### 基本命令

```bash
# 启动开发服务器
npm run dev

# 类型检查
npm run type-check

# 构建生产版本
npm run build

# 预览生产构建
npm run preview
```

### 高级命令

```bash
# 依赖检查
npm audit

# 修复依赖漏洞
npm audit fix

# 更新依赖
npm update

# 查看过时的依赖
npm outdated

# 清理缓存
npm cache clean --force
```

---

## 🔄 开发流程

### 1. 创建功能分支

```bash
# 从 main 分支创建
git checkout main
git pull origin main
git checkout -b feature/your-feature-name
```

### 2. 开发

```bash
# 启动开发服务器
npm run dev

# 在浏览器中访问 http://localhost:5173
# 修改代码，热更新会自动刷新页面
```

### 3. 测试

```bash
# 类型检查
npm run type-check

# 构建测试
npm run build

# 预览构建
npm run preview
```

### 4. 提交

```bash
# 查看改动
git status
git diff

# 添加文件
git add .

# 提交（遵循提交规范）
git commit -m "feat: 添加新功能"

# 推送
git push origin feature/your-feature-name
```

### 5. 创建 PR

访问 GitHub 创建 Pull Request。

---

## 📏 代码规范

### TypeScript 规范

#### 类型定义

```typescript
// ✅ 好的示例
interface Equipment {
  id: number;
  name: string;
  weight: number;
  completed: boolean;
}

function addEquipment(equipment: Equipment): void {
  store.addEquipment(equipment);
}

// ❌ 不好的示例
function addEquipment(equipment: any) {
  store.addEquipment(equipment);
}
```

#### 类型推断

```typescript
// ✅ 利用类型推断
const count = ref(0);  // 自动推断为 Ref<number>

// ❌ 不必要的类型注解
const count: Ref<number> = ref<number>(0);
```

### Vue 组件规范

#### 组件命名

```
# 文件命名：PascalCase
CategoryList.vue
EquipmentItem.vue
BaseModal.vue

# 组件名：PascalCase
<CategoryList />
<EquipmentItem />
```

#### Props 定义

```vue
<script setup lang="ts">
// ✅ 使用 TypeScript 接口
interface Props {
  title: string;
  count?: number;
  items: Equipment[];
}

const props = withDefaults(defineProps<Props>(), {
  count: 0
});

// ❌ 使用运行时声明
defineProps({
  title: String,
  count: Number
});
</script>
```

#### Emits 定义

```vue
<script setup lang="ts">
// ✅ TypeScript 类型
const emit = defineEmits<{
  update: [value: string];
  delete: [id: number];
}>();

// ❌ 运行时声明
const emit = defineEmits(['update', 'delete']);
</script>
```

### SCSS 规范

#### BEM 命名

```scss
// ✅ BEM 命名规范
.category-item {
  // Block
  &__header {
    // Element
  }
  
  &__title {
    // Element
  }
  
  &--collapsed {
    // Modifier
  }
}

// ❌ 随意命名
.item {
  .header {}
  .title {}
}
```

#### 使用变量

```scss
// ✅ 使用 CSS Variables
.button {
  background: var(--accent-primary);
  color: var(--text-on-accent);
  border-radius: var(--border-radius-md);
  padding: var(--spacing-md);
}

// ❌ 硬编码颜色
.button {
  background: #6366f1;
  color: white;
  border-radius: 8px;
  padding: 16px;
}
```

---

## 🧩 组件开发

### 组件结构

```vue
<script setup lang="ts">
// 1. 导入
import { ref, computed } from 'vue';
import { useStore } from '@/stores/equipment';

// 2. 类型定义
interface Props {
  // ...
}

// 3. Props & Emits
const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// 4. 状态
const store = useStore();
const localState = ref<string>('');

// 5. 计算属性
const computedValue = computed(() => {
  return store.someValue * 2;
});

// 6. 方法
function handleClick() {
  emit('click');
}

// 7. 生命周期
onMounted(() => {
  // ...
});
</script>

<template>
  <!-- 模板 -->
</template>

<style scoped lang="scss">
/* 样式 */
</style>
```

### 组件最佳实践

#### 1. 单一职责

```vue
// ✅ 职责单一
<template>
  <button @click="handleClick">
    {{ label }}
  </button>
</template>

// ❌ 职责过多
<template>
  <div>
    <button>Button 1</button>
    <input />
    <form>...</form>
    <table>...</table>
  </div>
</template>
```

#### 2. Props 向下，Events 向上

```vue
// ✅ 父组件通过 props 传递数据，子组件通过 emit 通知父组件
<ChildComponent
  :data="parentData"
  @update="handleUpdate"
/>

// ❌ 直接修改 props
props.data.value = newValue;  // 不要这样做
```

#### 3. 使用 Composables

```typescript
// composables/useCounter.ts
export function useCounter(initialValue = 0) {
  const count = ref(initialValue);
  
  function increment() {
    count.value++;
  }
  
  function decrement() {
    count.value--;
  }
  
  return {
    count,
    increment,
    decrement
  };
}

// 在组件中使用
const { count, increment, decrement } = useCounter(10);
```

---

## 🎨 主题开发

### 创建新主题

#### 1. 创建主题文件

在 `src/assets/styles/` 下创建 `_theme-your-theme.scss`：

```scss
[data-theme='your-theme'] {
  // 颜色变量
  --bg-primary: #ffffff;
  --bg-secondary: #f3f4f6;
  --text-primary: #111827;
  --text-secondary: #6b7280;
  --accent-primary: #3b82f6;
  --accent-secondary: #8b5cf6;
  
  // 间距变量
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;
  
  // 圆角变量
  --border-radius-sm: 4px;
  --border-radius-md: 8px;
  --border-radius-lg: 12px;
  
  // 阴影变量
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
  
  // 过渡
  --transition-fast: 150ms;
  --transition-normal: 300ms;
  --transition-slow: 500ms;
}
```

#### 2. 导入主题

在 `themes.scss` 中导入：

```scss
@import './theme-your-theme';
```

#### 3. 注册主题

在 `stores/themeStore.ts` 中注册：

```typescript
const themes = [
  // ... 其他主题
  { id: 'your-theme', name: '你的主题', icon: '🎨' }
];
```

### 主题测试

```bash
# 启动开发服务器
npm run dev

# 在浏览器中切换到你的主题
# 测试所有组件的显示效果
```

---

## 🔍 调试技巧

### Vue DevTools

安装 Vue DevTools 浏览器扩展：
- [Chrome/Edge](https://chrome.google.com/webstore/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd)
- [Firefox](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/)

### 调试 Pinia Store

```typescript
// 在组件中
import { storeToRefs } from 'pinia';
import { useEquipmentStore } from '@/stores/equipment';

const store = useEquipmentStore();
const { categories } = storeToRefs(store);

// 使用 Vue DevTools 查看 store 状态
```

### 调试 localStorage

```javascript
// 在浏览器控制台
localStorage.getItem('outdoorChecklist');
localStorage.setItem('outdoorChecklist', JSON.stringify(data));
localStorage.clear();
```

### 网络调试

```typescript
// 拦截 fetch 请求
const originalFetch = window.fetch;
window.fetch = function(...args) {
  console.log('Fetch:', args);
  return originalFetch.apply(this, args);
};
```

---

## ❓ 常见问题

### Q: 依赖安装失败？

```bash
# 清理缓存后重试
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### Q: 类型检查错误？

```bash
# 重新生成类型声明
npm run type-check

# 检查 tsconfig.json 配置
```

### Q: 热更新不工作？

```bash
# 重启开发服务器
Ctrl+C
npm run dev
```

### Q: 构建失败？

```bash
# 检查构建输出
npm run build

# 查看详细错误
npm run build --verbose
```

---

## 📚 参考资源

- [Vue 3 文档](https://cn.vuejs.org/)
- [TypeScript 手册](https://www.typescriptlang.org/docs/)
- [Vite 文档](https://cn.vitejs.dev/)
- [Pinia 文档](https://pinia.vuejs.org/zh/)
- [SCSS 文档](https://sass-lang.com/documentation/)

---

**Happy Coding! 🚀**

**Last Updated**: 2025-10-13

