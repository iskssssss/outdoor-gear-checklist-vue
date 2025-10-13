import { ref, watch, Ref, computed } from 'vue';
import {
  useElementBounding,
  useWindowSize,
  useEventListener,
  useMutationObserver,
  MaybeElementRef,
  unrefElement,
} from '@vueuse/core';

interface MenuOptions {
  isOpen: Ref<boolean>;
  offset?: number;
  setWidth?: boolean;
}

interface MenuStyle {
  position: string;
  top: string;
  left: string;
  opacity: number;
  visibility: string;
  transform: string;
  transition: string;
  width?: string;
  maxHeight?: string;
}

/**
 * 一个 Vue Composable 函数，用于动态调整菜单元素的位置，以确保其在视口内可见。
 * @param {ref} triggerRef - 触发菜单的元素的引用 (e.g., a button or input).
 * @param {ref} menuRef - 菜单元素的引用 (e.g., a dropdown list).
 * @param {object} options - 配置选项.
 * @param {ref<boolean>} options.isOpen - 控制菜单可见性的 ref.
 * @param {number} [options.offset=8] - 菜单与触发元素之间的距离（像素）.
 * @param {boolean} [options.setWidth=false] - 是否将菜单宽度设置为与触发器相同.
 * @returns {object} 包含菜单样式的 ref.
 */
export function useResponsiveMenu(
  triggerRef: MaybeElementRef,
  menuRef: MaybeElementRef,
  { isOpen, offset = 8, setWidth = false }: MenuOptions
) {
  const triggerBounding = useElementBounding(triggerRef);
  const menuBounding = useElementBounding(menuRef);
  const { width: windowWidth, height: windowHeight } = useWindowSize();

  const menuStyle = computed<MenuStyle>(() => {
    const menuEl = unrefElement(menuRef);
    if (!isOpen.value || !unrefElement(triggerRef) || !menuEl) {
      return {
        position: 'fixed',
        top: '0px',
        left: '0px',
        opacity: 0,
        visibility: 'hidden',
        transform: 'translateY(-10px)',
        transition: 'opacity 0.2s, transform 0.2s',
      };
    }

    const viewportWidth = windowWidth.value;
    const viewportHeight = windowHeight.value;

    const computedStyle = window.getComputedStyle(menuEl);
    const cssMaxHeight = computedStyle.maxHeight;
    let preferredMaxHeight = Infinity;
    if (cssMaxHeight && cssMaxHeight !== 'none') {
      preferredMaxHeight = parseFloat(cssMaxHeight);
    }
    const targetHeight = Math.min(menuBounding.height.value, preferredMaxHeight);

    let top: number;
    let left: number = triggerBounding.left.value;
    let finalMaxHeight: number;

    const spaceBelow = viewportHeight - triggerBounding.bottom.value;
    const spaceAbove = triggerBounding.top.value;

    const goesAbove = spaceBelow < targetHeight + offset && spaceAbove > spaceBelow;

    if (goesAbove) {
      const availableHeight = spaceAbove - offset;
      finalMaxHeight = Math.min(preferredMaxHeight, availableHeight);
      const finalMenuHeight = Math.min(menuBounding.height.value, finalMaxHeight);
      top = triggerBounding.top.value - finalMenuHeight - offset;
    } else {
      const availableHeight = spaceBelow - offset;
      finalMaxHeight = Math.min(preferredMaxHeight, availableHeight);
      top = triggerBounding.bottom.value + offset;
    }

    if (top < offset) {
      top = offset;
    }

    if (left + menuBounding.width.value > viewportWidth) {
      left = viewportWidth - menuBounding.width.value - offset;
    }

    if (left < offset) {
      left = offset;
    }

    let width = setWidth ? triggerBounding.width.value : menuBounding.width.value;
    if (width > viewportWidth - offset * 2) {
      width = viewportWidth - offset * 2;
      left = offset;
    }

    return {
      position: 'fixed',
      top: `${top}px`,
      left: `${left}px`,
      width: `${width}px`,
      maxHeight: `${finalMaxHeight}px`,
      opacity: 1,
      visibility: 'visible',
      transform: 'translateY(0)',
      transition: 'opacity 0.2s, transform 0.2s',
    };
  });

  const updatePosition = () => {
    triggerBounding.update();
    menuBounding.update();
  };
  
  watch(isOpen, (newValue) => {
    if (newValue) {
      updatePosition()
    }
  });
  
  useEventListener(window, 'scroll', updatePosition, true);
  
  useMutationObserver(menuRef, updatePosition, {
    childList: true,
    subtree: true,
  });

  return {
    menuStyle,
    updatePosition,
  };
}
