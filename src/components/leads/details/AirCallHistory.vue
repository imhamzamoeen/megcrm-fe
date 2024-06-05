<script lang="ts" setup>
import useApiFetch from "@/composables/useApiFetch";
import useTime from "@/composables/useTime";
import { useToast } from "@/plugins/toastr";
import { useLeadsStore } from "@/stores/leads/useLeadsStore";
import { requiredValidator } from "@validators";
import { ref } from "vue";

const leadStore = useLeadsStore();
const time = useTime();
const loader = ref(false);
const toast = useToast();
const errorMessage = ref("");
const airCallFormRef = ref();
const responseData = ref([]);
const form: any = ref({
  phone_number: null,
});

const fixNumber = (str: string): string => str.replace(/\D/g, "").slice(-10);

const getCallData = async (number: any) => {
  try {
    loader.value = true;

    const { data } = await useApiFetch("/aircall/search-call", {
      data: {
        phone_number: "+44" + number.phone_number,
      },
      method: "POST",
    });

    responseData.value = data;
  } catch (e: any) {
  } finally {
    loader.value = false;
  }
};

const airCallSearch = async () => {
  try {
    const { valid: valid } = await airCallFormRef?.value.validate();
    if (!valid) return;

    getCallData(form.value);

    errorMessage.value = "";
  } catch (err: any) {
    if (err?.response?.status === 422) {
      errorMessage.value = err?.response?.data?.errors?.phone_number?.[0];
    } else {
      toast.error(err.message);
    }
  }
};

onMounted(() => {
  form.value.phone_number = fixNumber(leadStore?.selectedLead?.phone_no);

  if (form.value.phone_number.length === 10) {
    getCallData(form.value);
  } else {
    toast.error("Invalid number, please update and click search button.");
  }
});
</script>

<template>
  <VCard title="Calls History ( AIR CALL )">
    <template #append>
      <div class="me-n3 mt-n2">
        <VCol cols="12">
          <VForm ref="airCallFormRef" @submit.prevent="airCallSearch">
            <div
              class="app-user-search-filter d-flex flex-wrap align-center gap-x-6 gap-y-4"
            >
              <VTextField
                v-model="form.phone_number"
                :rules="[requiredValidator]"
                label="Phone Number"
                placeholder="7943111370"
                density="compact"
                style="min-inline-size: 14rem"
                prefix="+44"
                class="order-2 order-sm-1"
                clearable
                hide-details
                single-line
                required
                :maxlength="10"
                :minLength="10"
                :error-messages="errorMessage"
              />

              <VBtn
                class="order-sm-2 order-1"
                size="small"
                type="submit"
                :disabled="loader"
                :loading="loader"
                icon="mdi-magnify"
              />
            </div>
          </VForm>
        </VCol>
      </div>
    </template>

    <VCardText>
      <VAlert class="mb-6" border="start" color="info" variant="tonal">
        Enter an e.164 format number to get the history.
      </VAlert>

      <VRow>
        <VCol cols="12">
          <VTable class="mt-4" fixed-header>
            <thead>
              <tr>
                <th class="text-uppercase">Caller Name</th>
                <th class="text-uppercase">Call Start Time</th>
                <th class="text-uppercase">Call End Time</th>
                <th class="text-uppercase">duration</th>
                <th class="text-uppercase">Phone Number</th>
                <th class="text-uppercase">Direction</th>
              </tr>
            </thead>
            <tbody class="text-high-emphasis">
              <tr v-if="responseData.length < 1">
                <td
                  class="font-italic font-weight-medium text-center"
                  colspan="6"
                >
                  No records found.
                </td>
              </tr>
              <tr v-else v-for="(callRecord, index) in (responseData as any)">
                <td>
                  <p class="font-weight-bold">
                    {{ callRecord?.user?.name }}
                  </p>
                </td>
                <td>
                  <p class="font-weight-medium">
                    {{ time.convertTimeStampToDate(callRecord?.started_at) }}
                  </p>
                </td>
                <td>
                  <p class="font-weight-medium">
                    {{ time.convertTimeStampToDate(callRecord?.ended_at) }}
                  </p>
                </td>
                <td>
                  <p class="font-weight-medium">
                    {{
                      time.convertSecondsToMinutes(callRecord?.duration ?? 0)
                    }}
                    mins
                  </p>
                </td>
                <td>
                  <p class="text-button font-italic">
                    {{ callRecord?.number?.digits }}
                  </p>
                </td>
                <td>
                  <p class="text-button font-italic">
                    {{ callRecord?.direction }}
                  </p>
                </td>
              </tr>
            </tbody>
          </VTable>
        </VCol>
      </VRow>
    </VCardText>
  </VCard>
</template>

<style lang="scss" scoped>
.card-list {
  --v-card-list-gap: 1.5625rem;
}

.custom-overflow {
  overflow: visible !important;
}

.float-right {
  float: inline-end;
}
</style>

<style lang="scss">
.meeting-schedule-list {
  .v-list-item__append {
    block-size: 100%;
  }
}
</style>
