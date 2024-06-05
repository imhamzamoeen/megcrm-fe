<script lang="ts" setup>
import env from "@/constants/env";
import { useToast } from "@/plugins/toastr";
import { useLeadsStore } from "@/stores/leads/useLeadsStore";
import { EventBus } from "@/utils/useEventBus";
import { getExtension, getFileName, isImageFileName } from "@/utils/useHelper";
const { VITE_APP_API_URL: BASE_URL } = env;

const isLoading: boolean = ref(false);
const SelectedImage: any = ref("");
const toast = useToast();
const store = useLeadsStore();

const show = (image: any) => {
  if (isImageFileName(image)) {
    EventBus.$emit("view-lightbox", {
      imgs: image,
      index: 0,
    });
  } else {
    window.open(image.link, "_blank");
  }
};

const documentsMerged = computed(() => {
  // Merge the two arrays using the spread operator
  return [
    ...store.selectedLead?.customer_support_images,
    ...store.selectedLead?.customer_support_documents,
  ];
});

const downloadImage = async (image: any) => {
  try {
    isLoading.value = true;
    SelectedImage.value = image;

    const customerSupportImages =
      store.selectedLead?.customer_support_images || [];
    const customerSupportDocuments =
      store.selectedLead?.customer_support_documents || [];
    let whichArray = null;
    // Find the index in customer_support_images
    const indexInImages = customerSupportImages?.findIndex(
      (item) => item === image
    );
    let index = null;
    if (indexInImages !== -1) {
      whichArray = "customer_support_images_ids";
      index = indexInImages;
      console.log(
        `Image URL found in customer_support_images at index: ${indexInImages}`
      );
    } else {
      // If not found in customer_support_images, search in customer_support_documents
      const indexInDocuments = customerSupportDocuments.findIndex(
        (item) => item === image
      );

      if (indexInDocuments !== -1) {
        whichArray = "customer_support_documents_ids";
        index = indexInDocuments;

        console.log(
          `Image URL found in customer_support_documents at index: ${indexInDocuments}`
        );
      } else {
        console.log(
          "Image URL not found in either customer_support_images or customer_support_documents"
        );
      }
    }

    let uuidToFetch = store.selectedLead[whichArray][index];
    const outputFilePath = "Downloads"; // Path where you want to save the downloaded file
    const extension = getExtension(image); // Example file extension

    // Fetch the blob using your API function

    // Add the query parameter to the base URL
    const urlWithQuery = BASE_URL + `/file-load/${uuidToFetch}?download=true`;

    // Open the URL in a new tab
    window.open(urlWithQuery, "_blank");
  } catch (error) {
    toast.error("Error downloading file");
    console.error("Error downloading image:", error);
  } finally {
    isLoading.value = false;
    SelectedImage.value = "";
  }
};

onMounted(async () => {});

onUnmounted(() => {});
</script>

<template>
  <div>
    <VRow class="mt-4">
      <VCol v-if="documentsMerged.length < 1" cols="12">
        <VCard title="No Documents Found" />
      </VCol>

      <VCol
        v-for="(image, index) in documentsMerged"
        :key="index"
        class="image-card px-3"
        cols="12"
        sm="6"
        md="3"
      >
        <VCard v-if="['jpeg', 'jpg', 'png'].includes(getExtension(image))">
          <VTooltip>
            <template #activator="{ props }">
              <div v-bind="props">
                <VRow @click="show(image)">
                  <VCol cols="12">
                    <!-- Image -->
                    <VImg
                      :src="`${image}`"
                      height="500"
                      width="500"
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
              <div style="display: flex; align-items: center">
                <!-- First child (80% width) for the name of the file -->
                <div style="flex-basis: 70%; padding: 10px">
                  <span>{{ getFileName(image) }}</span>
                </div>

                <!-- Second child (20% width) for download button or loader -->
                <div style="flex-basis: 20%; padding: 10px">
                  <VIcon
                    v-if="!isLoading && SelectedImage != image"
                    color="error"
                    icon="tabler-download"
                    @click.stop="downloadImage(image)"
                  />
                  <VProgressCircular
                    v-if="isLoading && SelectedImage == image"
                    size="24"
                    color="info"
                    indeterminate
                  />
                </div>
              </div>
            </VCol>
          </VRow>
        </VCard>
        <VCard v-else>
          <VTooltip>
            <template #activator="{ props }">
              <div v-bind="props">
                <VRow>
                  <VCol cols="12">
                    <!-- Image -->
                    <VImg
                      :src="
                        ['txt', 'pdf', 'xlsx'].includes(getExtension(image))
                          ? '/' + getExtension(image) + '.png'
                          : '/default.jpg'
                      "
                      height="500"
                      width="500"
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
              <div style="display: flex; align-items: center">
                <!-- First child (80% width) for the name of the file -->
                <div style="flex-basis: 70%; padding: 10px">
                  <span>{{ getFileName(image) }}</span>
                </div>

                <!-- Second child (20% width) for download button or loader -->
                <div style="flex-basis: 20%; padding: 10px">
                  <VIcon
                    v-if="!isLoading && SelectedImage != image"
                    color="error"
                    icon="tabler-download"
                    @click.stop="downloadImage(image)"
                  />
                  <VProgressCircular
                    v-if="isLoading && SelectedImage == image"
                    size="24"
                    color="info"
                    indeterminate
                  />
                </div>
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
