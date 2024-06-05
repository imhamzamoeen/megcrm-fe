import useApiFetch from '@/composables/useApiFetch'
import { defaultPagination } from '@/constants/pagination'
import { useToast } from '@/plugins/toastr'
import { EventBus } from '@/utils/useEventBus'
import { handleError, reshapeParams } from '@/utils/useHelper'
import { defineStore } from 'pinia'

export type LeadStatus = {
  name: string | null
  color: string | null
}

export const useLeadStatusesStore = defineStore('leads-statuses', () => {
  const endPoint = '/lead-statuses'
  const selectedLeadStatus = ref<any>(null)
  const isLoading = ref(false)
  const errors = ref({})
  const meta = ref(defaultPagination)
  const $toast: any = useToast()
  const leadStatuses: Ref<LeadStatus[]> = ref([])

  const isLeadStatusSelected = computed(() => !!selectedLeadStatus.value)

  const fetchAll = async (options = {}) => {
    isLoading.value = true
    const { data, meta: serverMeta } = await useApiFetch(reshapeParams(endPoint, meta.value, options))
    leadStatuses.value = data.lead_statuses
    meta.value = {
      filters: meta.value?.filters ?? {},
      ...serverMeta
    }
    isLoading.value = false
  }

  const store = async (payload: any, options: any = { method: 'POST' }) => {
    try {
      isLoading.value = true
      await useApiFetch(endPoint, {
        data: payload,
        ...options,
      })
      await fetchAll()
      $toast.success('Lead status was saved successfully.')
      EventBus.$emit('hide-lead-status-dialog')
    } catch (error) {
      handleError(error, errors)
    } finally {
      isLoading.value = false
    }
  }

  const update = async (id: number, payload: any, options = { method: 'PUT' }) => {
    try {
      isLoading.value = true
      await useApiFetch(`${endPoint}/${id}`, {
        data: payload,
        ...options
      })
      EventBus.$emit('hide-lead-status-dialog')
      $toast.success('Lead status was updated successfully.')
      await fetchAll()
    } catch (error) {
      handleError(error, errors)
    } finally {
      isLoading.value = false
    }
  }

  const destroy = async (id: number, options = { method: 'DELETE' }) => {
    try {
      isLoading.value = true
      await useApiFetch(`${endPoint}/${id}`, options)
      $toast.success('Lead status was deleted successfully.')
      await fetchAll()
    } catch (error) {
      handleError(error, errors)
    } finally {
      isLoading.value = false
    }
  }

  return {
    leadStatuses,
    isLoading,
    isLeadStatusSelected,
    selectedLeadStatus,
    meta,

    fetchAll,
    destroy,
    update,
    store,
  }
})
