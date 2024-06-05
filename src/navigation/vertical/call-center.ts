import type { VerticalNavItems } from '@/@layouts/types'
import { modules } from '@/constants/modules'

export default [
  {
    heading: 'Call Center',
    permissions: [
      modules.CALL_CENTER + '.*',
    ]
  },
  {
    title: 'Calls',
    to: { name: 'call-center' },
    icon: { icon: 'mdi-headset' },
    badgeContent: '1',
    badgeClass: 'bg-primary',
  },
] as VerticalNavItems
