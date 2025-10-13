# 🤝 贡献指南

> 感谢你对"户外装备清单"项目的关注！我们欢迎所有形式的贡献。

## 📋 目录

- [行为准则](#行为准则)
- [如何贡献](#如何贡献)
- [开发环境设置](#开发环境设置)
- [开发流程](#开发流程)
- [代码规范](#代码规范)
- [提交规范](#提交规范)
- [Pull Request 流程](#pull-request-流程)
- [问题报告](#问题报告)

---

## 📜 行为准则

参与本项目即表示你同意遵守我们的 [行为准则](CODE_OF_CONDUCT.md)。请务必阅读并遵守。

---

## 💡 如何贡献

你可以通过以下方式为项目做出贡献：

### 1. 报告 Bug

如果你发现了 Bug，请：
- 检查 [Issues](../../issues) 中是否已有相关报告
- 如果没有，[创建新 Issue](../../issues/new)
- 使用 Bug 报告模板
- 提供详细的重现步骤和环境信息

### 2. 提出新功能

如果你有好的想法：
- 先在 [Issues](../../issues) 中搜索是否有类似建议
- 创建 Feature Request Issue
- 详细描述功能需求和使用场景
- 说明为什么这个功能对用户有价值

### 3. 改进文档

文档改进同样重要：
- 修正错别字
- 补充缺失的说明
- 添加使用示例
- 翻译文档（如果支持多语言）

### 4. 贡献代码

- 修复已知 Bug
- 实现新功能
- 优化性能
- 重构代码

---

## 🛠️ 开发环境设置

### 前置要求

- **Node.js** >= 16.0.0
- **npm** >= 8.0.0
- **Git** 
- 代码编辑器（推荐 VS Code）

### 克隆仓库

```bash
# 1. Fork 项目到你的 GitHub 账号

# 2. 克隆你 fork 的仓库
git clone https://github.com/YOUR_USERNAME/hiking-checklist-vue.git

# 3. 进入项目目录
cd hiking-checklist-vue

# 4. 添加上游仓库
git remote add upstream https://github.com/iskssssss/hiking-checklist-vue.git
```

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

访问 `http://localhost:5173` 查看应用。

### VS Code 推荐插件

创建 `.vscode/extensions.json`：

```json
{
  "recommendations": [
    "Vue.volar",
    "Vue.vscode-typescript-vue-plugin",
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "stylelint.vscode-stylelint"
  ]
}
```

---

## 🔄 开发流程

### 1. 同步最新代码

开始工作前，确保本地代码是最新的：

```bash
# 切换到主分支
git checkout main

# 拉取上游更新
git fetch upstream

# 合并更新
git merge upstream/main

# 推送到你的 fork
git push origin main
```

### 2. 创建功能分支

```bash
# 创建并切换到新分支
git checkout -b feature/your-feature-name

# 或修复 Bug
git checkout -b fix/bug-description
```

**分支命名规范**：
- `feature/功能名称` - 新功能
- `fix/问题描述` - Bug 修复
- `docs/文档说明` - 文档更新
- `refactor/重构说明` - 代码重构
- `perf/优化说明` - 性能优化

### 3. 进行开发

- 编写代码
- 遵循代码规范
- 添加必要的注释
- 编写/更新测试（如果适用）

### 4. 测试你的改动

```bash
# 类型检查
npm run type-check

# 构建测试
npm run build

# 预览构建结果
npm run preview
```

### 5. 提交改动

```bash
# 查看改动
git status

# 添加文件
git add .

# 提交（遵循提交规范）
git commit -m "feat: 添加新功能"
```

详细的提交规范请参考 [COMMIT_CONVENTION.md](../development/COMMIT_CONVENTION.md)。

### 6. 推送到远程

```bash
git push origin feature/your-feature-name
```

### 7. 创建 Pull Request

1. 访问你 fork 的仓库
2. 点击 "Compare & pull request"
3. 填写 PR 描述（使用模板）
4. 等待代码审查

---

## 📏 代码规范

### TypeScript 规范

- 使用 TypeScript 编写新代码
- 为函数和组件添加类型注解
- 避免使用 `any` 类型
- 使用接口定义数据结构

```typescript
// ✅ 好的示例
interface Equipment {
  id: number;
  name: string;
  weight: number;
  completed: boolean;
}

function addEquipment(equipment: Equipment): void {
  // ...
}

// ❌ 不好的示例
function addEquipment(equipment: any) {
  // ...
}
```

### Vue 组件规范

- 使用 Composition API（`<script setup>`）
- 组件文件名使用 PascalCase
- Props 定义使用 TypeScript
- 组件按功能分组

```vue
<script setup lang="ts">
// ✅ 好的示例
interface Props {
  title: string;
  count?: number;
}

const props = withDefaults(defineProps<Props>(), {
  count: 0
});

const emit = defineEmits<{
  update: [value: string];
}>();
</script>
```

### 样式规范

- 使用 SCSS 编写样式
- 遵循 BEM 命名规范
- 使用主题变量而非硬编码颜色
- 移动端优先的响应式设计

```scss
// ✅ 好的示例
.equipment-item {
  padding: var(--spacing-md);
  background: var(--bg-secondary);
  
  &__title {
    color: var(--text-primary);
    font-size: var(--font-size-lg);
  }
  
  &--completed {
    opacity: 0.6;
  }
}
```

### 代码格式

- 使用 2 空格缩进
- 使用单引号
- 行尾不加分号（除非必要）
- 每行不超过 100 字符

---

## 📝 提交规范

我们使用 [Conventional Commits](https://www.conventionalcommits.org/zh-hans/) 规范。

### 提交格式

```
<type>(<scope>): <subject>

<body>

<footer>
```

### 提交类型

- `feat`: 新功能
- `fix`: Bug 修复
- `docs`: 文档更新
- `style`: 代码格式调整
- `refactor`: 重构
- `perf`: 性能优化
- `test`: 测试相关
- `chore`: 构建/工具相关

详细说明请查看 [COMMIT_CONVENTION.md](../development/COMMIT_CONVENTION.md)。

### 提交示例

```bash
# 新功能
git commit -m "feat: 添加表格视图模式"

# Bug 修复
git commit -m "fix: 修复拖拽失效问题"

# 文档更新
git commit -m "docs: 更新使用指南"
```

---

## 🔍 Pull Request 流程

### PR 标题

使用与提交信息相同的格式：

```
feat: 添加表格视图功能
fix: 修复拖拽在表格模式下失效的问题
docs: 更新 API 文档
```

### PR 描述

使用 PR 模板，包含：

1. **改动说明**
   - 这个 PR 做了什么？
   - 为什么需要这个改动？

2. **测试**
   - 如何测试这些改动？
   - 添加了什么测试？

3. **截图**（如果是 UI 改动）
   - 改动前后对比

4. **检查清单**
   - [ ] 代码遵循项目规范
   - [ ] 已添加必要的注释
   - [ ] 文档已更新
   - [ ] 通过所有测试

### 代码审查

- 耐心等待维护者审查
- 根据反馈进行修改
- 保持 PR 聚焦（一个 PR 只做一件事）
- 及时响应评论

### 合并后

PR 合并后：

```bash
# 切换到主分支
git checkout main

# 拉取最新代码
git pull upstream main

# 删除功能分支（可选）
git branch -d feature/your-feature-name
```

---

## 🐛 问题报告

### Bug 报告应包含

- **环境信息**
  - 操作系统和版本
  - 浏览器和版本
  - Node.js 版本（如果相关）

- **重现步骤**
  1. 访问 xxx 页面
  2. 点击 xxx 按钮
  3. 看到错误

- **期望行为**
  - 应该发生什么

- **实际行为**
  - 实际发生了什么

- **截图或录屏**
  - 如果适用

- **额外信息**
  - 错误日志
  - 控制台输出

---

## 🎨 UI/UX 贡献

如果你想改进界面或体验：

1. **设计提案**
   - 创建 Issue 说明设计想法
   - 提供设计稿或线框图
   - 说明改进的理由

2. **主题开发**
   - 参考现有主题文件
   - 遵循主题系统架构
   - 测试在不同设备上的效果

3. **响应式改进**
   - 测试多种屏幕尺寸
   - 确保移动端体验良好

---

## 📚 文档贡献

文档改进非常重要！

### 文档类型

- **README.md** - 项目概述
- **docs/USAGE.md** - 详细使用指南
- **docs/DEVELOPMENT.md** - 开发指南
- **docs/ARCHITECTURE.md** - 架构说明
- **代码注释** - JSDoc 格式

### 文档规范

- 使用清晰的中文
- 提供代码示例
- 添加截图说明
- 保持目录结构

---

## 🎁 贡献者

感谢所有贡献者！你的名字将出现在：

- GitHub Contributors 列表
- 项目 README
- Release Notes（重要贡献）

---

## ❓ 需要帮助？

如果你有任何问题：

1. 查看 [文档](../README.md)
2. 搜索 [Issues](../../issues)
3. 在 [Discussions](../../discussions) 中提问
4. 联系维护者

---

## 📄 许可证

贡献代码即表示你同意将代码以 [MIT](../LICENSE) 许可证发布。

---

**再次感谢你的贡献！每一个 PR 都让项目变得更好！** 🎉

**Made with ❤️ by iskssss and contributors**

