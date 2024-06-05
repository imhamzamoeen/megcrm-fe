<script lang="ts" setup>
import useDataTable from "@/composables/useDatatable";
import { useCompaniesStore } from "@/stores/companies/useCompaniesStore";

const router = useRouter();

// Headers
const headers = [
  { title: "Name", key: "name" },
  { title: "Address", key: "address" },
  { title: "VAT Number", key: "vat_number" },
  { title: "Added by", key: "created_by.name", sortable: false },
  { title: "Actions", key: "actions", sortable: false },
];

const filters = ref({
  name: "",
  address: "",
  vat_number: "",
});

const includes = ["createdBy"];

// composables
const store: any = useCompaniesStore();
const { onSortChange, onPaginationChange } = useDataTable(store, filters, () =>
  store.fetchAll({ include: includes.join(",") })
);

const handleView = (company: any) => {
  router.push({
    name: "companies-id-edit",
    params: {
      id: company.id,
    },
  });
};
</script>

<template>
  <!-- Filters -->
  <VRow class="pa-4">
    <VCol cols="12" lg="4">
      <VTextField v-model="filters.name" label="Name" clearable />
    </VCol>

    <VCol cols="12" lg="4">
      <VTextField v-model="filters.address" label="Address" clearable />
    </VCol>

    <VCol cols="12" lg="4">
      <VTextField v-model="filters.vat_number" label="VAT Number" clearable />
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
    <!-- Color -->
    <!-- @vue-expect-error -->
    <template #item.vat_number="{ item }">
      <VBtn size="x-small" color="primary">
        {{ item.raw?.vat_number ?? "NULL" }}
      </VBtn>
    </template>

    <!-- Actions -->
    <!-- @vue-expect-error -->
    <template #item.actions="{ item }">
      <IconBtn @click="handleView(item.raw)">
        <VIcon icon="tabler-edit" />
      </IconBtn>
      <VTooltip location="bottom">
        <template #activator="{ props }">
          <IconBtn v-bind="props" @click="store.destroy(item.raw.id)">
            <VProgressCircular
              v-if="
                store.isLoading &&
                store.selected?.id &&
                store.selected.id === item.raw.id
              "
              size="24"
              color="info"
              indeterminate
            />
            <VIcon v-else color="error" icon="tabler-trash" />
          </IconBtn>
        </template>
        <span>Are you sure you want to delete this company?</span>
      </VTooltip>
    </template>
  </DataTable>
</template>
