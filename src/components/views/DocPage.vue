<template>
  <MarkdownPage title="使用指南" :source-url="sourceUrl" cache-key-prefix="outdoor-gear-doc" @close="$router.push('/')" />
</template>

<script setup>
import MarkdownPage from './MarkdownPage.vue'

// 定义事件
defineEmits(['close'])

// GitHub仓库配置
const GITHUB_REPO = 'iskssssss/outdoor-gear-checklist'
const GITHUB_BRANCH = 'main'
const GITHUB_DOC_PATH = 'docs/USAGE.md'
const sourceUrl = `https://raw.githubusercontent.com/${GITHUB_REPO}/${GITHUB_BRANCH}/${GITHUB_DOC_PATH}`
</script>
