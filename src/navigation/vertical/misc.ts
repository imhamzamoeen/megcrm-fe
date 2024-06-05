import type { VerticalNavItems } from '@/@layouts/types'
import { modules } from '@/constants/modules'

const globalPermissions = [
  modules.BENEFIT_TYPES + '.*',
  modules.FUEL_TYPES + '.*',
  modules.JOB_TYPES + '.*',
  modules.MEASURES + '.*',
  modules.SURVEYORS + '.*',
  modules.LEAD_GENERATORS + '.*',
  modules.LEAD_SOURCES + '.*',
  modules.LEADS + '.*',
  modules.LEAD_STATUSES + '.*',
  modules.LEAD_GENERATOR_ASSIGNMENTS + '.*',
]

export default [
  {
    heading: 'MISCELLANEOUS',
    permissions: globalPermissions
  },
  {
    title: 'Extras',
    icon: { icon: 'mdi-plus-circle-outline' },
    permissions: globalPermissions,
    children: [
      {
        title: 'Job Types',
        to: 'job-types',
        permissions: [modules.JOB_TYPES + '.*'],
      },
      {
        title: 'Fuel Types',
        to: 'fuel-types',
        permissions: [modules.FUEL_TYPES + '.*'],
      },
      {
        title: 'Benefit Types',
        to: 'benefit-types',
        permissions: [modules.BENEFIT_TYPES + '.*'],
      },
      {
        title: 'Surveyors',
        to: 'surveyors',
        permissions: [modules.SURVEYORS + '.*'],
      },
      {
        title: 'Lead Generators',
        to: 'lead-generators',
        permissions: [modules.LEAD_GENERATORS + '.*'],
      },
      {
        title: 'Lead Sources',
        to: 'lead-sources',
        permissions: [modules.LEAD_SOURCES + '.*'],
      },
      {
        title: 'Measures',
        to: 'measures',
        permissions: [modules.MEASURES + '.*'],
      },
      {
        title: 'Installation Engineer Measures',
        to: 'installation-types',
        permissions: [modules.MEASURES + '.*'],
      },
      {
        title: 'Leads Statuses', to: 'leads-statuses',
        permissions: [modules.LEAD_STATUSES + '.*'],
      },
      {
        title: 'Assignments', to: 'leads-assignments',
        permissions: [modules.LEAD_GENERATOR_ASSIGNMENTS + '.*'],
      },
      {
        title: 'Data Match Upload', to: 'data-match-upload',
        permissions: [modules.LEADS + '.*'],
      },
      {
        title: 'Data Match Result Files', to: 'data-match-files',
        permissions: [modules.LEADS + '.*'],
      },
    ]
  },
] as VerticalNavItems
