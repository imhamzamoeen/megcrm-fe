<script setup lang="ts">
import { useUsersStore } from "@/stores/users/useUsersStore";
import avatar5 from "@images/avatars/avatar-5.png";

defineProps({
  user: {
    required: true,
    type: Object,
  },
});

const usersStore: any = useUsersStore();
</script>

<template>
  <VRow>
    <!-- SECTION User Details -->
    <VCol cols="12">
      <VCard v-if="user">
        <VCardText class="text-center pt-15">
          <VAvatar rounded :size="120">
            <VImg :src="avatar5" />
          </VAvatar>

          <h6 class="text-h6 mt-4">
            {{ user.full_name }}
          </h6>

          <VChip
            v-for="role in user.roles"
            label
            :color="usersStore.resolveUserRoleVariant(role.name).color"
            size="small"
            class="text-capitalize mt-4 mr-4"
          >
            {{ role.name.toUpperCase().replace("_", " ") }}
          </VChip>
        </VCardText>

        <VCardText>
          <h6 class="text-h6">Details</h6>

          <VDivider class="mt-4" />

          <VList class="card-list mt-2">
            <VListItem>
              <VListItemTitle class="text-sm">
                <span class="font-weight-medium"> Email: </span>
                <span class="text-body-2">
                  {{ user.email }}
                </span>
              </VListItemTitle>
            </VListItem>

            <VListItem>
              <VListItemTitle class="text-sm">
                <span class="font-weight-medium"> Status: </span>
                <VChip
                  label
                  size="small"
                  :color="usersStore.resolveUserStatusVariant(user.is_active)"
                  class="text-capitalize"
                >
                  {{ user.is_active ? "Active" : "Inactive" }}
                </VChip>
              </VListItemTitle>
            </VListItem>
          </VList>
        </VCardText>

        <VCardText class="d-flex justify-center">
          <VBtn
            :to="{
              name: 'profile-tab',
              params: { tab: 'account' },
            }"
            variant="elevated"
            class="me-4"
          >
            Edit
            <VIcon end icon="mdi-account-edit-outline" />
          </VBtn>
        </VCardText>
      </VCard>
    </VCol>
    <!-- !SECTION -->
  </VRow>
</template>

<style lang="scss" scoped>
.card-list {
  --v-card-list-gap: 0.8rem;
}

.current-plan {
  border: 2px solid rgb(var(--v-theme-primary));
}

.text-capitalize {
  text-transform: capitalize !important;
}
</style>
