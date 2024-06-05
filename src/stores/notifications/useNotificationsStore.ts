import useApiFetch from '@/composables/useApiFetch'
import { defineStore } from 'pinia'

export const useNotificationsStore = defineStore('notifications', () => {
  const endPoint = '/notifications'

  const markSingleAsRead = async (id: number | string) => {
    try {
      await useApiFetch(`${endPoint}/${id}`)
    } catch (error) {
      //
    }
  }

  const destroy = async (id: number | string) => {
    try {
      await useApiFetch(`${endPoint}/${id}`, { method: 'DELETE' })
    } catch (error) {
      //
    }
  }

  const markAllAsRead = async () => {
    try {
      await useApiFetch(`${endPoint}`)
    } catch (error) {
      //
    }
  }

  return {
    markSingleAsRead,
    markAllAsRead,
    destroy
  }
})
