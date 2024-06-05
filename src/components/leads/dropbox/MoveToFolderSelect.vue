<script lang="ts" setup>
import { useDropboxStore } from "@/stores/dropbox/useDropboxStore";
import { useLeadsStore } from "@/stores/leads/useLeadsStore";
import { EventBus } from "@/utils/useEventBus";

const props = defineProps(["image"]);

const leadsStore: any = useLeadsStore();
const store = useDropboxStore();
const name = ref(null);

const updateFolder = async () => {
  const regex = /\/installation\//i;
  const newPathDisplay = props.image.path_display.replace(
    regex,
    `/Installation/${name.value}/`
  );
  const response = await store.renameFile(
    props.image.path_display,
    newPathDisplay
  );

  const entryIndex = store.installationImages.findIndex(
    (i: any) => i.id === props.image.id
  );

  if (entryIndex !== -1) {
    store.installationImages[entryIndex] = {
      ...response,
      folderName: name.value,
    };
  }

  EventBus.$emit("refresh-installation-pictures");
};
</script>

<template>
  <VSelect
    v-model="name"
    :items="leadsStore.selectedLead.installation_bookings"
    item-value="name"
    item-title="name"
    placeholder="Select folder to move"
    density="compact"
    @update:modelValue="updateFolder"
  />
</template>
