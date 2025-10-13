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

**版本号统一在 `package.json` 中维护**，构建时会自动注入到应用中。

#### 更新 `package.json`

```json
{
  "name": "outdoor-gear-checklist",
  "version": "1.4.3",  // 更新此处（唯一需要维护版本号的地方）
  ...
}
```

> 💡 **自动同步**：版本号会通过 Vite 构建时自动注入到全局变量 `__APP_VERSION__`，并在以下位置使用：
> - 页面底部显示版本号
> - 版本更新检测功能
> 
> 无需在其他文件中手动维护版本号！

### Step 3: 更新文档

#### 3.1 更新 CHANGELOG.md

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

#### 3.2 更新 README.md

根据新功能更新以下部分：
- **功能特性**：添加新功能描述
- **技术栈**：更新使用的技术和库
- **使用指南**：补充新功能的简要说明

**示例**（v1.4.1）：
- 在"用户体验"部分添加"多视图模式"和"草稿保存"
- 在"技术栈"部分添加"TypeScript"和"@vueuse/core"

#### 3.3 更新 USAGE.md

详细更新使用文档：
- 在对应章节添加新功能的详细说明
- 添加使用方法和示例
- 更新常见问题（FAQ）

**示例**（v1.4.1）：
- 在"视图模式"章节添加"表格视图"详细说明
- 在"编辑装备"部分添加"草稿保存功能"说明
- 在"常见问题"添加相关FAQ

#### 3.4 更新路线图（ROADMAP.md）

如果完成了路线图中的功能：

**需要更新的内容**：
- 将"进行中"或"计划中"的功能标记为"已完成"
- 移动已完成的功能到对应版本的"已完成功能"部分
- 更新里程碑进度
- 调整未来版本的规划（如有变化）

**示例**：
```markdown
### v1.5.0 (2025-11)
- ✅ B01 - 装备数量进度化 ← 标记为已完成
- ✅ B03 - 装备分组与多选版本
- 🚧 B05 - 装备"是否必须"标签 ← 进行中
```

**更新时机**：
- 主要功能完成时
- 版本发布时
- 季度回顾时

---

#### 3.5 更新常见问题（FAQ.md）

如果新版本引入了新功能或改变了使用方式：

**需要添加的内容**：
- 新功能的使用问题
- 升级后的常见疑问
- 新技术的说明

**示例**（v1.4.1）：
```markdown
### Q: 表格视图和卡片视图有什么区别？
A: ...

### Q: 草稿保存在哪里？
A: ...
```

---

#### 3.6 更新架构文档（ARCHITECTURE.md）

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
- **技术决策**：记录重要技术选型原因

**示例**（v1.4.1）：
```markdown
## 技术栈
| 技术 | 版本 | 用途 |
|------|------|------|
| TypeScript | 5.x | 类型安全 | ← 新增
| @vueuse/core | 13.x | 工具集 | ← 新增

## 核心模块
### 视图管理模块 ← 新增章节
- CategoryTableView.vue - 表格视图
- ...
```

---

#### 3.7 更新开发指南（DEVELOPMENT.md）

**何时需要更新**：
- 开发环境配置有变化
- 添加了新的开发命令
- 引入了新的开发工具
- 代码规范有更新

**需要更新的部分**：
- **环境要求**：Node.js、npm 版本等
- **依赖安装**：新的安装步骤
- **开发命令**：新增的 npm scripts
- **VS Code 配置**：新的推荐插件
- **代码规范**：新的规范要求
- **组件开发**：新的开发模式

**示例**（TypeScript 迁移后）：
```markdown
## 代码规范

### TypeScript 规范 ← 新增

#### 类型定义
```typescript
// ✅ 好的示例
interface Equipment { ... }
```
```

---

#### 3.8 更新部署指南（DEPLOYMENT.md）

**何时需要更新**：
- 构建配置有变化
- 添加了新的环境变量
- 部署平台有更新
- 性能优化配置有改动

**需要更新的部分**：
- **构建命令**：如有变化
- **环境变量**：新增的配置项
- **优化配置**：新的优化策略
- **部署平台**：新支持的平台

**示例**：
```markdown
## 环境变量

### .env 文件
```bash
VITE_ENABLE_PWA=true  ← 新增
VITE_API_TIMEOUT=30000 ← 新增
```
```

---

#### 3.9 更新贡献指南（CONTRIBUTING.md）

**何时需要更新**：
- 贡献流程有调整
- 代码规范有更新
- PR 要求有变化
- 测试要求有新增

**较少变更，但需要注意**：
- 保持与实际流程一致
- 及时更新联系方式
- 补充新的贡献方向

---

#### 3.10 更新安全政策（SECURITY.md）

**何时需要更新**：
- 支持版本列表变化
- 新增安全特性
- 发现并修复了安全问题

**示例**：
```markdown
| 版本 | 支持状态 |
| --- | --- |
| 1.5.x | ✅ 支持 | ← 新增
| 1.4.x | ✅ 支持 |
| 1.3.x | ⚠️ 有限支持 | ← 更新状态
| < 1.3 | ❌ 不支持 | ← 更新范围
```

---

#### 3.11 文档更新检查清单

发布前确认以下文档已更新：

**必须更新** ✅：
- [ ] `package.json` - 版本号（唯一需要维护版本号的地方）
- [ ] `docs/CHANGELOG.md` - 版本更新记录
- [ ] `README.md` - 功能特性（如有新功能）

**建议更新** 📝：
- [ ] `docs/USAGE.md` - 使用指南（如有新功能）
- [ ] `docs/ROADMAP.md` - 路线图进度
- [ ] `docs/FAQ.md` - 常见问题（如有新问题）

**按需更新** 🔄：
- [ ] `docs/ARCHITECTURE.md` - 架构变更时
- [ ] `docs/DEVELOPMENT.md` - 开发流程变更时
- [ ] `docs/DEPLOYMENT.md` - 部署方式变更时
- [ ] `docs/CONTRIBUTING.md` - 贡献流程变更时
- [ ] `docs/SECURITY.md` - 支持版本变化时
- [ ] `docs/CODE_OF_CONDUCT.md` - 极少更新

---

#### 3.12 文档一致性检查

更新文档后，确保：

1. **版本号一致**
   - 所有文档中提到的版本号统一
   - 示例代码使用最新版本

2. **链接有效**
   - 文档间的相互引用链接正确
   - 外部链接可访问

3. **内容同步**
   - README 和 USAGE 中的功能描述一致
   - ARCHITECTURE 和 DEVELOPMENT 中的技术栈一致

4. **格式统一**
   - Markdown 格式规范
   - emoji 使用一致
   - 目录结构清晰

**检查工具**：
```bash
# 检查 Markdown 链接
npm install -g markdown-link-check
markdown-link-check docs/**/*.md

# 检查拼写
npm install -g cspell
cspell "docs/**/*.md"
```

### Step 4: 提交变更

#### 4.1 查看变更文件

```bash
git status
```

检查所有修改的文件，确保没有遗漏。

---

#### 4.2 添加文件到暂存区

根据实际修改的文档，选择性添加文件：

**基础文件（必须）**：
```bash
git add package.json
git add docs/CHANGELOG.md
```

**功能文档（建议）**：
```bash
# 如果更新了功能特性
git add README.md

# 如果添加了新功能使用说明
git add docs/USAGE.md

# 如果完成了路线图功能
git add docs/ROADMAP.md

# 如果添加了常见问题
git add docs/FAQ.md
```

**技术文档（按需）**：
```bash
# 如果有架构变更
git add docs/ARCHITECTURE.md

# 如果更新了开发流程
git add docs/DEVELOPMENT.md

# 如果更新了部署方式
git add docs/DEPLOYMENT.md

# 如果更新了支持版本
git add docs/SECURITY.md

# 如果更新了贡献流程
git add docs/CONTRIBUTING.md
```

**一次性添加所有文档（谨慎使用）**：
```bash
git add package.json src/config/appConfig.ts docs/
```

---

#### 4.3 提交变更

使用规范的提交信息：

**标准提交格式**：
```bash
git commit -m "docs: 发布 v1.4.3 版本并更新相关文档

- 更新应用版本号至 v1.4.3
- 添加 v1.4.3 更新日志（版本更新提示、版本号统一管理等）
- 更新 README.md 功能特性和技术栈
- 更新 USAGE.md 添加新功能详细说明
- 更新 RELEASE.md 简化版本号维护流程"
```

**完整示例（包含多个文档）**：
```bash
git commit -m "docs: 发布 v1.5.0 版本并更新全套文档

**版本更新**
- 更新应用版本号至 v1.5.0
- 添加 v1.5.0 更新日志

**功能文档**
- 更新 README.md: 添加装备进度化和分组功能
- 更新 USAGE.md: 详细说明新功能使用方法
- 更新 ROADMAP.md: 标记 B01、B03、B05 已完成
- 更新 FAQ.md: 添加新功能常见问题

**技术文档**
- 更新 ARCHITECTURE.md: 添加进度管理模块说明
- 更新 DEVELOPMENT.md: 更新组件开发规范
- 更新 SECURITY.md: 更新支持版本列表"
```

**快捷格式（小版本）**：
```bash
git commit -m "docs: 发布 v1.4.2 版本并更新文档

- 修复若干 Bug
- 更新 CHANGELOG 和 README"
```

> 📝 **提交规范**：详细的提交信息格式和规范请参考 [COMMIT_CONVENTION.md](development/COMMIT_CONVENTION.md)

---

#### 4.4 验证提交

提交前最后检查：

```bash
# 查看暂存的文件
git diff --cached --name-only

# 查看具体改动
git diff --cached

# 查看提交信息
git log -1 --pretty=format:"%B"
```

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

# 2. 更新版本号和文档（手动编辑文件）

## 必须更新：
# - package.json (版本号 - 唯一需要维护版本号的地方)
# - docs/CHANGELOG.md (更新日志)

## 建议更新：
# - README.md (功能特性)
# - docs/USAGE.md (使用说明)
# - docs/ROADMAP.md (路线图进度)
# - docs/FAQ.md (常见问题)

## 按需更新：
# - docs/ARCHITECTURE.md (架构变更)
# - docs/DEVELOPMENT.md (开发流程)
# - docs/DEPLOYMENT.md (部署方式)
# - docs/SECURITY.md (支持版本)
# - docs/CONTRIBUTING.md (贡献流程)

# 3. 运行测试和构建
npm run type-check
npm run build

# 4. 提交变更（添加修改的文档）

# 基础文件
git add package.json docs/CHANGELOG.md

# 功能文档（根据实际修改选择）
git add README.md docs/USAGE.md docs/ROADMAP.md docs/FAQ.md

# 技术文档（根据实际修改选择）
# git add docs/ARCHITECTURE.md docs/DEVELOPMENT.md docs/DEPLOYMENT.md

# 提交
git commit -m "docs: 发布 v1.4.1 版本并更新相关文档

**版本更新**
- 更新应用版本号至 v1.4.1
- 添加 v1.4.1 更新日志

**功能文档**
- 更新 README.md 和 USAGE.md
- 更新 ROADMAP.md 和 FAQ.md"

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

