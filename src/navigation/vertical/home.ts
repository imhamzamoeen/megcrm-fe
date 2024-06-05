import type { VerticalNavItems } from '@/@layouts/types'

export default [
  {
    heading: 'Dashboard',
  },
  {
    title: 'Home',
    to: { name: 'dashboard' },
    icon: { icon: 'mdi-home-outline' },
    badgeContent: '1',
    badgeClass: 'bg-primary',
  },
  {
    title: 'Profile',
    to: { name: 'profile' },
    icon: { icon: 'mdi-account-outline' },
  },
] as VerticalNavItems
