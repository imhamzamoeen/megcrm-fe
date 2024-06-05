<script lang="ts" setup>
import { roles } from "@/constants/rolesAndPermissions";
import { useToast } from "@/plugins/toastr";
import { usePermissionsStore } from "@/stores/permissions/usePermissionsStore";
import newRoleAvatar from "@images/pages/new-role-avatar.png";
import { storeToRefs } from "pinia";

interface RoleDetails {
  name: string;
  permissions: number[];
}

const isAddRoleDialogVisible = ref(false);
const rolesStore = usePermissionsStore();
const { selectedRole } = storeToRefs(rolesStore);
const $toast = useToast();

const createRole = () => {
  selectedRole.value = null;
  isAddRoleDialogVisible.value = true;
};

const editPermission = (role: RoleDetails) => {
  if (role.id !== 1) {
    selectedRole.value = role;
    isAddRoleDialogVisible.value = true;
  } else {
    $toast.error("Cannot change/update Super Admin.");
  }
};

const deleteRole = async (roleId: number) =>
  await rolesStore.deleteRole(roleId);

const getAvatar = (avatarNumber: number) => {
  if (avatarNumber > 10) {
    avatarNumber = Math.floor(Math.random() * 10) + 1;
  }

  // Generate the dynamic avatar image source based on the avatar number
  return `/src/assets/images/avatars/avatar-${avatarNumber}.png`;
};

onMounted(
  async () => await rolesStore.getRoles({ all: true, include: "permissions" })
);
</script>
<template>
  <VRow>
    <VCol cols="12">
      <h4 class="text-h4 mb-6">Roles List</h4>
      <p class="mb-0">
        A role provided access to predefined menus and features so that
        depending on assigned role an administrator can have access to what he
        need
      </p>
    </VCol>
  </VRow>

  <VCol cols="12" class="no-x-padding">
    <VRow>
      <!-- Roles -->
      <VCol
        v-for="role in rolesStore.roles"
        :key="role?.name"
        cols="12"
        sm="6"
        lg="4"
      >
        <VTooltip>
          <template #activator="{ props }">
            <VCard v-bind="props" @click="editPermission(role)">
              <VCardText class="d-flex align-center pb-1">
                <span> {{ role?.users.length }} user(s) </span>&nbsp;
                <span v-if="roles.SUPER_ADMIN !== role?.name">
                  {{ role?.meta.totalPermissions }} permission(s)

                  <VTooltip location="bottom">
                    <template #activator="{ props }">
                      <VIcon v-bind="props" icon="mdi-help-circle-outline" />
                    </template>
                    Some permissions are auto selected that are related to login
                    and registration.
                  </VTooltip>
                </span>

                <VSpacer />

                <div class="v-avatar-group">
                  <template v-for="(user, index) in role?.users" :key="user">
                    <VAvatar
                      v-if="
                        role?.users.length > 0 &&
                        role?.users.length !== 4 &&
                        index < 3
                      "
                      size="36"
                      :image="getAvatar(user.id)"
                    />

                    <VAvatar
                      v-if="role?.users.length === 4"
                      size="36"
                      :image="getAvatar(user.id)"
                    />
                  </template>
                  <VAvatar
                    v-if="role?.users.length > 4"
                    :color="$vuetify.theme.current.dark ? '#4A5072' : '#f6f6f7'"
                  >
                    <span> +{{ role?.users.length - 3 }} </span>
                  </VAvatar>
                  <VAvatar
                    v-if="role?.users.length == 0"
                    :color="$vuetify.theme.current.dark ? '#4A5072' : '#f6f6f7'"
                  >
                    <span> 0 </span>
                  </VAvatar>
                </div>
              </VCardText>

              <VCardText class="pb-5">
                <div class="d-flex justify-space-between">
                  <h4 class="text-h4">
                    {{ role?.formatted_name }}
                  </h4>

                  <VSpacer />

                  <VBtn
                    v-if="role.id > 9"
                    icon
                    color="error"
                    variant="text"
                    size="x-small"
                    class="mr-4 mt-4"
                    :disabled="rolesStore.isLoading"
                    @click="deleteRole(role.id)"
                  >
                    <VIcon size="24" icon="tabler-trash" />
                  </VBtn>
                </div>
              </VCardText>
            </VCard>
          </template>
          <span>Click to update role.</span>
        </VTooltip>
      </VCol>

      <!-- Add New Role -->
      <VCol cols="12" sm="6" lg="4">
        <VCard class="h-100" :ripple="false" @click="createRole()">
          <VRow no-gutters class="h-100">
            <VCol
              cols="5"
              class="d-flex flex-column justify-end align-center mt-5"
            >
              <img width="85" :src="newRoleAvatar" />
            </VCol>

            <VCol cols="7">
              <VCardText
                class="d-flex flex-column align-end justify-end gap-2 h-100"
                style="text-align: end"
              >
                <VBtn>Add New Role</VBtn>
                <span>Add role, if it doesn't exist.</span>
              </VCardText>
            </VCol>
          </VRow>
        </VCard>
      </VCol>
    </VRow>
  </VCol>

  <AddEditRoleDialog v-model:is-dialog-visible="isAddRoleDialogVisible" />
</template>
