import useApiFetch from '@/composables/useApiFetch'
import { defaultPagination } from '@/constants/pagination'
import { useToast } from '@/plugins/toastr'
import { useAuthStore } from '@/stores/auth/useAuthStore'
import { EventBus } from '@/utils/useEventBus'
import { getExceptionMessage, handleError, setQueryParams } from '@/utils/useHelper'
import { defineStore } from 'pinia'

export type CallCenter = {
  id: string | null | number
  called_at: string | null
  call_center_status_id: string | null
  comments: string | null
}

export const useCallCentersStore = defineStore('call-centers', () => {
  const defaultModel = {
    id: null,
    called_at: null,
    call_center_status_id: null,
    comments: null
  }

  const endPoint = '/call-center'
  const entity = 'Call Center Record'
  const selected = ref<CallCenter>(defaultModel)
  const isLoading = ref(false)
  const errors = ref({})
  const meta = ref(defaultPagination)
  const entries = ref([])
  const $toast: any = useToast()
  const callCenterStatuses = ref([])
  const auth = useAuthStore()

  const isSelected = computed(() => !!selected.value.id)

  const fetchCallCenterStatuses = async (force = false) => {
    if (callCenterStatuses.value.length === 0 || force) {
      isLoading.value = true
      const { data } = await useApiFetch('/call-center-statuses', {
        params: {
          all: true
        }
      })
      callCenterStatuses.value = data?.call_center_statuses ?? []
      isLoading.value = false
    }
  }

  const fetchDetails = async (callCenterId: number, options = {}) => {
    try {
      isLoading.value = true
      const { data } = await useApiFetch(`${endPoint}/${callCenterId}?${setQueryParams(options)}`)
      selected.value = data.lead
    } catch (error) {
      $toast.error(getExceptionMessage(error))
    } finally {
      isLoading.value = false
    }
  }

  const store = async (payload: any, options: any = { method: 'POST' }) => {
    try {
      isLoading.value = true
      await useApiFetch(endPoint, {
        data: payload,
        ...options,
      })
      setTimeout(async () => await auth.fetchUser(), 10000)
      EventBus.$emit('hide-dialog')
      EventBus.$emit('refresh-lead-data')
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
      await useApiFetch(`${endPoint}/${id}`, {
        data: payload,
        ...options
      })
      $toast.success(`${entity} was updated successfully.`)
    } catch (error) {
      handleError(error, errors)
    } finally {
      isLoading.value = false
    }
  }

  const destroy = async (id: number, options = { method: 'DELETE' }) => {
    try {
      isLoading.value = true
      selected.value.id = id
      await useApiFetch(`${endPoint}/${id}`, options)
      $toast.success(`${entity} was deleted successfully.`)
    } catch (error) {
      handleError(error, errors)
    } finally {
      isLoading.value = false
      selected.value.id = null
    }
  }

  const resetState = () => {
    selected.value = defaultModel
  }

  return {
    entries,
    isLoading,
    isSelected,
    selected,
    callCenterStatuses,
    meta,
    errors,

    fetchCallCenterStatuses,
    resetState,
    fetchDetails,
    destroy,
    update,
    store,
  }
})
