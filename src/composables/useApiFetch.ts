import env from '@/constants/env'
import { useToast } from '@/plugins/toastr'
import { useAuthStore } from '@/stores/auth/useAuthStore'
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import { default as axios } from 'axios'

const { VITE_APP_API_URL: BASE_URL } = env

export default async function useApiFetch(uri: string, options: AxiosRequestConfig = {}): Promise<any> {
  const auth = useAuthStore()
  const $toast = useToast()
  console.log(uri.startsWith("https://") || uri.startsWith("http://") ? `${uri}` :`${BASE_URL}${uri}`);
  const config: AxiosRequestConfig = {
    url:  uri.startsWith("https://") || uri.startsWith("http://") ? `${uri}` :`${BASE_URL}${uri}`,
    headers: {
      Accept: 'application/json',
      ...options.headers,
    },
    ...options,
  }

  const token = auth.accessToken || localStorage.getItem('access_token')

  if (token) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    config.headers!.Authorization = `Bearer ${token}`
  }

  const apiInstance: AxiosInstance = axios.create(config)

  apiInstance.interceptors.response.use(
    (response: AxiosResponse) => response.data,
    (error: any) => {
      if (error.response && error.response.status === 401) {
        if ($toast) { $toast.error('You have been logged out. Token expired') }

        auth.logout()
      }
      else if (error?.response?.data?.message === 'The route dashboard could not be found.') {
        auth.redirectToDashboard()
      }

      return Promise.reject(error)
    },
  )

  return await apiInstance.request<any>(config)
}
