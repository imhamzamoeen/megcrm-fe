<script setup lang="ts">
import useApiFetch from "@/composables/useApiFetch";
import { useToast } from "@/plugins/toastr";
import { getExceptionMessage } from "@/utils/useHelper";
import { requiredValidator } from "@validators";

const file: any = ref();
const uploadDataMatchResultForm = ref();
const loading = ref(false);
const isSuccess = ref(false);
const fileDownloadLink = ref(null);
const isError = ref(false);
const responseMessage = ref("");
const FailedLeads: any = ref(null);
const $toast: any = useToast();
const errorMessage: Ref<String> = ref("");

const downloadFailedLeadFiles = () => {
  if (fileDownloadLink.value) {
    window.open(fileDownloadLink.value, "_blank").focus();
  }
};
const handleFileUpload = async () => {
  uploadDataMatchResultForm.value?.validate().then(async (valid: any) => {
    if (valid.valid) {
      let formData = new FormData();

      formData.append("file", file.value[0], file.value[0].name);

      try {
        loading.value = true;
        isError.value = false;
        isSuccess.value = false;
        const { data: response, message: link } = await useApiFetch(
          "/leads-datamatch-upload",
          {
            method: "POST",
            headers: {
              "Content-Type": "multipart/form-data",
            },
            data: formData,
          }
        );
        FailedLeads.value = response.failedLeads;
        responseMessage.value = `File was uploaded successfully and updated ${
          response?.data?.totalUploadedRows ?? 0
        } leads .`;
        fileDownloadLink.value = link;
        $toast.success(
          `File was uploaded successfully and updated ${
            response?.data?.totalUploadedRows ?? 0
          } leads .`
        );
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

// watch(file, () => {
//   loading.value = !file.value[0];
// });
</script>

<template>
  <VRow>
    <VCol cols="12">
      <VCard class="leads-card">
        <VCardTitle class="pl-4 pr-4 mt-3 mb-2">
          <VRow class="text-layout">
            <VCol
              cols="12"
              lg="6"
              :class="$vuetify.display.lgAndUp ? 'text-left' : 'text-center'"
            >
              <h6 class="text-h5">Upload Data Match Results</h6>
            </VCol>
          </VRow>
        </VCardTitle>

        <VCardText>
          <VForm
            ref="uploadDataMatchResultForm"
            @submit.prevent="handleFileUpload"
          >
            <VRow>
              <VCol
                v-if="loading || isSuccess || isError"
                class="mb-2"
                cols="12"
              >
                <VAlert v-if="loading" type="info">
                  Please wait while the file is being uploaded. &nbsp;
                  <span>
                    <VProgressCircular indeterminate :size="20" color="#fff" />
                  </span>
                </VAlert>

                <VAlert v-if="isSuccess" type="success">
                  Your file was uploaded successfully. Please visit
                  <router-link :to="{ name: 'leads' }">Leads</router-link> to
                  view new leads.
                </VAlert>

                <VAlert v-if="isError" type="error">
                  {{ errorMessage }}
                </VAlert>

                <VAlert v-if="responseMessage" type="info">
                  {{ responseMessage }}
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
                  accept=".csv"
                  label="Select a csv file..."
                />
              </VCol>

              <VCol cols="12">
                <VRow>
                  <VCol cols="11">
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
                  <VCol cols="1" v-if="fileDownloadLink">
                    <VTooltip location="bottom">
                      <template #activator="{ props }">
                        <IconBtn
                          @click="downloadFailedLeadFiles()"
                          v-bind="props"
                        >
                          <VIcon color="success" icon="tabler-download" />
                        </IconBtn>
                      </template>
                      <span> Download the Failed updated Leads </span>
                    </VTooltip>
                  </VCol>
                </VRow>
              </VCol>

              <VCol cols="12" v-if="FailedLeads">
                <VRow>
                  <VCol cols="12">
                    <VTable class="mt-4" fixed-header>
                      <thead>
                        <tr>
                          <th class="text-uppercase">Name</th>
                          <th class="text-uppercase">PostCode</th>
                          <th class="text-uppercase">Addres</th>
                          <th class="text-uppercase">DOB</th>
                          <th class="text-uppercase">Property Number</th>
                          <th class="text-uppercase">
                            Eco Verification Status
                          </th>
                        </tr>
                      </thead>
                      <tbody class="text-high-emphasis">
                        <tr v-for="(lead, index) in (FailedLeads as any)">
                          <td>
                            <p class="font-weight-bold">
                              {{ lead?.forename + " " + lead?.surname }}
                            </p>
                          </td>
                          <td>
                            <p class="font-weight-medium">
                              {{ lead?.postcode }}
                            </p>
                          </td>
                          <td>
                            <p class="font-weight-medium">
                              {{ lead?.address_line_1 }}
                            </p>
                          </td>
                          <td>
                            <p class="font-weight-medium">
                              {{ lead?.date_of_birth }}
                            </p>
                          </td>
                          <td>
                            <p class="text-button font-italic">
                              {{ lead?.property_name_or_number }}
                            </p>
                          </td>
                          <td>
                            <p class="text-button font-italic">
                              {{ lead?.eco_4_verification_status }}
                            </p>
                          </td>
                        </tr>
                      </tbody>
                    </VTable>
                  </VCol>
                </VRow>
              </VCol>
            </VRow>
          </VForm>
        </VCardText>
      </VCard>
    </VCol>
  </VRow>
</template>
