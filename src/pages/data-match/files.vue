<script lang="ts" setup>
import useDataTable from "@/composables/useDatatable";
import useTime from "@/composables/useTime";
import env from "@/constants/env";
import { useDatamatchFilesStore } from "@/stores/data-match/useDatamatchFilesStore";

const { VITE_APP_API_URL: BASE_URL } = env;

// Headers
const headers = [
  { title: "Name", key: "file_name" },
  { title: "Created At", key: "created_at" },
  { title: "Added by", key: "created_by.name", sortable: false },
  { title: "Type", key: "type", sortable: false },
  { title: "Actions", key: "actions", sortable: false },
];

const filters = ref({
  file_name: "",
  created_at: "",
});

const includes = ["createdBy"];
const time = useTime();

// composables
const store: any = useDatamatchFilesStore();
const { onSortChange, onPaginationChange } = useDataTable(store, filters, () =>
  store.index({ include: includes.join(",") })
);

const handleDownload = (item: any) => {
  console.log("Downloading", item);
  // store.download(item.id, item.file_name);
  // @ts-ignore
  window.open(item.file_path, "_blank").focus();
};
</script>

<template>
  <!-- Filters -->
  <VRow class="pa-4">
    <VCol cols="12" lg="6">
      <VTextField v-model="filters.file_name" label="Name" clearable />
    </VCol>

    <VCol cols="12" lg="6">
      <AppDateTimePicker
        v-model="filters.created_at"
        :config="{
          mode: 'range',
          wrap: true,
          altInput: true,
          altFormat: 'F j, Y',
          dateFormat: 'Y-m-d',
        }"
        label="Dated"
        placeholder="Select date"
      />
    </VCol>
  </VRow>

  <!-- Table-->
  <DataTable
    :store="store"
    :items="store.entries"
    :headers="headers"
    class="text-no-wrap"
    show-select
    @update:on-pagination-change="onPaginationChange"
    @update:on-sort-change="onSortChange"
  >
    <!-- Actions -->
    <!-- @vue-expect-error -->
    <template #item.actions="{ item }">
      <IconBtn @click="handleDownload(item.raw)">
        <VIcon icon="tabler-download" />
      </IconBtn>
    </template>
  </DataTable>
</template>
