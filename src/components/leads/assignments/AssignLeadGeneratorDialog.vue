<script setup lang="ts">
import { useLeadGeneratorAssignmentStore } from "@/stores/leads/useLeadGeneratorAssignmentStore";
import { useLeadsStore } from "@/stores/leads/useLeadsStore";
import { requiredValidator } from "@validators";

interface Emit {
  (e: "update:isDialogVisible", value: boolean): void;
}

defineProps({
  isDialogVisible: {
    type: Boolean,
    default: () => false,
  },
});

const mainForm = ref();
const emit = defineEmits<Emit>();
const store = useLeadGeneratorAssignmentStore();
const leadStore = useLeadsStore();

const form = ref<any>({
  user_id: null,
  lead_generator_assignments: [],
});

const closeDialog = () => emit("update:isDialogVisible", false);

const handleSubmit = async () => {
  mainForm.value?.validate().then(async (valid: any) => {
    if (valid.valid) {
      await store.store(form.value);
    }
  });
};

onMounted(async () => await leadStore.getExtras());

watch(
  () => store.selected?.lead_generator_assignments,
  (n) => {
    if (n !== null) {
      if (n < 0) {
        form.value.lead_generator_assignments = [];
      } else {
        form.value.lead_generator_assignments = n.map((i: any) => i.id);
      }
    }
  }
);

watch(
  () => store.selected?.id,
  (n) => {
    if (n !== null) {
      form.value.user_id = n;
    }
  }
);
</script>

<template>
  <VDialog
    :width="$vuetify.display.smAndDown ? 'auto' : 540"
    :model-value="isDialogVisible"
    @update:model-value="closeDialog"
    persistent
  >
    <!-- Dialog close btn -->
    <DialogCloseBtn @click="closeDialog" />

    <VCard class="pa-sm-8 pa-5">
      <VCardText class="mt-6">
        <!-- Form -->
        <VForm ref="mainForm" @submit.prevent="handleSubmit">
          <VRow>
            <VCol cols="12">
              <VAutocomplete
                v-model="form.lead_generator_assignments"
                :items="leadStore.leadGenerators"
                :rules="[requiredValidator]"
                :error-messages="store?.errors?.lead_generator_assignments"
                label="Lead Generator"
                item-title="name"
                item-value="id"
                clearable
                required
                multiple
                chips
                :return-object="false"
              />
            </VCol>
          </VRow>

          <!-- Actions button -->
          <div class="d-flex align-center gap-3 mt-6">
            <VBtn
              type="submit"
              :disabled="store.isLoading"
              :loading="store.isLoading"
            >
              Save Lead Generators
            </VBtn>

            <VBtn color="secondary" variant="tonal" @click="closeDialog">
              Cancel
            </VBtn>
          </div>
        </VForm>
      </VCardText>
    </VCard>
  </VDialog>
</template>
