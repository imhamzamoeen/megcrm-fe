import useApiFetch from '@/composables/useApiFetch'
import { defaultPagination } from '@/constants/pagination'
import { useToast } from '@/plugins/toastr'
import { handleError, reshapeParams } from '@/utils/useHelper'
import { defineStore } from 'pinia'

export type LeadGenerator = {
  id: string | null | number
  name: string | null
  sender_id: string | null
  email: string | null
  phone_no: string | null
}

export const useLeadGeneratorsStore = defineStore('lead-generators', () => {
  const defaultModel = {
    id: null,
    name: null,
    sender_id: null,
    email: null,
    phone_no: null
  }

  const endPoint = '/lead-generators'
  const entity = 'Lead Generator'
  const selected = ref<LeadGenerator>(defaultModel)
  const isLoading = ref(false)
  const errors = ref({})
  const meta = ref(defaultPagination)
  const entries = ref([])
  const $toast: any = useToast()
  const include: any = ['createdBy']

  const isSelected = computed(() => !!selected.value.id)

  const fetchAll = async (options = {}) => {
    isLoading.value = true
    const { data, meta: serverMeta } = await useApiFetch(reshapeParams(endPoint, meta.value, options))
    entries.value = data.lead_generators
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
      await fetchAll({ include: include.join(',') })
    } catch (error) {
      handleError(error, errors)
    } finally {
      isLoading.value = false
      selected.value.id = null
    }
  }

  const resetState = () => {
    selected.value = { ...defaultModel }
    errors.value = {}
  }

  return {
    entries,
    isLoading,
    isSelected,
    selected,
    meta,
    errors,
    include,

    resetState,
    fetchAll,
    destroy,
    update,
    store,
  }
})
