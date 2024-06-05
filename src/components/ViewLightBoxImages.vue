<script setup lang="ts">
import { EventBus } from "@/utils/useEventBus";

const visible = ref(false);
const indexRef = ref(0);
const items = ref();

onMounted(() => {
  EventBus.$on("view-lightbox", ({ imgs, index = 0 }: any) => {
    items.value = imgs;
    indexRef.value = index;
    visible.value = true;
  });
});

onUnmounted(() => EventBus.$off("view-lightbox"));
</script>

<template>
  <VueEasyLightbox
    :visible="visible"
    :imgs="items"
    :index="indexRef"
    @hide="visible = false"
  />
</template>
