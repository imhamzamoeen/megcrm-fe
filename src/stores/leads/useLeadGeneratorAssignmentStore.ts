import useApiFetch from '@/composables/useApiFetch'
import { defaultPagination } from '@/constants/pagination'
import { roles } from '@/constants/rolesAndPermissions'
import { useToast } from '@/plugins/toastr'
import { EventBus } from '@/utils/useEventBus'
import { handleError, reshapeParams } from '@/utils/useHelper'
import { defineStore } from 'pinia'

export type LeadAssignment = {
  id: string | null | number
  lead_generator_assignments: any,
  user_id: string | null | number
}

export const useLeadGeneratorAssignmentStore = defineStore('lead-generator-assignments', () => {
  const defaultModel = {
    id: null,
    lead_generator_assignments: [],
    user_id: null
  }

  const endPoint = '/lead-generator-assignments'
  const usersEndPoint = '/users'
  const entity = 'Lead Generator Assignment'
  const selected = ref<LeadAssignment>(defaultModel)
  const isLoading = ref(false)
  const errors: any = ref({})
  const meta = ref(defaultPagination)
  const entries = ref([])
  const $toast: any = useToast()
  const includes = ["createdBy", "user", "leadGenerator"]
  const userIncludes = ["createdBy", "leadGeneratorAssignments"]
  const userFilters = {
    roles_except: [roles.SUPER_ADMIN]
  }

  const isSelected = computed(() => !!selected.value.id)

  const fetchAll = async (options = {}) => {
    isLoading.value = true
    const { data, meta: serverMeta } = await useApiFetch(reshapeParams(endPoint, meta.value, options))
    entries.value = data.lead_assignments
    meta.value = {
      filters: meta.value?.filters ?? {},
      ...serverMeta
    }
    isLoading.value = false
  }

  const fetchAllByUser = async (options = {}) => {
    isLoading.value = true
    const { data, meta: serverMeta } = await useApiFetch(reshapeParams(usersEndPoint, meta.value, options))
    entries.value = data.users
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
      EventBus.$emit('hide-dialog')
      EventBus.$emit('refresh-table')
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
      EventBus.$emit('reset-name-only-dialog')
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
      await fetchAll({ include: "createdBy" })
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
    meta,
    errors,
    includes,
    userIncludes,
    userFilters,

    fetchAllByUser,
    resetState,
    fetchAll,
    destroy,
    update,
    store,
  }
})
