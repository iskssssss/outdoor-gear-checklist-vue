/**
 * 基础UI组件统一导出
 * 使用方式：import { BaseButton, BaseInput } from '@/components/common'
 */

// 统一导出所有基础组件，以便全局或按需导入

// Data Components
export { default as BaseBadge } from './data/BaseBadge.vue';
export { default as BaseCard } from './data/BaseCard.vue';
export { default as BaseTable } from './data/BaseTable.vue';
export { default as MarkdownViewer } from './data/MarkdownViewer.vue';

// Feedback Components
export { default as BaseConfirm } from './feedback/BaseConfirm.vue';
export { default as BaseModal } from './feedback/BaseModal.vue';
export { default as ToastNotification } from './feedback/ToastNotification.vue';
export { default as BaseEmpty } from './feedback/BaseEmpty.vue';
export { default as BaseLoading } from './feedback/BaseLoading.vue';

// Form Components
export { default as BaseButton } from './form/BaseButton.vue';
export { default as BaseInput } from './form/BaseInput.vue';
export { default as BaseSelect } from './form/BaseSelect.vue';
export { default as BaseTextarea } from './form/BaseTextarea.vue';
export { default as BaseCheckbox } from './form/BaseCheckbox.vue';
export { default as BaseRadio } from './form/BaseRadio.vue';
export { default as InputSelect } from './form/InputSelect.vue';

// Navigation Components
export { default as BaseTabs } from './navigation/BaseTabs.vue';
export { default as BaseDropdown } from './navigation/BaseDropdown.vue';
export { default as BaseDropdownItem } from './navigation/BaseDropdownItem.vue';

// Others Components
export { default as BackToTopButton } from './others/BackToTopButton.vue';
export { default as BaseDivider } from './others/BaseDivider.vue';

