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
  - 示例：`1.3.x` → `1.4.0`
  - 适用场景：新功能添加、主题系统升级、重要组件重构

- **修订号 (PATCH)**：问题修复，向下兼容
  - 示例：`1.4.0` → `1.4.1`
  - 适用场景：Bug 修复、小优化、文档更新、依赖升级

### 特殊版本标识

- **预发布版本**：`1.4.0-alpha.1`, `1.4.0-beta.1`, `1.4.0-rc.1`
- **开发版本**：`1.4.0-dev`

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
- [ ] USAGE.md 使用文档完整
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

### Step 2: 更新版本号

需要更新以下文件中的版本号：

#### 2.1 更新 `package.json`

```json
{
  "name": "outdoor-gear-checklist",
  "version": "1.4.1",  // 更新此处
  ...
}
```

#### 2.2 更新 `src/config/appConfig.ts`

```typescript
/**
 * 应用版本号
 */
export const APP_VERSION = '1.4.1';  // 更新此处
```

### Step 3: 更新 CHANGELOG.md

在文件顶部添加新版本记录（参考历史记录格式）：

```markdown
# 📝 更新日志

### v1.4.1 (2025-10-13)

**新功能**
- ✨ **功能名称** - 功能描述

**技术改进**
- 🔧 **改进名称** - 改进描述

**修复**
- 🐛 修复描述

### v1.4.0 (2025-10-12)
...
```

#### 常用 emoji 标识

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

### Step 4: 提交变更

```bash
# 查看变更文件
git status

# 添加文件到暂存区
git add package.json src/config/appConfig.ts CHANGELOG.md

# 提交变更（使用规范的提交信息）
git commit -m "docs: 发布 v1.4.1 版本并更新相关文档

- 更新应用版本号至 v1.4.1
- 添加 v1.4.1 更新日志（功能摘要）"
```

#### 提交信息格式

```
<type>: <subject>

<body>
```

**Type 类型**：
- `feat`: 新功能
- `fix`: 修复
- `docs`: 文档变更
- `style`: 代码格式（不影响代码运行）
- `refactor`: 重构
- `perf`: 性能优化
- `test`: 测试相关
- `chore`: 构建/工具相关

### Step 5: 创建版本标签

```bash
# 创建带注释的标签
git tag -a v1.4.1 -m "Release v1.4.1

新功能:
- 功能描述

技术改进:
- 改进描述

修复:
- 修复描述"

# 查看标签
git tag -l -n20 v1.4.1

# 查看标签关联的提交
git log --oneline --decorate -5
```

#### 如果标签已存在

```bash
# 删除本地标签
git tag -d v1.4.1

# 重新创建
git tag -a v1.4.1 -m "Release v1.4.1 ..."

# 如果已推送到远程，需要删除远程标签
git push origin :refs/tags/v1.4.1
# 或者
git push origin --delete v1.4.1
```

### Step 6: 推送到远程仓库

```bash
# 推送提交
git push origin main

# 推送单个标签
git push origin v1.4.1

# 或推送所有标签
git push --tags
```

---

## 📤 发布后操作

### 1. GitHub Release

1. 访问项目的 GitHub 仓库
2. 进入 `Releases` 页面
3. 点击 `Draft a new release`
4. 选择刚创建的标签 `v1.4.1`
5. 填写 Release 标题：`v1.4.1 - 版本简述`
6. 复制 CHANGELOG.md 中的更新内容到描述框
7. 上传构建产物（可选）：
   ```bash
   npm run build
   cd dist && zip -r ../outdoor-gear-checklist-v1.4.1.zip .
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
git tag -d v1.4.1

# 删除远程标签（如果已推送）
git push origin --delete v1.4.1

# 重新创建正确的标签
git tag -a v1.4.1 -m "..."
git push origin v1.4.1
```

### Q3: CHANGELOG.md 写错了怎么修改？

```bash
# 如果还没推送，直接修改后重新提交
git add CHANGELOG.md
git commit --amend

# 如果已经推送，修改后创建新提交
git add CHANGELOG.md
git commit -m "docs: 修正 v1.4.1 更新日志"
git push
```

### Q4: 如何回退版本？

```bash
# 回退到上一个提交（不保留更改）
git reset --hard HEAD~1

# 回退到指定标签
git reset --hard v1.4.0

# 删除错误的标签
git tag -d v1.4.1
git push origin --delete v1.4.1
```

### Q5: 多人协作时如何避免冲突？

1. 发布前先拉取最新代码：`git pull origin main`
2. 确保本地分支是最新的
3. 如有冲突，先解决冲突再发布
4. 使用 `git push --force-with-lease` 替代 `--force`

---

## 📝 快速参考

### 完整发布命令（示例）

```bash
# 1. 查看提交记录，确定版本号
git log --oneline -10

# 2. 更新版本号（手动编辑文件）
# - package.json
# - src/config/appConfig.ts
# - CHANGELOG.md

# 3. 运行测试和构建
npm run type-check
npm run build

# 4. 提交变更
git add package.json src/config/appConfig.ts CHANGELOG.md
git commit -m "docs: 发布 v1.4.1 版本并更新相关文档

- 更新应用版本号至 v1.4.1
- 添加 v1.4.1 更新日志"

# 5. 创建标签
git tag -a v1.4.1 -m "Release v1.4.1

新功能:
- 功能列表

技术改进:
- 改进列表

修复:
- 修复列表"

# 6. 推送到远程
git push origin main
git push origin v1.4.1

# 7. 创建 GitHub Release（可选）
# 访问 https://github.com/your-repo/releases/new
```

### 版本号决策树

```
是否有破坏性变更？
├─ 是 → MAJOR 版本（如 1.x.x → 2.0.0）
└─ 否 → 是否有新功能？
    ├─ 是 → MINOR 版本（如 1.3.x → 1.4.0）
    └─ 否 → PATCH 版本（如 1.4.0 → 1.4.1）
```

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

