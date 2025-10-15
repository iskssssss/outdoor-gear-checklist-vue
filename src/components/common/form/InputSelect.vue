<template>
  <div class="input-select-wrapper" ref="triggerRef">
    <input type="text" v-model="displayText" @focus="handleFocus" @click="handleClick" @blur="handleBlur"
      @input="handleInput" @keyup.enter="selectOrCreateOption" :placeholder="placeholder" autocomplete="off">
    <ul class="suggestions-list" ref="menuRef" :style="menuStyle">
      <li v-for="option in filteredOptions" :key="option.value" @mousedown="handleSelect(option)"
        :class="{ 'selected': option.value === modelValue }"
        :ref="el => { if (option.value === modelValue) selectedItemRef = el }">
        {{ option.label }}
      </li>
      <li v-if="canAddNew" @mousedown.prevent="handleAddNew" class="add-new-option">
        + 添加 "{{ displayText }}"
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue';
import { useResponsiveMenu } from '@/composables/useResponsiveMenu';

const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },
  options: {
    type: Array,
    default: () => [],
  },
  category: {
    type: String,
    required: true,
  },
  placeholder: {
    type: String,
    default: '选择或输入...',
  },
});

const emit = defineEmits(['update:modelValue', 'addCustomOption']);

const displayText = ref('');
const isOpen = ref(false);
const isTyping = ref(false);
// 触发器引用
const triggerRef = ref(null);
// 菜单引用
const menuRef = ref(null);
let selectedItemRef = null;
let blurTimer = null;

// 使用响应式菜单 Composable
const { menuStyle, updatePosition } = useResponsiveMenu(triggerRef, menuRef, { isOpen, setWidth: true });

// 获取选中项的 label
const selectedOption = computed(() =>
  props.options.find(opt => opt.value === props.modelValue)
);

// 监听 modelValue 变化，更新显示文本
watch(() => props.modelValue, (newValue) => {
  if (!isOpen.value) {
    const option = props.options.find(opt => opt.value === newValue);
    displayText.value = option ? option.label : newValue || '';
  }
}, { immediate: true });

// 过滤后的选项
const filteredOptions = computed(() => {
  // 如果没有在输入状态，显示所有选项
  if (!isTyping.value) {
    return props.options;
  }

  // 否则根据输入过滤
  const search = displayText.value.toLowerCase().trim();
  if (!search) {
    return props.options;
  }

  return props.options.filter(opt =>
    opt.label.toLowerCase().includes(search)
  );
});

// 是否可以添加新项
const canAddNew = computed(() => {
  if (!isTyping.value || !displayText.value.trim()) {
    return false;
  }
  const search = displayText.value.trim().toLowerCase();
  return !props.options.some(opt => opt.label.toLowerCase() === search);
});

function handleFocus() {
  openDropdown();
}

function handleClick() {
  // 如果已经关闭，打开下拉列表
  // 如果已经打开，也重新打开（刷新状态）
  openDropdown();
}

function openDropdown() {
  // 清除可能存在的关闭计时器
  if (blurTimer) {
    clearTimeout(blurTimer);
    blurTimer = null;
  }

  // 重置输入状态
  isTyping.value = false;

  // 显示当前选中的值
  if (selectedOption.value) {
    displayText.value = selectedOption.value.label;
  }

  // 打开下拉列表
  isOpen.value = true;

  // 滚动到选中项
  nextTick(() => {
    if (selectedItemRef) {
      selectedItemRef.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  });
}

function handleBlur() {
  // 清除之前的计时器
  if (blurTimer) {
    clearTimeout(blurTimer);
  }

  // 极短的延迟，仅用于确保点击事件能够触发
  blurTimer = setTimeout(() => {
    isOpen.value = false;
    isTyping.value = false;

    // 恢复显示选中项
    if (selectedOption.value) {
      displayText.value = selectedOption.value.label;
    } else {
      displayText.value = '';
    }
  }, 50);
}

function handleInput() {
  // 清除关闭计时器
  if (blurTimer) {
    clearTimeout(blurTimer);
    blurTimer = null;
  }

  // 标记为正在输入
  isTyping.value = true;

  // 确保下拉列表打开
  if (!isOpen.value) {
    isOpen.value = true;
  }
}

function selectOrCreateOption() {
  const search = displayText.value.trim();
  if (!search) return;

  const existing = props.options.find(opt =>
    opt.label.toLowerCase() === search.toLowerCase()
  );

  if (existing) {
    handleSelect(existing);
  } else if (canAddNew.value) {
    handleAddNew();
  }
}

function handleSelect(option, event) {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }

  if (blurTimer) {
    clearTimeout(blurTimer);
  }

  emit('update:modelValue', option.value);
  displayText.value = option.label;
  isOpen.value = false;
  isTyping.value = false;
}

function handleAddNew(event) {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }

  if (blurTimer) {
    clearTimeout(blurTimer);
  }

  const label = displayText.value.trim();
  if (!label) return;

  emit('addCustomOption', props.category, label, label);
  emit('update:modelValue', label);
  displayText.value = label;
  isOpen.value = false;
  isTyping.value = false;
}
</script>

<style scoped lang="scss">
.input-select-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
}

.input-select-wrapper input {
  flex: 1;
  padding: var(--spacing-sm) var(--spacing-md);  /* 输入框中等内边距 */
  border: var(--border-width) solid var(--border-color);
  border-radius: var(--radius-sm);
  font-size: 1rem;
  background: var(--bg-input);
  color: var(--text-primary);
  cursor: pointer;
}

.input-select-wrapper input:focus {
  outline: none;
  border-color: var(--primary-color);
}

.suggestions-list {
  /* 移除 position, top, left, width, transform-origin */
  max-height: 200px;  /* 下拉列表最大高度固定，保证可见性 */
  overflow-y: auto;
  background: var(--bg-card);
  border: var(--border-width) solid var(--border-color);
  border-radius: var(--radius-sm);
  box-shadow: var(--shadow-lg);
  margin-top: var(--spacing-xs);  /* 下拉列表与输入框的小间隙 */
  z-index: 1000;
  padding: 0;
  list-style: none;
}

.suggestions-list li {
  padding: var(--spacing-sm) var(--spacing-md);  /* 列表项内边距与输入框对齐 */
  cursor: pointer;
  transition: background-color 0.2s ease;
  color: var(--text-primary);
}

.suggestions-list li:hover {
  background-color: var(--primary-light);
}

.suggestions-list li.selected {
  background-color: var(--primary-color);
  color: var(--btn-primary-text);
  font-weight: var(--font-weight-bold);
}

.suggestions-list li.add-new-option {
  color: var(--primary-color);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  padding: var(--spacing-sm) var(--spacing-md);  /* 添加新项的内边距 */
  text-align: center;
  border-top: var(--border-width) solid var(--border-color);
}

.suggestions-list li.add-new-option:hover {
  background-color: var(--primary-light);
}

/* 下拉列表过渡动画 */
.dropdown-enter-active {
  animation: dropdown-in 0.15s ease-out;
}

.dropdown-leave-active {
  animation: dropdown-out 0.1s ease-in;
}

@keyframes dropdown-in {
  0% {
    opacity: 0;
    transform: translateY(-10px);
  }

  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes dropdown-out {
  0% {
    opacity: 1;
    transform: translateY(0);
  }

  100% {
    opacity: 0;
    transform: translateY(-10px);
  }
}
</style>
