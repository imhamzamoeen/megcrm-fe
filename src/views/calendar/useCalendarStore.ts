import useApiFetch from '@/composables/useApiFetch'
import { defaultPagination } from '@/constants/pagination'
import { reshapeParams } from '@/utils/useHelper'
import axios from 'axios'
import { Event, NewEvent } from './types'

export type Calendar = {
  id: number
  name: string
  color: string
}

export const useCalendarStore = defineStore('calendar', () => {
  const isLoading = ref(false)
  const meta = ref(defaultPagination)
  const endPointCalendar = '/calendars'
  const availableCalendars = ref([]);
  const selectedCalendars: any = ref([])

  const fetchCalendars = async (options = {
    all: true
  }) => {
    isLoading.value = true
    const { data, meta: serverMeta } = await useApiFetch(reshapeParams(endPointCalendar, meta.value, options))
    availableCalendars.value = data.calendars
    meta.value = {
      filters: meta.value?.filters ?? {},
      ...serverMeta
    }
    isLoading.value = false
  }

  const fetchEvents = async () => {
    return useApiFetch('/calendar-events', {
      params:
      {
        "filter[calendars]": selectedCalendars.value.join(','),
        include: ['calendar'].join(','),
        all: true
      }
    })
  }

  const addEvent = async (event: NewEvent) => {
    return axios.post('/calendar/events', { event })
  }

  const updateEvent = async (event: Event) => {
    return axios.post(`/calendar/events/${event.id}`, { event })
  }

  const removeEvent = async (eventId: string) => {
    return axios.delete(`/calendar/events/${eventId}`)
  }

  return {
    availableCalendars,
    selectedCalendars,

    fetchCalendars,
    fetchEvents,
    addEvent,
    updateEvent,
    removeEvent
  }
})
