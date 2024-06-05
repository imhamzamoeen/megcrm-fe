<script lang="ts" setup>
import useDataTable from "@/composables/useDatatable";
import useTime from "@/composables/useTime";
import { useBoilersStore } from "@/stores/boilers/useBoilersStore";

// Headers
const headers = [
  { title: "Model", key: "Model_data", sortable: false },
  { title: "Fuel", key: "fuel", sortable: false },
  { title: "Main Type", key: "main_type", sortable: false },
  { title: "Condensing", key: "condensing", sortable: false },
  {
    title: "SAP Winter Seasonal Efficiency",
    key: "s_a_p_winter_seasonal_efficiency",
    sortable: false,
  },

  { title: "Last Updated", key: "updated_at", sortable: false },
];

const time = useTime();
const condensingTypes = ref([
  {
    key: "Yes",
    value: true,
  },
  {
    key: "No",
    value: false,
  },
]);

const filters = ref({
  Model_data: "",
  manufacturer: [],
  condensing: null,
});

// composables
const store: any = useBoilersStore();
const { onSortChange, onPaginationChange } = useDataTable(store, filters, () =>
  store.fetchAll()
);

onMounted(async () => {
  await store.fetchManufacturers();
});
</script>

<template>
  <!-- Filters -->
  <VRow class="pa-4">
    <VCol cols="12" lg="3">
      <VTextField
        v-model="filters.Model_data"
        label="Name"
        clearable
        density="compact"
      />
    </VCol>
    <VCol cols="12" lg="3">
      <VAutocomplete
        v-model="filters.manufacturer"
        :items="store.manufactures"
        label="Manufacturer"
        placeholder="Select manufacturer"
        item-title="original_manufacturer_name"
        item-value="original_manufacturer_name"
        chips
        multiple
        clearable
        :return-object="false"
        density="compact"
      />
    </VCol>
    <VCol cols="12" lg="3">
      <VAutocomplete
        v-model="filters.condensing"
        :items="condensingTypes"
        label="Type"
        placeholder="Select type"
        clearable
        item-title="key"
        item-value="value"
        :return-object="false"
        density="compact"
      />
    </VCol>
    <VCol cols="12" lg="3">
      <VTextField
        v-model="filters.s_a_p_winter_seasonal_efficiency"
        label="SAP Efficiency"
        clearable
        density="compact"
      />
    </VCol>
  </VRow>

  <!-- Table-->
  <DataTable
    :store="store"
    :items="store.entries"
    :headers="headers"
    class="text-no-wrap"
    @update:on-pagination-change="onPaginationChange"
    @update:on-sort-change="onSortChange"
  >
    <template #item.Model_data="{ item }">
      {{ item.raw.Model_data }}
    </template>

    <template #item.fuel="{ item }">
      {{ item?.raw?.fuel && item.raw.fuel.toUpperCase() }}
    </template>

    <template #item.main_type="{ item }">
      {{ item?.raw?.main_type && item.raw.main_type.toUpperCase() }}
    </template>

    <template #item.condensing="{ item }">
      {{ item.raw.condensing === 0 ? "No" : "Yes" }}
    </template>

    <template #item.updated_at="{ item }">
      {{ item?.raw?.updated_at && time.diffForHumans(item.raw.updated_at) }}
    </template>
  </DataTable>
</template>
