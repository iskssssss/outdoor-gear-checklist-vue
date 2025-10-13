<template>
  <MarkdownPage title="更新日志" :source-url="sourceUrl" cache-key-prefix="outdoor-gear-changelog"
    @close="$router.push('/')" />
</template>

<script setup>
import MarkdownPage from './MarkdownPage.vue'

// 定义事件
defineEmits(['close'])

// GitHub仓库配置
const GITHUB_REPO = 'iskssssss/outdoor-gear-checklist'
const GITHUB_BRANCH = 'main'
const GITHUB_DOC_PATH = 'docs/CHANGELOG.md'
const sourceUrl = `https://raw.githubusercontent.com/${GITHUB_REPO}/${GITHUB_BRANCH}/${GITHUB_DOC_PATH}`
</script>

<style scoped lang="scss">
.markdown-container {
  max-width: 1320px;
  margin: 0 auto;
  padding: 20px;
  background: var(--bg-card);
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-md);
  // 新增内边距以创建与页脚的间距
  padding-bottom: 40px;
}
</style>