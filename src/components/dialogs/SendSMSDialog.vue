<script setup lang="ts">
import { useLeadsStore } from "@/stores/leads/useLeadsStore";
import { maxLengthValidator, requiredValidator } from "@validators";

interface Emit {
  (e: "update:isDialogVisible", value: boolean): void;
}

defineProps({
  isDialogVisible: {
    type: Boolean,
    default: () => false,
  },
});

const smsForm = ref();
const store = useLeadsStore();
const emit = defineEmits<Emit>();

const form = ref<{ body: string | null }>({
  body: null,
});

const closeDialog = () => {
  emit("update:isDialogVisible", false);
};

const handleSubmit = async () => {
  smsForm.value.validate().then(async (v: any) => {
    if (v.valid) {
      try {
        await store.sendSms(store.selectedLead.id, form.value);

        closeDialog();
      } catch (e: any) {}
    }
  });
};
</script>

<template>
  <VDialog
    :width="$vuetify.display.smAndDown ? 'auto' : 750"
    :model-value="isDialogVisible"
    @update:model-value="closeDialog"
    persistent
  >
    <!-- Dialog close btn -->
    <DialogCloseBtn @click="closeDialog" />

    <VCard class="pa-sm-8 pa-5">
      <!-- Title -->
      <VCardItem class="text-center">
        <VCardTitle class="text-h4 mb-3">
          Send SMS to {{ store.selectedLead.full_name }}
        </VCardTitle>
      </VCardItem>

      <VCardText class="mt-6">
        <VAlert border="start" color="info" variant="tonal">
          Sending alert with name
          {{ store.selectedLead.lead_generator.sender_id }}
        </VAlert>

        <VForm class="mt-4" ref="smsForm" @submit.prevent="handleSubmit">
          <VRow>
            <VCol cols="12">
              <VTextarea
                v-model="form.body"
                :rules="[requiredValidator, (v) => maxLengthValidator(v, 1000)]"
                :error-messages="store.errors?.body"
                label="Message Body"
                placeholder="Raw Lead"
                counter
                required
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
              Send SMS
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
