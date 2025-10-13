# 📝 代码变更提交规范

> 本文档描述项目的 Git 提交信息规范，帮助团队保持一致的提交风格。

## 📋 目录

- [提交信息格式](#提交信息格式)
- [提交类型说明](#提交类型说明)
- [提交示例](#提交示例)
- [最佳实践](#最佳实践)
- [常见场景](#常见场景)

---

## 📐 提交信息格式

### 基本格式

```
<type>: <subject>

<body>

<footer>
```

### 格式说明

#### 1. Header（必填）

```
<type>(<scope>): <subject>
```

- **type**（必填）：提交类型
- **scope**（可选）：影响范围
- **subject**（必填）：简短描述（建议不超过 50 字符）

#### 2. Body（可选）

详细描述本次提交的内容，说明：
- 为什么需要这次改动
- 改动了什么内容
- 如何解决的问题

每行建议不超过 72 字符，多个要点使用 `-` 列表形式。

#### 3. Footer（可选）

用于关闭 Issue 或说明破坏性变更：
- `Closes #123`：关闭 Issue
- `BREAKING CHANGE: 描述`：破坏性变更说明

---

## 🏷️ 提交类型说明

### 主要类型

| Type | 说明 | 示例场景 |
|------|------|----------|
| `feat` | 新功能 | 添加表格视图、新增导出功能 |
| `fix` | Bug 修复 | 修复拖拽失效、解决样式错误 |
| `docs` | 文档变更 | 更新 README、添加使用说明 |
| `style` | 代码格式 | 代码格式化、补充分号、缩进调整 |
| `refactor` | 重构 | 重构组件结构、优化代码逻辑 |
| `perf` | 性能优化 | 优化渲染性能、减少内存占用 |
| `test` | 测试相关 | 添加单元测试、修复测试用例 |
| `chore` | 构建/工具 | 更新依赖、修改构建配置 |
| `revert` | 回退 | 回退某个 commit |

### 类型详细说明

#### `feat`: 新功能（Feature）
添加新的功能特性，对应 MINOR 或 MAJOR 版本。

**示例**：
```bash
feat: 新增表格视图模式

- 支持表格形式展示装备
- 支持行内快速编辑
- 支持拖拽调整顺序
```

#### `fix`: Bug 修复
修复已知问题，对应 PATCH 版本。

**示例**：
```bash
fix: 修复表格视图下的拖拽失效问题

- 修复拖拽事件监听器未正确绑定
- 更新拖拽后的数据持久化逻辑
```

#### `docs`: 文档变更
仅修改文档，不涉及代码改动。

**示例**：
```bash
docs: 更新项目文档以反映 v1.4.1 的新功能

- 更新 README.md 功能特性说明
- 添加表格视图使用指南
- 补充常见问题解答
```

#### `style`: 代码格式
不影响代码含义的格式调整（空格、缩进、分号等）。

**示例**：
```bash
style: 统一代码缩进风格

- 将所有文件统一为 2 空格缩进
- 移除行尾多余空格
```

#### `refactor`: 重构
既不是新增功能也不是修复 bug 的代码改动。

**示例**：
```bash
refactor: 重构装备编辑组件

- 提取可复用的表单逻辑
- 使用 Composition API 替代 Options API
- 简化状态管理
```

#### `perf`: 性能优化
提升性能的代码改动。

**示例**：
```bash
perf: 优化瀑布流布局计算性能

- 使用虚拟滚动减少 DOM 节点
- 优化位置计算算法
- 添加防抖处理
```

#### `test`: 测试相关
添加或修改测试代码。

**示例**：
```bash
test: 添加装备编辑组件单元测试

- 测试添加装备功能
- 测试编辑装备功能
- 测试删除装备功能
```

#### `chore`: 构建/工具
修改构建流程、工具配置、依赖管理等。

**示例**：
```bash
chore: 升级 Vue 到 3.5.22

- 更新 package.json 依赖版本
- 修复兼容性问题
```

---

## 📚 提交示例

### 示例 1: 版本发布

```bash
git commit -m "docs: 发布 v1.4.1 版本并更新相关文档

- 更新应用版本号至 v1.4.1
- 添加 v1.4.1 更新日志（表格视图、草稿编辑、TypeScript迁移等）
- 更新 README.md 功能特性和技术栈
- 更新 USAGE.md 添加新功能详细说明"
```

### 示例 2: 新功能

```bash
git commit -m "feat: 新增表格视图及草稿编辑功能

**表格视图**
- 实现紧凑的表格展示模式
- 支持行内快速编辑
- 支持拖拽调整装备顺序

**草稿编辑**
- 编辑过程自动保存草稿
- 刷新页面可恢复草稿
- 提供草稿恢复提示"
```

### 示例 3: Bug 修复

```bash
git commit -m "fix: 修复表格视图下的多项交互问题

- 修复拖拽功能在表格模式下失效
- 修复删除操作未正确更新视图
- 修复编辑时焦点丢失问题"
```

### 示例 4: 技术改进

```bash
git commit -m "refactor: 完成 TypeScript 迁移并修复相关错误

- 将所有 .js 文件迁移到 .ts
- 添加完整的类型定义
- 修复类型检查错误
- 更新构建配置"
```

### 示例 5: 依赖更新

```bash
git commit -m "chore: 集成 @vueuse/core 优化组合式 API

- 添加 @vueuse/core 依赖
- 使用 useLocalStorage 替代手动实现
- 使用 useEventListener 优化事件监听"
```

### 示例 6: 文档更新

```bash
git commit -m "docs: 添加版本发布流程文档

- 创建 RELEASE.md 规范发布流程
- 包含版本号规范、发布步骤、常见问题等
- 提供完整的发布命令参考和最佳实践"
```

---

## ✅ 最佳实践

### 1. Subject（标题）规范

- ✅ **使用中文描述**（本项目规范）
- ✅ **使用动词开头**：如"添加"、"修复"、"更新"
- ✅ **简洁明了**：不超过 50 个字符
- ✅ **不添加句号**：标题末尾不加标点符号
- ❌ **避免模糊描述**：如"修改了一些东西"、"更新"

**好的示例**：
```bash
feat: 添加表格视图模式
fix: 修复拖拽失效问题
docs: 更新使用文档
```

**不好的示例**：
```bash
update something
修改
fix bug
做了一些优化。
```

### 2. Body（正文）规范

- ✅ **详细说明改动内容**
- ✅ **使用列表形式**：多个要点用 `-` 分隔
- ✅ **说明改动原因**：为什么要这样改
- ✅ **空一行分隔**：Header 和 Body 之间空一行

**示例**：
```bash
feat: 新增草稿保存功能

- 编辑装备时自动保存草稿到 localStorage
- 页面刷新后提示用户恢复草稿
- 确认修改或取消后自动清除草稿

这个功能可以防止用户因误操作或浏览器崩溃导致的编辑内容丢失。
```

### 3. 提交频率

- ✅ **功能完整时提交**：确保每次提交都是可运行的
- ✅ **逻辑独立**：一次提交只做一件事
- ❌ **避免过大的提交**：如果改动太多，考虑拆分
- ❌ **避免过小的提交**：不要每改一行就提交一次

### 4. Scope（范围）使用

当改动集中在特定模块时，可以添加 scope：

```bash
feat(table-view): 添加表格视图模式
fix(equipment): 修复装备编辑的验证逻辑
docs(readme): 更新安装说明
style(header): 统一导航栏样式
```

**常用 Scope**：
- `component`: 组件相关
- `store`: 状态管理
- `router`: 路由
- `style`: 样式
- `config`: 配置
- `utils`: 工具函数

---

## 🎯 常见场景

### 场景 1: 版本发布提交

```bash
# 查看变更文件
git status

# 添加所有文档到暂存区
git add package.json src/config/appConfig.ts CHANGELOG.md README.md USAGE.md

# 提交变更
git commit -m "docs: 发布 v1.4.1 版本并更新相关文档

- 更新应用版本号至 v1.4.1
- 添加 v1.4.1 更新日志（表格视图、草稿编辑、TypeScript迁移等）
- 更新 README.md 功能特性和技术栈
- 更新 USAGE.md 添加新功能详细说明"
```

### 场景 2: 功能开发提交

```bash
# 添加新功能相关文件
git add src/components/views/CategoryTableView.vue
git add src/stores/equipment.ts

# 提交新功能
git commit -m "feat: 新增表格视图功能

- 创建 CategoryTableView 组件
- 实现表格展示和编辑功能
- 添加拖拽排序支持
- 更新装备 store 以支持表格模式"
```

### 场景 3: Bug 修复提交

```bash
# 添加修复文件
git add src/components/views/CategoryTableView.vue

# 提交修复
git commit -m "fix: 修复表格视图拖拽失效问题

- 修复事件监听器未正确绑定
- 添加拖拽状态的边界检查
- 更新拖拽完成后的数据持久化"
```

### 场景 4: 重构提交

```bash
# 添加重构文件
git add src/components/

# 提交重构
git commit -m "refactor: 完成 TypeScript 迁移

- 将所有组件迁移至 TypeScript
- 添加完整的类型定义文件
- 更新构建配置以支持 TS
- 修复所有类型检查错误"
```

### 场景 5: 文档更新提交

```bash
# 添加文档文件
git add README.md USAGE.md RELEASE.md

# 提交文档更新
git commit -m "docs: 更新项目文档以反映 v1.4.1 的新功能

- 更新 README.md：添加多视图模式、草稿保存功能说明
- 更新 USAGE.md：详细说明表格视图和草稿编辑功能
- 更新 RELEASE.md：完善发布流程，增加文档更新步骤"
```

### 场景 6: 依赖更新提交

```bash
# 添加依赖相关文件
git add package.json package-lock.json

# 提交依赖更新
git commit -m "chore: 集成 @vueuse/core 并优化代码

- 添加 @vueuse/core 依赖
- 使用 useLocalStorage 简化本地存储逻辑
- 使用 useEventListener 优化事件处理
- 更新相关组件使用新的工具函数"
```

---

## 🔧 提交工具命令

### 查看提交历史

```bash
# 查看最近 10 条提交（简洁）
git log --oneline -10

# 查看最近 10 条提交（详细）
git log -10

# 查看某个文件的提交历史
git log --oneline -- path/to/file

# 查看某个时间段的提交
git log --since="2025-10-01" --until="2025-10-13"
```

### 修改提交

```bash
# 修改最后一次提交信息
git commit --amend

# 追加文件到最后一次提交
git add forgotten-file
git commit --amend --no-edit

# 交互式修改多个提交
git rebase -i HEAD~3
```

### 撤销提交

```bash
# 撤销最后一次提交，保留改动
git reset --soft HEAD~1

# 撤销最后一次提交，丢弃改动
git reset --hard HEAD~1

# 创建新提交来撤销某次提交
git revert <commit-hash>
```

---

## 📚 参考资源

- [Conventional Commits](https://www.conventionalcommits.org/zh-hans/)
- [Angular Commit Guidelines](https://github.com/angular/angular/blob/main/CONTRIBUTING.md#commit)
- [Git Commit Best Practices](https://github.com/trein/dev-best-practices/wiki/Git-Commit-Best-Practices)

---

## 💡 提示

1. **提交前检查**：使用 `git diff` 查看改动内容
2. **使用模板**：可以配置 Git 提交模板简化输入
3. **保持一致**：团队成员应遵循相同的规范
4. **有意义的提交**：每次提交都应该有明确的目的

---

**Made with ❤️ by iskssss**

遵循良好的提交规范，让项目历史更清晰！

