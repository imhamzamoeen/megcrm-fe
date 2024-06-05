<script setup lang="ts">
import useApiFetch from "@/composables/useApiFetch";
import { useToast } from "@/plugins/toastr";
import { getExceptionMessage } from "@/utils/useHelper";
import { requiredValidator } from "@validators";

const file = ref() as any;
const uploadLeadForm = ref();
const loading = ref(false);
const isSuccess = ref(false);
const isError = ref(false);
const $toast: any = useToast();
const errorMessage: Ref<String> = ref("");

const handleFileUpload = async () => {
  uploadLeadForm.value?.validate().then(async (valid: any) => {
    if (valid.valid) {
      let formData = new FormData();

      formData.append("file", file.value[0], file.value[0].name);

      try {
        loading.value = true;
        isError.value = false;
        isSuccess.value = false;
        await useApiFetch("/leads/upload", {
          method: "POST",
          headers: {
            "Content-Type": "multipart/form-data",
          },
          data: formData,
        });

        $toast.success("File was uploaded successfully.");
        isSuccess.value = true;
        isError.value = false;
      } catch (e: any) {
        errorMessage.value = getExceptionMessage(e);
        $toast.error(errorMessage.value);
        isSuccess.value = false;
        isError.value = true;
      } finally {
        loading.value = false;
      }
    }
  });
};

watch(file, () => {
  loading.value = !file.value[0];
});
</script>

<template>
  <VForm ref="uploadLeadForm" @submit.prevent="handleFileUpload">
    <VRow>
      <VCol v-if="loading || isSuccess || isError" class="mb-2" cols="12">
        <VAlert v-if="loading" type="info">
          Please wait while the file is being uploaded. &nbsp;
          <span>
            <VProgressCircular indeterminate :size="20" color="#fff" />
          </span>
        </VAlert>

        <VAlert v-if="isSuccess" type="success">
          Your file was uploaded successfully. Please visit
          <router-link :to="{ name: 'leads' }">Leads</router-link> to view new
          leads.
        </VAlert>

        <VAlert v-if="isError" type="error">
          {{ errorMessage }}
        </VAlert>
      </VCol>

      <VCol cols="12">
        <VFileInput
          v-model="file"
          :loading="loading"
          :rules="[requiredValidator]"
          prepend-icon=""
          prepend-inner-icon="mdi-paperclip"
          color="primary"
          accept=".xlsx"
          label="Select an excel file..."
        />
      </VCol>

      <VCol cols="12">
        <VBtn
          type="submit"
          :loading="loading"
          :disabled="loading"
          color="primary"
        >
          Upload
          <VIcon end icon="mdi-cloud-upload-outline" />
        </VBtn>
      </VCol>
    </VRow>
  </VForm>
</template>
