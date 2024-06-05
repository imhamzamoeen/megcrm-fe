<script lang="ts" setup>
import { useLeadsStore } from "@/stores/leads/useLeadsStore";

const store = useLeadsStore();

const documents = ref([
  { name: "PRE-EPR" },
  { name: "POST-EPR" },
  { name: "PRE-SITE-NOTES" },
  { name: "POST-SITE-NOTES" },
  { name: "PRE-XML" },
  { name: "POST-XML" },
  { name: "RCVSR", draft: false },
  { name: "RECOMMENDATIONS", lodged: false },
]);

const areaOptions = ["0 - 72", "73 - 97", "98 - 199", "200+"];

const ratingOptions = [
  "0 - 10.5 LOW G",
  "10.5 - 20.4 HIGH G",
  "20.5 - 29.4 LOW F",
  "29.5 - 38.4 HIGH F",
  "28.5 - 46.4 LOW E",
  "46.5 - 54.4 HIGH E",
  "54.5 - 61.4 LOW D",
  "61.5 - 68.4 HIGH D",
  "68.5 - 74.4 LOW C",
  "74.5 - 80.4 HIGH C",
  "80.5 - 85.9 LOW B",
  "86 - 91.4 HIGH B",
  "91.5 - 95.9 LOW A",
  "96 HIGH A",
];
</script>

<template>
  <VCard>
    <VCardItem>
      <template #prepend>
        <VIcon icon="mdi-content-save-outline" class="text-disabled" />
      </template>

      <VCardTitle>Submission Details</VCardTitle>
    </VCardItem>

    <VDivider />

    <VCardText>
      <VRow class="mb-2">
        <VCol cols="12">
          <h6 class="text-h6">Submission Checks</h6>
        </VCol>

        <VCol cols="12" lg="4">
          <VAutocomplete
            v-model="store.selectedLead.submission.area"
            :items="areaOptions"
            label="Area"
            placeholder="Select area"
            clearable
            density="compact"
          />
        </VCol>
        <VCol cols="12" lg="4">
          <VAutocomplete
            v-model="store.selectedLead.submission.pre_rating"
            :items="ratingOptions"
            label="Pre Rating"
            placeholder="Select pre rating"
            clearable
            density="compact"
          />
        </VCol>
        <VCol cols="12" lg="4">
          <VAutocomplete
            v-model="store.selectedLead.submission.post_rating"
            :items="ratingOptions"
            label="Post Rating"
            placeholder="Select post rating"
            clearable
            density="compact"
          />
        </VCol>
      </VRow>

      <VRow class="mt-2">
        <VCol cols="12">
          <VTable fixed-header>
            <thead>
              <tr>
                <th class="text-uppercase">Document Name</th>
                <th class="text-uppercase">Draft</th>
                <th class="text-uppercase">Lodged</th>
              </tr>
            </thead>
            <tbody class="text-high-emphasis">
              <SubmissionDocument
                v-for="document in documents"
                :title="document.name"
              />
            </tbody>
          </VTable>
        </VCol>
      </VRow>
    </VCardText>
  </VCard>
</template>
