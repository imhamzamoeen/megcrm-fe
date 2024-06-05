<script lang="ts" setup>
import { ADDITIONAL } from "@/constants/general";
import { useDropboxStore } from "@/stores/dropbox/useDropboxStore";
import { useLeadsStore } from "@/stores/leads/useLeadsStore";
import { EventBus } from "@/utils/useEventBus";
import { getExtension } from "@/utils/useHelper";

const props = defineProps({
  type: {
    type: String,
    default: () => "Survey Pictures",
  },
  imageData: {
    type: Object,
    required: true,
  },
});

const isLoading = ref(false);
const store = useDropboxStore();
const leadsStore = useLeadsStore();
const name: any = ref(null);
const oldName: any = ref(null);
const path: any = ref(null);
const ext: any = ref("");
const actualName: any = ref("");

const handleSubmit: any = async () => {
  isLoading.value = true;

  const nameWithExtension = `${name.value}.${ext.value}`;

  const response = await store.renameFile(
    path.value,
    path.value.replace(
      oldName.value,
      `${
        leadsStore.selectedLead.reference_number
      } - ${nameWithExtension.replace(
        `${leadsStore.selectedLead.reference_number} - `,
        ""
      )}`
    )
  );

  if (props.type === "Survey Pictures") {
    const entryIndex = store.folderImages.findIndex(
      (i: any) => i.id === props.imageData.id
    );

    if (entryIndex !== -1) {
      store.folderImages[entryIndex] = response;
    }

    EventBus.$emit("refresh-survey-pictures");
  } else {
    const entryIndex = store.installationImages.findIndex(
      (i: any) => i.id === props.imageData.id
    );

    if (entryIndex !== -1) {
      if (props.imageData?.folderName) {
        store.installationImages[entryIndex] = {
          ...response,
          folderName: props.imageData?.folderName,
        };
      } else {
        store.installationImages[entryIndex] = response;
      }
    }

    EventBus.$emit("refresh-installation-pictures");
  }
};

function removeRenameCountAndExtension(filename: string) {
  // Regular expression to match the rename count enclosed in parentheses at the end of the string
  const renameCountRegex = /\s*\(\d+\)\.[^.]+$/;
  // Remove the rename count
  let cleanedFilename = filename.replace(renameCountRegex, "");

  // Regular expression to match the file extension
  const extensionRegex = /\.[^.]+$/;
  // Remove the file extension
  cleanedFilename = cleanedFilename.replace(extensionRegex, "");

  return cleanedFilename;
}

onMounted(() => {
  ext.value = getExtension(props.imageData.fileName);
  actualName.value = props.imageData.fileName
    .replace(`${leadsStore.selectedLead.reference_number} - `, "")
    .replace(`.${ext.value}`, "");

  oldName.value = props.imageData.fileName;
  path.value = props.imageData.filePath;

  name.value = removeRenameCountAndExtension(
    props?.imageData?.fileName
  ).replace(`${leadsStore.selectedLead.reference_number} - `, "");

  if (!dropdownOptions.value.includes(name.value)) {
    name.value = "";
  }
});

const dropdownOptions = computed(() => {
  if (props.type === "Survey Pictures") {
    return ADDITIONAL.LEADS.SURVEY_IMAGE_LABELS.sort((a, b) =>
      a.toLowerCase().localeCompare(b.toLowerCase())
    );
  }

  return ADDITIONAL.LEADS.INSTALLATION_IMAGE_LABELS.sort((a, b) =>
    a.toLowerCase().localeCompare(b.toLowerCase())
  );
});
</script>

<template>
  <VCol class="pa-0" cols="12">
    <select v-model="name" @change="handleSubmit">
      <option value="" disabled>Select an option</option>
      <option v-for="option in dropdownOptions" :value="option" :key="option">
        {{ option === name ? actualName : option }}
      </option>
    </select>
  </VCol>
</template>

<style lang="scss" scoped>
select {
  padding: 6px;
  padding-inline: 12px;
  border: 1px solid #7a7979;
  width: 100%;
  height: 100%;
  border-radius: 10px;
  background: #fafafa;
}
</style>
