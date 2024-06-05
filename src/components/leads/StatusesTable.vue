<script lang="ts" setup>
import useDataTable from "@/composables/useDatatable";
import { useLeadStatusesStore } from "@/stores/leads/useLeadStatusesStore";
import { EventBus } from "../../utils/useEventBus";

// Headers
const headers = [
  { title: "Name", key: "name" },
  { title: "Color", key: "color", align: "center", sortable: false },
  { title: "Actions", key: "actions", sortable: false },
];

const filters = ref({
  name: "",
});

// composables
const store: any = useLeadStatusesStore();
const { onSortChange, onPaginationChange } = useDataTable(
  store,
  filters,
  store.fetchAll
);

const handleLeadStatusView = (leadStatus: any) => {
  store.selectedLeadStatus = leadStatus;

  EventBus.$emit("lead-status-selected", leadStatus);
};
</script>

<template>
  <!-- Filters -->
  <VRow class="pa-4">
    <VCol cols="12" lg="3">
      <VTextField v-model="filters.name" label="Name" clearable />
    </VCol>
  </VRow>

  <!-- Table-->
  <DataTable
    :store="store"
    :items="store.leadStatuses"
    :headers="headers"
    class="text-no-wrap"
    show-select
    @update:on-pagination-change="onPaginationChange"
    @update:on-sort-change="onSortChange"
  >
    <!-- Color -->
    <template #item.color="{ item }">
      <VBadge :color="item.raw.color" />
    </template>

    <!-- Actions -->
    <template #item.actions="{ item }">
      <IconBtn @click="handleLeadStatusView(item.raw)">
        <VIcon icon="tabler-edit" />
      </IconBtn>
      <VTooltip location="bottom">
        <template #activator="{ props }">
          <IconBtn v-bind="props" @click="store.destroy(item.raw.id)">
            <VIcon color="error" icon="tabler-trash" />
          </IconBtn>
        </template>
        <span>Are you sure you want to delete this lead status?</span>
      </VTooltip>
    </template>
  </DataTable>
</template>
