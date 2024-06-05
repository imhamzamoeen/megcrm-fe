<script setup lang="ts">
import { usePermissionsStore } from "@/stores/permissions/usePermissionsStore";
import { EventBus } from "@/utils/useEventBus";
import { requiredValidator } from "@validators";
import { VForm } from "vuetify/components/VForm";

interface Emit {
  (e: "update:isDialogVisible", value: boolean): void;
}

const props = defineProps({
  isDialogVisible: {
    type: Boolean,
    default: false,
    required: false,
  },
  showRoles: {
    type: Boolean,
    default: true,
    required: false,
  },
  store: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits<Emit>();

const showAircallEmailField = ref(false);
const formRef = ref();
const permissionsStore: any = usePermissionsStore();
const label = computed(() => (props.store.isSelected ? "Update" : "Create"));

const handleSubmit = async () => {
  formRef.value.validate().then(async (v: any) => {
    if (v.valid) {
      if (props.store.isSelected) {
        await props.store.update(props.store.selectedId, props.store.selected);
      } else {
        await props.store.store(props.store.selected);
      }
    }
  });
};

const closeDialog: any = () => {
  props.store.reset();
  emit("update:isDialogVisible", false);

  // setTimeout(() => props.store.reset(), 500);
};

onMounted(async () => {
  await props.store.getUsersForAssignment();
  EventBus.$on("toggle-team-dialog", (type: any) => {
    emit("update:isDialogVisible", type);
  });
});

onUnmounted(() => EventBus.$off("toggle-team-dialog"));
</script>

<template>
  <VDialog
    :width="$vuetify.display.smAndDown ? 'auto' : 900"
    :model-value="isDialogVisible"
    @update:model-value="closeDialog"
    persistent
  >
    <!-- Dialog close btn -->
    <DialogCloseBtn @click="closeDialog" />

    <VCard class="pa-sm-8 pa-5">
      <!-- Title -->
      <VCardItem class="text-center">
        <VCardTitle class="text-h4 mb-3"> {{ label }} Team </VCardTitle>
      </VCardItem>

      <!-- Form -->
      <VForm ref="formRef" class="mt-3" @submit.prevent="handleSubmit">
        <VRow>
          <VCol cols="12" md="12">
            <VRow>
              <!-- Name -->
              <VCol md="3" cols="3"> </VCol>
              <VCol cols="6" md="6">
                <VTextField
                  v-model="store.selected.name"
                  :rules="[requiredValidator]"
                  label="Team Name"
                  placeholder="Team Alpha"
                  :error-messages="store?.errors?.name?.[0]"
                />
              </VCol>
            </VRow>

            <VRow>
              <VCol md="12" sm="12" cols="12">
                <!-- Team Leader -->
                <VAutocomplete
                  v-model="store.selected.admin_id"
                  :rules="[requiredValidator]"
                  :items="store.users"
                  label="Team Leader"
                  placeholder="Leader"
                  item-title="formated_name"
                  item-value="id"
                  clearable
                  :error-messages="store?.errors?.admin_id?.[0]"
                  :return-object="false"
                />
              </VCol>
            </VRow>

            <VRow>
              <VCol md="12" sm="12" cols="12">
                <!-- Members -->

                <VAutocomplete
                  v-model="store.selected.members"
                  :rules="[requiredValidator]"
                  :items="store.users"
                  item-title="formated_name"
                  item-value="id"
                  label="Members"
                  placeholder="Members"
                  :return-object="false"
                  :error-messages="store?.errors?.members?.[0]"
                  multiple
                  chips
                  clearable
                />
              </VCol>
            </VRow>

            <VRow>
              <Vcol cols="12" md="6">
                <!-- Actions button -->
                <div class="d-flex align-center justify-end gap-3 mt-6">
                  <VBtn
                    type="submit"
                    :disabled="store.isLoading"
                    :loading="store.isLoading"
                  >
                    {{ label }} Team
                  </VBtn>

                  <VBtn color="secondary" variant="tonal" @click="closeDialog">
                    Cancel
                  </VBtn>
                </div>
              </Vcol>
            </VRow>
          </VCol></VRow
        >
      </VForm>
    </VCard>
  </VDialog>
</template>
