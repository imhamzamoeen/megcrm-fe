import useApiFetch from '@/composables/useApiFetch'
import { defaultPagination } from '@/constants/pagination'
import { useToast } from '@/plugins/toastr'
import { EventBus } from '@/utils/useEventBus'
import { handleError, reshapeParams } from '@/utils/useHelper'
import { defineStore } from 'pinia'

export const useDatamatchFilesStore = defineStore('lead-datamatch-files', () => {

  const endPoint = '/leads-datamatch-files'
  const downloadEndPoint = '/file-download'
  const entity = 'Datamatch Files'
  const isLoading = ref(false)
  const errors = ref({})
  const meta = ref(defaultPagination)
  const entries = ref([])
  const $toast: any = useToast()

  const index = async (options = {}) => {
    isLoading.value = true
    const { data, meta: serverMeta } = await useApiFetch(reshapeParams(endPoint, meta.value, options))
    entries.value = data.data_match_files
    meta.value = {
      filters: meta.value?.filters ?? {},
      ...serverMeta
    }
    isLoading.value = false
  }



  return {
    entries,
    isLoading,
    meta,
    errors,

    index,
  }
})
