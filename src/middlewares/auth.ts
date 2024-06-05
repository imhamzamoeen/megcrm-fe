import { useToast } from '@/plugins/toastr'

export function isValidToken(token: any) {
  return token && token !== 'undefined'
}

export function notifyError(message: string) {
  const $toast = useToast()
  if ($toast) {
    $toast.error(message)
  }
  else { console.error('Notification service not available.') }
}
