<script setup lang="ts">
import illustrationJohnDark from "@images/cards/illustration-john-dark.png";
import illustrationJohnLight from "@images/cards/illustration-john-light.png";

import { useAuthStore } from "@/stores/auth/useAuthStore";
import { useGenerateImageVariant } from "@core/composable/useGenerateImageVariant";

const image = useGenerateImageVariant(
  illustrationJohnLight,
  illustrationJohnDark
);

const store: any = useAuthStore();
</script>

<template>
  <VCard class="py-3 px-2">
    <VRow no-gutters>
      <VCol cols="12" sm="6">
        <VCardItem>
          <VCardTitle class="text-md-h5 text-wrap">
            <span class="me-1">Congratulations</span>
            <strong class="me-1"> {{ store.user.name }}! </strong>
            <span>🎉</span>
          </VCardTitle>
        </VCardItem>

        <VCardText>
          <p class="custom-margin">
            You can access your upcoming leads and their history.
            <br />
          </p>
          <p>All the best for your new lead. 🚀</p>
          <VBtn :to="{ name: 'leads' }">View Leads</VBtn>
        </VCardText>
      </VCol>

      <VCol cols="12" sm="4" order="1" order-sm="2" class="text-center">
        <img
          :src="image"
          class="avatar-illustration"
          :height="$vuetify.display.xs ? '165' : '200'"
          :class="
            $vuetify.display.xs ? 'position-relative' : 'position-absolute'
          "
          alt="avatar-illustration"
        />
      </VCol>
    </VRow>
  </VCard>
</template>

<style lang="scss" scoped>
.custom-margin {
  margin-block-end: 10px;
}

.avatar-illustration {
  inset-block-end: -0.0625rem;
  inset-inline-end: 0;
}
</style>
