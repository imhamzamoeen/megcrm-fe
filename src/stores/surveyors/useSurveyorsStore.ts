import useApiFetch from '@/composables/useApiFetch'
import { defaultPagination } from '@/constants/pagination'
import { useToast } from '@/plugins/toastr'
import { useUsersStore } from '@/stores/users/useUsersStore'
import { EventBus } from '@/utils/useEventBus'
import { handleError, reshapeParams } from '@/utils/useHelper'
import { defineStore } from 'pinia'

export const useSurveyorsStore = defineStore('surveyors', () => {

  const usersStore = useUsersStore()
  const endPoint = '/surveyors'
  const entity = 'Surveyor'
  const selected: any = ref(usersStore.defaultModel)
  const selectedId: any = ref(null)
  const isLoading = ref(false)
  const errors = ref({})
  const meta = ref(defaultPagination)
  const entries = ref([])
  const $toast: any = useToast()
  const includes = ["createdBy"]

  const isSelected = computed(() => !!selected.value.id)

  const index = async (options = {}) => {
    isLoading.value = true
    const { data, meta: serverMeta } = await useApiFetch(reshapeParams(endPoint, meta.value, options))
    entries.value = data.users
    meta.value = {
      filters: meta.value?.filters ?? {},
      ...serverMeta
    }
    isLoading.value = false
  }

  const get = async (userId: Number) => {
    isLoading.value = true
    selectedId.value = userId

    const { data } = await useApiFetch(`/users/${userId}`)

    selected.value = data.user
    selected.value.roles = data.user.roles.map((i: any) => i.id)
    isLoading.value = false
  }

  const store = async (payload: any, options: any = { method: 'POST' }) => {
    try {
      isLoading.value = true
      await useApiFetch(endPoint, {
        data: payload,
        ...options,
      })

      await index({ include: includes.join(",") })
      $toast.success(`${entity} was saved successfully.`)
    } catch (error) {
      handleError(error, errors)
    } finally {
      isLoading.value = false
    }
  }

  const update = async (id: number | string, payload: any, options = { method: 'PUT' }) => {
    try {
      isLoading.value = true
      await useApiFetch(`/users/${id}`, {
        data: payload,
        ...options
      })
      $toast.success(`${entity} was updated successfully.`)
      
      await index({ include: includes.join(",") })
    } catch (error) {
      handleError(error, errors)
    } finally {
      isLoading.value = false
    }
  }

  const destroy = async (userId: number, options = { method: 'DELETE' }) => {
    try {
      isLoading.value = true
      selectedId.value = userId
      await useApiFetch(`/users/${userId}`, options)
      $toast.success(`${entity} was deleted successfully.`)
      await index({ include: includes.join(",") })
    } catch (error) {
      handleError(error, errors)
    } finally {
      isLoading.value = false
    }
  }

  const reset = () => {
    selected.value = { ...defaultModel }
    errors.value = {}
  }

  return {
    entries,
    isLoading,
    isSelected,
    selected,
    selectedId,
    meta,
    errors,
    includes,

    resolveUserStatusVariant: usersStore.resolveUserStatusVariant,
    resolveUserRoleVariant: usersStore.resolveUserRoleVariant,
    reset,
    index,
    update,
    destroy,
    store,
    get,
  }
})
