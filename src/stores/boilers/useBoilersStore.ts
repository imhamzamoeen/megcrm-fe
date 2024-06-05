import { defaultPagination } from '@/constants/pagination'
import { reshapeParams } from '@/utils/useHelper'
import axios from 'axios'
import { defineStore } from 'pinia'

export type BenefitType = {
  id: string | null | number
  name: string | null
}

export const useBoilersStore = defineStore('boilers', () => {
  const baseUrl = 'https://boilers.megcrm.co.uk'
  const manufactures = ref([])
  const isLoading = ref(false)
  const meta = ref(defaultPagination)
  const entries = ref([])

  const fetchManufacturers = async (options = {}) => {
    isLoading.value = true
    const { data } = await axios.get(`${baseUrl}/api/get-manufacturer`)
    manufactures.value = data.data
    isLoading.value = false
  }

  const fetchAll = async (options = {}) => {
    // ?condensing=false&manufacturer[0]=Hepworth Heating&per_page&specific_columns[0]=*&page=1
    isLoading.value = true
    const { data } = await axios.get(reshapeParams(`${baseUrl}/api/getData`, meta.value, {}))
    entries.value = data?.data?.data ?? []
    meta.value = {
      current_page: data.data.current_page,
      current: data.data.current_page,
      per_page: data.data.per_page,
      total: data.data.total,
      search: '',
      language: 'en',
      sort: {},
      filters: []
    }
    isLoading.value = false
  }

  return {
    entries,
    manufactures,
    isLoading,
    meta,

    fetchAll,
    fetchManufacturers,
  }
})
