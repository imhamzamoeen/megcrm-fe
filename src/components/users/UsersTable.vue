<script lang="ts" setup>
import useDataTable from "@/composables/useDatatable";
import { useAuthStore } from "@/stores/auth/useAuthStore";
import { usePermissionsStore } from "@/stores/permissions/usePermissionsStore";
import { useUsersStore } from "@/stores/users/useUsersStore";

const router = useRouter();
const store: any = useUsersStore();
const rolesStore: any = usePermissionsStore();
const auth: any = useAuthStore();

// Headers
const headers = [
  { title: "Name", key: "name" },
  { title: "Email", key: "email", searchable: true },
  { title: "Status", key: "status", sortable: false, searchable: true },
  { title: "Role", key: "role", sortable: false },
  { title: "Actions", key: "actions", sortable: false },
];

const filters = ref({
  name: "",
  email: "",
  roles: [],
});

// composables
const { onSortChange, onPaginationChange } = useDataTable(store, filters, () =>
  store.index({ include: store.includes.join(",") })
);

const handleRedirect = (id: number) => {
  router.push({ name: "users-id-edit", params: { id } });
};
</script>

<template>
  <!-- Filters -->
  <VRow class="pa-4">
    <VCol cols="12" lg="4">
      <VTextField v-model="filters.name" label="Name" clearable />
    </VCol>

    <VCol cols="12" lg="4">
      <VTextField v-model="filters.email" label="Email" clearable />
    </VCol>

    <VCol cols="12" lg="4">
      <VAutocomplete
        v-model="filters.roles"
        :items="rolesStore.roles"
        label="Roles"
        item-title="name_formatted"
        item-value="id"
        chips
        multiple
        clearable
        :return-object="false"
      />
    </VCol>
  </VRow>

  <DataTable
    :store="store"
    :items="store.users"
    :headers="headers"
    class="text-no-wrap"
    show-select
    @update:on-pagination-change="onPaginationChange"
    @update:on-sort-change="onSortChange"
  >
    <!-- Name -->
    <template #item.name="{ item }">
      <div class="d-flex align-center">
        <div class="d-flex flex-column">
          <h6 class="text-base">
            {{ item.raw.name }}
          </h6>
        </div>
      </div>
    </template>

    <!-- Email -->
    <template #item.email="{ item }">
      <div class="d-flex align-center">
        <div class="d-flex flex-column">
          <span class="text-sm text-medium-emphasis">{{ item.raw.email }}</span>
        </div>
      </div>
    </template>

    <!-- Status -->
    <template #item.status="{ item }">
      <VChip
        label
        size="small"
        class="text-capitalize"
        :color="store.resolveUserStatusVariant(item.raw.is_active)"
      >
        {{ item.raw.is_active ? "Active" : "Inactive" }}
      </VChip>
    </template>

    <!-- Role -->
    <template #item.role="{ item }">
      <div class="d-flex align-center gap-4">
        <VAvatar
          :size="30"
          :color="store.resolveUserRoleVariant(item.raw.top_role).color"
          variant="tonal"
        >
          <VIcon
            :size="20"
            :icon="store.resolveUserRoleVariant(item.raw.top_role).icon"
          />
        </VAvatar>
        <span class="text-capitalize">
          {{ item.raw.top_role == "" ? "No role" : item.raw.top_role }}
          {{
            item.raw.roles.length > 1 ? `( +${item.raw.roles.length - 1} )` : ""
          }}
        </span>
      </div>
    </template>

    <!-- Actions -->
    <template #item.actions="{ item }">
      <IconBtn @click="handleRedirect(item.raw.id)">
        <VProgressCircular
          v-if="store.isLoading && store.selectedId === item.raw.id"
          size="24"
          color="info"
          indeterminate
        />
        <VIcon v-else icon="tabler-edit" />
      </IconBtn>
      <VTooltip
        v-if="
          ['cfaysal099@gmail.com', 'megcrm24@gmail.com'].includes(
            auth.user.email
          )
        "
        location="bottom"
      >
        <template #activator="{ props }">
          <IconBtn
            v-if="
              !['cfaysal099@gmail.com', 'megcrm24@gmail.com'].includes(
                item.raw.email
              )
            "
            @click="store.destroy(item.raw.id)"
            v-bind="props"
          >
            <VProgressCircular
              v-if="store.isLoading && store.selectedId === item.raw.id"
              size="24"
              color="info"
              indeterminate
            />
            <VIcon v-else color="error" icon="tabler-trash" />
          </IconBtn>
        </template>
        <span>Are you sure you want to delete this user?</span>
      </VTooltip>
    </template>
  </DataTable>
</template>
