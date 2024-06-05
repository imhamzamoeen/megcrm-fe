<script lang="ts" setup>
import { useLeadsStore } from "@/stores/leads/useLeadsStore";
import { requiredValidator } from "@validators";

const store = useLeadsStore();

onMounted(async () => {
  await store.getExtras();
});
</script>

<template>
  <VCard>
    <VCardItem>
      <template #prepend>
        <VIcon icon="mdi-home-plus" class="text-disabled" />
      </template>

      <VCardTitle>Survey Booking Details</VCardTitle>
    </VCardItem>

    <VDivider />

    <VCardText>
      <VRow>
        <VCol cols="12" lg="6">
          <VAutocomplete
            v-model="store.selectedLead.survey_booking.surveyor_id"
            :items="store.surveyors"
            :rules="[requiredValidator]"
            label="Surveyor"
            item-title="name"
            item-value="id"
            clearable
            required
            :return-object="false"
            density="compact"
          />
        </VCol>

        <VCol cols="12" lg="6">
          <VAutocomplete
            v-model="store.selectedLead.survey_booking.preffered_time"
            :rules="[requiredValidator]"
            :items="['Morning', 'Afternoon', 'Evening']"
            label="Preffered Time"
            clearable
            required
            density="compact"
          />
        </VCol>

        <VCol cols="12" lg="6">
          <AppDateTimePicker
            v-model="store.selectedLead.survey_booking.survey_at"
            :rules="[requiredValidator]"
            :config="{
              minDate: 'today',
              altInput: true,
              altFormat: 'F j, Y H:i',
              dateFormat: 'Y-m-d H:i',
              enableTime: true,
            }"
            label="Survey Start Time"
            placeholder="Select date and time"
            required
            density="compact"
          />
        </VCol>

        <VCol cols="12" lg="6">
          <AppDateTimePicker
            v-model="store.selectedLead.survey_booking.survey_to"
            :rules="[requiredValidator]"
            :config="{
              minDate: 'today',
              altInput: true,
              altFormat: 'F j, Y H:i',
              dateFormat: 'Y-m-d H:i',
              enableTime: true,
            }"
            label="Survey End Time"
            placeholder="Select date and time"
            required
            density="compact"
          />
        </VCol>

        <VCol cols="12">
          <VTooltip :disabled="store.selectedLead.phone_number_formatted">
            <template #activator="{ props }">
              <div v-bind="props" class="d-inline-block">
                <VSwitch
                  v-model="
                    store.selectedLead.survey_booking.is_sms_alert_enabled
                  "
                  label="Send SMS Alert?"
                  :disabled="!store.selectedLead.phone_number_formatted"
                />
              </div>
            </template>
            <span>
              This lead have invalid number, please fix it to allow sending text
              messages.
            </span>
          </VTooltip>
        </VCol>

        <VCol cols="12">
          <VTextarea
            v-model="store.selectedLead.survey_booking.comments"
            label="Comments"
            placeholder="Some comments..."
            auto-grow
            clearable
            counter
          />
        </VCol>
      </VRow>
    </VCardText>
  </VCard>
</template>
