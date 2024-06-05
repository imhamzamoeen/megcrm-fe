<script setup lang="ts">
import { useUsersStore } from "@/stores/users/useUsersStore";

const usersStore = useUsersStore();

onMounted(async () => {
  // resetting on create
  usersStore.reset();
});
</script>

<template>
  <VCard class="mb-4">
    <VCardItem>
      <template #prepend>
        <VBtn class="pa-1 mr-2" to="/users" size="x-small" rounded>
          <VIcon icon="mdi-arrow-left" />
        </VBtn>
        <VIcon icon="mdi-account-outline" class="text-disabled" />
      </template>

      <VCardTitle>New User Details</VCardTitle>
    </VCardItem>

    <VDivider />

    <VCardText>
      <UserComponent />
    </VCardText>
  </VCard>
</template>
