# 样式文件结构说明

本目录包含按主题风格拆分的 SCSS 样式文件，采用**通用基础层 + 主题差异层**的架构，避免重复代码，便于维护和扩展。

## 文件结构

```
src/assets/styles/
├── README.md              # 本说明文件
├── _base.scss            # ⭐ 通用基础样式（所有主题共享的结构和布局）
├── _mixins.scss          # SCSS 混入（可复用的样式片段）
├── _theme-default.scss   # 默认主题 - 仅差异化样式
├── _theme-paper.scss     # 手绘主题 - 仅差异化样式
├── _theme-dark.scss      # 暗黑主题 - 仅差异化样式
├── _theme-soft.scss      # 柔和主题 - 仅差异化样式
├── _theme-pixel.scss     # 像素主题 - 仅差异化样式
├── _theme-minimal.scss   # 极简主题 - 仅差异化样式
└── themes.scss           # 主题入口文件，统一导入所有文件
```

## 架构设计

### 三层架构

1. **基础层** (`_base.scss`)
   - 定义所有主题共享的通用样式
   - 布局、结构、尺寸、动画等
   - 使用 CSS 变量引用颜色和主题相关属性
   - 避免在各主题文件中重复定义

2. **混入层** (`_mixins.scss`)
   - 可复用的样式片段
   - 特殊效果（如手绘边框、纸张阴影）
   - 供各主题按需调用

3. **主题层** (`_theme-*.scss`)
   - 仅定义 CSS 变量值
   - 仅定义该主题特有的差异化样式
   - 保持文件简洁，专注于主题特色

## 各文件说明

### `_base.scss` ⭐ 核心文件
通用基础样式，所有主题共享：
- 组件结构和布局（卡片、模态框、导航栏等）
- 尺寸、间距、动画
- 通用交互状态（hover、focus等）
- 使用 CSS 变量，适配所有主题

**示例**：
```scss
.item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: var(--bg-input);  // 使用变量，各主题自动适配
  color: var(--text-primary);
}
```

### `_mixins.scss`
可复用的 SCSS 混入：
- `irregular-border($index)` - 6种手绘不规则边框变体
- `paper-shadow` - 纸张阴影效果
- `paper-button` - 手绘按钮效果
- `card($shadow)` - 卡片样式
- `gradient-bg($start, $end)` - 渐变背景

### `_theme-default.scss`
默认主题 - 仅差异化部分：
- 定义紫色系 CSS 变量
- 渐变背景特效
- 最轻量级主题

### `_theme-paper.scss`
手绘主题 - 仅差异化部分：
- 定义纸张色调变量
- 手写字体
- 不规则边框（调用 mixins）
- 纸张阴影特效

### `_theme-dark.scss`
暗黑主题 - 仅差异化部分：
- 定义深色变量
- 荧光色调和发光效果
- 特殊阴影

### `_theme-soft.scss`
柔和主题 - 仅差异化部分：
- 定义马卡龙色系变量
- 柔和渐变和阴影
- 弹性动画效果

### `_theme-pixel.scss`
像素主题 - 仅差异化部分：
- 定义8-bit像素风格变量
- 像素化边框和阴影
- 使用像素字体（如果已引入）

### `_theme-minimal.scss`
极简主题 - 仅差异化部分：
- 定义黑白灰变量
- 移除大部分装饰性样式
- 强调线条和对比度

### `themes.scss`
主入口文件：
- 导入 Google Fonts
- 按顺序导入：mixins → base → 各主题
- 确保样式加载顺序正确

## 使用方法

### 在 `main.js` 中引入
```javascript
import './assets/styles/themes.scss'
```

### 添加新主题

1. 创建新的主题文件 `_theme-custom.scss`
2. 定义 CSS 变量值
3. 只定义该主题的差异化样式（通用样式已在 `_base.scss` 中）
4. 在 `themes.scss` 中导入：`@import './theme-custom';`

**示例**：
```scss
// _theme-custom.scss
body.theme-custom {
  // 1. 定义变量
  --primary-color: #ff6b6b;
  --bg-card: #fff;
  --text-primary: #333;
  // ... 其他必需变量
  
  // 2. 只定义差异化样式
  .app-container {
    background: linear-gradient(135deg, #ff6b6b 0%, #ffd93d 100%);
  }
  
  .category-header {
    background: var(--primary-color);
    // 特殊效果...
  }
}
```

### 使用混入
在主题文件中使用混入：
```scss
body.theme-paper {
  .category:nth-child(6n+1) {
    @include irregular-border(1);
    @include paper-shadow;
  }
}
```

## 样式优先级和覆盖规则

### 层叠顺序
```
_base.scss (通用样式，优先级低)
    ↓
_theme-*.scss (主题样式，优先级高，可覆盖 base)
```

### 示例说明

**在 `_base.scss` 中定义通用结构**：
```scss
body[class*="theme-"] {
  .item {
    display: flex;
    padding: 12px 16px;
    background: var(--bg-input);  // 使用变量
    color: var(--text-primary);
  }
}
```

**在 `_theme-dark.scss` 中覆盖差异**：
```scss
body.theme-dark {
  --bg-input: #2a2d3a;  // 定义变量值
  
  .item:hover {
    // 只定义该主题特有的 hover 效果
    box-shadow: 0 0 10px rgba(0, 217, 255, 0.2);
  }
}
```

结果：
- 通用样式自动应用
- 主题变量自动替换
- 特殊效果按需添加
- 无重复代码

## CSS 变量规范

每个主题应定义以下 CSS 变量：

### 颜色变量
- `--primary-color` - 主色调
- `--secondary-color` - 次要色
- `--success-color` - 成功色
- `--warning-color` - 警告色
- `--danger-color` - 危险色
- `--info-color` - 信息色

### 背景变量
- `--bg-main` - 主背景
- `--bg-card` - 卡片背景
- `--bg-header` - 头部背景
- `--bg-input` - 输入框背景
- `--bg-button-group` - 按钮组背景

### 文字变量
- `--text-primary` - 主要文字
- `--text-secondary` - 次要文字
- `--text-muted` - 弱化文字

### 边框变量
- `--border-color` - 边框颜色
- `--border-width` - 边框宽度
- `--border-radius` - 圆角半径

## 主题切换机制

主题通过 `body` 标签的 class 切换：
- `theme-default` - 默认主题
- `theme-paper` - 手绘主题
- `theme-dark` - 暗黑主题
- `theme-soft` - 柔和主题
- `theme-pixel` - 像素主题
- `theme-minimal` - 极简主题

由 `themeStore.js` 动态管理 body class。

## 重复样式检查清单

在添加新样式时，请先检查：

### ✅ 应该放在 `_base.scss`
- [ ] 所有主题都需要的布局和结构
- [ ] 尺寸、间距、定位
- [ ] 通用动画和过渡效果
- [ ] 使用 CSS 变量的通用样式

### ✅ 应该放在主题文件 `_theme-*.scss`
- [ ] CSS 变量定义（颜色、背景、边框等）
- [ ] 该主题特有的背景效果
- [ ] 该主题特有的阴影、边框样式
- [ ] 该主题特有的悬停、激活状态

### ❌ 避免重复
- 不要在多个主题文件中定义相同的结构样式
- 不要硬编码颜色值，使用 CSS 变量
- 相同的效果应提取为 mixin

## 最佳实践

1. **DRY 原则**（Don't Repeat Yourself）
   - 通用样式放 `_base.scss`
   - 差异样式放主题文件
   - 可复用效果用 mixin

2. **变量优先**
   - 避免硬编码颜色
   - 统一使用 CSS 变量
   - 便于主题自动适配

3. **主题独立性**
   - 每个主题只关注自己的特色
   - 不依赖其他主题的样式
   - 可独立开发和测试

4. **清晰注释**
   - 说明样式用途
   - 标注特殊效果
   - 便于后续维护

5. **渐进增强**
   - 基础样式保证可用性
   - 主题样式提升体验
   - 降级方案友好

## 代码示例对比

### ❌ 错误方式 - 在每个主题重复定义
```scss
// _theme-default.scss
body.theme-default {
  .item {
    display: flex;
    padding: 12px;
    background: #f8f9fa;
  }
}

// _theme-dark.scss
body.theme-dark {
  .item {
    display: flex;  // 重复！
    padding: 12px;  // 重复！
    background: #2a2d3a;
  }
}
```

### ✅ 正确方式 - 通用 + 差异
```scss
// _base.scss
body[class*="theme-"] {
  .item {
    display: flex;
    padding: 12px;
    background: var(--bg-input);  // 使用变量
  }
}

// _theme-default.scss
body.theme-default {
  --bg-input: #f8f9fa;  // 只定义变量
}

// _theme-dark.scss
body.theme-dark {
  --bg-input: #2a2d3a;  // 只定义变量
  
  .item:hover {
    box-shadow: 0 0 10px rgba(0, 217, 255, 0.2);  // 特有效果
  }
}
```

优势：
- 减少 66% 重复代码
- 修改一处，所有主题生效
- 主题文件更简洁

