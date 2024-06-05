import { VerticalNavItems } from '@/@layouts/types'
import { modules } from '@/constants/modules'

const globalPermissions = [
  modules.LEAD_JOBS + '.*',
]

export default [
  {
    heading: 'Job Management',
    permissions: globalPermissions
  },
  {
    title: 'Jobs',
    icon: { icon: 'mdi-stairs-up' },
    permissions: globalPermissions,
    children: [
      {
        title: 'All Jobs', to: 'jobs',
        permissions: [modules.LEAD_JOBS + '.index', modules.LEADS + '.assigned-leads'],
      },
      {
        title: 'Survey Done', to: 'jobs-survey-done',
        permissions: [modules.LEAD_JOBS + '.index', modules.LEADS + '.assigned-leads'],
      },
      {
        title: 'Survey Booked', to: 'jobs-survey-booked',
        permissions: [modules.LEAD_JOBS + '.index', modules.LEADS + '.assigned-leads'],
      },
      {
        title: 'Survey Pending (Resch)', to: 'jobs-survey-pending',
        permissions: [modules.LEAD_JOBS + '.index', modules.LEADS + '.assigned-leads'],
      },
      {
        title: 'Cancelled Leads', to: 'jobs-cancelled-leads',
        permissions: [modules.LEAD_JOBS + '.index', modules.LEADS + '.assigned-leads'],
      },
      {
        title: 'Cancelled Jobs', to: 'jobs-cancelled-jobs',
        permissions: [modules.LEAD_JOBS + '.index', modules.LEADS + '.assigned-leads'],
      },
      {
        title: 'Cancelled Surveys', to: 'jobs-cancelled-surveys',
        permissions: [modules.LEAD_JOBS + '.index', modules.LEADS + '.assigned-leads'],
      }
    ]
  },
] as VerticalNavItems
