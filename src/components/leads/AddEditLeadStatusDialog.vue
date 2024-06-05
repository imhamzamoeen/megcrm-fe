<script setup lang="ts">
import CreateLeadStatusForm from "@/components/leads/CreateLeadStatusForm.vue";
import { useLeadStatusesStore } from "@/stores/leads/useLeadStatusesStore";
import { EventBus } from "@/utils/useEventBus";

interface Emit {
  (e: "update:isLeadStatusDialogVisible", value: boolean): void;
}

defineProps({
  isLeadStatusDialogVisible: {
    type: Boolean,
    default: () => false,
  },
});

const store = useLeadStatusesStore();
const emit = defineEmits<Emit>();

const closeDialog = () => {
  store.selectedLeadStatus = null;

  emit("update:isLeadStatusDialogVisible", false);
};

onMounted(() => {
  EventBus.$on("hide-lead-status-dialog", () => {
    emit("update:isLeadStatusDialogVisible", false);
  });
});

onUnmounted(() => EventBus.$off("form-reset"));
</script>

<template>
  <VDialog
    :width="$vuetify.display.smAndDown ? 'auto' : 450"
    :model-value="isLeadStatusDialogVisible"
    @update:model-value="closeDialog"
    persistent
  >
    <!-- Dialog close btn -->
    <DialogCloseBtn @click="closeDialog" />

    <VCard class="pa-sm-8 pa-5">
      <!-- Title -->
      <VCardItem class="text-center">
        <VCardTitle class="text-h4 mb-3"> Lead Status </VCardTitle>
      </VCardItem>

      <VCardText class="mt-6">
        <!-- Form -->
        <CreateLeadStatusForm>
          <template #dialogCloseButton>
            <VBtn color="secondary" variant="tonal" @click="closeDialog">
              Cancel
            </VBtn>
          </template>
        </CreateLeadStatusForm>
      </VCardText>
    </VCard>
  </VDialog>
</template>
