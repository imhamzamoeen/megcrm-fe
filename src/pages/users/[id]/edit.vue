<script setup lang="ts">
import { useUsersStore } from "@/stores/users/useUsersStore";

const route = useRoute();
const usersStore = useUsersStore();

onMounted(async () => {
  await usersStore.get(route.params.id as any);
});
</script>

<template>
  <VCard class="mb-4">
    <VCardItem>
      <template #prepend>
        <VIcon icon="mdi-account-outline" class="text-disabled" />
      </template>

      <VCardTitle>Edit User Details</VCardTitle>
    </VCardItem>

    <VDivider />

    <VCardText>
      <UserComponent />
    </VCardText>
  </VCard>
</template>
