<script setup lang="ts">
import { VDataTableServer } from "vuetify/labs/VDataTable";

const expanded: any = ref([]);

const props: any = defineProps({
  store: {
    required: true,
    type: Object,
  },
  searchable: {
    type: Boolean,
    required: false,
    default: () => false,
  },
});

const emit = defineEmits(["update:onPaginationChange", "update:onSortChange"]);

const pagination = ref({ current_page: 1, per_page: 50 });

declare type SortItem = {
  key: string;
  order: "asc" | "desc";
};

const sort = ref({
  sort_by: "name",
  type: "asc",
});

const handlePageChange = (page: number) => {
  pagination.value.current_page = page;

  emit("update:onPaginationChange", {
    pagination: pagination.value,
  });
};

const handlePerPageChange = (page: number) => {
  props.store.meta.per_page = page;
  props.store.meta.current_page = 1;

  emit("update:onPaginationChange");
};

const sortable = (sortItem: SortItem[]) => {
  sort.value.sort_by = sortItem[0].key;
  sort.value.type = sortItem[0].order;

  emit("update:onSortChange", {
    sort: sort.value,
    pagination: pagination.value,
  });
};
</script>

<template>
  <VDataTableServer
    v-bind="$attrs"
    :items-per-page="pagination.per_page"
    :page="pagination.current_page"
    :items-length="10"
    :must-sort="true"
    class="elevation-1"
    v-model:expanded="expanded"
    @update:sort-by="sortable"
  >
    <template #top>
      <VProgressLinear
        v-if="store.isLoading"
        indeterminate
        color="primary"
        :height="2"
      />
    </template>

    <!-- Pass on all scoped slots -->
    <template v-for="slot in Object.keys($slots)" #[slot]="scope">
      <slot v-if="scope" :name="slot" v-bind="scope" />
    </template>

    <!-- <template v-if="searchable" #top>
      <v-text-field
        v-model="rawFilter.search"
        label="Search"
        density="compact"
        hide-details
        class="px-4 pb-2"
      />
    </template> -->

    <!-- pagination -->
    <template #bottom>
      <VDivider />

      <Pagination
        :store="store"
        @update:perPage="handlePerPageChange"
        @update:currentPage="handlePageChange"
      />
    </template>
  </VDataTableServer>
</template>
