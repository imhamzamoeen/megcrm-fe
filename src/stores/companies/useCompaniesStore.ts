import useApiFetch from '@/composables/useApiFetch'
import { defaultPagination } from '@/constants/pagination'
import { useToast } from '@/plugins/toastr'
import { handleError, renameFile, reshapeParams } from '@/utils/useHelper'
import { defineStore } from 'pinia'

export type Company = {
    id: string | null | number
    name: string | null
}

export const useCompaniesStore = defineStore('companies', () => {
    const defaultModel = {
        id: null,
        name: null,
        address: null,
        number: null,
        vat_number: null,
        account_number: null,
        sort_code: null,
        policy_reference: null,
        public_liability_number: null,
        documents: []
    }

    const endPoint = '/companies'
    const entity = 'Company'
    const selected = ref(defaultModel)
    const isLoading = ref(false)
    const isUpdating = ref(false)
    const errors = ref({})
    const meta = ref(defaultPagination)
    const entries = ref([])
    const $toast: any = useToast()

    const isSelected = computed(() => !!selected.value.id)

    const index = async (options = {}) => {
        isLoading.value = true
        const { data, meta: serverMeta } = await useApiFetch(reshapeParams(endPoint, meta.value, options))
        entries.value = data.companies
        meta.value = {
            filters: meta.value?.filters ?? {},
            ...serverMeta
        }
        isLoading.value = false
    }

    const get = async (id: Number, isEdit: any = false) => {
        isLoading.value = !isEdit

        const { data } = await useApiFetch(`${endPoint}/${id}`)

        selected.value = data.company;
        isLoading.value = false
    }

    const store = async (payload: any, options: any = { method: 'POST' }) => {
        try {
            isLoading.value = true
            const { data: { company } } = await useApiFetch(endPoint, {
                data: payload,
                ...options,
            })
            $toast.success(`${entity} was saved successfully.`)
            return company;
        } catch (error) {
            handleError(error, errors)
        } finally {
            isLoading.value = false
        }
    }

    const update = async (id: number | string, payload: any, options = { method: 'PUT' }) => {
        try {
            isUpdating.value = true
            await useApiFetch(`${endPoint}/${id}`, {
                data: payload,
                ...options
            })
            $toast.success(`${entity} was updated successfully.`)
        } catch (error) {
            handleError(error, errors)
        } finally {
            isUpdating.value = false
        }
    }

    const destroy = async (id: number, options = { method: 'DELETE' }) => {
        try {
            isLoading.value = true
            await useApiFetch(`${endPoint}/${id}`, options)
            $toast.success(`${entity} was deleted successfully.`)
            await index({ include: "createdBy" })
        } catch (error) {
            handleError(error, errors)
        } finally {
            isLoading.value = false
            selected.value.id = null
        }
    }

    const saveDocumentToCollection = async (id: number, collection: string, file: File, fileName: string | null, expiry: string | null, options = { method: 'POST' }) => {
        try {
            if (fileName) {
                file = renameFile(file, fileName)
            }

            let formData = new FormData()

            formData.set('file', file)
            formData.set('collection', collection)

            if (expiry) {
                formData.set('expiry', expiry)
            }

            await useApiFetch(`${endPoint}/${id}/collections/docs/upload`, {
                data: formData,
                ...options
            })

            $toast.success(`File was uploaded successfully.`)
        } catch (error) {
            handleError(error, errors)
        }
    }

    const updateExpiryDate = async (mediaId: number, expiry: string | null, options = { method: 'POST' }) => {
        try {
            await useApiFetch(`${endPoint}/${mediaId}/expiry/update`, {
                data: { expiry },
                ...options
            })

            $toast.success(`Expiry date was updated successfully.`)
        } catch (error) {
            handleError(error, errors)
        }
    }


    const reset = () => {
        selected.value = defaultModel
    }

    return {
        entries,
        isLoading,
        isUpdating,
        isSelected,
        selected,
        meta,
        errors,

        updateExpiryDate,
        saveDocumentToCollection,
        reset,
        index,
        get,
        destroy,
        update,
        store,
    }
})
