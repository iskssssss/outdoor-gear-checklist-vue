# 📦 版本发布流程

> 本文档描述了项目的完整版本发布流程，包括版本号规范、文档更新、Git操作等。

## 📋 目录

- [版本号规范](#版本号规范)
- [发布前检查](#发布前检查)
- [发布步骤](#发布步骤)
- [发布后操作](#发布后操作)
- [常见问题](#常见问题)

---

## 🔢 版本号规范

本项目遵循 [语义化版本 2.0.0](https://semver.org/lang/zh-CN/) 规范：

### 版本号格式：`主版本号.次版本号.修订号` (MAJOR.MINOR.PATCH)

- **主版本号 (MAJOR)**：重大更新，不兼容的 API 修改
  - 示例：`1.x.x` → `2.0.0`
  - 适用场景：架构重构、API 破坏性变更、重大功能改版

- **次版本号 (MINOR)**：新增功能，向下兼容
  - 示例：`1.5.x` → `1.6.0`
  - 适用场景：新功能添加、重要组件重构、技术栈升级

- **修订号 (PATCH)**：问题修复，向下兼容
  - 示例：`1.5.0` → `1.5.1`
  - 适用场景：Bug 修复、小优化、文档更新

### 版本号决策树

```
是否有破坏性变更？
├─ 是 → MAJOR 版本（如 1.x.x → 2.0.0）
└─ 否 → 是否有新功能？
    ├─ 是 → MINOR 版本（如 1.5.x → 1.6.0）
    └─ 否 → PATCH 版本（如 1.5.0 → 1.5.1）
```

---

## ✅ 发布前检查

### 1. 代码质量检查

```bash
# 运行类型检查
npm run type-check

# 本地构建测试
npm run build

# 预览构建结果
npm run preview
```

### 2. 功能测试

- [ ] 核心功能正常运行
- [ ] 新增功能符合预期
- [ ] Bug 修复已验证
- [ ] 主题切换正常
- [ ] 数据导入导出正常
- [ ] 响应式布局正常

### 3. 文档检查

- [ ] README.md 描述准确
- [ ] 代码注释清晰

---

## 🚀 发布步骤

### Step 1: 确定版本号

根据提交记录确定版本类型：

```bash
# 查看最近的提交记录
git log --oneline -10

# 查看详细提交信息
git log --since="YYYY-MM-DD" --pretty=format:"%h - %s (%ci)" --no-merges
```

**判断依据**：
- 如果有 `feat:` 新功能 → 考虑 MINOR 版本
- 如果只有 `fix:` 修复 → PATCH 版本
- 如果有 `BREAKING CHANGE` → MAJOR 版本
- 如果有 `refactor:` 重构 → 根据影响范围决定

---

### Step 2: 更新版本号和文档

#### 2.1 更新 package.json

**唯一需要维护版本号的地方**：

```json
{
  "name": "outdoor-gear-checklist",
  "version": "1.6.0",  // ← 更新此处
  ...
}
```

> 💡 **自动同步**：版本号会通过 Vite 构建时自动注入到全局变量 `__APP_VERSION__`，并在以下位置使用：
> - 页面底部显示版本号
> - 版本更新检测功能
> 
> 无需在其他文件中手动维护版本号！

---

#### 2.2 更新 CHANGELOG.md

在文件顶部添加新版本记录：

```markdown
# 📝 更新日志

### v1.6.0 (2025-XX-XX)

**新功能**
- ✨ **功能名称** - 功能描述

**技术改进**
- 🔧 **改进名称** - 改进描述

**修复**
- 🐛 修复描述

### v1.5.0 (2025-10-15)
...
```

**常用 emoji 标识**：

| Emoji | 类型 | 说明 |
|-------|------|------|
| ✨ | 新功能 | 新增功能特性 |
| 🎨 | UI/UX | 界面和体验优化 |
| 🔧 | 技术改进 | 技术栈升级或优化 |
| ♻️ | 重构 | 代码重构 |
| 🐛 | 修复 | Bug 修复 |
| 📝 | 文档 | 文档更新 |
| 🚀 | 性能 | 性能优化 |
| 🔒 | 安全 | 安全相关 |
| 📦 | 依赖 | 依赖更新 |
| 🧹 | 清理 | 代码清理 |

---

#### 2.3 更新 ROADMAP.md

**需要更新的内容**：
- 更新"当前版本"标记
- 将已完成的功能标记为"已完成"
- 移动已完成的功能到对应版本的"已完成功能"部分
- 更新里程碑进度

**示例**：
```markdown
## 📊 当前版本：v1.6.0

## ✅ 已完成功能

### v1.6.0 (2025-XX-XX)
- ✅ 新功能1
- ✅ 新功能2
```

---

#### 2.4 更新 README.md（如有新功能）

根据新功能更新以下部分：
- **功能特性**：添加新功能描述
- **技术栈**：更新使用的技术和库
- **快速开始**：补充新功能的简要说明

---

#### 2.5 更新 ARCHITECTURE.md（如有架构变更）

**何时需要更新**：
- 添加了新的核心模块
- 技术栈有重大变更
- 数据流或状态管理有改动
- 项目结构有调整

**需要更新的部分**：
- **技术栈表格**：添加新技术/库及其版本
- **项目结构图**：反映新的目录结构
- **核心模块**：添加新模块说明
- **数据流图**：更新数据流向

**示例**：
```markdown
## 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| ECharts | 6.x | 数据可视化图表库 | ← 新增
```

---

#### 2.6 更新 guides/BASE_COMPONENTS_GUIDE.md（如有新增组件）

**需要更新的部分**：
- 组件列表表格
- 组件覆盖率表格
- 计划中的组件列表

---

### Step 3: 提交变更

#### 3.1 查看变更文件

```bash
git status
```

#### 3.2 添加文件到暂存区

**基础文件（必须）**：
```bash
git add package.json
git add docs/CHANGELOG.md
```

**功能文档（建议）**：
```bash
# 如果更新了功能特性
git add README.md

# 如果完成了路线图功能
git add docs/ROADMAP.md
```

**技术文档（按需）**：
```bash
# 如果有架构变更
git add docs/architecture/ARCHITECTURE.md

# 如果有新增组件
git add docs/guides/BASE_COMPONENTS_GUIDE.md
```

#### 3.3 提交变更

使用规范的提交信息：

**标准提交格式**：
```bash
git commit -m "docs: 发布 v1.6.0 版本并更新相关文档

**版本更新**
- 更新应用版本号至 v1.6.0
- 添加 v1.6.0 更新日志

**功能文档**
- 更新 ROADMAP.md 标记已完成功能
- 更新 README.md 功能特性

**技术文档**
- 更新 ARCHITECTURE.md 技术栈信息"
```

**快捷格式（小版本）**：
```bash
git commit -m "docs: 发布 v1.5.1 版本并更新文档

- 修复若干 Bug
- 更新 CHANGELOG 和 README"
```

#### 3.4 验证提交

提交前最后检查：

```bash
# 查看暂存的文件
git diff --cached --name-only

# 查看具体改动
git diff --cached

# 查看提交信息
git log -1 --pretty=format:"%B"
```

---

### Step 4: 创建版本标签

```bash
# 创建带注释的标签
git tag -a v1.6.0 -m "Release v1.6.0

新功能:
- 功能描述

技术改进:
- 改进描述

修复:
- 修复描述"

# 查看标签
git tag -l -n20 v1.6.0

# 查看标签关联的提交
git log --oneline --decorate -5
```

#### 如果标签已存在

```bash
# 删除本地标签
git tag -d v1.6.0

# 重新创建
git tag -a v1.6.0 -m "Release v1.6.0 ..."

# 如果已推送到远程，需要删除远程标签
git push origin --delete v1.6.0
```

---

### Step 5: 推送到远程仓库

```bash
# 推送提交
git push origin main

# 推送单个标签
git push origin v1.6.0

# 或推送所有标签
git push --tags
```

---

## 📤 发布后操作

### 1. GitHub Release

1. 访问项目的 GitHub 仓库
2. 进入 `Releases` 页面
3. 点击 `Draft a new release`
4. 选择刚创建的标签 `v1.6.0`
5. 填写 Release 标题：`v1.6.0 - 版本简述`
6. 复制 CHANGELOG.md 中的更新内容到描述框
7. 上传构建产物（可选）：
   ```bash
   npm run build
   cd dist && zip -r ../outdoor-gear-checklist-v1.6.0.zip .
   ```
8. 点击 `Publish release`

### 2. 更新部署

如果项目已部署，需要更新生产环境：

```bash
# 拉取最新代码
git pull origin main

# 安装依赖（如有更新）
npm install

# 构建生产版本
npm run build

# 部署到服务器（根据实际部署方式）
# 例如：rsync、scp、CI/CD 等
```

### 3. 通知相关人员

- [ ] 更新项目文档网站（如果有）
- [ ] 通知团队成员
- [ ] 发布更新公告（如果需要）

---

## 📝 完整发布命令（快速参考）

```bash
# 1. 查看提交记录，确定版本号
git log --oneline -10

# 2. 更新版本号和文档（手动编辑文件）
# - package.json (版本号)
# - docs/CHANGELOG.md (更新日志)
# - docs/ROADMAP.md (路线图进度)
# - README.md (功能特性，如有新功能)
# - docs/architecture/ARCHITECTURE.md (架构变更，如有)

# 3. 运行测试和构建
npm run type-check
npm run build

# 4. 提交变更
git add package.json docs/CHANGELOG.md docs/ROADMAP.md
git add README.md docs/architecture/ARCHITECTURE.md  # 如有修改
git commit -m "docs: 发布 v1.6.0 版本并更新相关文档

- 更新应用版本号至 v1.6.0
- 添加 v1.6.0 更新日志
- 更新 ROADMAP.md 和 README.md"

# 5. 创建标签
git tag -a v1.6.0 -m "Release v1.6.0

新功能:
- 功能列表

技术改进:
- 改进列表

修复:
- 修复列表"

# 6. 推送到远程
git push origin main
git push origin v1.6.0

# 7. 创建 GitHub Release（可选）
# 访问 https://github.com/iskssssss/outdoor-gear-checklist/releases/new
```

---

## ❓ 常见问题

### Q1: 版本号更新后忘记提交怎么办？

```bash
# 追加到上一次提交
git add <forgotten-file>
git commit --amend --no-edit

# 如果已经推送，需要强制推送（谨慎使用）
git push --force-with-lease
```

### Q2: 标签打错了怎么办？

```bash
# 删除本地标签
git tag -d v1.6.0

# 删除远程标签（如果已推送）
git push origin --delete v1.6.0

# 重新创建正确的标签
git tag -a v1.6.0 -m "..."
git push origin v1.6.0
```

### Q3: CHANGELOG.md 写错了怎么修改？

```bash
# 如果还没推送，直接修改后重新提交
git add docs/CHANGELOG.md
git commit --amend

# 如果已经推送，修改后创建新提交
git add docs/CHANGELOG.md
git commit -m "docs: 修正 v1.6.0 更新日志"
git push
```

### Q4: 如何回退版本？

```bash
# 回退到上一个提交（不保留更改）
git reset --hard HEAD~1

# 回退到指定标签
git reset --hard v1.5.0

# 删除错误的标签
git tag -d v1.6.0
git push origin --delete v1.6.0
```

### Q5: 多人协作时如何避免冲突？

1. 发布前先拉取最新代码：`git pull origin main`
2. 确保本地分支是最新的
3. 如有冲突，先解决冲突再发布
4. 使用 `git push --force-with-lease` 替代 `--force`

---

## 📚 相关资源

- [语义化版本规范](https://semver.org/lang/zh-CN/)
- [Conventional Commits](https://www.conventionalcommits.org/zh-hans/)
- [Git 标签管理](https://git-scm.com/book/zh/v2/Git-基础-打标签)
- [GitHub Releases 文档](https://docs.github.com/zh/repositories/releasing-projects-on-github)

---

## 🔄 版本历史模板

可以使用以下模板快速创建 CHANGELOG 条目：

```markdown
### v{VERSION} ({DATE})

**新功能**
- ✨ **功能名称** - 功能描述

**优化改进**
- 💅 **优化项** - 描述
- 🎨 **UI改进** - 描述

**技术改进**
- 🔧 **技术升级** - 描述
- ♻️ **代码重构** - 描述
- 📦 **依赖更新** - 描述

**修复**
- 🐛 修复具体问题描述
- 🐛 修复另一个问题

**文档**
- 📝 文档更新说明
```

---

**Made with ❤️ by iskssss**

如有疑问或建议，欢迎提 Issue 讨论！
