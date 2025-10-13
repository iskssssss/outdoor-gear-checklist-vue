<template>
  <div
    class="base-divider"
    :class="[
      `direction-${direction}`,
      `content-position-${contentPosition}`,
      `border-style-${borderStyle}`,
      { hasContent: $slots.default || content }
    ]"
  >
    <span v-if="$slots.default || content" class="divider-content">
      <slot>{{ content }}</slot>
    </span>
  </div>
</template>

<script setup lang="ts">
interface Props {
  direction?: 'horizontal' | 'vertical'
  contentPosition?: 'left' | 'center' | 'right'
  borderStyle?: 'solid' | 'dashed' | 'dotted'
  content?: string
}

withDefaults(defineProps<Props>(), {
  direction: 'horizontal',
  contentPosition: 'center',
  borderStyle: 'solid'
})
</script>

<style scoped lang="scss">
.base-divider {
  position: relative;
  margin: var(--spacing-lg) 0;

  &.direction-horizontal {
    width: 100%;
    height: 0;
    border-top: 1px var(--border-color);

    &.border-style-solid {
      border-top-style: solid;
    }

    &.border-style-dashed {
      border-top-style: dashed;
    }

    &.border-style-dotted {
      border-top-style: dotted;
    }

    &.hasContent {
      display: flex;
      align-items: center;
      height: auto;
      border: none;

      &::before,
      &::after {
        content: '';
        flex: 1;
        border-top: 1px var(--border-color);
      }

      &.border-style-solid::before,
      &.border-style-solid::after {
        border-top-style: solid;
      }

      &.border-style-dashed::before,
      &.border-style-dashed::after {
        border-top-style: dashed;
      }

      &.border-style-dotted::before,
      &.border-style-dotted::after {
        border-top-style: dotted;
      }

      &.content-position-left::before {
        max-width: 5%;
      }

      &.content-position-right::after {
        max-width: 5%;
      }
    }
  }

  &.direction-vertical {
    display: inline-block;
    width: 0;
    height: 100%;
    min-height: 1em;
    margin: 0 var(--spacing-md);
    border-left: 1px var(--border-color);
    vertical-align: middle;

    &.border-style-solid {
      border-left-style: solid;
    }

    &.border-style-dashed {
      border-left-style: dashed;
    }

    &.border-style-dotted {
      border-left-style: dotted;
    }
  }
}

.divider-content {
  padding: 0 var(--spacing-md);
  color: var(--text-secondary);
  font-size: 14px;
  white-space: nowrap;
}
</style>

