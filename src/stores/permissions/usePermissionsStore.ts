import useApiFetch from '@/composables/useApiFetch';
import { roles as roleConstants } from '@/constants/rolesAndPermissions';
import { useToast } from '@/plugins/toastr';
import { getExceptionMessage, reshapeParams } from '@/utils/useHelper';
import { defineStore } from 'pinia';

type RoleData = {
  name: string
  permissions: number[]
}

export const usePermissionsStore = defineStore('permissions', () => {
  const rolesEndpoint = '/roles'
  const permissionsEndpoint = '/permissions'
  const roles = ref([])
  const permissions = ref([])
  const selectedRole = ref<any>({
    permissions: []
  })
  const isLoading = ref(false)
  const $toast: any = useToast()
  const userPermissions: any = ref([])
  const userRoles: any = ref([])

  const isSuperAdmin = computed(() => !!userRoles.value.includes(roleConstants.SUPER_ADMIN))
  const isSurveyorOnly = computed(() => (!!(userRoles.value.length === 1) && (userRoles.value.includes(roleConstants.SURVEYOR))))

  const isRoleSelected = computed(() => !!selectedRole.value)

  const getUserPermissions = async () => {
    const { data: permissionsData } = await useApiFetch('/get-permissions')
    userRoles.value = permissionsData.roles
    userPermissions.value = permissionsData.permissions
  }

  const can = (permissionsToCheck: any) => {
    //! SUPER ADMIN HAS FULL ACCESS
    if (isSuperAdmin.value) {
      return true
    }

    return permissionsToCheck.some((permission: string) => {
      if (permission.includes('*')) {
        const prefix = permission.split('.')[0];
        return userPermissions.value.some((userPermission: string) => userPermission.startsWith(prefix));
      } else {
        return userPermissions.value.includes(permission);
      }
    });
  }


  const is = (role: string) => userRoles.value.includes(role)

  const getPermissions = async (options: any = { all: true }) => {
    isLoading.value = true
    const { data } = await useApiFetch(reshapeParams(permissionsEndpoint, null, options))
    permissions.value = data.permissions
    isLoading.value = false
  }

  const getRoles = async (options: any = { all: true }) => {
    if (roles.value.length < 1) {
      isLoading.value = true
      const { data } = await useApiFetch(reshapeParams(rolesEndpoint, null, options))
      roles.value = data.roles.map((i: any) => {
        return {
          ...i,
          name_formatted: i.name.replace("_", " ").toUpperCase()
        }
      })

      roles.value.forEach((role: any) => {
        role.meta = getCountTotalPermissionsCountFromRole(role.name)
      })

      isLoading.value = false
    }
  }

  const storeRole = async (roleData: RoleData, options: any = { method: 'POST' }) => {
    try {
      isLoading.value = true
      await useApiFetch('/roles', {
        data: roleData,
        ...options,
      })
      await getRoles({ include: "permissions" })
      $toast.success('Role was saved successfully.')
    } catch (error) {
      $toast.error(getExceptionMessage(error))
    } finally {
      isLoading.value = false
    }
  }

  const updateRole = async (roleData: RoleData, options: any = { method: 'PUT' }) => {
    try {
      isLoading.value = true
      await useApiFetch(`/roles/${selectedRole.value.id}`, {
        data: roleData,
        ...options,
      })
      await getRoles({ include: "permissions" })
      $toast.success('Role was updated successfully.')
    } catch (error) {
      $toast.error(getExceptionMessage(error))
    } finally {
      isLoading.value = false
    }
  }

  const deleteRole = async (roleId: number, options: any = { method: 'DELETE' }) => {
    try {
      isLoading.value = true
      await useApiFetch(`/roles/${roleId}`, options)
      $toast.success('Role was deleted successfully.')
      await getRoles({ include: "permissions" })
    } catch (error) {
      $toast.error(getExceptionMessage(error))
    } finally {
      isLoading.value = false
    }
  }

  const getCountTotalPermissionsCountFromRole = (roleName: string) => {
    const role: any = roles.value.find((role: any) => role.name === roleName)

    if (!role) {
      return {
        totalPermissions: 0,
        moduleCount: 0,
      }
    }

    const moduleCount = role.formatted_permissions.length
    let submoduleCount = 0

    for (const module of role.formatted_permissions) {
      submoduleCount += module.submodules.length
    }

    return {
      totalPermissions: submoduleCount,
      moduleCount: moduleCount,
    }
  }

  const getRoleNameFromId = (id: number) => {
    return roles.value.find((i: any) => i.id === id);
  }

  const hasRole = (rolesArray: any = [], name: string) => {
    const localRole: any = roles.value.find((i: any) => i.name === name);

    return rolesArray.includes(localRole.id)
  }

  const $reset = () => {
    roles.value = []
    permissions.value = []
    selectedRole.value = { permissions: [] }
    isLoading.value = false
    userPermissions.value = []
    userRoles.value = []
  }

  return {
    roles,
    permissions,
    isLoading,
    selectedRole,
    isRoleSelected,
    userRoles,
    userPermissions,
    isSuperAdmin,
    isSurveyorOnly,

    hasRole,
    getRoleNameFromId,
    is,
    can,
    storeRole,
    updateRole,
    deleteRole,
    getRoles,
    getPermissions,
    getUserPermissions,
    $reset
  }
})
