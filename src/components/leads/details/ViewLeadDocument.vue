<script lang="ts" setup>
import { EventBus } from "@/utils/useEventBus";

const isDialogVisible = ref(false);
const localLink: any = ref(null);

  onMounted(() => {
  EventBus.$on("view-pdf", (link: string) => {
    localLink.value = link;
    isDialogVisible.value = true;
  });
});

onUnmounted(() => {
  EventBus.$off("view-pdf");
});
</script>

<template>
  <VDialog
    :width="$vuetify.display.smAndDown ? 'auto' : 1100"
    :model-value="isDialogVisible"
    persistent
  >
    <!-- Dialog close btn -->
    <DialogCloseBtn @click="isDialogVisible = false" />

    <VCard class="pa-sm-8 pa-5">
      <VCardText>
        <VuePdfEmbed :source="localLink" />
      </VCardText>
    </VCard>
  </VDialog>
</template>
