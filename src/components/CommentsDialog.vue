<script lang="ts" setup>
import { requiredValidator } from "@validators";

defineProps({
  isCommentsDialogVisible: {
    type: Boolean,
    default: () => false,
  },
  isLoading: {
    required: true,
    default: () => false,
  },
});

const formRef = ref();
const comments = ref("");

const emit = defineEmits(["onCommentsUpdate", "onDialogClose"]);

const closeDialog = () => emit("onDialogClose");

const handleCommentsSubmit = async () => {
  const validation = await formRef.value.validate();

  if (validation?.valid) {
    emit("onCommentsUpdate", comments.value);

    // resetting
    setTimeout(() => {
      comments.value = "";
    }, 1000);

    closeDialog();
  }
};
</script>

<template>
  <VDialog
    :width="$vuetify.display.smAndDown ? 'auto' : 800"
    :model-value="isCommentsDialogVisible"
    @update:model-value="closeDialog"
    persistent
  >
    <!-- Dialog close btn -->
    <DialogCloseBtn @click="closeDialog" />

    <VCard class="pa-sm-8 pa-5">
      <!-- Title -->
      <VCardItem class="text-center">
        <VCardTitle class="text-h5 mb-3">
          Add Details of why you are changing lead status
        </VCardTitle>
      </VCardItem>

      <VForm ref="formRef" @submit.prevent="handleCommentsSubmit">
        <VCol cols="12">
          <VTextarea
            v-model="comments"
            :rules="[requiredValidator]"
            label="Comments"
            placeholder="Some comments..."
            auto-grow
            clearable
            counter
            required
          />
        </VCol>

        <VCol cols="12">
          <div class="d-flex align-center gap-3 mt-6">
            <VBtn type="submit" :disabled="isLoading" :loading="isLoading">
              Add Comments
            </VBtn>

            <VBtn color="secondary" variant="tonal" @click="closeDialog">
              Cancel
            </VBtn>
          </div>
        </VCol>
      </VForm>
    </VCard>
  </VDialog>
</template>
