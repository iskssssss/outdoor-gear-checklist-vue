<template>
  <BaseDropdown 
    :trigger="trigger" 
    :placement="placement"
    :disabled="disabled"
    ref="dropdownRef"
  >
    <template #trigger>
      <BaseButton 
        :variant="variant"
        :size="size"
        :icon="icon"
        :disabled="disabled"
      >
        {{ text }}
      </BaseButton>
    </template>
    
    <!-- 递归渲染菜单项 -->
    <template v-for="item in options" :key="item.value || item.label">
      <!-- 有子菜单的项 -->
      <BaseDropdownSubmenu 
        v-if="item.children && item.children.length > 0"
        :icon="item.icon"
        :title="item.label"
        :active="item.active"
        :disabled="item.disabled"
        :divided="item.divided"
        :expand-trigger="expandTrigger"
      >
        <BaseDropdownItem
          v-for="child in item.children"
          :key="child.value || child.label"
          :icon="child.icon"
          :active="child.active"
          :disabled="child.disabled"
          :divided="child.divided"
          :danger="child.danger"
          @click="handleItemClick(child)"
        >
          {{ child.label }}
        </BaseDropdownItem>
      </BaseDropdownSubmenu>
      
      <!-- 普通菜单项 -->
      <BaseDropdownItem 
        v-else
        :icon="item.icon"
        :active="item.active"
        :disabled="item.disabled"
        :divided="item.divided"
        :danger="item.danger"
        @click="handleItemClick(item)"
      >
        {{ item.label }}
      </BaseDropdownItem>
    </template>
  </BaseDropdown>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import BaseDropdown from './BaseDropdown.vue'
import BaseDropdownItem from './BaseDropdownItem.vue'
import BaseDropdownSubmenu from './BaseDropdownSubmenu.vue'
import BaseButton from '../form/BaseButton.vue'

export interface MenuItem {
  // 菜单项值（用于标识）
  value?: string | number
  // 菜单项标签
  label: string
  // 图标
  icon?: string
  // 是否激活
  active?: boolean
  // 是否禁用
  disabled?: boolean
  // 是否危险操作
  danger?: boolean
  // 是否显示分隔线
  divided?: boolean
  // 子菜单
  children?: MenuItem[]
  // 点击处理函数（可选，也可以通过 @select 事件统一处理）
  handler?: () => void
}

interface Props {
  // 按钮文本
  text: string
  // 按钮图标
  icon?: string
  // 按钮变体
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'secondary' | 'outline' | 'text'
  // 按钮尺寸
  size?: 'sm' | 'md' | 'lg'
  // 触发方式
  trigger?: 'click' | 'hover'
  // 下拉位置
  placement?: 'bottom' | 'bottom-start' | 'bottom-end' | 'top' | 'top-start' | 'top-end'
  // 禁用
  disabled?: boolean
  // 菜单选项配置（数据驱动）
  options: MenuItem[]
  // 子菜单展开触发方式（参考 cascader 的 expandTrigger）
  expandTrigger?: 'click' | 'hover'
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  trigger: 'hover',
  placement: 'bottom-start',
  disabled: false,
  expandTrigger: 'hover'  // 默认悬停展开子菜单
})

const emit = defineEmits<{
  'select': [item: MenuItem]
}>()

const dropdownRef = ref()

/**
 * 处理菜单项点击
 */
function handleItemClick(item: MenuItem) {
  // 如果有自定义处理函数，优先执行
  if (item.handler) {
    item.handler()
  }
  
  // 触发 select 事件
  emit('select', item)
  
  // 关闭下拉菜单
  dropdownRef.value?.close()
}

// 暴露下拉框方法
defineExpose({
  open: () => dropdownRef.value?.open(),
  close: () => dropdownRef.value?.close(),
  toggle: () => dropdownRef.value?.toggle()
})
</script>

<style scoped>
/* 此组件只是组合，样式由子组件提供 */
</style>

