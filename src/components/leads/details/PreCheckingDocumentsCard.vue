<script setup lang="ts">
import { useToast } from "@/plugins/toastr";
import { useDropboxStore } from "@/stores/dropbox/useDropboxStore";
import { isImageFileName, renameFile } from "@/utils/useHelper";
import { useDropzone } from "vue3-dropzone";
import { EventBus } from "../../../utils/useEventBus";

interface Props {
  title: string;
  color?: string;
  icon: string;
}

const props = withDefaults(defineProps<Props>(), {
  color: "primary",
});

const $toast = useToast();
const isPdf = ref(false);
const isImage = ref(false);
const selectedFile = ref("");
const dbStore = useDropboxStore();
const onDrop = (acceptFiles: any, rejectReasons: any) => saveFiles(acceptFiles);
const { getRootProps, getInputProps, ...rest } = useDropzone({
  onDrop,
  accept: ["image/*", ".pdf"],
  multiple: false,
});

const onButtonClick = (type: string) => (selectedFile.value = type);

const saveFiles = async (files: any) => {
  if (selectedFile.value !== "") {
    await dbStore.store(
      dbStore.folder,
      "Pre Checking",

      renameFile(
        files[0],
        selectedFile.value === "Others"
          ? `${files[0].name.split(".").slice(0, -1).join(".")} `
          : selectedFile.value
      )
    );

    await dbStore.getPreCheckingFiles(dbStore.folder, true);
    selectedFile.value = "";
  }
};

const fileObject = computed(() => {
  return dbStore.precheckingDocuments.find(
    (i: any) => i.name.split(".")[0] === props.title ?? null
  );
});

const handleView = () => {
  if (isPdf.value) {
    EventBus.$emit("view-pdf", fileObject.value.link);
  } else if (isImage.value) {
    EventBus.$emit("view-lightbox", {
      imgs: fileObject.value.link,
    });
  } else {
    $toast.error("View not supported for this file.");
  }
};

const showOtherDocumentsDialog = () => {
  EventBus.$emit("view-other-documents-dialog");
};

watch(
  () => fileObject,
  (n) => {
    if (n.value && n?.value?.link) {
      if (n.value.name.includes(".pdf")) {
        isPdf.value = true;
        isImage.value = false;
      } else if (isImageFileName(n.value.name)) {
        isPdf.value = false;
        isImage.value = true;
      }
    }
  },
  { deep: true, immediate: true }
);
</script>

<template>
  <VCard>
    <VCardText class="d-flex align-center justify-space-between">
      <div class="d-flex align-center" :style="{ gap: 0 }">
        <VAvatar
          size="40"
          rounded
          :color="props.color"
          variant="tonal"
          class="me-4"
        >
          <VIcon :icon="props.icon" size="24" />
        </VAvatar>

        <span class="font-italic mt-2">{{ props.title }}</span>
      </div>

      <!-- View or Download Button -->
      <div v-if="fileObject?.link">
        <VTooltip v-if="isImage || isPdf">
          <template #activator="{ props }">
            <VBtn
              @click="handleView"
              v-bind="props"
              class="mr-2"
              size="small"
              color="secondary"
              icon="mdi-eye-outline"
            />
          </template>
          <span> Click to view file ( Only PDF are viewable ) </span>
        </VTooltip>
        <VTooltip>
          <template #activator="{ props }">
            <VBtn
              :href="fileObject.link"
              v-bind="props"
              size="small"
              color="info"
              icon="mdi-download-outline"
            />
          </template>
          <span> Click to download file </span>
        </VTooltip>
      </div>

      <!-- Upload Button -->
      <div v-else>
        <div v-if="true" v-bind="getRootProps()">
          <input v-bind="getInputProps()" />
          <VTooltip>
            <template #activator="{ props }">
              <VBtn
                @click="onButtonClick(title)"
                v-bind="props"
                size="small"
                color="primary"
                :disabled="dbStore.loading"
                :loading="dbStore.loading"
                icon="mdi-upload-outline"
              />
            </template>
            <span>
              This file will be automatically named as {{ props.title }}
            </span>
          </VTooltip>
        </div>
        <VTooltip v-else>
          <template #activator="{ props }">
            <VBtn
              @click="showOtherDocumentsDialog"
              v-bind="props"
              size="small"
              color="primary"
              :disabled="dbStore.loading"
              :loading="dbStore.loading"
              icon="mdi-upload-outline"
            />
          </template>
          <span> Add an custom attachment. </span>
        </VTooltip>
      </div>
    </VCardText>
  </VCard>
</template>
