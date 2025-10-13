import { inject } from 'vue'

interface ConfirmOptions {
  title?: string;
  message?: string;
  confirmButtonText?: string;
  showDangerWarning?: boolean;
}

type ShowConfirmFunction = (options: ConfirmOptions) => Promise<boolean>;

export function useConfirm(): ShowConfirmFunction | undefined {
  const showConfirm = inject<ShowConfirmFunction>('showConfirm')
  return showConfirm
}
