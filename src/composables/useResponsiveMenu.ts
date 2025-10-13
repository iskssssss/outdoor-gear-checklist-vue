import { ref, onMounted, onBeforeUnmount, nextTick, watch, Ref } from 'vue';

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
export function useResponsiveMenu(triggerRef: Ref<HTMLElement | null>, menuRef: Ref<HTMLElement | null>, { isOpen, offset = 8, setWidth = false }: MenuOptions) {
  const menuStyle = ref<MenuStyle>({
    position: 'fixed',
    top: '0px',
    left: '0px',
    opacity: 0,
    visibility: 'hidden',
    transform: 'translateY(-10px)',
    transition: 'opacity 0.2s, transform 0.2s',
  });

  const updatePosition = async (): Promise<void> => {
    if (!isOpen.value || !triggerRef.value || !menuRef.value) {
      menuStyle.value.opacity = 0;
      menuStyle.value.visibility = 'hidden';
      menuStyle.value.transform = 'translateY(-10px)';
      return;
    }

    // 关键修复：先将菜单在屏幕外设为可见，以便正确测量其尺寸
    const menu = menuRef.value as HTMLElement;
    menu.style.visibility = 'visible';
    menu.style.opacity = '0';
    menu.style.top = '-9999px';
    menu.style.left = '-9999px';

    // 等待 DOM 更新以应用上述样式
    await nextTick();

    const triggerRect: DOMRect = triggerRef.value.getBoundingClientRect();
    // 现在可以获取到真实的尺寸
    const menuRect: DOMRect = menu.getBoundingClientRect();
    const computedStyle: CSSStyleDeclaration = window.getComputedStyle(menu);
    const cssMaxHeight: string = computedStyle.maxHeight;
    let preferredMaxHeight: number = Infinity;
    if (cssMaxHeight && cssMaxHeight !== 'none') {
      preferredMaxHeight = parseFloat(cssMaxHeight);
    }
    const targetHeight: number = Math.min(menuRect.height, preferredMaxHeight);

    const viewportWidth: number = window.innerWidth;
    const viewportHeight: number = window.innerHeight;

    let top: number;
    let left: number = triggerRect.left;
    let finalMaxHeight: number;

    // --- 最终的垂直定位与高度限制逻辑 ---
    const spaceBelow: number = viewportHeight - triggerRect.bottom;
    const spaceAbove: number = triggerRect.top;

    const goesAbove: boolean = (spaceBelow < targetHeight + offset) && (spaceAbove > spaceBelow);

    if (goesAbove) {
      const availableHeight: number = spaceAbove - offset;
      finalMaxHeight = Math.min(preferredMaxHeight, availableHeight);
      const finalMenuHeight: number = Math.min(menuRect.height, finalMaxHeight);
      top = triggerRect.top - finalMenuHeight - offset;
    } else {
      const availableHeight: number = spaceBelow - offset;
      finalMaxHeight = Math.min(preferredMaxHeight, availableHeight);
      top = triggerRect.bottom + offset;
    }

    // 确保菜单不会被推到屏幕顶部之外
    if (top < offset) {
      top = offset;
    }

    // 水平位置调整
    if (left + menuRect.width > viewportWidth) {
      // 尝试右对齐，并留出边距
      left = viewportWidth - menuRect.width - offset;
    }

    if (left < offset) {
      // 确保左侧也有边距
      left = offset;
    }

    let width: number = setWidth ? triggerRect.width : menuRect.width;
    // 如果菜单宽度大于视口宽度，则强制适应
    if (width > viewportWidth - (offset * 2)) {
      width = viewportWidth - (offset * 2);
      left = offset;
    }


    const finalStyle: MenuStyle = {
      ...menuStyle.value,
      top: `${top}px`,
      left: `${left}px`,
      width: `${width}px`,
      // 应用最终计算出的智能高度
      maxHeight: `${finalMaxHeight}px`,
      opacity: 1,
      visibility: 'visible',
      transform: 'translateY(0)',
    };

    // 清理临时内联样式
    menu.style.visibility = '';
    menu.style.opacity = '';
    menu.style.top = '';
    menu.style.left = '';

    // 应用最终计算出的样式
    menuStyle.value = finalStyle;
  };

  let observer: MutationObserver | null = null;

  onMounted(() => {
    // 使用 MutationObserver 监视菜单内容变化，以便在内容变化时更新位置
    if (menuRef.value) {
      observer = new MutationObserver(updatePosition);
      observer.observe(menuRef.value, { childList: true, subtree: true });
    }
    window.addEventListener('resize', updatePosition);
    // 在捕获阶段处理滚动
    window.addEventListener('scroll', updatePosition, true);
  });

  onBeforeUnmount(() => {
    if (observer) {
      observer.disconnect();
    }
    window.removeEventListener('resize', updatePosition);
    window.removeEventListener('scroll', updatePosition, true);
  });

  // 监视 isOpen 状态的变化
  watch(isOpen, (newValue: boolean) => {
    if (newValue) {
      updatePosition().then(r => {

      });
    } else {
      menuStyle.value.opacity = 0;
      menuStyle.value.visibility = 'hidden';
      menuStyle.value.transform = 'translateY(-10px)';
    }
  });

  return {
    menuStyle,
    updatePosition,
  };
}
