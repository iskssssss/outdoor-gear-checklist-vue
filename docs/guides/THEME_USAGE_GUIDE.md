# 主题系统使用指南

## 📖 快速入门

### 什么是设计Token？

设计Token是设计系统的基础构建块，是命名的设计决策（颜色、间距、字体等）。

**优势**：
- 🎨 一处修改，全局更新
- ♻️ 代码高度复用
- 📏 设计一致性保证
- 🔧 易于维护和扩展

---

## 🎨 色彩系统使用

### 基础色彩层级

每个主题都有完整的10级色彩渐变：

```scss
--color-{category}-50   /* 最浅 - 用于背景 */
--color-{category}-100  /* 很浅 */
--color-{category}-200  /* 浅 */
--color-{category}-300  /* 较浅 */
--color-{category}-400  /* 稍浅 */
--color-{category}-500  /* 基准色 - 品牌主色 */
--color-{category}-600  /* 稍深 */
--color-{category}-700  /* 较深 */
--color-{category}-800  /* 深 */
--color-{category}-900  /* 最深 - 用于文本 */
```

### 使用场景推荐

#### 背景色（50-200）
```vue
<style scoped>
.notification-success {
  background: var(--color-success-50);  /* 浅绿色背景 */
  border-left: 3px solid var(--color-success-500);
}

.card-hover {
  background: var(--color-primary-100);  /* 浅色悬浮背景 */
}
</style>
```

#### UI元素（300-600）
```vue
<style scoped>
.button {
  background: var(--color-primary-500);  /* 按钮主色 */
  border: 1px solid var(--color-primary-600);
}

.badge {
  background: var(--color-warning-400);  /* 徽章颜色 */
  color: var(--color-warning-900);
}
</style>
```

#### 文本和图标（700-900）
```vue
<style scoped>
.heading {
  color: var(--color-primary-900);  /* 深色标题 */
}

.icon-primary {
  color: var(--color-primary-700);  /* 图标颜色 */
}

.link {
  color: var(--color-info-700);  /* 链接颜色 */
}
</style>
```

### 语义化颜色变量

推荐使用语义化变量而非直接使用层级token：

```vue
<style scoped>
/* ✅ 推荐：语义化变量 */
.text {
  color: var(--text-primary);      /* 主文本 */
}

.description {
  color: var(--text-secondary);    /* 次要文本 */
}

.hint {
  color: var(--text-muted);        /* 提示文本 */
}

/* ❌ 不推荐：直接使用层级token */
.text {
  color: var(--color-gray-800);    /* 不够语义化 */
}
```

---

## 📏 间距系统使用

### 间距Token

```scss
--spacing-xs: 4px     /* 紧密元素 */
--spacing-sm: 8px     /* 小间距 */
--spacing-md: 16px    /* 标准间距 */
--spacing-lg: 24px    /* 大间距 */
--spacing-xl: 32px    /* 超大间距 */
--spacing-2xl: 48px   /* 章节间距 */
--spacing-3xl: 64px   /* 分区间距 */
```

### 使用示例

```vue
<style scoped>
.card {
  /* 内边距 */
  padding: var(--spacing-md);           /* 16px */
  
  /* 外边距 */
  margin-bottom: var(--spacing-lg);     /* 24px */
  
  /* 组合使用 */
  padding: var(--spacing-sm) var(--spacing-md);  /* 8px 16px */
}

.section {
  /* 大间距用于分区 */
  margin-top: var(--spacing-2xl);       /* 48px */
}

.button-group {
  /* 按钮之间的小间距 */
  gap: var(--spacing-sm);               /* 8px */
}
</style>
```

### 响应式间距

```vue
<style scoped>
.container {
  padding: var(--spacing-md);
}

/* 移动端减小间距 */
@media (max-width: 768px) {
  .container {
    padding: var(--spacing-sm);
  }
}

/* 桌面端增大间距 */
@media (min-width: 1024px) {
  .container {
    padding: var(--spacing-xl);
  }
}
</style>
```

---

## 🔘 圆角系统使用

### 圆角Token

```scss
--radius-none: 0        /* 无圆角（方形） */
--radius-sm: 4px        /* 小圆角 */
--radius-md: 8px        /* 标准圆角 */
--radius-lg: 12px       /* 大圆角 */
--radius-xl: 16px       /* 超大圆角 */
--radius-2xl: 24px      /* 巨大圆角 */
--radius-full: 9999px   /* 完全圆形 */
```

### 组件推荐

```vue
<style scoped>
/* 按钮 */
.btn {
  border-radius: var(--radius-md);      /* 8px - 标准 */
}

/* 小标签 */
.tag {
  border-radius: var(--radius-sm);      /* 4px - 小圆角 */
}

/* 卡片 */
.card {
  border-radius: var(--radius-lg);      /* 12px - 大圆角 */
}

/* 模态框 */
.modal {
  border-radius: var(--radius-xl);      /* 16px - 超大 */
}

/* 圆形头像 */
.avatar {
  border-radius: var(--radius-full);    /* 完全圆形 */
}

/* 无圆角 */
.table {
  border-radius: var(--radius-none);    /* 方形 */
}
</style>
```

### 主题特殊处理

```scss
/* Pixel主题：强制无圆角 */
body.theme-pixel .btn {
  border-radius: var(--radius-none);  /* 永远是0 */
}

/* Soft主题：加大圆角 */
body.theme-soft .card {
  border-radius: var(--radius-xl);    /* 更圆润 */
}
```

---

## ☁️ 阴影系统使用

### 阴影Token

```scss
--shadow-sm    /* 微阴影 - 细节元素 */
--shadow-md    /* 标准阴影 - 卡片 */
--shadow-lg    /* 大阴影 - 悬浮元素 */
--shadow-xl    /* 超大阴影 - 模态框 */
--shadow-2xl   /* 巨大阴影 - 深层弹窗 */
--shadow-inner /* 内阴影 - 输入框 */
```

### 层次化使用

```vue
<style scoped>
/* 基础卡片 */
.card {
  box-shadow: var(--shadow-md);
  
  /* 悬浮时增强 */
  &:hover {
    box-shadow: var(--shadow-lg);
  }
}

/* 浮动按钮 */
.fab {
  box-shadow: var(--shadow-xl);
}

/* 模态框 */
.modal {
  box-shadow: var(--shadow-2xl);
}

/* 输入框内阴影 */
.input {
  box-shadow: var(--shadow-inner);
}
</style>
```

### 自定义阴影

```vue
<style scoped>
/* 结合主题色的自定义阴影 */
.special-card {
  box-shadow: 
    var(--shadow-lg),                    /* 基础阴影 */
    0 0 20px var(--primary-color);       /* 发光效果 */
}
</style>
```

---

## 🎭 主题切换指南

### 在组件中响应主题

```vue
<script setup lang="ts">
import { useThemeStore } from '@/stores/themeStore'
import { computed } from 'vue'

const themeStore = useThemeStore()

// 获取当前主题
const currentTheme = computed(() => themeStore.currentTheme)

// 检查特定主题
const isPixelTheme = computed(() => currentTheme.value === 'pixel')
const isDarkMode = computed(() => currentTheme.value === 'dark')
</script>

<template>
  <div class="component" :class="{ 'pixel-style': isPixelTheme }">
    <!-- 内容 -->
  </div>
</template>

<style scoped>
.component {
  /* 默认样式使用token */
  background: var(--bg-card);
}

/* 特定主题的特殊处理 */
.component.pixel-style {
  image-rendering: pixelated;
}
</style>
```

### 主题切换动画

```vue
<style>
/* 全局主题过渡 */
body {
  transition: background-color 0.3s ease,
              color 0.3s ease;
}

/* 组件过渡 */
.card {
  transition: background 0.3s ease,
              border-color 0.3s ease,
              box-shadow 0.3s ease;
}
</style>
```

---

## 🔧 实用技巧

### 1. 动态调整主题色

```typescript
// 运行时修改CSS变量
document.documentElement.style.setProperty(
  '--color-primary-500',
  '#新颜色'
)
```

### 2. 获取当前主题变量值

```typescript
// 读取CSS变量
const primaryColor = getComputedStyle(document.documentElement)
  .getPropertyValue('--primary-color')
  .trim()

console.log(primaryColor)  // "#667eea"
```

### 3. 条件样式

```vue
<style scoped>
.element {
  /* 默认 */
  background: var(--bg-card);
  
  /* 深色主题特殊处理 */
  body.theme-dark & {
    border: 1px solid var(--border-color);
    box-shadow: 0 0 10px rgba(0, 188, 212, 0.2);
  }
}
</style>
```

### 4. 主题变量组合

```vue
<style scoped>
.gradient-bg {
  background: linear-gradient(
    135deg,
    var(--color-primary-400),
    var(--color-primary-600)
  );
}

.shadow-colored {
  box-shadow: 
    var(--shadow-lg),
    0 0 30px var(--color-primary-500);
}
</style>
```

---

## ⚠️ 常见错误

### ❌ 错误1：硬编码颜色

```vue
<style scoped>
/* ❌ 错误 */
.card {
  background: #ffffff;
  color: #1a202c;
}

/* ✅ 正确 */
.card {
  background: var(--bg-card);
  color: var(--text-primary);
}
</style>
```

### ❌ 错误2：魔法数字

```vue
<style scoped>
/* ❌ 错误 */
.element {
  padding: 16px;
  margin: 24px;
  border-radius: 8px;
}

/* ✅ 正确 */
.element {
  padding: var(--spacing-md);
  margin: var(--spacing-lg);
  border-radius: var(--radius-md);
}
</style>
```

### ❌ 错误3：忽略对比度

```vue
<style scoped>
/* ❌ 错误：浅灰色文本在白色背景 */
.text {
  color: #cccccc;  /* 对比度仅 1.6:1 */
  background: #ffffff;
}

/* ✅ 正确：使用符合AA标准的文本色 */
.text {
  color: var(--text-muted);  /* 对比度 > 4.5:1 */
  background: var(--bg-card);
}
</style>
```

### ❌ 错误4：主题特定硬编码

```vue
<style scoped>
/* ❌ 错误：假设总是浅色背景 */
.card {
  background: #f5f5f5;  /* Dark主题会出问题 */
}

/* ✅ 正确：使用语义化变量 */
.card {
  background: var(--bg-input);  /* 自动适配主题 */
}
</style>
```

---

## 🎯 最佳实践

### 1. 优先使用语义化变量

```scss
/* 优先级：语义化变量 > 层级token > 硬编码 */

/* ⭐⭐⭐ 最佳 */
color: var(--text-primary);

/* ⭐⭐ 可接受 */
color: var(--color-gray-800);

/* ⭐ 避免 */
color: #1a202c;
```

### 2. 按用途选择Token

```scss
/* 文本 */
color: var(--text-primary);        /* 主要文本 */
color: var(--text-secondary);      /* 次要说明 */
color: var(--text-muted);          /* 弱化提示 */

/* 背景 */
background: var(--bg-card);        /* 卡片背景 */
background: var(--bg-input);       /* 输入框背景 */
background: var(--bg-hover);       /* 悬浮背景 */

/* 边框 */
border-color: var(--border-color);     /* 标准边框 */
border-color: var(--primary-color);    /* 强调边框 */

/* 功能色 */
color: var(--success-color);       /* 成功状态 */
color: var(--warning-color);       /* 警告状态 */
color: var(--danger-color);        /* 危险状态 */
```

### 3. 合理使用层级Token

当语义化变量不够用时，直接使用层级token：

```vue
<style scoped>
.progress-bar {
  /* 渐变使用多个层级 */
  background: linear-gradient(
    90deg,
    var(--color-primary-400),
    var(--color-primary-600)
  );
}

.status-badge {
  /* 轻微背景色 */
  background: var(--color-success-100);
  /* 深色文本 */
  color: var(--color-success-900);
  /* 中等边框 */
  border: 1px solid var(--color-success-400);
}
</style>
```

### 4. 组合使用Token

```vue
<style scoped>
.fancy-card {
  /* 背景 */
  background: var(--bg-card);
  
  /* 间距 */
  padding: var(--spacing-md);
  margin: var(--spacing-lg) auto;
  
  /* 边框 */
  border: var(--border-width) solid var(--border-color);
  border-radius: var(--radius-lg);
  
  /* 阴影 */
  box-shadow: var(--shadow-card);
  
  /* 悬浮 */
  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-hover);
  }
}
</style>
```

---

## 🌈 特定主题适配

### Dark 主题适配

```vue
<style scoped>
.component {
  /* 基础样式 */
  background: var(--bg-card);
  color: var(--text-primary);
}

/* Dark主题特殊处理 */
body.theme-dark .component {
  /* 荧光边框 */
  border: 1px solid var(--primary-color);
  box-shadow: 0 0 10px rgba(0, 188, 212, 0.3);
}
</style>
```

### Pixel 主题适配

```vue
<style scoped>
.image {
  /* 默认平滑渲染 */
  image-rendering: auto;
}

/* Pixel主题像素化 */
body.theme-pixel .image {
  image-rendering: pixelated;
  -ms-interpolation-mode: nearest-neighbor;
}
</style>
```

### Paper 主题适配

```vue
<style scoped>
@use '@/assets/styles/mixins' as *;

.card {
  border-radius: var(--radius-md);
}

/* Paper主题使用不规则边框 */
body.theme-paper .card {
  @include irregular-border(1);
  padding: var(--border-width);  /* 为不规则边框留空间 */
}
</style>
```

---

## 📐 布局示例

### 卡片布局

```vue
<template>
  <div class="info-card">
    <div class="card-header">
      <h3>标题</h3>
    </div>
    <div class="card-body">
      <p>内容</p>
    </div>
    <div class="card-footer">
      <button class="btn">操作</button>
    </div>
  </div>
</template>

<style scoped>
.info-card {
  background: var(--bg-card);
  border: var(--border-width) solid var(--border-color);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-card);
  overflow: hidden;
}

.card-header {
  background: var(--primary-color);
  color: var(--btn-primary-text);
  padding: var(--spacing-md);
  border-bottom: var(--border-width) solid var(--border-color);
}

.card-body {
  padding: var(--spacing-lg);
  color: var(--text-primary);
}

.card-footer {
  padding: var(--spacing-md);
  border-top: var(--border-width) solid var(--border-color);
  background: var(--bg-input);
}

.btn {
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--primary-color);
  color: var(--btn-primary-text);
  border: none;
  border-radius: var(--radius-md);
  
  &:hover {
    background: var(--primary-dark);
    box-shadow: var(--shadow-md);
  }
}
</style>
```

### 表单布局

```vue
<template>
  <form class="theme-form">
    <div class="form-group">
      <label>装备名称</label>
      <input type="text" class="form-input">
    </div>
    
    <div class="form-group">
      <label>装备类型</label>
      <select class="form-select">
        <option>选择类型</option>
      </select>
    </div>
    
    <div class="form-actions">
      <button type="submit" class="btn-primary">提交</button>
      <button type="button" class="btn-secondary">取消</button>
    </div>
  </form>
</template>

<style scoped>
.theme-form {
  background: var(--bg-card);
  padding: var(--spacing-xl);
  border-radius: var(--radius-lg);
}

.form-group {
  margin-bottom: var(--spacing-lg);
}

label {
  display: block;
  margin-bottom: var(--spacing-xs);
  color: var(--text-secondary);
  font-weight: var(--font-weight-medium);
}

.form-input,
.form-select {
  width: 100%;
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--bg-input);
  border: var(--border-width) solid var(--border-color);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  
  &:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px rgba(var(--primary-color), 0.2);
  }
}

.form-actions {
  display: flex;
  gap: var(--spacing-md);
  margin-top: var(--spacing-xl);
}

.btn-primary {
  background: var(--primary-color);
  color: var(--btn-primary-text);
  border: none;
  padding: var(--spacing-sm) var(--spacing-lg);
  border-radius: var(--radius-md);
  
  &:hover {
    background: var(--primary-dark);
  }
}

.btn-secondary {
  background: transparent;
  color: var(--text-secondary);
  border: var(--border-width) solid var(--border-color);
  padding: var(--spacing-sm) var(--spacing-lg);
  border-radius: var(--radius-md);
  
  &:hover {
    background: var(--bg-hover);
  }
}
</style>
```

---

## 🎨 主题特色保留技巧

### 保留渐变特效

```vue
<style scoped>
/* 基础主题：使用主题渐变 */
.hero-section {
  background: linear-gradient(
    135deg,
    var(--color-primary-500),
    var(--color-primary-700)
  );
}

/* Mountain Sunrise：天空蓝到晨光橙 */
body.theme-mountain-sunrise .hero-section {
  background: linear-gradient(
    135deg,
    var(--color-primary-400),
    var(--color-warning-300)
  );
}
</style>
```

### 保留动画效果

```vue
<style scoped>
@keyframes theme-pulse {
  0%, 100% {
    box-shadow: var(--shadow-md);
  }
  50% {
    box-shadow: var(--shadow-xl),
                0 0 30px var(--primary-color);
  }
}

.animated-badge {
  animation: theme-pulse 2s ease-in-out infinite;
}
</style>
```

---

## 📱 响应式主题

### 移动端优化

```vue
<style scoped>
.responsive-card {
  /* 桌面端 */
  padding: var(--spacing-xl);
  border-radius: var(--radius-lg);
}

/* 平板 */
@media (max-width: 1024px) {
  .responsive-card {
    padding: var(--spacing-lg);
  }
}

/* 手机 */
@media (max-width: 768px) {
  .responsive-card {
    padding: var(--spacing-md);
    border-radius: var(--radius-md);
  }
}
</style>
```

---

## 🛠 调试技巧

### 查看当前Token值

```javascript
// 在浏览器控制台
const styles = getComputedStyle(document.documentElement)

console.log('Primary:', styles.getPropertyValue('--primary-color'))
console.log('Spacing:', styles.getPropertyValue('--spacing-md'))
console.log('Radius:', styles.getPropertyValue('--radius-lg'))
```

### 测试对比度

```javascript
// 使用浏览器DevTools
// 1. 右键元素 → 检查
// 2. 打开 "辅助功能" 面板
// 3. 查看对比度数值
```

---

## 📚 参考资源

### 内部文档
- [主题可访问性报告](./THEME_ACCESSIBILITY_REPORT.md)
- [主题重构报告](./THEME_REFACTORING_REPORT.md)
- [主题一致性清单](./THEME_CONSISTENCY_CHECKLIST.md)

### 外部资源
- [Material Design Color System](https://material.io/design/color)
- [Tailwind CSS Colors](https://tailwindcss.com/docs/customizing-colors)
- [WCAG Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [CSS Variables MDN](https://developer.mozilla.org/docs/Web/CSS/Using_CSS_custom_properties)

---

## 🎓 进阶话题

### 创建自定义主题

1. **复制模板文件**
   ```bash
   cp _theme-default.scss _theme-custom.scss
   ```

2. **定义色彩系统**
   - 选择品牌主色
   - 生成50-900层级（可使用工具）
   - 定义成功/警告/危险色

3. **调整设计Token**
   - 间距（保持8px基准）
   - 圆角（根据风格）
   - 阴影（柔和/硬边）

4. **验证对比度**
   - 使用在线工具检查
   - 确保≥4.5:1

5. **注册主题**
   ```typescript
   // stores/themeStore.ts
   themes: [
     // ...
     { id: 'custom', name: '自定义主题', file: 'theme-custom' }
   ]
   ```

### 主题变量继承

```scss
/* 从其他主题继承并覆盖 */
body.theme-custom {
  /* 继承Default的色彩系统 */
  @extend body.theme-default;
  
  /* 只覆盖主色调 */
  --color-primary-500: #your-brand-color;
  /* 其他颜色自动计算或手动调整 */
}
```

### 动态主题生成

未来可实现：
```typescript
// 基于用户输入生成主题
function generateTheme(baseColor: string) {
  // 1. 生成50-900层级
  // 2. 计算互补色
  // 3. 验证对比度
  // 4. 输出CSS变量
}
```

---

## 💡 小技巧集合

### 1. 透明度变化

```scss
/* 使用rgba()调整透明度 */
.overlay {
  background: rgba(var(--primary-color), 0.5);
}
```

### 2. 颜色混合

```scss
/* 使用CSS color-mix（现代浏览器） */
.mixed-color {
  background: color-mix(
    in srgb,
    var(--primary-color) 50%,
    var(--secondary-color)
  );
}
```

### 3. 条件Token

```scss
/* 根据主题使用不同token */
.button {
  /* 标准主题 */
  box-shadow: var(--shadow-md);
  
  /* Minimal主题无阴影 */
  body.theme-minimal & {
    box-shadow: none;
  }
}
```

---

## ✅ 检查清单

在提交代码前检查：

- [ ] 未硬编码任何颜色值
- [ ] 所有间距使用token
- [ ] 圆角使用token
- [ ] 阴影使用token或主题特色
- [ ] 文本对比度≥4.5:1
- [ ] 焦点状态清晰可见
- [ ] 14个主题都测试通过
- [ ] 响应式布局正常
- [ ] 无console警告/错误

---

## 🆘 常见问题

### Q1: 为什么我的颜色在Dark主题不显示？
**A**: 可能使用了硬编码的浅色，改用 `var(--text-primary)` 等语义化变量。

### Q2: 如何让元素在所有主题都保持白色背景？
**A**: 使用 `background: #ffffff` 是可以的，但要确保文本颜色对比度足够。

### Q3: Pixel主题的圆角为什么无效？
**A**: Pixel主题所有 `--radius-*` 都是0，这是设计特色。如需圆角，使用固定值。

### Q4: 如何为特定主题添加特效？
**A**: 使用主题选择器：
```scss
body.theme-dark .element {
  /* Dark主题特效 */
}
```

### Q5: 间距token不够用怎么办？
**A**: 可以组合使用：
```scss
padding: calc(var(--spacing-md) + var(--spacing-sm));  /* 24px */
```

---

**文档版本**：v1.0  
**更新日期**：2025-10-13  
**维护者**：OutdoorChecklist Team

