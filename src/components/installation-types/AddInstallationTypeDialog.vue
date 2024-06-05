<script setup lang="ts">
import { useInstallationTypeStore } from "@/stores/installation-types/useInstallationTypeStore";
import { useLeadsStore } from "@/stores/leads/useLeadsStore";
import { requiredValidator } from "@validators";
import { EventBus } from "../../utils/useEventBus";

const formRef = ref();
const showDialog = ref(false);
const store = useInstallationTypeStore();
const leadsStore = useLeadsStore();
const errors = computed(() => store.errors);

const handleSubmit = async () => {
  formRef.value?.validate().then(async (valid: any) => {
    if (valid.valid) {
      try {
        if (store.selected?.id) {
          await store.update(store.selected.id, store.selected);
        } else {
          await store.store(store.selected);
        }

        await store.fetchAll({ include: store.includes.join(",") });

        closeDialog();
      } catch (e: any) {
        //
      }
    }
  });
};

const closeDialog = () => {
  showDialog.value = false;

  setTimeout(() => store.$reset());
};

onMounted(async () => {
  EventBus.$on("show-installation-dialog", () => (showDialog.value = true));
  await leadsStore.getExtras();
});

onUnmounted(() => {
  EventBus.$off("show-installation-dialog");
});
</script>

<template>
  <VDialog
    :width="$vuetify.display.smAndDown ? 'auto' : 900"
    :model-value="showDialog"
    @update:model-value="closeDialog"
    persistent
  >
    <!-- Dialog close btn -->
    <DialogCloseBtn @click="closeDialog" />

    <VCard class="pa-sm-8 pa-5">
      <!-- Title -->
      <VCardItem class="text-center">
        <VCardTitle class="text-h4 mb-3">
          Add Installation Engineer
        </VCardTitle>
      </VCardItem>

      <VCardText class="mt-6">
        <VForm ref="formRef" @submit.prevent="handleSubmit">
          <VRow>
            <VCol cols="12">
              <VTextField
                v-model="store.selected.name"
                :rules="[requiredValidator]"
                :error-messages="errors?.name"
                label="Name"
                placeholder="Loft Insulation Engineer"
                clearable
                required
              />
            </VCol>
            <VCol cols="12">
              <VSelect
                v-model="store.selected.measures"
                :items="leadsStore.measures"
                item-title="name"
                item-value="id"
                label="Measures"
                placeholder="Loft Insulation"
                clearable
                required
                multiple
                chips
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
              {{ store.isSelected ? "Update" : "Create" }} Installation Engineer
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
