<script lang="ts" setup>
import { ADDITIONAL } from "@/constants/general";
import { useDropboxStore } from "@/stores/dropbox/useDropboxStore";
import { useLeadsStore } from "@/stores/leads/useLeadsStore";
import { EventBus } from "@/utils/useEventBus";
import { isImageFileName, sleep, strTruncated } from "@/utils/useHelper";
import errorimage from "@images/custom/404.jpg";
import Compressor from "compressorjs";
import { useDropzone } from "vue3-dropzone";

const dbStore = useDropboxStore();
const leadsStore = useLeadsStore();
const filesUploaded = ref(0);
const selectedFilesLength = ref(0);
const isUploading = ref(false);
const selectedTags = ref<string[]>([]);

const show = (image: any) => {
  if (isImageFileName(image.name)) {
    const toShow = dbStore.folderImages.map((i: any) => i.link);
    const index = toShow.indexOf(image.link);

    EventBus.$emit("view-lightbox", {
      imgs: toShow,
      index: index !== -1 ? index : 0,
    });
  } else {
    window.open(image.link, "_blank");
  }
};

async function uploadFilesSequentially(files: any) {
  for (const file of files) {
    if (!file) {
      continue;
    }

    // Check if the file is an image
    if (file.type.startsWith("image/")) {
      new Promise((resolve, reject) => {
        new Compressor(file, {
          quality: 0.4,
          async success(result) {
            try {
              await dbStore.store(dbStore.folder, "Survey", result);
              filesUploaded.value++;
              resolve(result);
            } catch (error) {
              reject(error);
            }
          },
          error(err) {
            console.log(err.message);
            reject(err);
          },
        });
      });

      await sleep(1000);
    } else {
      try {
        dbStore.store(dbStore.folder, "Survey", file);
        filesUploaded.value++;
      } catch (error) {
        console.error("Error uploading file:", error);
      }

      await sleep(1000);
    }
  }
}

const saveFiles = async (files: any) => {
  isUploading.value = true;
  selectedFilesLength.value = files.length;

  uploadFilesSequentially(files)
    .then(async () => {
      await leadsStore.updateStatus({
        leadId: leadsStore.selectedLead.id,
        status: "Survey Done",
        comments: "All files were uploaded to dropbox.",
      });

      setTimeout(() => {
        dbStore.index(dbStore.folder);
      }, 1000);
    })
    .catch((error) => {
      console.error("Error uploading files:", error);
    })
    .finally(() => {
      //
    });
};

const onDrop = (acceptFiles: any, rejectReasons: any) => saveFiles(acceptFiles);

const { getRootProps, getInputProps, ...rest } = useDropzone({
  onDrop,
  accept: ["image/*", "video/*", "application/pdf"],
});

onMounted(async () => {
  EventBus.$on("refresh-survey-pictures", () => {
    dbStore.index(dbStore.folder);
  });

  //! IMPORTANT TO WAIT AS THE STORE IS STILL CHECKING FOR OLD DIRECTORY
  setTimeout(async () => {
    await dbStore.create(`${dbStore.folder}/Survey`);
    await dbStore.index(dbStore.folder);
  }, 500);
});
const filteredSurveyImageLabels = computed(() => {
  return ADDITIONAL.LEADS.SURVEY_IMAGE_LABELS.sort()
    .filter((additional) =>
      dbStore.surveyFileNames.includes(
        `${leadsStore.selectedLead.reference_number} - ${additional}`
      )
    )
    .map((i: any) => {
      const count = dbStore.surveyFileNames.filter((f: any) => {
        const newName = f.replace(
          `${leadsStore.selectedLead.reference_number} - `,
          ""
        );

        return newName.startsWith(i);
      }).length;

      return {
        title: `${i} ( ${count} )`,
        value: i,
      };
    });
});
onUnmounted(() => {
  EventBus.$off("refresh-survey-pictures");
});

const filteredResults = computed(() => {
  if (selectedTags.value.length < 1) {
    return dbStore.folderImages;
  }

  return dbStore.folderImages.filter((image: any) =>
    selectedTags.value.some((item: any) => image.name.includes(item.value))
  );
});
</script>

<template>
  <div>
    <VCard>
      <VCardItem class="py-2 px-4">
        <template #prepend>
          <VIcon icon="mdi-image-marker" class="text-disabled" />
        </template>

        <VCardTitle>
          Survey Pictures ( {{ dbStore.folderImages.length }} )
        </VCardTitle>

        <template #append>
          <div class="me-n3 mt-n2">
            <VCol cols="12">
              <div v-bind="getRootProps()">
                <input v-bind="getInputProps()" />
                <VTooltip>
                  <template #activator="{ props }">
                    <VBtn
                      :loading="dbStore.loading"
                      :disabled="dbStore.loading"
                      v-bind="props"
                      color="primary"
                      icon="mdi-upload-outline"
                    />
                  </template>

                  <span>Upload files</span>
                </VTooltip>
              </div>
            </VCol>
          </div>
        </template>
      </VCardItem>

      <VCardTitle v-if="isUploading">
        <span> Uploaded {{ filesUploaded }} / {{ selectedFilesLength }} </span>
      </VCardTitle>

      <VDivider />

      <VCardItem>
        <VRow>
          <VCol cols="12" class="mt-2">
            <VCombobox
              v-model="selectedTags"
              :items="filteredSurveyImageLabels"
              item-title="title"
              item-value="value"
              label="Selected Filters"
              clearable
              multiple
              chips
              density="compact"
            />
          </VCol>
        </VRow>
        <VRow v-if="!dbStore.loading || dbStore.folderImages.length > 0">
          <VCol cols="12" class="mt-2">
            <h6 class="text-h6">Missing Pictures</h6>
          </VCol>

          <template
            v-for="additional in ADDITIONAL.LEADS.SURVEY_IMAGE_LABELS.sort()"
          >
            <VCol
              cols="12"
              lg="2"
              v-if="
                !dbStore.surveyFileNames.includes(
                  `${leadsStore.selectedLead.reference_number} - ${additional}`
                )
              "
            >
              <VTooltip>
                <template #activator="{ props }">
                  <VChip
                    class="ring"
                    v-bind="props"
                    color="error"
                    variant="flat"
                  >
                    {{ strTruncated(additional) }}
                  </VChip>
                </template>
                <span> {{ additional }} Missing </span>
              </VTooltip>
            </VCol>
          </template>
        </VRow>
      </VCardItem>
    </VCard>

    <VRow class="mt-4">
      <VCol v-if="filteredResults.length < 1" cols="12">
        <VCard title="No image(s) found." />
      </VCol>

      <VCol
        v-for="image in (filteredResults as any)"
        v-else
        :key="image.id"
        class="image-card px-3"
        cols="12"
        sm="6"
        md="3"
      >
        <div v-if="image.link === undefined">
          <Skeleton height="2rem" class="mb-2" borderRadius="16px" />

          <VCardText class="position-relative">
            <VCardTitle>
              <Skeleton width="5rem" borderRadius="16px" class="mb-2" />
            </VCardTitle>
          </VCardText>
        </div>
        <VCard v-else>
          <VTooltip>
            <template #activator="{ props }">
              <div v-bind="props">
                <VRow @click="show(image)">
                  <VCol cols="12">
                    <!-- Image -->
                    <VImg
                      :src="`${
                        isImageFileName(image.name) ? image.link : errorimage
                      }`"
                      height="350"
                      loading="lazy"
                    />
                  </VCol>
                </VRow>
              </div>
            </template>
            <span>Click to preview</span>
          </VTooltip>
          <VRow>
            <VCol
              class="d-flex justify-start align-center pa-3"
              cols="12"
              @click.stop
            >
              <div style="flex-basis: 100%; padding: 10px">
                <rename-select-file-dialog
                  :imageData="{
                    id: image.id,
                    fileName: image.name,
                    filePath: image.path_display,
                  }"
                />
              </div>
            </VCol>
          </VRow>
        </VCard>
      </VCol>
    </VRow>
  </div>
</template>

<style lang="scss" scoped>
/* stylelint-disable-next-line selector-pseudo-class-no-unknown */
:deep(.image-card img) {
  object-fit: fill !important;
}

.image-card {
  padding-inline: 4px 4px;

  :hover {
    cursor: pointer;
  }
}
</style>
