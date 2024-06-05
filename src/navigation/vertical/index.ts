import type { VerticalNavItems } from '@/@layouts/types'
import Calendar from './calendar'
import Home from './home'
import JobManagement from './job-management'
import LeadManagement from './lead-management'
import Misc from './misc'
import UserManagement from './user-management'

export default [
  ...Home,
  ...Calendar,
  ...LeadManagement,
  ...JobManagement,
  ...Misc,
  ...UserManagement,
] as VerticalNavItems
