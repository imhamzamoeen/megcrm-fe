import useApiFetch from '@/composables/useApiFetch'
import { defaultPagination } from '@/constants/pagination'
import { useToast } from '@/plugins/toastr'
import { EventBus } from '@/utils/useEventBus'
import { handleError, reshapeParams } from '@/utils/useHelper'
import { defineStore } from 'pinia'

type teamData = {
  name: string,
  admin_id: string,
  members: string[]
}

const defaultModel = {
  id: null,
  name: null,
  admin_id: null,
  members: [],
}

export const useTeamStore = defineStore('team', () => {
  const endPoint = '/team'
  const entity = 'Team'
  const users = ref<any>([]);
  const team = ref<any>([])
  const selected = ref<any>({ ...defaultModel })
  const selectedId = ref<any>(null)
  const errors = ref<any>({})
  const isLoading = ref<any>(false)
  const meta = ref<any>(defaultPagination)
  const $toast: any = useToast()
  const includes = ["createdBy"]

  const isSelected = computed(() => !!selected.value.id)

  const index = async (options = { include: includes.join(",") }) => {
    isLoading.value = true
    const { data, meta: serverMeta } = await useApiFetch(reshapeParams(endPoint, meta.value, options))
    team.value = data.teams
    meta.value = {
      filters: meta.value?.filters ?? {},
      ...serverMeta
    }
    isLoading.value = false
  }

  const get = async (userId: Number) => {
    isLoading.value = true
    selectedId.value = userId
    const { data } = await useApiFetch(`${endPoint}/${userId}`)
    selected.value = data.user
    selected.value.roles = data.user.roles.map((i: any) => i.id)
    isLoading.value = false
    EventBus.$emit('toggle-team-dialog', true)
  }

  const getUsersForAssignment = async () => {
    try {
      isLoading.value = true

      const { data: response } = await useApiFetch(reshapeParams("/users", {}, {
        all: true,
      }));

      users.value = response.users.map(function (user: any) {
        return {
          ...user,
          'formated_name': `${user.name} : ${user.email}`,
        }
      }

      );
    } catch (err) {
      console.log(`output - err`, err)
    } finally {
      isLoading.value = false
    }

  }

  const filterUser = (roles: string[]) => {
    return users?.value.filter(function (user: any) {
      return user.roles.some((role: any) => roles.includes(role.name));
    });
  }
  const store = async (teamData: teamData, options: any = { method: 'POST' }) => {
    try {
      isLoading.value = true
      await useApiFetch('/team', {
        data: teamData,
        ...options,
      })
      $toast.success('Team Created Successfully.')
      errors.value = {}
      EventBus.$emit('toggle-team-dialog', false)
      await index()
    } catch (error) {
      handleError(error, errors)
    } finally {
      reset();
      isLoading.value = false
    }
  }

  const destroy = async (id: number, options = { method: 'DELETE' }) => {
    try {
      isLoading.value = true
      selectedId.value = id
      await useApiFetch(`${endPoint}/${id}`, options)
      $toast.success(`${entity} was deleted successfully.`)
      await index()
    } catch (error) {
      handleError(error, errors)
    } finally {
      isLoading.value = false
    }
  }

  const update = async (id: number | string, payload: any, options = { method: 'PUT' }) => {
    try {
      isLoading.value = true
      await useApiFetch(`${endPoint}/${id}`, {
        data: payload,
        ...options
      })
      $toast.success(`${entity} was updated successfully.`)
      errors.value = {}
      EventBus.$emit('toggle-team-dialog', false)
      await index()
    } catch (error) {
      handleError(error, errors)
    } finally {
      reset();
      isLoading.value = false
    }
  }


  const reset = () => {
    selected.value = { ...defaultModel };
    errors.value = {}
  }

  const resolveUserRoleVariant = (role: string) => {
    const roleLowerCase = role.toLowerCase();

    if (roleLowerCase === "super admin")
      return { color: "warning", icon: "tabler-device-laptop" };

    return { color: "primary", icon: "tabler-user" };
  };

  const resolveUserStatusVariant = (stat: string) => {
    if (stat) {
      return "success";
    }

    return "error";
  };

  const setTeamForSelected = (team: any) => {
    selectedId.value = team.id;
    selected.value.name = team.name;
    selected.value.admin_id = team.admin_id;
    selected.value.id = team.id;
    var userIds: [] = [];
    team.users.forEach(function (user: any) {
      if (user.id !== team.admin_id)
        userIds.push(user.id);
    });
    console.log(`output->userIds`, userIds)
    selected.value.members = userIds;
  }


  return {
    team,
    selectedId,
    isLoading,
    isSelected,
    selected,
    meta,
    errors,
    includes,
    users,

    resolveUserStatusVariant,
    resolveUserRoleVariant,
    reset,
    index,
    get,
    store,
    destroy,
    update,
    getUsersForAssignment,
    filterUser,
    setTeamForSelected,
  }
})
