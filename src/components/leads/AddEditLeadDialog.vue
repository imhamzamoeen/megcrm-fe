<script setup lang="ts">
import LeadForm from "@/components/leads/CreateForm.vue";
import { EventBus } from "@/utils/useEventBus";

interface Emit {
  (e: "update:isLeadDialogVisible", value: boolean): void;
}

defineProps({
  isLeadDialogVisible: {
    type: Boolean,
    default: () => false,
  },
});

const emit = defineEmits<Emit>();

const closeDialog = () => emit("update:isLeadDialogVisible", false);

onMounted(() => {
  EventBus.$on("hide-lead-dialog", () =>
    emit("update:isLeadDialogVisible", false)
  );
});

onUnmounted(() => EventBus.$off("hide-lead-dialog"));
</script>

<template>
  <VDialog
    :width="$vuetify.display.smAndDown ? 'auto' : 1100"
    :model-value="isLeadDialogVisible"
    @update:model-value="closeDialog"
    persistent
  >
    <!-- Dialog close btn -->
    <DialogCloseBtn @click="closeDialog" />

    <VCard class="pa-sm-8 pa-5">
      <VCardText class="mt-6">
        <!-- Form -->
        <LeadForm>
          <template #dialogCloseButton>
            <VBtn color="secondary" variant="tonal" @click="closeDialog">
              Cancel
            </VBtn>
          </template>
        </LeadForm>
      </VCardText>
    </VCard>
  </VDialog>
</template>
