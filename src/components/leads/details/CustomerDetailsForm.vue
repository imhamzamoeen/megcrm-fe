<script lang="ts" setup>
import {
  contactMethods,
  priorityTypes,
  timesToContact,
  titles,
} from "@/constants/leads/customerDetails";
import { useLeadsStore } from "@/stores/leads/useLeadsStore";
import { usePermissionsStore } from "@/stores/permissions/usePermissionsStore";
import {
  emailValidator,
  integerValidator,
  requiredValidator,
} from "@validators";

const permissionsStore = usePermissionsStore();
const store = useLeadsStore();
const DataMatchLogs = ref(null);
const jobTypes = computed(() =>
  store.jobTypes.map((i: any) => {
    return { title: i.name, value: i.id };
  })
);
const isDisabledBecauseDatamatch = computed(
  () =>
    store.selectedLead.lead_customer_additional_detail.datamatch_progress ==
      "Sent" && !permissionsStore.isSuperAdmin
);

onMounted(async () => {
  await store.getExtras();
  DataMatchLogs.value = store.selectedLead.logs.filter(function (log: any) {
    return (
      log?.event == "updated" &&
      log?.properties?.attributes?.hasOwnProperty("datamatch_progress")
    );
  });
});
</script>

<template>
  <VCard>
    <VCardText>
      <VRow>
        <VCardItem>
          <template #prepend>
            <VIcon icon="mdi-account-edit" class="text-disabled" />
          </template>

          <VCardTitle>Customer Details</VCardTitle>
        </VCardItem>

        <VDivider class="mb-3" />

        <!--First Name -->
        <VCol cols="12" lg="4">
          <VTextField
            v-model="store.selectedLead.first_name"
            :rules="[requiredValidator]"
            label="First Name"
            placeholder="John"
            clearable
            required
          />
        </VCol>

        <!--Middle Name -->
        <VCol cols="12" lg="4">
          <VTextField
            v-model="store.selectedLead.middle_name"
            label="Middle Name"
            placeholder="-"
            clearable
            required
          />
        </VCol>

        <!--Last Name -->
        <VCol cols="12" lg="4">
          <VTextField
            v-model="store.selectedLead.last_name"
            :rules="[requiredValidator]"
            label="Last Name"
            placeholder="Doe"
            clearable
            required
          />
        </VCol>

        <!-- Title -->
        <VCol cols="12" lg="4">
          <VAutocomplete
            v-model="store.selectedLead.title"
            :items="titles"
            :rules="[requiredValidator]"
            label="Title"
            placeholder="Select title"
            clearable
            required
          />
        </VCol>

        <!--Email -->
        <VCol cols="12" lg="4">
          <VTextField
            v-model="store.selectedLead.email"
            :rules="[emailValidator]"
            label="Email"
            placeholder="johndoe@example.com"
            clearable
          />
        </VCol>

        <!-- Phone No -->
        <VCol cols="12" lg="4">
          <VTextField
            v-model="store.selectedLead.phone_no"
            :rules="[requiredValidator, integerValidator]"
            label="Phone"
            placeholder="XXX-XXXXXXX"
            type="number"
            required
            :readonly="!permissionsStore.isSuperAdmin"
          />
        </VCol>

        <!-- DOB -->
        <VCol cols="12" lg="4">
          <AppDateTimePicker
            v-model="store.selectedLead.dob"
            :rules="[requiredValidator]"
            :config="{
              maxDate: 'today',
              wrap: true,
              altInput: false,
              altFormat: 'F j, Y',
              dateFormat: 'Y-m-d',
            }"
            label="Date of Birth"
            placeholder="Select date"
            :disabled="isDisabledBecauseDatamatch"
            required
          />
        </VCol>

        <!-- Post code -->
        <VCol cols="12" lg="4">
          <VTextField
            v-model="store.selectedLead.post_code"
            prepend-inner-icon="mdi-post-outline"
            label="Postcode"
            :rules="[requiredValidator]"
            placeholder="Enter postcode to search addresses"
            required
            :disabled="isDisabledBecauseDatamatch"
            :readonly="!permissionsStore.isSuperAdmin"
          />
        </VCol>

        <!-- Address -->
        <VCol cols="12" lg="4">
          <VTextField
            prepend-inner-icon="mdi-map-marker-outline"
            v-model="store.selectedLead.address"
            :rules="[requiredValidator]"
            label="Address"
            placeholder="Enter postcode to search addresses"
            type="text"
            required
            :disabled="isDisabledBecauseDatamatch"
            :readonly="!permissionsStore.isSuperAdmin"
          />
        </VCol>

        <!-- Benefit Type -->
        <VCol cols="12" lg="6">
          <VCombobox
            v-model="store.selectedLead.benefits"
            :items="store.benefitTypes"
            label="Benefit Type"
            item-title="name"
            item-value="id"
            clearable
            :return-object="false"
            multiple
            chips
          />
        </VCol>

        <!-- Lead Generator -->
        <VCol cols="12" lg="6">
          <VAutocomplete
            v-model="store.selectedLead.lead_generator_id"
            :items="store.leadGenerators"
            label="Lead Generator"
            item-title="name"
            item-value="id"
            :return-object="false"
            :readonly="!permissionsStore.isSuperAdmin"
          />
        </VCol>

        <!-- Lead Source -->
        <VCol cols="12" lg="6">
          <VAutocomplete
            v-model="store.selectedLead.lead_source_id"
            :items="store.leadSources"
            label="Lead Source"
            item-title="name"
            item-value="id"
            clearable
            :return-object="false"
          />
        </VCol>

        <!-- Lead Measures -->
        <VCol cols="12" lg="6">
          <VCombobox
            v-model="store.selectedLead.measures"
            :items="store.measures"
            item-title="name"
            item-value="id"
            label="Measures"
            placeholder="Loft Insulation"
            clearable
            required
            multiple
            chips
            :return-object="false"
          />
        </VCol>

        <!-- Notes -->
        <VCol cols="12">
          <VTextarea
            v-model="store.selectedLead.notes"
            label="Comments"
            placeholder="Some comments..."
            auto-grow
            clearable
            counter
          />
        </VCol>

        <!-- Checkboxes -->
        <VCol cols="12">
          <div class="demo-space-x">
            <!-- Second Receipent -->
            <VSwitch
              v-model="store.selectedLead.has_second_receipent"
              label="Second Receipent"
            />

            <VSwitch
              v-model="store.selectedLead.is_marked_as_job"
              label="Mark as job"
            />

            <!-- Customer Owner -->
            <!-- <VSwitch
              v-model="
                store.selectedLead.lead_customer_additional_detail
                  .is_customer_owner
              "
              label="Is customer the owner"
            /> -->

            <!-- Share Lead -->
            <!-- <VSwitch
              v-model="
                store.selectedLead.lead_customer_additional_detail
                  .is_lead_shared
              "
              label="Share Lead"
            /> -->

            <!-- Datamatch required -->
            <VSwitch
              v-model="
                store.selectedLead.lead_customer_additional_detail
                  .is_datamatch_required
              "
              label="Requires datamatch"
            />

            <span>
              <VChip
                label
                size="small"
                class="text-capitalize animate-pulse"
                color="info"
              >
                {{
                  store.selectedLead.lead_customer_additional_detail
                    .datamatch_progress
                }}
              </VChip>
            </span>
          </div>
        </VCol>
      </VRow>

      <transition name="fade" mode="out-in">
        <VRow v-show="store.selectedLead.has_second_receipent">
          <VCardItem>
            <template #prepend>
              <VIcon icon="mdi-account-outline" class="text-disabled" />
            </template>

            <VCardTitle>Second Receipent Details</VCardTitle>
          </VCardItem>

          <VDivider class="mb-3" />

          <VCol cols="12" lg="3">
            <VTextField
              v-model="store.selectedLead.second_receipent.first_name"
              :error-messages="
                store?.errors?.['second_receipent.first_name']?.[0]
              "
              label="First Name"
              placeholder="John"
              clearable
              required
            />
          </VCol>

          <VCol cols="12" lg="3">
            <VTextField
              v-model="store.selectedLead.second_receipent.middle_name"
              :error-messages="
                store?.errors?.['second_receipent.middle_name']?.[0]
              "
              label="Middle Name"
              placeholder="-"
              clearable
            />
          </VCol>

          <VCol cols="12" lg="3">
            <VTextField
              v-model="store.selectedLead.second_receipent.last_name"
              :error-messages="
                store?.errors?.['second_receipent.last_name']?.[0]
              "
              label="Last Name"
              placeholder="Doe"
              clearable
              required
            />
          </VCol>

          <VCol cols="12" lg="3">
            <AppDateTimePicker
              v-model="store.selectedLead.second_receipent.dob"
              :config="{
                altInput: true,
                altFormat: 'F j, Y',
                dateFormat: 'Y-m-d',
              }"
              label="Date of Birth"
              placeholder="Select date"
              required
            >
            </AppDateTimePicker>
          </VCol>
        </VRow>
      </transition>

      <transition name="fade" mode="out-in">
        <VRow>
          <VCardItem>
            <template #prepend>
              <VIcon icon="mdi-bullseye-arrow" class="text-disabled" />
            </template>

            <VCardTitle>More Details</VCardTitle>
          </VCardItem>

          <VDivider class="mb-3" />

          <!-- Dataprogress Value -->
          <VCol cols="12" lg="6">
            <VAutocomplete
              v-model="
                store.selectedLead.lead_customer_additional_detail
                  .datamatch_progress
              "
              :items="['Required', 'Not required']"
              :rules="[requiredValidator]"
              :label="`Datamatch progress for ${store.selectedLead.full_name}`"
              placeholder="Select an option"
              required
              :readonly="true"
            />
          </VCol>

          <!-- Dataprogress Date -->
          <VCol cols="12" lg="6">
            <VAutocomplete
              v-model="
                store.selectedLead.lead_customer_additional_detail
                  .datamatch_progress_date
              "
              :rules="[requiredValidator]"
              label="Date processed by DWP"
              placeholder="Date processed"
              required
              :readonly="true"
            />
          </VCol>

          <!-- Datamatch History -->
          <VCol class="pa-0" cols="12" lg="12" v-if="DataMatchLogs">
            <ActivityTimeline
              :logs="DataMatchLogs ?? []"
              heading="DataMatch History"
              elevation="0"
            />
          </VCol>
        </VRow>
      </transition>

      <VRow>
        <VCardItem>
          <template #prepend>
            <VIcon icon="mdi-account-details-outline" class="text-disabled" />
          </template>

          <VCardTitle>Other Details</VCardTitle>
        </VCardItem>

        <VDivider class="mb-3" />

        <!-- Job Types -->
        <VCol cols="12" lg="6">
          <VLabel class="mb-4" text="Job Type" />
          <CustomRadios
            v-model:selected-radio="store.selectedLead.job_type_id"
            :radio-content="jobTypes"
            :grid-column="{ lg: '4', cols: '12' }"
          />
        </VCol>

        <!-- Contact Methods -->
        <VCol cols="12" lg="6">
          <VLabel class="mb-4" text="Contact Methods" />
          <CustomRadios
            v-model:selected-radio="
              store.selectedLead.lead_customer_additional_detail.contact_method
            "
            :radio-content="contactMethods"
            :grid-column="{ lg: '4', cols: '12' }"
          />
        </VCol>

        <!-- Priority Types -->
        <VCol cols="12" lg="6">
          <VLabel class="mb-4" text="Priority Type" />
          <CustomRadios
            v-model:selected-radio="
              store.selectedLead.lead_customer_additional_detail.priority_type
            "
            :radio-content="priorityTypes"
            :grid-column="{ lg: '4', cols: '12' }"
          />
        </VCol>

        <!-- Time to contact -->
        <VCol cols="12" lg="6">
          <VLabel class="mb-4">
            <!-- append -->
            <template #default>
              <span class="mr-2">Time to contact</span>

              <VTooltip location="bottom">
                <template #activator="{ props }">
                  <VIcon v-bind="props" icon="mdi-help-circle-outline" />
                </template>
                Most suitable time to contact the customer.
              </VTooltip>
            </template>
          </VLabel>
          <CustomRadios
            v-model:selected-radio="
              store.selectedLead.lead_customer_additional_detail.time_to_contact
            "
            :radio-content="timesToContact"
            :grid-column="{ lg: '4', cols: '12' }"
          />
        </VCol>
      </VRow>
    </VCardText>
  </VCard>
</template>
