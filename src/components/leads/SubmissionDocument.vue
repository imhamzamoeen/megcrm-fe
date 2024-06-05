<script lang="ts" setup>
import { useLeadsStore } from "@/stores/leads/useLeadsStore";
import { useDropzone } from "vue3-dropzone";
import { EventBus } from "../../utils/useEventBus";

const props = defineProps({
  title: {
    required: true,
    type: String,
  },
});

const store = useLeadsStore();

const selectedFile = ref("");

const onButtonClick = (type: string) => (selectedFile.value = type);
const onDrop = (acceptFiles: any, rejectReasons: any) => saveFiles(acceptFiles);
const { getRootProps, getInputProps, ...rest } = useDropzone({
  onDrop,
  accept: ["image/*", ".pdf"],
  multiple: false,
});

const draftLink: any = computed(() => {
  const record: any = store.selectedLead?.submission_documents?.find(
    (i: any) => i.name === `${props.title}-DRAFT`
  );

  if (!record) {
    return null;
  }

  return record;
});

const lodgedLink: any = computed(() => {
  const record: any = store.selectedLead?.submission_documents?.find(
    (i: any) => i.name === `${props.title}-LODGED`
  );

  if (!record) {
    return null;
  }

  return record;
});

const saveFiles = async (files: any) => {
  if (Array.isArray(files) && files.length > 0) {
    await store.saveDocumentToCollection(
      store.selectedLead.id,
      "submission_documents",
      files[0],
      selectedFile.value
    );

    EventBus.$emit("refresh-lead-data");
  }
};
</script>

<template>
  <tr>
    <td class="py-4" style="width: 80%">
      <p class="mb-0 font-italic">
        {{ title }}
      </p>
    </td>
    <td style="width: 10%">
      <div class="d-flex">
        <VTooltip v-if="draftLink?.original_url">
          <template #activator="{ props }">
            <VBtn
              :href="draftLink.original_url"
              target="_blank"
              v-bind="props"
              size="small"
              color="info"
              icon="mdi-eye-outline"
              :loading="store.isLoading"
              :disabled="store.isLoading"
            />
          </template>
          <span> Click to download file </span>
        </VTooltip>
        <div v-bind="getRootProps()">
          <input v-bind="getInputProps()" />
          <VTooltip>
            <template #activator="{ props }">
              <VBtn
                @click="onButtonClick(`${title}-DRAFT`)"
                v-bind="props"
                size="small"
                color="primary"
                icon="mdi-upload-outline"
                :loading="store.isLoading"
                :disabled="store.isLoading"
              />
            </template>
            <span>
              This file will be automatically named as {{ `${title}-DRAFT` }}
            </span>
          </VTooltip>
        </div>
      </div>
    </td>
    <td style="width: 10%">
      <div class="d-flex">
        <VTooltip v-if="lodgedLink?.original_url">
          <template #activator="{ props }">
            <VBtn
              :href="lodgedLink.original_url"
              target="_blank"
              v-bind="props"
              size="small"
              color="info"
              icon="mdi-eye-outline"
              :loading="store.isLoading"
              :disabled="store.isLoading"
            />
          </template>
          <span> Click to download file </span>
        </VTooltip>

        <div v-bind="getRootProps()">
          <input v-bind="getInputProps()" />
          <VTooltip>
            <template #activator="{ props }">
              <VBtn
                @click="onButtonClick(`${title}-LODGED`)"
                v-bind="props"
                size="small"
                color="#28A44D"
                class="text-white"
                icon="mdi-upload-outline"
                :loading="store.isLoading"
                :disabled="store.isLoading"
              />
            </template>
            <span>
              This file will be automatically named as {{ `${title}-LODGED` }}
            </span>
          </VTooltip>
        </div>
      </div>
    </td>
  </tr>
</template>
