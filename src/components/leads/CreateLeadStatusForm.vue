<script lang="ts" setup>
import {
  LeadStatus,
  useLeadStatusesStore,
} from "@/stores/leads/useLeadStatusesStore";
import { focusFirstErrorDiv } from "@/utils/useHelper";
import { requiredValidator } from "@validators";

const props = defineProps({
  isFullPage: {
    default: false,
    type: Boolean,
  },
});

const store = useLeadStatusesStore();

const isSelected = computed(() => !!store.isLeadStatusSelected);

const formRef = ref();
const form = ref<LeadStatus>({
  name: store.selectedLeadStatus?.name ?? null,
  color: store.selectedLeadStatus?.color ?? null,
});

const handleSubmit = async () => {
  const validation = await formRef.value.validate();

  if (validation?.valid) {
    if (store.selectedLeadStatus?.name) {
      await store.update(store.selectedLeadStatus.id, form.value);
    } else {
      await store.store(form.value);
    }
  } else {
    focusFirstErrorDiv(props.isFullPage);
  }
};
</script>

<template>
  <VForm @submit.prevent="handleSubmit" ref="formRef">
    <VRow>
      <VCol cols="12">
        <VTextField
          v-model="form.name"
          :rules="[requiredValidator]"
          label="Name"
          placeholder="Raw Lead"
          clearable
          required
        />
      </VCol>

      <VCol cols="12" align="center">
        <VColorPicker
          v-model="form.color"
          :rules="[requiredValidator]"
          label="Color"
          clearable
          required
          hide-inputs
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
        {{ isSelected ? "Update" : "Create" }} Lead Status
      </VBtn>

      <slot name="dialogCloseButton" />
    </div>
  </VForm>
</template>
