<script lang="ts" setup>
import { requiredValidator } from "@/@core/utils/validators";
import { useCompaniesStore } from "@/stores/companies/useCompaniesStore";

const store: any = useCompaniesStore();
const { params } = useRoute();

const form = ref();

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

const handleSubmit = () => {
  form.value?.validate().then(async (v: any) => {
    if (v.valid) {
      await store.update(store.selected.id, store.selected);
    }
  });
};

onMounted(async () => {
  await store.get(params.id);
});
</script>

<template>
  <VCard class="pa-4">
    <VForm ref="form" @submit.prevent="handleSubmit">
      <VRow>
        <VCol cols="12">
          <VCardItem class="px-0">
            <template #prepend>
              <VBtn class="pa-1 mr-2" to="/companies" size="x-small" rounded>
                <VIcon icon="mdi-arrow-left" />
              </VBtn>
              <VIcon icon="mdi-office-building-outline" class="text-disabled" />
            </template>

            <VCardTitle>Company Details</VCardTitle>
          </VCardItem>

          <VDivider class="mt-1 mb-6" />
        </VCol>

        <template v-if="!store.isLoading">
          <VCol cols="12" md="6">
            <VTextField
              v-model="store.selected.name"
              label="Name"
              placeholder="MEG"
              :rules="[requiredValidator]"
              :error-messages="store?.errors?.name?.[0]"
              clearable
            />
          </VCol>

          <VCol cols="12" md="6">
            <VTextField
              v-model="store.selected.address"
              label="Address"
              placeholder="62 Mansfield Street"
              :rules="[requiredValidator]"
              :error-messages="store?.errors?.address?.[0]"
              clearable
            />
          </VCol>

          <VCol cols="12" md="6">
            <VTextField
              v-model="store.selected.number"
              label="Company Number"
              placeholder="AB112233"
              :error-messages="store?.errors?.number?.[0]"
              clearable
            />
          </VCol>

          <VCol cols="12" md="6">
            <VTextField
              v-model="store.selected.vat_number"
              label="VAT Number"
              placeholder="AB112233"
              :error-messages="store?.errors?.vat_number?.[0]"
              clearable
            />
          </VCol>

          <VCol cols="12" md="6">
            <VTextField
              v-model="store.selected.sort_code"
              label="Sort Code"
              placeholder="00-00-00"
              :error-messages="store?.errors?.sort_code?.[0]"
              clearable
            />
          </VCol>

          <VCol cols="12" md="6">
            <VTextField
              v-model="store.selected.account_number"
              label="Account Number"
              placeholder="AB112233"
              :error-messages="store?.errors?.account_number?.[0]"
              clearable
            />
          </VCol>

          <VCol cols="12" md="6">
            <VTextField
              v-model="store.selected.policy_reference"
              label="Policy Reference"
              placeholder="000000"
              :error-messages="store?.errors?.policy_reference?.[0]"
              clearable
            />
          </VCol>

          <VCol cols="12" md="6">
            <VTextField
              v-model="store.selected.public_liability_number"
              label="Sort Code"
              placeholder="Public Liability Number"
              :error-messages="store?.errors?.public_liability_number?.[0]"
              clearable
            />
          </VCol>

          <VCol cols="12">
            <VCardItem class="px-0">
              <template #prepend>
                <VIcon
                  icon="mdi-file-document-multiple-outline"
                  class="text-disabled"
                />
              </template>

              <VCardTitle>Company Documents</VCardTitle>
            </VCardItem>

            <VDivider class="mt-1 mb-6" />
          </VCol>

          <VCol
            v-for="document in documents"
            :key="document.title"
            cols="12"
            lg="4"
          >
            <CompanyDocument v-bind="document" :store="store" />
          </VCol>

          <VCol cols="12">
            <div
              class="d-flex flex-wrap gap-4 justify-sm-space-between justify-center mt-8"
            >
              <VBtn
                :loading="store.isUpdating"
                :disabled="store.isUpdating"
                type="submit"
              >
                Update Details
              </VBtn>
            </div>
          </VCol>
        </template>
        <template v-else>
          <VCol cols="12">
            <Skeleton height="2rem" class="pa-2 mb-2" borderRadius="16px" />
          </VCol>
        </template>
      </VRow>
    </VForm>
  </VCard>
</template>
