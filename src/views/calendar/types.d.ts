import { CalendarEvent } from '@/@fake-db/types';
import type { Except } from 'type-fest';

export interface Event extends CalendarEvent {
  id: number
  start_date: string
  end_date: string
  all_day: boolean
  description: string
}

export type NewEvent = Except<Event, 'id'>
