import useApiFetch from '@/composables/useApiFetch'
import { defaultPagination } from '@/constants/pagination'
import { reshapeParams } from '@/utils/useHelper'
import { defineStore } from 'pinia'

type Measure = {
  name: string
}

type Surveyor = {
  name: string
}

export const useLeadJobsStore = defineStore('lead-jobs', () => {
  const endPoint = '/lead-jobs'
  const leads = ref([])
  const selectedLead = ref<any>({
    benefits: [],
    cell_centers: []
  })
  const selectedId = ref<null | string | number>(null)
  const isLoading = ref(false)
  const meta = ref(defaultPagination)
  const measures: Ref<Measure[]> = ref([])
  const surveyors: Ref<Surveyor[]> = ref([])
  const errors = ref({})

  const isLeadSelected = computed(() => !!selectedLead.value?.id)

  const fetchLeads = async (options = {}) => {
    isLoading.value = true
    const { data, meta: serverMeta } = await useApiFetch(reshapeParams(endPoint, meta.value, options))
    leads.value = data.leads
    meta.value = {
      filters: meta.value?.filters ?? {},
      ...serverMeta
    }
    isLoading.value = false
  }

  return {
    surveyors,
    measures,
    leads,
    isLoading,
    isLeadSelected,
    selectedLead,
    selectedId,
    errors,
    meta,

    fetchLeads,
  }
})
