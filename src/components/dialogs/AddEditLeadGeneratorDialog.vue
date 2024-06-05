<script setup lang="ts">
import { useLeadGeneratorsStore } from "@/stores/lead-generators/useLeadGeneratorsStore";
import {
  emailValidator,
  integerValidator,
  lengthValidator,
  maxLengthValidator,
  requiredValidator,
} from "@validators";

interface Emit {
  (e: "update:isDialogVisible", value: boolean): void;
}

defineProps({
  isDialogVisible: {
    type: Boolean,
    default: () => false,
  },
});

const store: any = useLeadGeneratorsStore();
const formRef = ref();
const emit = defineEmits<Emit>();

const closeDialog = () => {
  store.resetState();

  emit("update:isDialogVisible", false);
};

const handleSubmit = async () => {
  try {
    formRef.value.validate().then(async (v: any) => {
      if (v.valid) {
        if (store?.selected?.id) {
          await store.update(store.selected.id, store.selected);
        } else {
          await store.store(store.selected);
        }

        store.fetchAll({ include: store.include.join(",") });

        closeDialog();
      }
    });
  } catch (e) {
    //
  }
};
</script>

<template>
  <VDialog
    :width="$vuetify.display.smAndDown ? 'auto' : 650"
    :model-value="isDialogVisible"
    @update:model-value="closeDialog"
    persistent
  >
    <!-- Dialog close btn -->
    <DialogCloseBtn @click="closeDialog" />

    <VCard class="pa-sm-8 pa-5">
      <!-- Title -->
      <VCardItem class="text-center">
        <VCardTitle class="text-h4 mb-3"> Lead Generator </VCardTitle>
      </VCardItem>

      <VCardText class="mt-6">
        <VForm ref="formRef" @submit.prevent="handleSubmit">
          <VRow>
            <VCol cols="12">
              <VTextField
                v-model="store.selected.name"
                :rules="[requiredValidator]"
                :error-messages="store.errors?.name"
                label="Name"
                placeholder="Raw Lead"
                clearable
                required
              />
            </VCol>

            <VCol cols="12">
              <VTextField
                v-model="store.selected.sender_id"
                :rules="[requiredValidator]"
                :error-messages="store.errors?.sender_id"
                label="SMS Sender Name"
                placeholder="MEG"
                clearable
                required
              />
            </VCol>

            <VCol cols="12">
              <VTextField
                v-model="store.selected.email"
                :rules="[emailValidator]"
                :error-messages="store.errors?.email"
                label="Email Address"
                placeholder="info@leadgenerator.co.uk"
                clearable
                required
              />
            </VCol>

            <VCol cols="12">
              <VTextField
                v-model="store.selected.phone_no"
                :rules="[
                  integerValidator,
                  (v:any) => maxLengthValidator(v, 10),
                  (v:any) => lengthValidator(v, 10),
                ]"
                :error-messages="store.errors?.phone_no"
                label="Phone No"
                placeholder="7943111111"
                clearable
                required
              />
            </VCol>

            <VCol cols="12">
              <VTextField
                v-model="store.selected.aircall_number"
                :rules="[
                  integerValidator,
                  (v:any) => maxLengthValidator(v, 10),
                  (v:any) => lengthValidator(v, 10),
                ]"
                :error-messages="store.errors?.aircall_number"
                label="Aircall No"
                placeholder="7943111111"
                clearable
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
              {{ store.isSelected ? "Update" : "Create" }}
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
