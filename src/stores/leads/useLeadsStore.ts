import { Comment } from '@/components/leads/LeadsTable.vue'
import useApiFetch from '@/composables/useApiFetch'
import { defaultPagination } from '@/constants/pagination'
import { useToast } from '@/plugins/toastr'
import { LeadStatus } from '@/stores/leads/useLeadStatusesStore'
import { getExceptionMessage, handleError, renameFile, reshapeParams, setQueryParams } from '@/utils/useHelper'
// @ts-ignore
import { omit } from 'lodash'
import { defineStore } from 'pinia'

type BenefitType = {
  name: string
}

type FuelType = {
  name: string
}

type JobType = {
  name: string
}

type LeadGenerator = {
  name: string
}

type LeadSource = {
  name: string
}

type Measure = {
  name: string
}

type Surveyor = {
  name: string
}

type Installer = {
  name: string
}

type InstallationType = {
  name: string
}

type Bank = {
  name: string
}

export const useLeadsStore = defineStore('leads', () => {
  const endPoint = '/leads'
  const leads = ref([])
  const selectedLead = ref<any>({
    tracking_link: null,
    benefits: [],
    cell_centers: [],
    submission_documents: []
  })
  const selectedLeadCopy = ref();
  const selectedId = ref<null | string | number>(null)
  const isLoading = ref(false)
  const meta = ref(defaultPagination)
  const $toast: any = useToast()
  const benefitTypes: Ref<BenefitType[]> = ref([])
  const fuelTypes: Ref<FuelType[]> = ref([])
  const jobTypes: Ref<JobType[]> = ref([])
  const leadGenerators: Ref<LeadGenerator[]> = ref([])
  const leadSources: Ref<LeadSource[]> = ref([])
  const measures: Ref<Measure[]> = ref([])
  const surveyors: Ref<Surveyor[]> = ref([])
  const leadStatuses: Ref<LeadStatus[]> = ref([])
  const leadTableStatuses: Ref<LeadStatus[]> = ref([])
  const leadJobTableStatuses: Ref<LeadStatus[]> = ref([])
  const installers: Ref<Installer[]> = ref([])
  const installation_types: Ref<InstallationType[]> = ref([])
  const isStatusChanged: Ref<Boolean> = ref(false)
  const banks: Ref<Bank[]> = ref([])
  const csrs = ref([])
  const sms_templates = ref([])
  const errors = ref({})
  const includes = [
    "leadGenerator",
    "statuses",
    "leadCustomerAdditionalDetail",
    "benefits",
    "measures",
    "callCenters.callCenterStatus",
    "callCenters.createdBy",
    "surveyBooking",
    "installationBookings",
    "comments.commentator",
    "leadAdditional",
    "secondReceipent",
    "submission",
    "notifications"
  ];
  const router = useRouter()

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

  const getExtras = async (force = false) => {
    if (leadStatuses.value.length === 0 || force) {
      isLoading.value = true
      const { data } = await useApiFetch('/lead-extras')
      measures.value = data?.measures ?? []
      jobTypes.value = data?.job_types ?? []
      fuelTypes.value = data?.fuel_types ?? []
      benefitTypes.value = data?.benefit_types ?? []
      surveyors.value = data?.surveyors ?? []
      leadGenerators.value = data?.lead_generators ?? []
      leadSources.value = data?.lead_sources ?? []
      leadStatuses.value = data?.lead_statuses ?? []
      leadTableStatuses.value = data?.lead_table_filters ?? []
      leadJobTableStatuses.value = data?.lead_jobs_filters ?? []
      installers.value = data?.installers ?? []
      installation_types.value = data?.installation_types ?? []
      banks.value = data?.banks ?? []
      csrs.value = data?.csrs ?? []
      sms_templates.value = data?.sms_templates?.map((t: any) => ({ ...t, body_copy: t.body, model: t.properties.map((p: any) => { return { p: null } }) })) ?? []
      isLoading.value = false
    }
  }

  const storeLead = async (payload: any, options: any = { method: 'POST' }, showAlert: boolean = true) => {
    try {
      errors.value = {}
      isLoading.value = true
      const { data } = await useApiFetch('/leads', {
        data: payload,
        ...options,
      })
      $toast.success('Lead was saved successfully.')
      router.push({ name: "leads-edit-id-tab", params: { id: data.lead.id, tab: 'customer-details' } });
      errors.value = {}
    } catch (error: any) {
      if (error?.response?.status === 422) {
        errors.value = error?.response?.data?.errors
      }

      if (showAlert) {
        $toast.error(getExceptionMessage(error))
      }
    } finally {
      isLoading.value = false
    }
  }

  const deleteLead = async (leadId: number, options = { method: 'DELETE' }) => {
    try {
      isLoading.value = true
      selectedId.value = leadId
      await useApiFetch(`${endPoint}/${leadId}`, options)
      $toast.success('Lead was deleted successfully.')
      await fetchLeads({ include: "leadGenerator" })
    } catch (error) {
      $toast.error(getExceptionMessage(error))
    } finally {
      isLoading.value = false
      selectedId.value = null
    }
  }

  const fetchLead = async (leadId: number, options = {}) => {
    try {
      isLoading.value = true
      const { data } = await useApiFetch(`${endPoint}/${leadId}?${setQueryParams(options)}`)
      selectedLead.value = data.lead
      const date = new Date(selectedLead.value.dob);  // checking that its a coorect date or not 
      // Check if the created Date object is valid and if the dateString matches the expected format because we will not let it submit for datamatch if dob is not correct
      selectedLead.value.dob = date instanceof Date && !isNaN(date) ? date : null;

      let installations: any = [];

      data.lead.measures.forEach((measure: any) => {
        const entry = data.lead.installation_bookings.find((installationBooking: any) => installationBooking.measure_id === measure.id)

        installations.push({
          installer_id: entry?.installer_id ?? null,
          installation_at: entry?.installation_at ?? null,
          measure_id: entry?.measure_id ?? measure.id,
          name: entry?.name ?? measure.name,
          comments: entry?.comments ?? null,
        })
      })

      selectedLead.value.installation_bookings = installations

      if (selectedLead.value.survey_booking === null) {
        selectedLead.value.survey_booking = {
          surveyor_id: null,
          survey_at: null,
          survey_to: null,
          preffered_time: null,
          comments: null,
          is_sms_alert_enabled: false,
        }
      }

      if (selectedLead.value.lead_additional === null) {
        selectedLead.value.lead_additional = {
          datamatch_confirmed: false,
          land_registry_confirmed: false,
          proof_of_address_confirmed: false,
          epr_report_confirmed: false,
          is_pre_checking_confirmed: false,
          gas_connection_before_april_2022: false
        }
      }

      if (selectedLead.value.second_receipent === null) {
        selectedLead.value.second_receipent = {
          first_name: null,
          middle_name: null,
          last_name: null,
          dob: null,
        }
      }

      if (selectedLead.value.submission === null) {
        selectedLead.value.submission = {
          area: null,
          pre_rating: null,
          post_rating: null
        }
      }

      selectedLead.value.benefits = data.lead?.benefits.map((i: any) => i.id)
      selectedLead.value.measures = data.lead?.measures.map((i: any) => i.id)
      selectedLeadCopy.value = JSON.parse(JSON.stringify(selectedLead.value))
    } catch (error) {
      $toast.error(getExceptionMessage(error))
    } finally {
      isLoading.value = false
    }
  }

  const updateStatus = async (payload: Comment, options = { method: 'POST' }) => {
    try {
      isLoading.value = true
      await useApiFetch(`/lead-status/${payload.leadId}`, {
        data: payload,
        ...options
      })
      $toast.success('Lead status was updated successfully.')
    } catch (error) {
      handleError(error, errors)
    } finally {
      isLoading.value = false
    }
  }

  const update = async (options = { method: 'PUT' }) => {
    try {
      isLoading.value = true

      await useApiFetch(`/leads/${selectedLead.value.id}`, {
        data: omit(selectedLead.value, [
          'logs', 'status_details', 'statuses', 'lead_generator', 'call_centers'
        ]),
        ...options
      })

      $toast.success('Lead was updated successfully.')
      errors.value = {}
    } catch (error) {
      handleError(error, errors)
    } finally {
      isLoading.value = false
    }
  }

  const checkIfCountryIsScotland = (n: string): boolean | null => {
    if (n === null) {
      return false;
    }

    const countryRegex = /--\s*(\w+(?:\s*\w+)*)/;
    const match = n.match(countryRegex);

    return match && match[1].toUpperCase() === "SCOTLAND";
  }

  const storeComments = async (leadId: number, options = {}) => {
    try {
      isLoading.value = true
      await useApiFetch(`${endPoint}/${leadId}/comments`, {
        method: 'POST',
        ...options
      })
      $toast.success('Lead comments were saved successfully.')
    } catch (error) {
      handleError(error, errors)
    } finally {
      isLoading.value = false
    }
  }

  const showEditButton = computed(() => {
    const copy = JSON.stringify(selectedLeadCopy.value)
    const changed = JSON.stringify(selectedLead.value)
    const copyParsed = JSON.parse(copy)
    const changedParsed = JSON.parse(changed)

    isStatusChanged.value = copyParsed?.status_details?.name !== changedParsed?.status_details?.name
    return copy !== changed
  })

  const sendSms = async (leadId: string, payload: { body: string | null }, options = { method: 'POST' }) => {
    try {
      isLoading.value = true

      await useApiFetch(`/send-sms/${leadId}`, {
        data: payload,
        ...options
      })

      $toast.success('SMS was sent successfully.')
    } catch (error) {
      handleError(error, errors)
    } finally {
      isLoading.value = false
    }
  }

  const sendDocsUploadLink = async (leadId: string, options = { method: 'GET' }) => {
    try {
      isLoading.value = true

      const { data } = await useApiFetch(`/send-sms/${leadId}/tracking-link`)

      const lead: any = leads.value.find((i: any) => i.id === leadId)

      if (lead) {
        lead.tracking_link = data.link;
      }
      $toast.success('SMS was sent successfully.')
    } catch (error) {
      handleError(error, errors)
    } finally {
      isLoading.value = false
    }
  }

  const saveDocumentToCollection = async (id: number, collection: string, file: File, fileName: string | null, options = { method: 'POST' }) => {
    try {
      if (fileName) {
        file = renameFile(file, fileName)
      }

      let formData = new FormData()

      formData.set('file', file)
      formData.set('collection', collection)

      await useApiFetch(`${endPoint}/${id}/collections/docs/upload`, {
        data: formData,
        ...options
      })

      $toast.success(`File was uploaded successfully.`)
    } catch (error) {
      handleError(error, errors)
    }
  }

  const getNameOfSurveyBookers = (item: any) => {
    return item.raw?.status_details?.survey_booked?.user?.name ?? "Not booked";
  };

  const getCommentsOfSurveyBooker = (item: any) => {
    return item.raw?.status_details?.survey_booked?.reason ?? "Not booked";
  };

  const getColorOfSurveyBookers = (name: string) => {
    if (name.toLowerCase().startsWith("samiya")) {
      return "#FF0000";
    }

    if (name.toLowerCase().startsWith("amna")) {
      return "#E4A11B";
    }


    if (name.toLowerCase().startsWith("hajar")) {
      return "#14A44D";
    }

    return "secondary";
  };

  const getBadgeColorsForExtraColumns = (str: any) => {
    if (!str) {
      return 'secondary';
    }

    if (str.toLowerCase().startsWith('no')) {
      return '#ff0000';
    }

    if (str.toLowerCase().startsWith('ye')) {
      return '#14A44D';
    }

    return '#E4A11B';
  }

  const getExpandedColumnLength = (columns: any, divide = 3): number => {
    return columns.length % divide === 0
      ? columns.length / divide
      : columns.length / divide + 1;
  };

  return {
    sms_templates,
    csrs,
    banks,
    installation_types,
    installers,
    leadTableStatuses,
    leadStatuses,
    leadJobTableStatuses,
    jobTypes,
    fuelTypes,
    leadGenerators,
    leadSources,
    benefitTypes,
    surveyors,
    measures,
    leads,
    isLoading,
    isLeadSelected,
    selectedLead,
    selectedId,
    errors,
    meta,
    includes,
    showEditButton,
    isStatusChanged,

    sendDocsUploadLink,
    getExpandedColumnLength,
    saveDocumentToCollection,
    getColorOfSurveyBookers,
    getNameOfSurveyBookers,
    getBadgeColorsForExtraColumns,
    getCommentsOfSurveyBooker,
    storeComments,
    checkIfCountryIsScotland,
    updateStatus,
    update,
    fetchLeads,
    fetchLead,
    storeLead,
    deleteLead,
    getExtras,
    sendSms
  }
})
