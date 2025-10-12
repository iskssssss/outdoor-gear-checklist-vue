<template>
  <MarkdownPage
    title="📝 更新日志"
    :source-url="sourceUrl"
    cache-key-prefix="outdoor-gear-changelog"
    :show-refresh-button="true"
    :cooldown-duration="30"
    @close="$emit('close')"
  />
</template>

<script setup>
import MarkdownPage from './MarkdownPage.vue'

// 定义事件
defineEmits(['close'])

// GitHub仓库配置
const GITHUB_REPO = 'iskssssss/outdoor-gear-checklist'
const GITHUB_BRANCH = 'main'
const GITHUB_DOC_PATH = 'CHANGELOG.md'
const sourceUrl = `https://raw.githubusercontent.com/${GITHUB_REPO}/${GITHUB_BRANCH}/${GITHUB_DOC_PATH}`
</script>
