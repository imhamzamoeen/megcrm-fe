<script lang="ts" setup>
import { useCompaniesStore } from "@/stores/companies/useCompaniesStore";
import { requiredValidator } from "@validators";

const router = useRouter();
const store: any = useCompaniesStore();
const form = ref();

const handleSubmit = async () => {
  form.value?.validate().then(async (valid: any) => {
    if (valid.valid) {
      try {
        const company = await store.store(store.selected);

        router.push({
          name: "companies-id-edit",
          params: { id: company.id },
        });
      } catch (e) {
        //
      }
    }
  });
};

onUnmounted(() => store.reset());
</script>

<template>
  <VCard class="mb-4">
    <VForm ref="form" @submit.prevent="handleSubmit">
      <VCardItem>
        <template #prepend>
          <VBtn class="pa-1 mr-2" to="/companies" size="x-small" rounded>
            <VIcon icon="mdi-arrow-left" />
          </VBtn>
          <VIcon icon="mdi-office-building-outline" class="text-disabled" />
        </template>

        <template #append>
          <VBtn
            :loading="store.isLoading"
            :disabled="store.isLoading"
            type="submit"
          >
            Save Company
          </VBtn>
        </template>

        <VCardTitle>Company Details</VCardTitle>
      </VCardItem>

      <VDivider />

      <VCardText>
        <VRow>
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
              label="Public Liability Number"
              placeholder="Public Liability Number"
              :error-messages="store?.errors?.public_liability_number?.[0]"
              clearable
            />
          </VCol>
        </VRow>
      </VCardText>
    </VForm>
  </VCard>
</template>
