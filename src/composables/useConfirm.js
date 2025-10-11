import { inject } from 'vue'

export function useConfirm() {
  const showConfirm = inject('showConfirm')
  return showConfirm
}
