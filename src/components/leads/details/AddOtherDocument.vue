<script lang="ts" setup>
import { useToast } from "@/plugins/toastr";
import { useDropboxStore } from "@/stores/dropbox/useDropboxStore";
import { useLeadsStore } from "@/stores/leads/useLeadsStore";
import { EventBus } from "@/utils/useEventBus";
import { renameFile } from "@/utils/useHelper";
import { requiredValidator } from "@validators";
import { useDropzone } from "vue3-dropzone";

const $toast = useToast();
const isDialogVisible = ref(false);
const store = useLeadsStore();
const dbStore = useDropboxStore();
const formRef = ref();
const name: any = ref(null);

const onDrop = (acceptFiles: any, rejectReasons: any) => saveFile(acceptFiles);
const { getRootProps, getInputProps, ...rest } = useDropzone({
  onDrop,
  accept: ["image/*", ".pdf"],
  multiple: false,
});

const saveFile = async (files: any) => {
  if (Array.isArray(files) && files.length > 0) {
    try {
      await dbStore.store(
        dbStore.folder,
        "Pre Checking",
        renameFile(files[0], name.value)
      );

      await dbStore.getPreCheckingFiles(dbStore.folder, true);

      name.value = null;
      isDialogVisible.value = false;
      $toast.success("File was uploaded successfully.");
    } catch (e: any) {
      $toast.error(e.message);
    }
  }
};

onMounted(() => {
  EventBus.$on(
    "view-other-documents-dialog",
    () => (isDialogVisible.value = true)
  );
});

onUnmounted(() => {
  EventBus.$off("view-other-documents-dialog");
});
</script>

<template>
  <VDialog
    :width="$vuetify.display.smAndDown ? 'auto' : 900"
    :model-value="isDialogVisible"
    @update:model-value="isDialogVisible = false"
    persistent
  >
    <!-- Dialog close btn -->
    <DialogCloseBtn @click="isDialogVisible = false" />

    <VCard class="pa-sm-8 pa-5">
      <!-- Title -->
      <VCardItem class="text-center">
        <VCardTitle class="text-h4 mb-3"> Add New Attachment </VCardTitle>
      </VCardItem>

      <VForm ref="formRef">
        <VCol cols="12">
          <VCombobox
            v-model="name"
            :rules="[requiredValidator]"
            :items="store.benefitTypes"
            label="Benefit Types"
            placeholder="Select Benefit"
            item-title="name"
            item-value="name"
            clearable
            required
            :return-object="false"
          />
        </VCol>

        <VCol cols="12">
          <div class="d-flex align-center gap-3 mt-6">
            <div v-if="name" v-bind="getRootProps()">
              <input v-bind="getInputProps()" />
              <VBtn :disabled="dbStore.loading" :loading="dbStore.loading">
                Upload File
              </VBtn>
            </div>

            <VBtn
              color="secondary"
              variant="tonal"
              @click="isDialogVisible = false"
            >
              Cancel
            </VBtn>
          </div>
        </VCol>
      </VForm>
    </VCard>
  </VDialog>
</template>
