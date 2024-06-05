<script lang="ts" setup>
import useApiFetch from "@/composables/useApiFetch";
import { titles } from "@/constants/leads/customerDetails";
import { useToast } from "@/plugins/toastr";
import { useLeadsStore } from "@/stores/leads/useLeadsStore";
import { getExceptionMessage } from "@/utils/useHelper";
import avatar3 from "@images/avatars/avatar-3.png";
import {
  emailValidator,
  integerValidator,
  requiredValidator,
} from "@validators";
import moment from "moment";
import { VForm } from "vuetify/components/VForm";

type Lead = {
  title: String | null;
  first_name: String | null;
  middle_name: String | null;
  last_name: String | null;
  email: String | null;
  phone_no: String | null;
  dob: String | null;
  address: String | null;
  post_code: String | null | undefined;
  comments: String | null;
  measures: Number[];
  job_type_id: Number | null;
  fuel_type_id: Number | null;
  benefits: Number[] | null;
  surveyor_id: Number | null;
  lead_generator_id: Number | null;
  lead_source_id: Number | null;
  has_second_receipent: Boolean;
  is_marked_as_job: Boolean;
  second_receipent: SecondReceipent;
};

type SecondReceipent = {
  first_name: String | null;
  middle_name: String | null;
  last_name: String | null;
  dob: String | null;
};

const props = defineProps({
  isFullPage: {
    default: false,
    type: Boolean,
  },
});

const $toast = useToast();
const store = useLeadsStore();

const steps = [
  {
    title: "Address",
    icon: "custom-wizard-address",
  },
  {
    title: "Basic Information",
    icon: "custom-wizard-personal",
  },
  {
    title: "Optional",
    icon: "custom-wizard-social-link",
  },
  {
    title: "Review & Submit",
    icon: "custom-wizard-submit",
  },
];

const addressCombobox = ref();
const loading = ref(false);
const suggestions: Ref<String[]> = ref([]);
const currentStep = ref(0);
const refPersonalForm = ref<VForm>();
const refAddressForm = ref<VForm>();
const refAdditionalInformationForm = ref<VForm>();
const refReviewForm = ref<VForm>();
const isCurrentStepValid = ref(true);
const isAddressFormValid = ref(false);

const personalInformationForm = ref({
  title: null,
  first_name: null,
  middle_name: null,
  last_name: null,
  email: null,
  phone_no: null,
  dob: null,
});

const addressInformationForm = ref({
  address: null,
  post_code: null,
});

const additionalInformationForm = ref({
  notes: null,
  measures: [],
  job_type_id: null,
  fuel_type_id: null,
  benefits: [],
  surveyor_id: null,
  lead_generator_id: null,
  lead_source_id: null,
  has_second_receipent: false,
  is_marked_as_job: false,
  second_receipent: {
    first_name: null,
    middle_name: null,
    last_name: null,
    dob: null,
  },
});

const validatePersonalInformationForm = () => {
  refPersonalForm.value?.validate().then((valid: any) => {
    if (valid.valid) {
      currentStep.value++;
      isCurrentStepValid.value = true;
    } else {
      isCurrentStepValid.value = false;
    }
  });
};

const validateAddressInformationForm = () => {
  if (isAddressFormValid.value) {
    currentStep.value++;
    isCurrentStepValid.value = true;
  } else {
    isCurrentStepValid.value = false;
  }
};

const validateAdditionalInformationForm = () => {
  refAdditionalInformationForm.value?.validate().then((valid: any) => {
    if (valid.valid) {
      currentStep.value++;
      isCurrentStepValid.value = true;
    } else {
      isCurrentStepValid.value = false;
    }
  });
};

const getSuggestions = async () => {
  if (!addressInformationForm.value.post_code) {
    $toast.error("Please enter postcode to proceed.");

    return;
  }

  loading.value = true;
  suggestions.value = [];

  try {
    const { data } = await useApiFetch(
      `/getSuggestions?post_code=${addressInformationForm.value.post_code.toUpperCase()}`,
      {
        method: "GET",
      }
    );

    data?.map((i: any) => suggestions.value.push(i));
    addressCombobox.value.$el.querySelector("input").focus();
    if (Array.isArray(data) && data.length > 0) {
      addressInformationForm.value.post_code = data[0].post_code;
    } else {
      addressInformationForm.value.post_code =
        addressInformationForm.value.post_code.toUpperCase();
    }
    addressInformationForm.value.address = null;
  } catch (e) {
    $toast.error(getExceptionMessage(e));
  } finally {
    loading.value = false;
  }
};

const checkDuplicate = async (v: any) => {
  if (!v) {
    isAddressFormValid.value = false;

    return "The address is required";
  }

  await store.storeLead(
    {
      ...addressInformationForm.value,
    },
    { method: "POST" },
    false
  );

  if (store.errors.hasOwnProperty("address.address")) {
    isAddressFormValid.value = false;

    return "This address already exists";
  } else {
    isAddressFormValid.value = true;
    return true;
  }
};

const handleSubmit = async () => {
  await store.storeLead({
    ...personalInformationForm.value,
    ...addressInformationForm.value,
    ...additionalInformationForm.value,
  });
};

onMounted(async () => await store.getExtras());
</script>

<template>
  <VCardText>
    <!-- 👉 Stepper -->
    <AppStepper
      v-model:current-step="currentStep"
      :items="steps"
      :is-active-step-valid="isCurrentStepValid"
    />
  </VCardText>

  <VDivider />

  <VCardText>
    <VWindow v-model="currentStep" class="disable-tab-transition">
      <VWindowItem>
        <VForm
          @submit.prevent="validateAddressInformationForm"
          ref="refAddressForm"
        >
          <VRow>
            <VCol cols="12">
              <LeadAlertMessages :address="addressInformationForm.address" />
            </VCol>

            <VCol cols="12" lg="5">
              <VTextField
                v-model="addressInformationForm.post_code"
                label="Postcode"
                :rules="[requiredValidator]"
                placeholder="Enter postcode to search addresses"
                required
                @keydown.enter.prevent="getSuggestions"
              >
                <!-- Prepend -->
                <template #prepend-inner>
                  <VTooltip location="bottom">
                    <template #activator="{ props }">
                      <VIcon v-bind="props" icon="mdi-help-circle-outline" />
                    </template>
                    Search for available address to continue.
                  </VTooltip>
                </template>

                <!-- AppendInner -->
                <template #append-inner>
                  <VFadeTransition leave-absolute>
                    <VProgressCircular
                      v-if="loading"
                      size="24"
                      color="info"
                      indeterminate
                    />
                  </VFadeTransition>
                </template>

                <!-- Append -->
                <template #append>
                  <VBtn
                    :size="$vuetify.display.smAndDown ? 'small' : 'large'"
                    :class="$vuetify.display.smAndDown ? 'mt-n2' : 'mt-n3'"
                    :icon="$vuetify.display.smAndDown"
                    @click="getSuggestions"
                  >
                    <VIcon icon="mdi-map-search-outline" />
                  </VBtn>
                </template>
              </VTextField>
            </VCol>

            <VCol cols="12" lg="7">
              <VAutocomplete
                v-model="addressInformationForm.address"
                ref="addressCombobox"
                :items="suggestions"
                item-title="address"
                item-value="address"
                :rules="[checkDuplicate]"
                label="Address"
                placeholder="Enter postcode to search addresses"
                type="text"
                clearable
                required
                :return-object="true"
              />
            </VCol>

            <VCol cols="12">
              <div
                class="d-flex flex-wrap gap-4 justify-sm-space-between justify-center mt-8"
              >
                <VBtn
                  :loading="store.isLoading"
                  :disabled="store.isLoading"
                  type="submit"
                >
                  Next
                  <VIcon icon="mdi-arrow-right" end class="flip-in-rtl" />
                </VBtn>
              </div>
            </VCol>
          </VRow>
        </VForm>
      </VWindowItem>
      <VWindowItem>
        <VForm
          @submit.prevent="validatePersonalInformationForm"
          ref="refPersonalForm"
        >
          <VRow>
            <VCol cols="12" lg="4">
              <VTextField
                v-model="personalInformationForm.first_name"
                :rules="[requiredValidator]"
                label="First Name"
                placeholder="John"
                clearable
                required
              />
            </VCol>

            <VCol cols="12" lg="4">
              <VTextField
                v-model="personalInformationForm.middle_name"
                label="Middle Name"
                placeholder="-"
                clearable
              />
            </VCol>

            <VCol cols="12" lg="4">
              <VTextField
                v-model="personalInformationForm.last_name"
                :rules="[requiredValidator]"
                label="Last Name"
                placeholder="Doe"
                clearable
                required
              />
            </VCol>

            <VCol cols="12" lg="4">
              <VAutocomplete
                v-model="personalInformationForm.title"
                :items="titles"
                :rules="[requiredValidator]"
                label="Title"
                placeholder="Select title"
                clearable
                required
              />
            </VCol>

            <VCol cols="12" lg="4">
              <VTextField
                v-model="personalInformationForm.email"
                :rules="[emailValidator]"
                label="Email"
                placeholder="johndoe@example.com"
                clearable
              />
            </VCol>

            <VCol cols="12" lg="4">
              <VTextField
                v-model="personalInformationForm.phone_no"
                :rules="[requiredValidator, integerValidator]"
                label="Phone"
                placeholder="XXX-XXXXXXX"
                type="number"
                clearable
                required
              />
            </VCol>

            <VCol cols="12" lg="6">
              <AppDateTimePicker
                v-model="personalInformationForm.dob"
                :rules="[requiredValidator]"
                :config="{
                  maxDate: 'today',
                  wrap: true,
                  altInput: true,
                  altFormat: 'F j, Y',
                  dateFormat: 'Y-m-d',
                }"
                label="Date of Birth"
                placeholder="Select date"
                required
              />
            </VCol>

            <VCol cols="12" lg="6">
              <VAutocomplete
                v-model="additionalInformationForm.lead_generator_id"
                :items="store.leadGenerators"
                :rules="[requiredValidator]"
                label="Lead Generator"
                item-title="name"
                item-value="id"
                clearable
                required
                :return-object="false"
              />
            </VCol>

            <VCol cols="12">
              <div
                class="d-flex flex-wrap gap-4 justify-sm-space-between justify-center mt-8"
              >
                <VBtn color="secondary" variant="tonal" @click="currentStep--">
                  <VIcon icon="mdi-arrow-left" start class="flip-in-rtl" />
                  Previous
                </VBtn>

                <VBtn type="submit">
                  Next
                  <VIcon icon="mdi-arrow-right" end class="flip-in-rtl" />
                </VBtn>
              </div>
            </VCol>
          </VRow>
        </VForm>
      </VWindowItem>
      <VWindowItem>
        <VForm
          @submit.prevent="validateAdditionalInformationForm"
          ref="refAdditionalInformationForm"
        >
          <VRow>
            <VCol cols="12">
              <VAutocomplete
                v-model="additionalInformationForm.measures"
                :items="store.measures"
                label="Measures"
                placeholder="Select Measures"
                item-title="name"
                item-value="id"
                chips
                multiple
                clearable
                :return-object="false"
              />
            </VCol>

            <VCol cols="12" lg="6">
              <VAutocomplete
                v-model="additionalInformationForm.job_type_id"
                :items="store.jobTypes"
                label="Job Type"
                item-title="name"
                item-value="id"
                clearable
                :return-object="false"
              />
            </VCol>

            <VCol cols="12" lg="6">
              <VAutocomplete
                v-model="additionalInformationForm.fuel_type_id"
                :items="store.fuelTypes"
                label="Fuel Type"
                item-title="name"
                item-value="id"
                clearable
                :return-object="false"
              />
            </VCol>

            <VCol cols="12" lg="6">
              <VAutocomplete
                v-model="additionalInformationForm.lead_source_id"
                :items="store.leadSources"
                label="Lead Source"
                item-title="name"
                item-value="id"
                clearable
                :return-object="false"
              />
            </VCol>

            <VCol cols="12" lg="6">
              <VCombobox
                v-model="additionalInformationForm.benefits"
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

            <VCol cols="12">
              <VTextarea
                v-model="additionalInformationForm.notes"
                label="Comments"
                placeholder="Some comments..."
                auto-grow
                clearable
                counter
              />
            </VCol>
            <transition name="fade" mode="out-in">
              <VCol
                v-show="additionalInformationForm.has_second_receipent"
                cols="12"
              >
                <VRow>
                  <VCol cols="12" lg="3">
                    <VTextField
                      v-model="
                        additionalInformationForm.second_receipent.first_name
                      "
                      :rules="[
                        additionalInformationForm.has_second_receipent &&
                          requiredValidator,
                      ]"
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
                      v-model="
                        additionalInformationForm.second_receipent.middle_name
                      "
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
                      v-model="
                        additionalInformationForm.second_receipent.last_name
                      "
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
                      v-model="additionalInformationForm.second_receipent.dob"
                      :error-messages="
                        store?.errors?.['second_receipent.dob']?.[0]
                      "
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
              </VCol>
            </transition>

            <VCol cols="12">
              <div class="demo-space-x">
                <VSwitch
                  v-model="additionalInformationForm.has_second_receipent"
                  label="Second Receipent"
                />

                <VSwitch
                  v-model="additionalInformationForm.is_marked_as_job"
                  label="Mark as job"
                />
              </div>
            </VCol>

            <VCol cols="12">
              <div
                class="d-flex flex-wrap gap-4 justify-sm-space-between justify-center mt-8"
              >
                <VBtn color="secondary" variant="tonal" @click="currentStep--">
                  <VIcon icon="mdi-arrow-left" start class="flip-in-rtl" />
                  Previous
                </VBtn>

                <VBtn type="submit">
                  Next
                  <VIcon icon="mdi-arrow-right" end class="flip-in-rtl" />
                </VBtn>
              </div>
            </VCol>
          </VRow>
        </VForm>
      </VWindowItem>
      <VWindowItem>
        <VForm @submit.prevent="handleSubmit" ref="refReviewForm">
          <VRow>
            <VCol>
              <VCardText
                class="d-flex justify-space-between flex-wrap flex-column flex-sm-row print-row"
              >
                <div class="my-4">
                  <h6 class="text-sm font-weight-medium mb-3">
                    Customer Details:
                  </h6>
                  <p class="mb-1">
                    {{
                      personalInformationForm.first_name +
                      " " +
                      personalInformationForm.last_name
                    }}
                  </p>
                  <p class="mb-1">
                    {{ addressInformationForm.address?.address }}
                  </p>
                  <p class="mb-1">
                    {{ personalInformationForm.phone_no }}
                  </p>
                  <p class="mb-0">
                    {{ personalInformationForm.email }}
                  </p>
                </div>

                <div class="my-4">
                  <h6 class="text-sm font-weight-medium mb-3">
                    Lead Number: ####
                  </h6>

                  <div class="d-flex justify-space-between">
                    <VChip size="x-small" color="primary" text="Raw Lead" />
                    <VChip
                      size="x-small"
                      :color="
                        additionalInformationForm.is_marked_as_job
                          ? 'success'
                          : 'error'
                      "
                      :text="
                        additionalInformationForm.is_marked_as_job
                          ? 'Yes'
                          : 'No'
                      "
                    />
                  </div>

                  <VList>
                    <VListItem>
                      <!-- 👉 Avatar  -->
                      <template #prepend>
                        <VAvatar
                          rounded
                          :size="38"
                          :image="avatar3"
                          class="me-3"
                        />
                      </template>

                      <VListItemTitle class="text-sm font-weight-medium mb-1">
                        {{
                          store.surveyors.find(
                            (i: any) =>
                              i.id === additionalInformationForm.surveyor_id
                          )?.name ?? "Not Selected"
                        }}
                      </VListItemTitle>

                      <VListItemSubtitle
                        class="text-xs text-no-wrap d-flex align-center"
                      >
                        <VIcon start :size="16" icon="mdi-calendar-blank" />
                        <span>{{ moment().format("DD-MM-YYYY") }}</span>
                      </VListItemSubtitle>
                    </VListItem>
                  </VList>
                </div>
              </VCardText>
            </VCol>
            <VCol cols="12">
              <div
                class="d-flex flex-wrap gap-4 justify-sm-space-between justify-center mt-8"
              >
                <VBtn color="secondary" variant="tonal" @click="currentStep--">
                  <VIcon icon="mdi-arrow-left" start class="flip-in-rtl" />
                  Previous
                </VBtn>

                <VBtn
                  type="submit"
                  :disabled="store.isLoading"
                  :loading="store.isLoading"
                >
                  Submit
                  <VIcon icon="mdi-arrow-right" end class="flip-in-rtl" />
                </VBtn>
              </div>
            </VCol>
          </VRow>
        </VForm>
      </VWindowItem>
    </VWindow>
  </VCardText>
</template>

<style lang="scss" scoped>
.v-list-item {
  padding-inline: 0 !important;
}
</style>
