<script setup lang="ts">
import { EventBus } from "@/utils/useEventBus";
import { requiredValidator } from "@validators";

interface Emit {
  (e: "update:isNameOnlyDialogVisible", value: boolean): void;
  (e: "onFormSubmitted", value: boolean): void;
}

const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  isNameOnlyDialogVisible: {
    type: Boolean,
    default: () => false,
  },
  store: {
    required: true,
    type: Object as any,
    default: () => {},
  },
});

const form = ref<any>({ name: null });
const errors = computed(() => props.store.errors);
const emit = defineEmits<Emit>();

const closeDialog = () => {
  setTimeout(() => (form.value.name = null), 500);
  setTimeout(() => props.store.resetState(), 500);

  emit("update:isNameOnlyDialogVisible", false);
};

const handleSubmit = () => emit("onFormSubmitted", form.value);

onMounted(() => {
  EventBus.$on("reset-name-only-dialog", () => closeDialog());
});

onUnmounted(() => EventBus.$off("reset-name-only-dialog"));

// Watch for changes in props.store.selected.name and update form accordingly
watch(
  () => props.store.selected?.name,
  (n) => {
    if (n !== null) {
      form.value.name = n;
    }
  }
);
</script>

<template>
  <VDialog
    :width="$vuetify.display.smAndDown ? 'auto' : 450"
    :model-value="isNameOnlyDialogVisible"
    @update:model-value="closeDialog"
    persistent
  >
    <!-- Dialog close btn -->
    <DialogCloseBtn @click="closeDialog" />

    <VCard class="pa-sm-8 pa-5">
      <!-- Title -->
      <VCardItem class="text-center">
        <VCardTitle class="text-h4 mb-3"> {{ title }} </VCardTitle>
      </VCardItem>

      <VCardText class="mt-6">
        <VForm @submit.prevent="handleSubmit">
          <VRow>
            <VCol cols="12">
              <VTextField
                v-model="form.name"
                :rules="[requiredValidator]"
                :error-messages="errors?.name"
                label="Name"
                placeholder="Raw Lead"
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
              {{ store.isSelected ? "Update" : "Create" }} {{ title }}
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
