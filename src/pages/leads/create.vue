<script lang="ts" setup>
import LeadForm from "@/components/leads/CreateForm.vue";
</script>

<template>
  <VCard>
    <!-- Title -->
    <VCardItem>
      <VCardTitle class="text-h4 mb-3"> Create Lead </VCardTitle>
      <p class="text-muted">You can add leads in the system here.</p>
    </VCardItem>

    <VCardText>
      <LeadForm :is-full-page="true" />
    </VCardText>
  </VCard>
</template>
