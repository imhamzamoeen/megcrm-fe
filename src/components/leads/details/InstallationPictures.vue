<script lang="ts" setup>
import { ADDITIONAL } from "@/constants/general";
import { useDropboxStore } from "@/stores/dropbox/useDropboxStore";
import { useLeadsStore } from "@/stores/leads/useLeadsStore";
import { EventBus } from "@/utils/useEventBus";
import { isImageFileName, sleep } from "@/utils/useHelper";
import errorimage from "@images/custom/404.jpg";
import Compressor from "compressorjs";
import { useDropzone } from "vue3-dropzone";
import { strTruncated } from "../../../utils/useHelper";

const dbStore = useDropboxStore();
const filesUploaded = ref(0);
const selectedFilesLength = ref(0);
const isUploading = ref(false);
const leadsStore = useLeadsStore();
const panel = ref(0);
const selectedTags = ref<string[]>([]);
const subFolder = ref(null);
const newFolderName = ref(null);

const selectTag = (v: string) => {
  const index = selectedTags.value.indexOf(v);

  if (index !== -1) {
    selectedTags.value.splice(index, 1);
  } else {
    selectedTags.value.push(v);
  }
};

const filteredInstallationLabels = computed(() => {
  return ADDITIONAL.LEADS.INSTALLATION_IMAGE_LABELS.sort()
    .filter((additional) =>
      dbStore.installationFileNames.includes(
        `${leadsStore.selectedLead.reference_number} - ${additional}`
      )
    )
    .map((i: any) => {
      const count = dbStore.installationFileNames.filter((f: any) => {
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

const show = (image: any) => {
  if (isImageFileName(image.name)) {
    const toShow = dbStore.installationImages.map((i: any) => i.link);
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
  filesUploaded.value = 0;

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
              await dbStore.store(
                dbStore.folder,
                [null, ""].includes(subFolder.value)
                  ? "Installation"
                  : `Installation/${subFolder.value}`,
                result
              );
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
        dbStore.store(dbStore.folder, "Installation", file);
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
      setTimeout(() => {
        dbStore.getInstallationPictures(dbStore.folder);
      }, 2000);
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
  EventBus.$on("refresh-installation-pictures", () => {
    dbStore.getInstallationPictures(dbStore.folder);
  });

  //! IMPORTANT TO WAIT AS THE STORE IS STILL CHECKING FOR OLD DIRECTORY
  setTimeout(async () => {
    await dbStore.create(`${dbStore.folder}/Installation`);
    dbStore.getInstallationPictures(dbStore.folder);
  }, 500);
});

const filteredResults = computed(() => {
  if (selectedTags.value.length < 1) {
    return dbStore.installationImages;
  }

  return dbStore.installationImages.filter((image: any) =>
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
          Installation Pictures ( {{ dbStore.installationImages.length }} )
        </VCardTitle>
      </VCardItem>

      <VDivider />

      <VCardItem>
        <VRow>
          <VCol cols="12" class="mt-2">
            <VCombobox
              v-model="selectedTags"
              :items="filteredInstallationLabels"
              label="Selected Filters"
              item-title="title"
              item-value="value"
              clearable
              multiple
              chips
              density="compact"
            />
          </VCol>
        </VRow>
        <VRow v-if="!dbStore.loading || dbStore.installationImages.length > 0">
          <VCol cols="12" class="mt-2">
            <h6 class="text-h6">Missing Pictures</h6>
          </VCol>

          <template
            v-for="additional in ADDITIONAL.LEADS.INSTALLATION_IMAGE_LABELS.sort()"
          >
            <VCol
              cols="12"
              lg="2"
              v-if="
                !dbStore.installationFileNames.includes(
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

    <VRow
      v-if="filteredResults.filter((i: any) => !i?.folderName)
                .length > 0"
      class="py-4 mt-2"
    >
      <VCol cols="12">
        <VCardItem class="pa-0">
          <template #prepend>
            <VIcon icon="mdi-image-marker" class="text-disabled" />
          </template>

          <VCardTitle>
            Pictures not marked (
            {{ filteredResults.filter((i: any) => !i?.folderName).length }}
            )
          </VCardTitle>
        </VCardItem>
      </VCol>
    </VRow>

    <VRow class="mt-4">
      <VCol
        v-for="image in (filteredResults.filter((i:any) => !i.folderName) as any)"
        v-if="filteredResults.filter((i:any) => !i.folderName).length > 0"
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
                      height="300"
                      loading="lazy"
                    />
                  </VCol>
                </VRow>
              </div>
            </template>
            <span>Click to preview</span>
          </VTooltip>
          <VRow class="pa-4">
            <VCol cols="12" @click.stop>
              <MoveToFolderSelect :image="image" />
            </VCol>
          </VRow>
        </VCard>
      </VCol>
    </VRow>

    <VExpansionPanels class="mt-4" v-model="panel" multiple>
      <VExpansionPanel
        v-if="leadsStore.selectedLead.measures.length > 0"
        v-for="installation in leadsStore.selectedLead.installation_bookings"
        :key="installation.id"
      >
        <VExpansionPanelTitle>
          {{
            `${installation.name} ( ${
              filteredResults.filter(
                (i: any) => i?.folderName === installation.name
              ).length
            } )`
          }}
          <template v-slot:actions="{ expanded }">
            <div @click.stop>
              <VCol @click="subFolder = installation.name" cols="12">
                <div v-bind="getRootProps()">
                  <input v-bind="getInputProps()" />
                  <VTooltip>
                    <template #activator="{ props }">
                      <VBtn
                        :loading="dbStore.loading"
                        :disabled="dbStore.loading"
                        v-bind="props"
                        color="primary"
                        icon="mdi-upload"
                        density="compact"
                      />
                    </template>

                    <span>Upload files</span>
                  </VTooltip>
                </div>
              </VCol>
            </div>
          </template>
        </VExpansionPanelTitle>

        <VExpansionPanelText>
          <VRow>
            <VCol cols="12">
              <VCardTitle v-if="isUploading">
                <span>
                  Uploaded {{ filesUploaded }} / {{ selectedFilesLength }}
                </span>
              </VCardTitle>
            </VCol>
          </VRow>

          <VRow class="mt-4">
            <VCol
              v-if="filteredResults.filter(
                      (i: any) => i?.folderName === installation.name
                    ).length < 1"
              class="pa-0"
              cols="12"
            >
              <VCard flat title="No image(s) found." />
            </VCol>

            <VCol
              v-for="image in (filteredResults.filter(
                      (i: any) => i?.folderName === installation.name
                    ) as any)"
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

              <VCard flat v-else>
                <VTooltip>
                  <template #activator="{ props }">
                    <div v-bind="props">
                      <VRow @click="show(image)">
                        <VCol cols="12">
                          <!-- Image -->
                          <VImg
                            :src="`${
                              isImageFileName(image.name)
                                ? image.link
                                : errorimage
                            }`"
                            height="300"
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
                    <div style="flex-basis: 100%">
                      <rename-select-file-dialog
                        type="Installation Pictures"
                        :imageData="{
                          id: image.id,
                          fileName: image.name,
                          filePath: image.path_display,
                          folderName: image?.folderName,
                        }"
                      />
                    </div>
                  </VCol>
                </VRow>
              </VCard>
            </VCol>
          </VRow>
        </VExpansionPanelText>
      </VExpansionPanel>
      <VExpansionPanel
        v-else
        title="Please select measures to upload pictures."
      />
    </VExpansionPanels>
  </div>

  <!-- Dialogs-->
  <RenameFileDialog />
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
