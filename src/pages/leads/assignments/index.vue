<script lang="ts" setup>
import { EventBus } from "@/utils/useEventBus";

const isDialogVisible: any = ref(false);

onMounted(() => {
  EventBus.$on("hide-dialog", () => (isDialogVisible.value = false));
});

onUnmounted(() => EventBus.$off("hide-dialog"));
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
                <h6 class="text-h5">Lead Generators Assignments Table</h6>
              </VCol>
            </VRow>
          </VCardTitle>

          <LeadAssignmentsTable v-model:is-dialog-visible="isDialogVisible" />
        </VCard>
      </VCol>
    </VRow>
  </section>

  <AssignLeadGeneratorDialog v-model:is-dialog-visible="isDialogVisible" />
</template>
