<script lang="ts" setup>
import { useMeasuresStore } from "@/stores/measures/useMeasuresStore";
import { EventBus } from "@/utils/useEventBus";

const store = useMeasuresStore();
const isAddNameOnlyDialogVisible: any = ref(false);
const includes = ["createdBy"];

const onNameFormSubmit = async (form: any) => {
  if (store.selected.id) {
    await store.update(store.selected.id, form);
  } else {
    await store.store(form);
  }

  await store.fetchAll({ include: includes.join(",") });
};

onMounted(() => {
  EventBus.$on("item-selected", () => {
    isAddNameOnlyDialogVisible.value = true;
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
                <h6 class="text-h5">Measures Table</h6>
              </VCol>
              <VCol
                cols="12"
                lg="6"
                :class="$vuetify.display.lgAndUp ? 'text-right' : 'text-center'"
              >
                <VBtn
                  @click="isAddNameOnlyDialogVisible = true"
                  color="primary"
                >
                  Create Measure
                </VBtn>
              </VCol>
            </VRow>
          </VCardTitle>

          <MeasuresTable />
        </VCard>
      </VCol>
    </VRow>
  </section>

  <AddNameOnlyDialog
    v-model:is-name-only-dialog-visible="isAddNameOnlyDialogVisible"
    title="Measures"
    :store="store"
    @on-form-submitted="onNameFormSubmit"
  />
</template>
