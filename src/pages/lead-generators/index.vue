<script lang="ts" setup>
import { useLeadGeneratorsStore } from "@/stores/lead-generators/useLeadGeneratorsStore";
import { EventBus } from "@/utils/useEventBus";

const store = useLeadGeneratorsStore();
const isDialogVisible: any = ref(false);
const includes = ["createdBy"];

const onFormSubmitted = async (form: any) => {
  if (store.selected.id) {
    await store.update(store.selected.id, form);
  } else {
    await store.store(form);
  }

  await store.fetchAll({ include: includes.join(",") });
};

onMounted(() => {
  EventBus.$on("item-selected", () => {
    isDialogVisible.value = true;
  });
});

onUnmounted(() => {
  EventBus.$off("item-selected");
});
</script>

<template>
  <section>
    <VRow>
      <VCol cols="12">
        <VCard class="leads-card">
          <VCardTitle class="pl-4 pr-4 mt-3 mb-2">
            <VRow class="text-layout">
              <VCol
                cols="12"
                lg="6"
                :class="$vuetify.display.lgAndUp ? 'text-left' : 'text-center'"
              >
                <h6 class="text-h5">Lead Generators Table</h6>
              </VCol>
              <VCol
                cols="12"
                lg="6"
                :class="$vuetify.display.lgAndUp ? 'text-right' : 'text-center'"
              >
                <VBtn @click="isDialogVisible = true" color="primary">
                  Create Lead Generator
                </VBtn>
              </VCol>
            </VRow>
          </VCardTitle>

          <LeadGeneratorsTable />
        </VCard>
      </VCol>
    </VRow>
  </section>

  <AddEditLeadGeneratorDialog
    v-model:is-dialog-visible="isDialogVisible"
    title="Lead Generators"
    :store="store"
    @on-form-submitted="onFormSubmitted"
  />
</template>
