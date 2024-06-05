<script setup lang="ts">
import { useLeadsStore } from "@/stores/leads/useLeadsStore";
import { usePermissionsStore } from "@/stores/permissions/usePermissionsStore";
import { useUsersStore } from "@/stores/users/useUsersStore";

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
});

const emit = defineEmits<Emit>();

const usersStore = useUsersStore();
const leadsStore = useLeadsStore();
const permissionsStore: any = usePermissionsStore();

const closeDialog: any = () => {
  emit("update:isDialogVisible", false);

  setTimeout(() => usersStore.reset(), 500);
};

onMounted(async () => {
  await permissionsStore.getRoles();
  await leadsStore.getExtras();
});
</script>

<template>
  <VDialog
    :width="$vuetify.display.smAndDown ? 'auto' : 1600"
    :model-value="isDialogVisible"
    @update:model-value="closeDialog"
    persistent
  >
    <!-- Dialog close btn -->
    <DialogCloseBtn @click="closeDialog" />
  </VDialog>
</template>
