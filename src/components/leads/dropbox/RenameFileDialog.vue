<script lang="ts" setup>
import { ADDITIONAL } from "@/constants/general";
import { useDropboxStore } from "@/stores/dropbox/useDropboxStore";
import { useLeadsStore } from "@/stores/leads/useLeadsStore";
import { EventBus } from "@/utils/useEventBus";
import { getExtension } from "@/utils/useHelper";
import { requiredValidator } from "@validators";

const store = useDropboxStore();
const leadsStore = useLeadsStore();
const name: any = ref(null);
const oldName: any = ref(null);
const path: any = ref(null);
const ext: any = ref("");
const formRef = ref();
const isDialogVisible = ref(false);

const reset = () => {
  name.value = null;
  path.value = null;
  oldName.value = null;
  ext.value = "";
};

const closeDialog = () => {
  isDialogVisible.value = false;
  reset();
};

const handleSubmit = async () => {
  formRef.value.validate().then(async (v: any) => {
    if (v.valid) {
      const nameWithExtension = `${name.value}.${ext.value}`;

      await store.renameFile(
        path.value,
        path.value.replace(
          oldName.value,
          `${
            leadsStore.selectedLead.reference_number
          } - ${nameWithExtension.replace(
            `${leadsStore.selectedLead.reference_number} - `,
            ""
          )}`
        ),
        nameWithExtension
      );

      store.folderImages = store.folderImages.filter(
        (image: any) => image.name !== oldName.value.split(".")[0]
      );

      EventBus.$emit("refresh-survey-pictures");
      closeDialog();
    }
  });
};

onMounted(() => {
  EventBus.$on(
    "show-dropbox-rename-dialog",
    (data: { fileName: string; filePath: string }) => {
      ext.value = getExtension(data.fileName);
      oldName.value = data.fileName;
      name.value = data.fileName.replace(`.${ext.value}`, "");
      path.value = data.filePath;

      isDialogVisible.value = true;
    }
  );
});

onUnmounted(() => {
  EventBus.$off("show-dropbox-rename-dialog");
});
</script>

<template>
  <VDialog
    :width="$vuetify.display.smAndDown ? 'auto' : 600"
    :model-value="isDialogVisible"
    @update:model-value="closeDialog"
    persistent
  >
    <!-- Dialog close btn -->
    <DialogCloseBtn @click="closeDialog" />

    <VCard class="pa-sm-8 pa-5">
      <!-- Title -->
      <VCardItem class="text-center">
        <VCardTitle class="text-h4 mb-3"> Rename File </VCardTitle>
      </VCardItem>

      <VForm ref="formRef" @submit.prevent="handleSubmit">
        <VCol cols="12">
          <VCombobox
            v-model="name"
            :rules="[requiredValidator]"
            :items="ADDITIONAL.LEADS.SURVEY_IMAGE_LABELS"
            label="Name"
            placeholder="File Name"
            clearable
            required
          />
        </VCol>

        <VCol cols="12">
          <div class="d-flex align-center gap-3 mt-6">
            <VBtn
              type="submit"
              :disabled="store.loading"
              :loading="store.loading"
            >
              Rename File
            </VBtn>

            <VBtn color="secondary" variant="tonal" @click="closeDialog">
              Cancel
            </VBtn>
          </div>
        </VCol>
      </VForm>
    </VCard>
  </VDialog>
</template>
