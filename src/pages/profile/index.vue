<script lang="ts" setup>
import { useAuthStore } from "@/stores/auth/useAuthStore";

const auth: any = useAuthStore();
</script>

<template>
  <VRow>
    <!-- Bio -->
    <VCol cols="12" lg="4">
      <UserBioPanel :user="auth.user" />
    </VCol>

    <!-- Activity Timeline -->
    <VCol cols="12" lg="8">
      <ActivityTimeline :logs="auth?.user?.logs ?? []" />
    </VCol>
  </VRow>
</template>
