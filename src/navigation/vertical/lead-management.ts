import type { VerticalNavItems } from '@/@layouts/types'
import { modules } from '@/constants/modules'

const globalPermissions = [
  modules.LEADS + '.*',
]

export default [
  {
    heading: 'Lead Management',
    permissions: globalPermissions
  },
  {
    title: 'Leads',
    icon: { icon: 'mdi-star-check-outline' },
    permissions: globalPermissions,
    children: [
      {
        title: 'Create Lead', to: 'leads-create',
        permissions: [modules.LEADS + '.store'],
      },
      {
        title: 'Leads', to: 'leads',
        permissions: [modules.LEADS + '.index', modules.LEADS + '.assigned-leads'],
      },
      {
        title: 'Upload Leads', to: 'leads-upload',
        permissions: [modules.LEADS + '.file-upload'],
      },
      {
        title: 'All Boilers', to: 'boilers',
      }
    ]
  },
] as VerticalNavItems
