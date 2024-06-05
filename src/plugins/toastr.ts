import { useToast as baseUseToast } from 'vue-toast-notification'
import 'vue-toast-notification/dist/theme-default.css'

export const useToast = (options = {}) => {
  // Provide a default position if not provided in options
  const toastOptions = {
    position: 'top-right',
    dismissible: false,
    ...options,
  }

  return baseUseToast(toastOptions as any)
}
