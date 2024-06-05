<script lang="ts" setup>
import useDataTable from "@/composables/useDatatable";
import { useAuthStore } from "@/stores/auth/useAuthStore";
import { usePermissionsStore } from "@/stores/permissions/usePermissionsStore";
import { useTeamStore } from "@/stores/team/useTeamStore";
const router = useRouter();
const store: any = useTeamStore();
const rolesStore: any = usePermissionsStore();
const auth: any = useAuthStore();
const emit = defineEmits(["EditTeam"]);
// Headers
const headers = [
  { title: "Name", key: "name" },
  { title: "Admin", key: "admin_name", searchable: true },
  { title: "Creator", key: "creator", sortable: false, searchable: false },
  { title: "Members", key: "members_count", sortable: false },
  { title: "Actions", key: "action", sortable: false },
];

const filters = ref({
  name: "",
  admin_name: "",
});

// composables
const { onSortChange, onPaginationChange } = useDataTable(store, filters, () =>
  store.index({ include: store.includes.join(",") })
);

const handleRedirect = (team: any) => {
  // send an event to parent to open the modal
  emit("EditTeam", team);
};
</script>

<template>
  <!-- Filters -->
  <VRow class="pa-4">
    <VCol cols="12" lg="6">
      <VTextField v-model="filters.name" label=" Team Name" clearable />
    </VCol>

    <VCol cols="12" lg="6">
      <VTextField v-model="filters.admin_name" label="Admin Name" clearable />
    </VCol>
  </VRow>

  <DataTable
    :store="store"
    :items="store.team"
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
            {{ item.raw?.name }}
          </h6>
        </div>
      </div>
    </template>

    <!-- Email -->
    <template #item.admin_name="{ item }">
      <div class="d-flex align-center">
        <div class="d-flex flex-column">
          <span class="text-sm text-medium-emphasis">{{
            item.raw?.admin?.name
          }}</span>
        </div>
      </div>
    </template>

    <!-- Status -->
    <template #item.creator="{ item }">
      <div class="d-flex align-center">
        <span class="text-sm text-medium-emphasis">{{
          item.raw?.created_by?.name
        }}</span>
      </div>
    </template>

    <!-- Role -->
    <template #item.members_count="{ item }">
      <div class="d-flex align-center gap-4">
        <VAvatar :size="30" color="primary" variant="tonal">
          <VIcon :size="20" icon="tabler-user" />
        </VAvatar>
        <span class="text-capitalize">
          {{ item.raw?.members_count }}
        </span>
      </div>
    </template>

    <!-- Actions -->
    <template #item.action="{ item }">
      <IconBtn @click="handleRedirect(item.raw)">
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
          <IconBtn @click="store.destroy(item.raw.id)" v-bind="props">
            <VProgressCircular
              v-if="store.isLoading && store.selectedId === item.raw.id"
              size="24"
              color="info"
              indeterminate
            />
            <VIcon v-else color="error" icon="tabler-trash" />
          </IconBtn>
        </template>
        <span>Are you sure you want to delete this Team ?</span>
      </VTooltip>
    </template>
  </DataTable>
</template>
