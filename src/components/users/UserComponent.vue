<script setup lang="ts">
import { useCompaniesStore } from "@/stores/companies/useCompaniesStore";
import { useLeadsStore } from "@/stores/leads/useLeadsStore";
import { usePermissionsStore } from "@/stores/permissions/usePermissionsStore";
import { useUsersStore } from "@/stores/users/useUsersStore";
import { emailValidator, requiredValidator } from "@core/utils/validators";
import { VForm } from "vuetify/components/VForm";

const documents: any = ref([
  {
    title: "Gas Safe Card",
    color: "primary",
    icon: "mdi-document",
    hasExpiry: true,
  },
  {
    title: "Public Liability Insurance",
    color: "primary",
    icon: "mdi-document",
    hasExpiry: true,
  },
  {
    title: "Anamizer Callibration Cert",
    color: "primary",
    icon: "mdi-document",
    hasExpiry: true,
  },
  {
    title: "SS of company no. from company house",
    color: "primary",
    icon: "mdi-document",
    hasExpiry: false,
  },
  {
    title: "Gas Safe Certificate",
    color: "primary",
    icon: "mdi-document",
    hasExpiry: false,
  },
]);

const numberedSteps = [
  {
    title: "Account Details",
    subtitle: "Setup Account Details",
  },
  {
    title: "Personal Info",
    subtitle: "Add personal information",
  },
  {
    title: "Roles",
    subtitle: "Manage User Role(s)",
  },
  {
    title: "Documents",
    subtitle: "Manage User Files",
  },
];

const statuses = [
  {
    key: true,
    value: "Active",
  },
  {
    key: false,
    value: "Inactive",
  },
];

const permissionsStore = usePermissionsStore();
const leadsStore = useLeadsStore();
const companiesStore = useCompaniesStore();
const store = useUsersStore();
const currentStep = ref(0);
const isPasswordVisible = ref(false);
const isConfirmPasswordVisible = ref(false);
const isCurrentStepValid = ref(true);
const refAccountForm = ref<VForm>();
const file = ref();
const fileName = ref(null);
const uploadingFile = ref(false);

const isCsrSelected = computed(() => {
  return permissionsStore.hasRole(store.selected.roles, "csr");
});

const isInstallerSelected = computed(() => {
  return permissionsStore.hasRole(store.selected.roles, "installer");
});

const handleUploadFile = async () => {
  try {
    uploadingFile.value = true;

    await store.uploadFile(store.selectedId, file.value[0], fileName.value);

    fileName.value = null;
    file.value = null;

    //@ts-ignore
    document.activeElement.blur();
    await store.get(store.selected.id);
  } catch (e: any) {
    //
  } finally {
    uploadingFile.value = false;
  }
};

const handleSubmit = () => {
  refAccountForm.value?.validate().then(async (valid) => {
    if (valid.valid) {
      try {
        if (store.shouldRefresh) {
          if (!store.selectedId) {
            await store.store(store.selected);
            store.index();
          } else {
            store.update(store.selectedId, store.selected);
          }
        }

        currentStep.value++;
        isCurrentStepValid.value = true;
      } catch (e) {
        isCurrentStepValid.value = false;
        //
      }
    } else {
      isCurrentStepValid.value = false;
    }
  });
};

onMounted(async () => {
  await permissionsStore.getRoles();
  await leadsStore.getExtras();
  await companiesStore.index({
    all: true,
  });
});
</script>

<template>
  <VCardText>
    <!-- Stepper -->
    <AppStepper
      v-model:current-step="currentStep"
      :items="numberedSteps"
      align="start"
      :is-active-step-valid="!store.isSelected ? false : undefined"
    />
  </VCardText>

  <VDivider />

  <VCardText>
    <VWindow v-model="currentStep" class="disable-tab-transition">
      <VWindowItem>
        <VCol class="mb-4" cols="12">
          <h6 class="text-sm font-weight-medium">Account Information</h6>
          <p class="text-xs mb-0">Enter below details to create an account.</p>
        </VCol>

        <VForm class="pa-4" ref="refAccountForm" @submit.prevent="handleSubmit">
          <VRow>
            <!-- Name -->
            <VCol cols="12" md="6">
              <VTextField
                v-model="store.selected.name"
                :rules="[requiredValidator]"
                label="Name"
                placeholder="John Doe"
                required
                :error-messages="store?.errors?.name?.[0]"
              />
            </VCol>

            <!-- Email -->
            <VCol cols="12" md="6">
              <VTextField
                v-model="store.selected.email"
                :rules="[requiredValidator, emailValidator]"
                label="Email"
                type="email"
                required
                placeholder="johndoe@email.com"
                :error-messages="store?.errors?.email?.[0]"
              />
            </VCol>

            <!-- Password -->
            <VCol cols="12" md="6">
              <VTextField
                v-model="store.selected.password"
                :rules="[!store.isSelected && requiredValidator]"
                label="New Password"
                placeholder="············"
                :type="isPasswordVisible ? 'text' : 'password'"
                :append-inner-icon="
                  isPasswordVisible ? 'mdi-eye-off-outline' : 'mdi-eye-outline'
                "
                :error-messages="store?.errors?.password?.[0]"
                @click:append-inner="isPasswordVisible = !isPasswordVisible"
                required
              />
            </VCol>

            <!-- Password Confirmation -->
            <VCol cols="12" md="6">
              <VTextField
                v-model="store.selected.password_confirmation"
                :rules="[!store.isSelected && requiredValidator]"
                label="Confirm Password"
                placeholder="············"
                :type="isConfirmPasswordVisible ? 'text' : 'password'"
                :append-inner-icon="
                  isConfirmPasswordVisible
                    ? 'mdi-eye-off-outline'
                    : 'mdi-eye-outline'
                "
                @click:append-inner="
                  isConfirmPasswordVisible = !isConfirmPasswordVisible
                "
                required
              />
            </VCol>

            <!-- Submit -->
            <VCol cols="12">
              <div
                class="d-flex flex-wrap gap-4 justify-sm-space-between justify-center mt-8"
              >
                <VBtn color="secondary" variant="tonal" disabled>
                  <VIcon icon="mdi-arrow-left" start class="flip-in-rtl" />
                  Previous
                </VBtn>

                <VBtn
                  :loading="store.isLoading"
                  :disabled="store.isLoading"
                  type="submit"
                >
                  Save
                  <VIcon icon="mdi-arrow-right" end class="flip-in-rtl" />
                </VBtn>
              </div>
            </VCol>
          </VRow>
        </VForm>
      </VWindowItem>

      <VWindowItem>
        <VCol class="mb-4" cols="12">
          <h6 class="text-sm font-weight-medium">Personal Information</h6>
          <p class="text-xs mb-0">Add more desccription about user.</p>
        </VCol>

        <VForm class="pa-4" @submit.prevent="handleSubmit">
          <VRow>
            <!-- Status -->
            <VCol cols="12" md="6">
              <VAutocomplete
                v-model="store.selected.is_active"
                label="Status"
                :items="statuses"
                item-value="key"
                item-title="value"
                :menu-props="{ maxHeight: 200 }"
              />
            </VCol>

            <!-- Gender -->
            <VCol cols="12" lg="6">
              <VSelect
                v-model="store.selected.additional.gender"
                :rules="[requiredValidator]"
                :items="store.GENDERS"
                label="Gender"
                placeholder="Male"
                :error-messages="store?.errors?.gender?.[0]"
              />
            </VCol>

            <!-- DOB -->
            <VCol cols="12" md="6">
              <VTextField
                v-model="store.selected.additional.dob"
                type="date"
                label="Date of birth"
                placeholder="01/01/1998"
                :error-messages="store?.errors?.dob?.[0]"
              />
            </VCol>

            <!-- Visa Expiry -->
            <VCol cols="12" md="6">
              <VTextField
                v-model="store.selected.additional.visa_expiry"
                type="date"
                label="Visa Expiry Date"
                placeholder="01/01/1998"
                :error-messages="store?.errors?.visa_expiry?.[0]"
              />
            </VCol>

            <!-- Phone -->
            <VCol cols="12" lg="6">
              <VTextField
                v-model="store.selected.additional.phone_no"
                label="Phone"
                placeholder="XXX-XXXXXXX"
                type="number"
                clearable
              />
            </VCol>

            <!-- National Insurance Number -->
            <VCol cols="12" md="6">
              <VTextField
                v-model="store.selected.additional.nin"
                label="National Insurance Number"
                placeholder="TR00111001"
                :error-messages="store?.errors?.nin?.[0]"
              />
            </VCol>

            <!-- Bank Name -->
            <VCol cols="12" md="6">
              <VCombobox
                v-model="store.selected.additional.bank"
                :items="leadsStore.banks"
                item-value="name"
                item-title="name"
                label="Bank Name"
                placeholder="Natwest"
                :return-object="false"
                :error-messages="store?.errors?.bank_id?.[0]"
              />
            </VCol>

            <!-- Account Number -->
            <VCol cols="12" md="6">
              <VTextField
                v-model="store.selected.additional.account_number"
                label="Account Number"
                placeholder="00-00-12345678"
                :error-messages="store?.errors?.account_number?.[0]"
              />
            </VCol>

            <!-- Address -->
            <VCol cols="12">
              <VTextarea
                v-model="store.selected.additional.address"
                label="Address"
                placeholder="103 House Example Street..."
                auto-grow
                clearable
                counter
              />
            </VCol>

            <!-- Submit -->
            <VCol cols="12">
              <div
                class="d-flex flex-wrap gap-4 justify-sm-space-between justify-center mt-8"
              >
                <VBtn @click="currentStep--" color="secondary" variant="tonal">
                  <VIcon icon="mdi-arrow-left" start class="flip-in-rtl" />
                  Previous
                </VBtn>

                <VBtn
                  :loading="store.isLoading"
                  :disabled="store.isLoading"
                  type="submit"
                >
                  Save
                  <VIcon icon="mdi-arrow-right" end class="flip-in-rtl" />
                </VBtn>
              </div>
            </VCol>
          </VRow>
        </VForm>
      </VWindowItem>

      <VWindowItem>
        <VCol class="mb-4" cols="12">
          <h6 class="text-sm font-weight-medium">Roles</h6>
          <p class="text-xs mb-0">Manage User Roles</p>
        </VCol>

        <VForm class="pa-4" @submit.prevent="handleSubmit">
          <VRow>
            <VCol class="d-md-inline-flex justify-space-between" cols="12">
              <VCheckbox
                v-for="role in (permissionsStore.roles as any)"
                :key="`role-${role.id}`"
                v-model="store.selected.roles"
                :label="role.formatted_name"
                :value="role.id"
                dense
              >
              </VCheckbox>
            </VCol>

            <!-- Aircall Email Address -->
            <VFadeTransition>
              <VCol cols="12" v-if="isCsrSelected">
                <VCardItem class="px-0">
                  <template #prepend>
                    <VIcon icon="mdi-account-outline" class="text-disabled" />
                  </template>

                  <VCardTitle>Aircall Details</VCardTitle>
                </VCardItem>

                <VDivider class="mt-1 mb-6" />

                <VTextField
                  v-model="store.selected.aircall_email_address"
                  :rules="[emailValidator]"
                  label="Aircall Email Address"
                  type="email"
                  placeholder="johndoe@email.com"
                  :error-messages="store?.errors?.aircall_email_address?.[0]"
                />
              </VCol>
            </VFadeTransition>

            <VFadeTransition>
              <!-- Installer Details -->
              <VCol cols="12" v-if="isInstallerSelected">
                <VRow>
                  <VCol cols="12">
                    <VCardItem class="px-0">
                      <template #prepend>
                        <VIcon icon="mdi-water-boiler" class="text-disabled" />
                      </template>

                      <VCardTitle>Installation Types</VCardTitle>
                    </VCardItem>

                    <VDivider class="mt-1 mb-6" />

                    <VAutocomplete
                      v-model="store.selected.installation_types"
                      :rules="[requiredValidator]"
                      :items="leadsStore.installation_types"
                      item-title="name"
                      item-value="id"
                      label="Installation Type"
                      placeholder="Installation Type"
                      :return-object="false"
                      :error-messages="store?.errors?.installation_types?.[0]"
                      multiple
                      chips
                      clearable
                    />
                  </VCol>
                </VRow>
                <VRow>
                  <VCol cols="12">
                    <VCardItem class="px-0">
                      <template #prepend>
                        <VIcon
                          icon="mdi-office-building-outline"
                          class="text-disabled"
                        />
                      </template>

                      <VCardTitle>Company Details</VCardTitle>
                    </VCardItem>

                    <VDivider class="mt-1 mb-6" />
                  </VCol>

                  <VCol cols="12">
                    <VSwitch
                      v-model="store.selected.is_associated_with_company"
                      label="Is associated with a company?"
                    />
                  </VCol>

                  <VRow class="mt-4">
                    <VCol
                      v-if="store.selected.is_associated_with_company"
                      cols="12"
                    >
                      <VSelect
                        v-model="store.selected.company_id"
                        label="Select Company"
                        placeholder="MEG"
                        :items="companiesStore.entries"
                        :error-messages="store?.errors?.company_id?.[0]"
                        item-title="name"
                        item-value="id"
                        required
                        clearable
                      />
                    </VCol>

                    <VCol
                      v-else
                      v-for="document in documents"
                      :key="document.title"
                      cols="12"
                      lg="4"
                    >
                      <InstallerDocuments v-bind="document" />
                    </VCol>
                  </VRow>
                </VRow>
              </VCol>
            </VFadeTransition>

            <VCol cols="12">
              <div
                class="d-flex flex-wrap gap-4 justify-sm-space-between justify-center mt-8"
              >
                <VBtn color="secondary" variant="tonal" @click="currentStep--">
                  <VIcon icon="mdi-arrow-left" start class="flip-in-rtl" />
                  Previous
                </VBtn>

                <VBtn
                  :loading="store.isLoading"
                  :disabled="store.isLoading"
                  type="submit"
                >
                  Save
                  <VIcon icon="mdi-arrow-right" end class="flip-in-rtl" />
                </VBtn>
              </div>
            </VCol>
          </VRow>
        </VForm>
      </VWindowItem>

      <VWindowItem>
        <VCol class="mb-4" cols="12">
          <h6 class="text-sm font-weight-medium">Documents</h6>
          <p class="text-xs mb-0">Associate multiple files to the user</p>
        </VCol>

        <VForm class="pa-4" @submit.prevent="handleSubmit">
          <VRow>
            <!-- Documents -->
            <VCol v-if="store.isSelected" cols="12">
              <VLabel text="Documents" class="mb-2" />

              <VRow>
                <VCol cols="12" md="6">
                  <VTooltip>
                    <template #activator="{ props }">
                      <VTextField
                        v-model="fileName"
                        v-bind="props"
                        placeholder="File Name"
                      >
                        <template #prepend-inner>
                          <VIcon icon="mdi-information-outline" />
                        </template>
                      </VTextField>
                    </template>
                    <span>
                      This name is optional, if given the file will be saved
                      with this name.
                    </span>
                  </VTooltip>
                </VCol>

                <VCol cols="12" md="6">
                  <VFileInput
                    v-model="file"
                    :loading="uploadingFile"
                    color="primary"
                    prepend-icon=""
                    label="Select any file to upload"
                    @change="handleUploadFile"
                  >
                    <template #selection="{ fileNames }">
                      <template v-for="fileName in fileNames" :key="fileName">
                        <VChip
                          label
                          size="small"
                          variant="outlined"
                          color="primary"
                          class="me-2"
                        >
                          {{ fileName }}
                        </VChip>
                      </template>
                    </template>

                    <!-- AppendInner -->
                    <template #append-inner>
                      <VFadeTransition leave-absolute>
                        <VProgressCircular
                          v-if="uploadingFile"
                          size="24"
                          color="info"
                          indeterminate
                        />
                        <VIcon v-else icon="mdi-paperclip" />
                      </VFadeTransition>
                    </template>
                  </VFileInput>
                </VCol>
              </VRow>
            </VCol>

            <!-- Documents List -->
            <VCol class="d-flex" v-if="store.isSelected" cols="12">
              <VBtn
                v-for="document in store.selected.documents"
                :href="document.original_url"
                target="_blank"
                variant="outlined"
              >
                <VIcon start icon="mdi-file-outline" />
                {{ document.file_name }}
              </VBtn>
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
                  :loading="store.isLoading"
                  :disabled="store.isLoading"
                  type="submit"
                >
                  Save
                </VBtn>
              </div>
            </VCol>
          </VRow>
        </VForm>
      </VWindowItem>
    </VWindow>
  </VCardText>
</template>
