<script lang="ts" setup>
import { requiredValidator } from "@/@core/utils/validators";
import { useLeadsStore } from "@/stores/leads/useLeadsStore";

const store = useLeadsStore();
const panel = ref(0);

onMounted(async () => {
  await store.getExtras();
});
</script>

<template>
  <VCard>
    <VCardItem>
      <template #prepend>
        <VIcon icon="mdi-tools" class="text-disabled" />
      </template>

      <VCardTitle>Installation Details</VCardTitle>
    </VCardItem>

    <VDivider />
  </VCard>

  <VExpansionPanels class="mt-4" v-model="panel" multiple>
    <VExpansionPanel
      v-if="store.selectedLead.measures.length > 0"
      v-for="installation in store.selectedLead.installation_bookings"
      :key="installation.id"
      :title="installation.name"
    >
      <VExpansionPanelText>
        <VRow>
          <VCol cols="12" lg="6">
            <VAutocomplete
              v-model="installation.installer_id"
              :items="store.installers"
              :rules="[requiredValidator]"
              label="Installer"
              :item-title="
                (item:any) =>
                  `${item.name} ( ${item?.company?.name ?? 'No company'} )`
              "
              item-value="id"
              clearable
              required
              :return-object="false"
            />
          </VCol>

          <VCol cols="12" lg="6">
            <AppDateTimePicker
              v-model="installation.installation_at"
              :rules="[requiredValidator]"
              :config="{
                minDate: 'today',
                altInput: true,
                altFormat: 'F j, Y H:i',
                dateFormat: 'Y-m-d H:i',
                enableTime: true,
              }"
              label="Installation Time"
              placeholder="Select date and time"
              required
            />
          </VCol>

          <VCol cols="12">
            <VTextarea
              v-model="installation.comments"
              label="Comments"
              placeholder="Some comments..."
              auto-grow
              clearable
              counter
            />
          </VCol>
        </VRow>
      </VExpansionPanelText>
    </VExpansionPanel>
    <VExpansionPanel
      v-else
      title="Please select measures to assign installers."
    />
  </VExpansionPanels>
</template>
