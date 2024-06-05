<script setup lang="ts">
import useApiFetch from "@/composables/useApiFetch";
import useTime from "@/composables/useTime";
import { useToast } from "@/plugins/toastr";
import { useAuthStore } from "@/stores/auth/useAuthStore";
import { useCallCentersStore } from "@/stores/call-center/useCallCentersStore";
import { useLeadsStore } from "@/stores/leads/useLeadsStore";
import { fixNumber } from "@/utils/useString";
import avatar1 from "@images/avatars/avatar-4.png";

const auth: any = useAuthStore();
const leadStore = useLeadsStore();
const store = useCallCentersStore();
const time = useTime();
const $toast = useToast();

const isDialogVisible = ref(false);
const isConfirmDialogVisible = ref(false);
const body = ref("");
const selectedNumberForCall: any = ref("");
const airCallLoader = ref(false);

let isDialCall = true;

const handleAirCall = async (lead: any) => {
  try {
    if (!lead?.phone_no) {
      $toast.error("phone number invalid");
      return;
    }
    leadStore.selectedId = lead.id;
    airCallLoader.value = true;
    /* before making a call i need to make another call to check the stats of this number and check whether someone else has called it or not */
    let { data: oldCalls } = await useApiFetch("/aircall/search-call", {
      data: {
        phone_number: "+44" + fixNumber(lead?.phone_no ?? ""),
      },
      method: "POST",
    });
    selectedNumberForCall.value = "+44" + fixNumber(lead?.phone_no ?? "");
    const myCallerId = auth?.user?.air_caller_id;
    oldCalls = oldCalls.filter(function (obj: any) {
      /* check if some one else has called it or not */
      if (!obj.user) {
        return false; // if its an inbound then it should not be included
      }
      return myCallerId != obj?.user?.id;
    });

    if (oldCalls.length > 0) {
      console.log(oldCalls);

      const otherCallersNames = oldCalls
        ?.map(function (obj: any) {
          return obj.user.name;
        })
        .filter(
          (value: any, index: any, self: any) => self.indexOf(value) === index // make uniquness of name
        )
        .join(", ");

      console.log(`output->others`, otherCallersNames);

      body.value = `This person is already called by ${otherCallersNames}. would you still like to call this customer`;
      isConfirmDialogVisible.value = true;
      // means someone has called it and its not me
      return;
    }

    if (isDialCall) {
      return makeDialCall(selectedNumberForCall.value);
    } else {
      return false;
    }
  } catch (err: any) {
    console.log(err);
    $toast.error(err.response?.data?.message ?? "Something Went Wrong!");
  } finally {
    leadStore.selectedId = null;
    airCallLoader.value = false;
  }
};

const makeDialCall = async (phone_no: string) => {
  try {
    airCallLoader.value = true;
    const { data, message } = await useApiFetch("/aircall/dial-call", {
      data: {
        phone_number: "+44" + fixNumber(phone_no),
      },
      method: "POST",
    });
    $toast.success("AirCall Success");
  } catch (err: any) {
    $toast.error(err.response?.data?.message ?? "Something Went Wrong!");
  } finally {
    airCallLoader.value = false;
  }
};

onMounted(async () => await store.fetchCallCenterStatuses());
</script>

<template>
  <VCard title="Calling Schedule">
    <template #append>
      <div class="me-n3 mt-n2">
        <VCol class="d-flex align-center" cols="12">
          <VTooltip>
            <template #activator="{ props }">
              <div v-bind="props">
                <VProgressCircular
                  v-if="
                    airCallLoader &&
                    `+44` + fixNumber(leadStore?.selectedLead?.phone_no ?? '')
                  "
                  size="24"
                  color="info"
                  indeterminate
                />
                <VBtn
                  v-else
                  @click.stop="handleAirCall(leadStore.selectedLead)"
                  v-bind="props"
                  icon="mdi-phone-dial-outline"
                  color="info"
                  size="small"
                />
              </div>
            </template>
            <span>Make a new AirCall call</span>
          </VTooltip>
          <VTooltip>
            <template #activator="{ props }">
              <VBtn
                v-bind="props"
                @click="isDialogVisible = true"
                color="primary"
                icon="mdi-content-save-alert-outline"
                size="small"
              />
            </template>
            <span>Save call details</span>
          </VTooltip>
        </VCol>
      </div>
    </template>

    <VCardText>
      <VList lines="two" class="meeting-schedule-list card-list">
        <template #default>
          <VAlert clas="mb-4" border="start" color="info" variant="tonal">
            Once you have added a call record, you will not be able to delete or
            edit it.
          </VAlert>

          <VTable class="mt-4" fixed-header>
            <thead>
              <tr>
                <th class="text-uppercase">Call No</th>
                <th class="text-uppercase">Caller Name</th>
                <th class="text-uppercase">Details</th>
                <th class="text-uppercase">Comments</th>
                <th class="text-uppercase">Status</th>
              </tr>
            </thead>

            <tbody class="text-high-emphasis">
              <tr v-if="leadStore.selectedLead.call_centers < 1">
                <td
                  class="font-italic font-weight-medium text-center"
                  colspan="4"
                >
                  No records found.
                </td>
              </tr>
              <tr
                v-else
                v-for="(callRecord, index) in leadStore.selectedLead
                  .call_centers"
              >
                <td>
                  <p>#{{ index + 1 }}</p>
                </td>
                <td>
                  <p class="font-weight-medium">
                    {{ callRecord.created_by.name }}
                  </p>
                </td>
                <td>
                  <div class="d-flex align-center my-3">
                    <VAvatar rounded :size="38" :image="avatar1" class="me-3" />

                    <div>
                      <VListItemTitle class="text-sm font-weight-medium mb-1">
                        Call with {{ leadStore.selectedLead.full_name }}
                      </VListItemTitle>

                      <VListItemSubtitle
                        class="text-xs text-no-wrap d-flex align-center"
                      >
                        <VIcon start :size="16" icon="mdi-calendar-blank" />
                        <span>
                          {{ time.formatDate(callRecord.created_at) }}
                        </span>
                      </VListItemSubtitle>
                    </div>
                  </div>
                </td>
                <td>
                  <p class="text-button font-italic">
                    {{ callRecord?.comments ?? "No comments." }}
                  </p>
                </td>
                <td>
                  <div class="mt-3">
                    <VChip
                      size="x-small"
                      color="primary"
                      :text="callRecord?.call_center_status?.name"
                    />

                    <div v-if="callRecord?.is_call_scheduled">
                      <p class="font-italic mt-2">
                        Call scheduled at:
                        {{ time.formatDate(callRecord?.call_scheduled_time) }}
                      </p>
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          </VTable>
        </template>
      </VList>
    </VCardText>
  </VCard>

  <AddCallRecordDialog
    v-model:is-dialog-visible="isDialogVisible"
    @on-dialog-close="isDialogVisible = false"
  />
</template>

<style lang="scss" scoped>
.card-list {
  --v-card-list-gap: 1.5625rem;
}
</style>

<style lang="scss">
.meeting-schedule-list {
  .v-list-item__append {
    block-size: 100%;
  }
}
</style>
