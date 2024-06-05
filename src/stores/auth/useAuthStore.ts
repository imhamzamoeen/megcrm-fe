import useApiFetch from '@/composables/useApiFetch'
import { ACCESS_TOKEN_KEY } from '@/constants/general'
import { isValidToken } from '@/middlewares/auth'
import { useToast } from '@/plugins/toastr'
import { usePermissionsStore } from '@/stores/permissions/usePermissionsStore'
import { handleError, reshapeParams } from '@/utils/useHelper'

interface User {
  id: number
  name: string
  email: string
}

interface Credentials {
  email: string
  password: string
}

interface ForgotPassword {
  email: string
}

interface ResetPassword {
  token: string
  email: string
  password: string
  password_confirmation: string
}

export const useAuthStore = defineStore('auth', () => {
  const endPoint = '/user'

  const publicRoutes = ['/login', '/forgot-password', '/reset-password']

  const accessToken = ref<string | null>(null)
  const user = ref<User | null>(null)
  const isLoading = ref<boolean>(false)
  const errors = ref<any>({})
  const success = ref<boolean>(false)
  const message = ref<string>('')
  const isLoggedIn = computed(() => !!user.value)
  const router = useRouter()
  const $toast = useToast()
  const route = useRoute()
  const permissionsStore = usePermissionsStore()

  const fetchUser = async () => {
    isLoading.value = true

    try {
      const { data } = await useApiFetch(reshapeParams(endPoint, {}, {
        include: ['notifications'].join(','),
        append: ['users_logs', 'rights', 'top_role', 'user_agents'].join(',')
      }))

      await setUser(data.user)
    }
    catch (e: any) {
      user.value = null
      throw Error(e)
    } finally {
      isLoading.value = false
    }

  }

  const login = async (credentials: Credentials) => {
    isLoading.value = true
    errors.value = {}

    try {
      const { data: loginData } = await useApiFetch('/login', {
        data: credentials,
        method: 'POST',
      })

      await setToken(loginData.access_token)
      await setUser(loginData.user)
      redirectToDashboard()
    }
    catch (error: any) {
      handleError(error, errors)
    }
    finally {
      isLoading.value = false
    }
  }

  const forgotPassword = async (payload: ForgotPassword) => {
    isLoading.value = true
    errors.value = {}

    try {
      const { success: rSuccess, message: rMessage } = await useApiFetch('/forgot-password', {
        data: payload,
        method: 'POST',
      })

      if (rSuccess) {
        $toast.success(rMessage)
        success.value = true
        message.value = rMessage
      }
    }
    catch (error: any) {
      handleError(error, errors)
    }
    finally {
      isLoading.value = false
    }
  }

  const resetPassword = async (payload: ResetPassword) => {
    isLoading.value = true
    errors.value = {}

    try {
      const { success: rSuccess, message: rMessage } = await useApiFetch('/reset-password', {
        data: payload,
        method: 'POST',
      })

      if (rSuccess) {
        $toast.success(rMessage)
        success.value = true
        message.value = rMessage
      }
    }
    catch (error: any) {
      handleError(error, errors)
    }
    finally {
      isLoading.value = false
    }
  }

  const setUser = async (userData: User | any) => {
    user.value = userData

    if (!accessToken.value && isValidToken(getStorageToken().value)) {
      accessToken.value = getStorageToken().value
    }
  }

  const setToken = async (token: any) => {
    accessToken.value = token
    getStorageToken().value = token
  }

  const destroyUser = async () => (user.value = null)

  const destroyToken = async () => {
    getStorageToken().value = null
    accessToken.value = null
  }

  const getStorageToken = () => useStorage(ACCESS_TOKEN_KEY, null)

  const logout = async () => {
    destroyUser()
    destroyToken()

    permissionsStore.$reset()
    $reset()

    redirectToLogin()
  }

  const redirectToLogin = () => router.push('/login')

  const redirectToDashboard = () => {
    $toast.success('Redirecting to dashboard')
    router.push('/dashboard')
  }

  const reset = () => {
    errors.value = {}
    success.value = false
    message.value = ''
  }

  const $reset = () => {
    accessToken.value = null
    user.value = null
    isLoading.value = false
    errors.value = {}
    success.value = false
    message.value = ''
  }

  // resetting errors if route changes
  watch(() => route.name, () => reset())

  return {
    user,
    isLoggedIn,
    isLoading,
    success,
    message,
    errors,
    accessToken,
    publicRoutes,

    login,
    logout,
    fetchUser,
    forgotPassword,
    resetPassword,
    redirectToDashboard,
    redirectToLogin,
    setToken,
    setUser,
    destroyUser,
    destroyToken,
    $reset
  }
})
