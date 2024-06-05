<script setup lang="ts">
import { usePermissionsStore } from "@/stores/permissions/usePermissionsStore";
import { focusFirstErrorDiv } from "@/utils/useHelper";
import { capitalizeFirstLetter } from "@/utils/useString";
import { requiredValidator } from "@validators";
import { VForm } from "vuetify/components/VForm";

interface Emit {
  (e: "update:isDialogVisible", value: boolean): void;
}

const props = defineProps({
  isDialogVisible: {
    type: Boolean,
    default: () => false,
  },
});

const emit = defineEmits<Emit>();

const formRef = ref();
const panel = ref(0);
const permissionsStore = usePermissionsStore();
const form = reactive<any>({
  permissions: [],
});

const label = computed(() =>
  permissionsStore.isRoleSelected ? "Update" : "Create"
);

const handleSubmit = async () => {
  const validation = await formRef.value.validate();

  if (validation?.valid) {
    permissionsStore.isRoleSelected
      ? await permissionsStore.updateRole(form)
      : await permissionsStore.storeRole(form);

    emit("update:isDialogVisible", false);
  } else {
    focusFirstErrorDiv();
  }
};

watch(
  props,
  () => {
    form.name = permissionsStore.isRoleSelected
      ? permissionsStore.selectedRole.name
      : "";
    form.permissions = permissionsStore.isRoleSelected
      ? permissionsStore.selectedRole?.permissions?.map((p: any) => p.id)
      : [];
  },
  { deep: true }
);

const closeDialog = () => emit("update:isDialogVisible", false);

onMounted(async () => await permissionsStore.getPermissions());
</script>

<template>
  <VDialog
    :width="$vuetify.display.smAndDown ? 'auto' : 900"
    :model-value="isDialogVisible"
    @update:model-value="closeDialog"
  >
    <!-- Dialog close btn -->
    <DialogCloseBtn @click="closeDialog" />

    <VCard class="pa-sm-8 pa-5">
      <!-- Title -->
      <VCardItem class="text-center">
        <VCardTitle class="text-h4 mb-3"> {{ label }} Role </VCardTitle>
      </VCardItem>

      <!-- Form -->
      <VForm ref="formRef" class="mt-3" @submit.prevent="handleSubmit">
        <!-- Role name -->
        <VTooltip>
          <template #activator="{ props }">
            <VTextField
              v-bind="props"
              v-model="form.name"
              :rules="[requiredValidator]"
              :readonly="
                permissionsStore.isRoleSelected &&
                permissionsStore.selectedRole.id <= 9
              "
              label="Role Name"
              placeholder="Enter Role Name"
              required
            />
          </template>
          <span>Cannot update the role name created by system.</span>
        </VTooltip>

        <VRow class="text-layout">
          <VCol cols="6" class="text-left">
            <p class="text-h5 mt-8 mb-3">Role Permissions</p>
          </VCol>
        </VRow>

        <!-- Permissions -->
        <VExpansionPanels v-model="panel" class="no-icon-rotate">
          <VExpansionPanel
            v-for="(permissionModule, idx) in permissionsStore.permissions"
            :key="`module-${idx}`"
          >
            <template v-if="permissionModule.name !== 'auth'">
              <VExpansionPanelTitle disable-icon-rotate
                >{{ capitalizeFirstLetter(permissionModule.name) }}
                <template #actions>
                  <VIcon size="18" icon="tabler-alert-circle" color="primary" />
                </template>
              </VExpansionPanelTitle>
              <VExpansionPanelText>
                <VRow>
                  <VCol
                    cols="4"
                    md="3"
                    v-for="permission in permissionModule.submodules"
                    :key="permission"
                  >
                    <VCheckbox
                      v-model="form.permissions"
                      :value="permission.id"
                      dense
                    >
                      <template v-slot:label>
                        <span style="font-size: 12px">
                          {{ permission.name }}
                        </span>
                      </template>
                    </VCheckbox>
                  </VCol>
                </VRow>
              </VExpansionPanelText>
            </template>
          </VExpansionPanel>
        </VExpansionPanels>

        <!-- Actions button -->
        <div class="d-flex align-center justify-center gap-3 mt-6">
          <VBtn
            type="submit"
            :disabled="permissionsStore.isLoading"
            :loading="permissionsStore.isLoading"
          >
            {{ label }} Role
          </VBtn>

          <VBtn color="secondary" variant="tonal" @click="closeDialog">
            Cancel
          </VBtn>
        </div>
      </VForm>
    </VCard>
  </VDialog>
</template>
