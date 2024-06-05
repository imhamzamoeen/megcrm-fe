<script setup lang="ts">
import { useUsersStore } from "@/stores/users/useUsersStore";
import { useDropzone } from "vue3-dropzone";

interface Props {
  title: string;
  color?: string;
  icon: string;
  hasExpiry: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  color: "primary",
});

const store: any = useUsersStore();
const expiry = ref(null);
const selectedFile = ref("");
const onDrop = (acceptFiles: any, rejectReasons: any) => saveFiles(acceptFiles);
const { getRootProps, getInputProps, ...rest } = useDropzone({
  onDrop,
  accept: ["image/*", ".pdf"],
  multiple: false,
});

const link: any = computed(() => {
  const record: any = store.selected.company_documents.find(
    (i: any) => i.name === props.title
  );

  if (!record) {
    return null;
  }

  if (record?.custom_properties?.expiry) {
    expiry.value = record.custom_properties.expiry;
  }

  return record;
});

const onButtonClick = (type: string) => (selectedFile.value = type);

const saveFiles = async (files: any) => {
  if (Array.isArray(files) && files.length > 0) {
    await store.saveDocumentToCollection(
      store.selected.id,
      "company-documents",
      files[0],
      props.title,
      expiry.value
    );

    await store.update(store.selectedId, store.selected);
  }
};

watch(
  () => expiry.value,
  async (n) => {
    if (link?.value?.id) {
      if (
        link?.value?.custom_properties?.expiry &&
        link.value.custom_properties.expiry !== n
      ) {
        await store.updateExpiryDate(link.value.id, n);
      }
    }
  }
);
</script>

<template>
  <div class="rounded-lg mt-2" :style="{ background: 'floralwhite' }">
    <VForm>
      <VRow class="mb-0">
        <VCol cols="12">
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

            <!-- Upload or Download Buttons -->
            <div class="d-flex">
              <VTooltip v-if="link?.original_url">
                <template #activator="{ props }">
                  <VBtn
                    :href="link.original_url"
                    target="_blank"
                    v-bind="props"
                    size="small"
                    color="info"
                    icon="mdi-download-outline"
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
                      @click="onButtonClick(title)"
                      v-bind="props"
                      size="small"
                      color="primary"
                      icon="mdi-upload-outline"
                      :loading="store.isLoading"
                      :disabled="store.isLoading || (hasExpiry && !expiry)"
                    />
                  </template>
                  <span>
                    This file will be automatically named as {{ props.title }}
                  </span>
                </VTooltip>
              </div>
            </div>
          </VCardText>
        </VCol>
      </VRow>

      <VRow class="pa-4 mt-0" v-if="hasExpiry">
        <VCol cols="12">
          <VTextField
            label="Expiry"
            placeholder="Select document expiry"
            v-model="expiry"
            type="date"
          />
        </VCol>
      </VRow>
    </VForm>
  </div>
</template>
