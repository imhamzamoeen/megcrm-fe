<script lang="ts" setup>
import useApiFetch from "@/composables/useApiFetch";
import useDataTable from "@/composables/useDatatable";
import useTime from "@/composables/useTime";
import env from "@/constants/env";
import { useToast } from "@/plugins/toastr";
import router from "@/router";
import { useAuthStore } from "@/stores/auth/useAuthStore";
import { useCallCentersStore } from "@/stores/call-center/useCallCentersStore";
import { useLeadsStore } from "@/stores/leads/useLeadsStore";
import { usePermissionsStore } from "@/stores/permissions/usePermissionsStore";
import { copy, strTruncated } from "@/utils/useHelper";
import { fixNumber } from "@/utils/useString";
import moment from "moment";
import { mergeProps } from "vue";

const { VITE_APP_API_URL: BASE_URL } = env;

export type Comment = {
  leadId: Number | String;
  status: String;
  comments: String;
};

// Headers
const headers = [
  { text: "", key: "data-table-expand" },
  { title: "Name", key: "first_name" },
  { title: "Post Code", key: "post_code" },
  { title: "Lead Generator", key: "lead_generator_id", sortable: false },
  // { title: "Survey Booked By", key: "id", sortable: false },
  { title: "Status", key: "status_details", sortable: false },
  { title: "EPC", key: "epc", sortable: false },
  { title: "Recommend", key: "recommend", sortable: false },
  { title: "Gas Safe", key: "gas_safe", sortable: false },
  { title: "Added on", key: "created_at" },
  { title: "Actions", key: "actions", sortable: false },
];

const isDialogVisible = ref(false);

// filters
const filters = ref({
  name: "",
  phone_no: "",
  post_code: "",
  statuses: [],
  lead_generator_id: [],
  surveyor_id: [],
  timestamp: "",
  epc_assessment_at: "",
  improvements: "",
  features: "",
  address: "",
  reference_number: "",
  survey_booked_by: [],
});

const isCommentsDialogVisible = ref(false);

const form = reactive<Comment>({
  leadId: "",
  status: "",
  comments: "",
});

// composables
let SelectedNumberForCall: any = ref("");
let isDialCall = true;

const epcDetails = ref({});
const isEpcDialogVisible = ref(false);
const store: any = useLeadsStore();
const callCenterStore = useCallCentersStore();
const body = ref("");
const isConfirmDialogVisible = ref(false);
const auth: any = useAuthStore();
const permStore: any = usePermissionsStore();
const time = useTime();
const airCallLoader = ref(false);
const toast = useToast();
const { onSortChange, onPaginationChange } = useDataTable(store, filters, () =>
  store.fetchLeads({ include: ["leadGenerator", "benefits"].join(",") })
);

const handleCommentsSubmit = async (comments: String) => {
  form.comments = comments;

  await store.updateStatus(form);
  await store.fetchLeads({ include: "leadGenerator" });
};

const onStatusSelect = (leadId: any, status: any) => {
  form.leadId = leadId;
  form.status = status;

  isCommentsDialogVisible.value = true;
};

const onRowClick = ($event: PointerEvent, item: any) => {
  handleRedirect(item.item.raw.id);
};

const handleRedirect = (itemId: any) => {
  store.selectedId = itemId;

  const routeData = router.resolve({
    name: "leads-edit-id-tab",
    params: { id: itemId, tab: "customer-details" },
  });

  window.open(routeData.href, "_blank");
};

const handleAirCall = async (lead: any) => {
  try {
    if (!lead?.phone_no) {
      toast.error("phone number invalid");
      return;
    }
    store.selectedId = lead.id;
    airCallLoader.value = true;

    let otherPeopleCalls = [];

    /* before making a call i need to make another call to check the stats of this number and check whether someone else has called it or not */
    let { data: oldCalls } = await useApiFetch("/aircall/search-call", {
      data: {
        phone_number: "+44" + fixNumber(lead?.phone_no ?? ""),
      },
      method: "POST",
    });
    SelectedNumberForCall.value = "+44" + fixNumber(lead?.phone_no ?? "");
    const myCallerId = auth?.user?.air_caller_id;
    otherPeopleCalls = oldCalls.filter(function (obj: any) {
      /* check if some one else has called it or not */
      if (!obj.user) {
        return false; // if its an inbound then it should not be included
      }
      return myCallerId != obj?.user?.id;
    });

    if (oldCalls.length > 0) {
      const otherCallersNames = oldCalls
        ?.map(function (obj: any) {
          return {
            name: obj.user.name,
            time: moment.unix(obj.started_at).format("DD/MM/YYYY hh:mm A"),
            number: obj.number.digits,
            unixTime: obj.started,
          };
        })
        .sort((a: any, b: any) => a.unixTime - b.unixTime)
        .filter(
          (value: any, index: any, self: any) => self.indexOf(value) === index // make uniquness of name
        )
        .map((i: any) => `From ${i.number} at ${i.time} by ${i.name}`)
        .join("<br />");

      body.value = `This person is already called by:<br /><br />${otherCallersNames}<br /><br /><p class="font-italic">Last comment: ${
        lead?.status_details?.reason?.toUpperCase() ?? "NULL"
      } (${
        lead.status_details?.user?.name ?? "System"
      })</p>Do you still like to call this customer?`;
      isConfirmDialogVisible.value = true;
      // means someone has called it and its not me
      return;
    }

    if (isDialCall) {
      return makeDialCall(SelectedNumberForCall.value);
    } else {
      return false;
    }
  } catch (err: any) {
    console.log(err);
    toast.error(err.response?.data?.message ?? "Something Went Wrong!");
  } finally {
    store.selectedId = null;
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
    toast.success("AirCall Success");
  } catch (err: any) {
    toast.error(err.response?.data?.message ?? "Something Went Wrong!");
  } finally {
    airCallLoader.value = false;
  }
};

const handleSwalCallback = (response: boolean) => {
  if (response) {
    makeDialCall(SelectedNumberForCall.value);
  }
};

const handleStoreCallStatus = (lead: any) => {
  store.selectedLead = lead;
  isDialogVisible.value = true;
};

const handleLeadUpdate = (lead: any) => {
  store.selectedLead = lead;
  store.update();
};

const handleEpcDetailsClick = async (details: any, postCode: number) => {
  if (!details) {
    window.open(`${BASE_URL}/leads-links/epc/${postCode}`);

    return;
  }

  epcDetails.value = details;
  isEpcDialogVisible.value = true;
};

onMounted(async () => {
  await store.getExtras();
  await callCenterStore.fetchCallCenterStatuses();
});
</script>

<template>
  <!-- Filters -->
  <VRow class="pa-4">
    <VCol cols="12" lg="4">
      <VTextField
        v-model="filters.name"
        label="Name"
        clearable
        density="compact"
      />
    </VCol>

    <VCol cols="12" lg="4">
      <VTextField
        v-model="filters.post_code"
        label="Post code"
        clearable
        density="compact"
      />
    </VCol>

    <VCol cols="12" lg="4">
      <VTextField
        v-model="filters.reference_number"
        label="Reference Number"
        clearable
        density="compact"
      />
    </VCol>

    <VCol cols="12" lg="4">
      <VAutocomplete
        v-model="filters.statuses"
        :items="store.leadTableStatuses"
        label="Status"
        placeholder="Select status"
        item-title="name"
        item-value="name"
        chips
        multiple
        clearable
        :return-object="false"
        density="compact"
      />
    </VCol>

    <VCol cols="12" lg="4">
      <VAutocomplete
        v-model="filters.lead_generator_id"
        :items="store.leadGenerators"
        label="Lead Generator"
        placeholder="Select Lead Genrator"
        item-title="name"
        item-value="id"
        chips
        multiple
        clearable
        :return-object="false"
        density="compact"
      />
    </VCol>

    <VCol cols="12" lg="4">
      <VAutocomplete
        v-model="filters.survey_booked_by"
        :items="store.csrs"
        label="Survey Booked By"
        placeholder="Select User"
        item-title="name"
        item-value="id"
        chips
        multiple
        clearable
        :return-object="false"
        density="compact"
      />
    </VCol>

    <VCol cols="12" lg="4">
      <VAutocomplete
        v-model="filters.surveyor_id"
        :items="store.surveyors"
        label="Surveyor"
        placeholder="Select surveyor"
        item-title="name"
        item-value="id"
        chips
        multiple
        clearable
        :return-object="false"
        :disabled="permStore.isSurveyorOnly"
        density="compact"
      />
    </VCol>

    <VCol cols="12" lg="4">
      <AppDateTimePicker
        v-model="filters.timestamp"
        :config="{
          mode: 'range',
          wrap: true,
          altInput: true,
          altFormat: 'F j, Y',
          dateFormat: 'Y-m-d',
        }"
        label="Dated"
        placeholder="Select date"
        density="compact"
        clearable
      />
    </VCol>

    <VCol cols="12" lg="4">
      <VTextField
        v-model="filters.address"
        label="Address"
        clearable
        density="compact"
      />
    </VCol>

    <VCol cols="12" lg="4">
      <AppDateTimePicker
        v-model="filters.epc_assessment_at"
        :config="{
          mode: 'range',
          wrap: true,
          altInput: true,
          altFormat: 'F j, Y',
          dateFormat: 'Y-m-d',
        }"
        label="EPC Assessment Date"
        placeholder="Select date"
        density="compact"
        clearable
      />
    </VCol>

    <VCol cols="12" lg="4">
      <VTextField
        v-model="filters.features"
        label="Features"
        clearable
        density="compact"
      />
    </VCol>

    <VCol cols="12" lg="4">
      <VTextField
        v-model="filters.improvements"
        label="Improvements"
        clearable
        density="compact"
      />
    </VCol>
  </VRow>

  <!-- Table-->
  <DataTable
    :store="store"
    :items="store.leads"
    :headers="headers"
    show-expand
    class="text-no-wrap"
    @click:row="onRowClick"
    @update:on-pagination-change="onPaginationChange"
    @update:on-sort-change="onSortChange"
  >
    <!-- Expanded Data -->
    <!-- @vue-expect-error -->
    <template v-slot:expanded-row="{ columns, item }">
      <tr>
        <td class="pa-5" :colspan="columns.length">
          <p class="px-1 mb-0">
            Address:
            <span class="font-italic">{{ item.raw.address }}</span>
          </p>
        </td>
      </tr>
      <tr>
        <td class="pa-5" :colspan="columns.length">
          <p class="px-1 mb-0">
            Email:
            <span class="d-inline-flex">
              <a
                v-if="item.raw?.email"
                :href="`mailto:${item.raw.email}`"
                class="font-italic"
              >
                {{ item.raw.email ?? "Not found" }}
              </a>
              <p v-else class="mb-0 font-italic">Not found</p>
            </span>
          </p>
        </td>
      </tr>
      <tr>
        <td class="pa-5" :colspan="columns.length">
          <p class="px-1 mb-0">
            Phone:
            <span class="d-inline-flex">
              <a
                v-if="item.raw?.phone_number_formatted"
                :href="`tel:${item.raw.phone_number_formatted}`"
                class="font-italic"
              >
                {{ item.raw.phone_number_formatted ?? "Not found" }}
              </a>
              <p v-else class="mb-0 font-italic">
                {{ item.raw?.phone_number_formatted ?? "NULL" }}
              </p>
            </span>
          </p>
        </td>
      </tr>
      <tr>
        <td class="pa-5" :colspan="columns.length">
          <p class="px-1 mb-0">
            Survey booked by:
            <span class="d-inline-flex">
              <VBtn
                class="text-white"
                variant="elevated"
                size="x-small"
                :color="
                  store.getColorOfSurveyBookers(
                    store.getNameOfSurveyBookers(item)
                  )
                "
                readonly
              >
                {{ store.getNameOfSurveyBookers(item) }}
              </VBtn>
            </span>
          </p>
        </td>
      </tr>
      <tr>
        <td class="pa-5" :colspan="columns.length">
          <p class="px-1 mb-0">
            Survey booking comments:
            <span class="d-inline-flex">
              <p class="mb-0 font-italic">
                {{ store.getCommentsOfSurveyBooker(item) }}
              </p>
            </span>
          </p>
        </td>
      </tr>
      <tr>
        <td class="pa-5" :colspan="columns.length">
          <p class="px-1 mb-0">
            Benefits:
            <span class="d-inline-flex">
              <p class="mb-0 font-italic">
                {{
                  item.raw.benefits.length > 0
                    ? item.raw.benefits.map((b: any) => b.name).join(", ")
                    : "No benefits"
                }}
              </p>
            </span>
          </p>
        </td>
      </tr>
      <tr v-if="item.raw?.tracking_link">
        <td class="pa-5" :colspan="columns.length">
          <a :href="item.raw.tracking_link" target="_blank" class="px-1 mb-0">
            Click here to open tracking link
          </a>
        </td>
      </tr>
      <tr>
        <td class="pa-5" :colspan="3">
          <VTextField label="EPC" v-model="item.raw.epc" density="compact" />
        </td>
        <td class="pa-5" :colspan="3">
          <VTextField
            label="Recommend"
            v-model="item.raw.recommend"
            density="compact"
          />
        </td>
        <td class="pa-5" :colspan="3">
          <VTextField
            label="Gas Safe"
            v-model="item.raw.gas_safe"
            density="compact"
          />
        </td>
        <td class="text-center pa-5" :colspan="1">
          <VBtn
            class="mt-2"
            @click="handleLeadUpdate(item.raw)"
            size="small"
            :loading="store.isLoading"
            :disabled="store.isLoading"
          >
            Save
          </VBtn>
        </td>
      </tr>
    </template>

    <!-- Name -->
    <!-- @vue-expect-error -->
    <template #item.first_name="{ item }">
      {{ item.raw.full_name }}
    </template>

    <!-- Post Code -->
    <!-- @vue-expect-error -->
    <template #item.post_code="{ item }">
      <VTooltip>
        <template #activator="{ props }">
          <div v-bind="props" @click.stop="copy(item.raw.post_code)">
            {{ item.raw.post_code }}
          </div>
        </template>
        <span>
          {{ item.raw.address }}
        </span>
      </VTooltip>
    </template>

    <!-- Lead Generator -->
    <!-- @vue-expect-error -->
    <template #item.lead_generator_id="{ item }">
      <VTooltip>
        <template #activator="{ props }">
          <div class="font-italic" v-bind="props">
            {{
              strTruncated(
                item.raw?.lead_generator?.name ?? "No lead generator",
                10
              )
            }}
          </div>
        </template>
        {{ item.raw?.lead_generator?.name ?? "No lead generator" }}
      </VTooltip>
    </template>

    <!-- Status -->
    <!-- @vue-expect-error -->
    <template #item.status_details="{ item }">
      <VMenu>
        <template v-slot:activator="{ props: menu }">
          <VTooltip location="top">
            <template v-slot:activator="{ props: tooltip }">
              <VBtn
                class="text-white"
                size="x-small"
                :color="
                  item.raw?.status_details?.lead_status_model?.color ??
                  'primary'
                "
                v-bind="mergeProps(menu, tooltip)"
              >
                {{
                  item.raw?.status_details?.name?.toUpperCase() ?? "No status"
                }}
              </VBtn>
            </template>
            <span>
              {{ item.raw?.status_details?.reason }}
              {{
                item?.raw?.status_details?.user &&
                `by ${
                  item.raw.status_details?.user?.name ?? "System"
                } at ${time.formatDate(item.raw.status_details?.created_at)}`
              }}
            </span>
          </VTooltip>
        </template>
        <VList>
          <VListItem
            @click="onStatusSelect(item.raw.id, status.name)"
            v-for="(status, index) in store.leadTableStatuses"
            :key="`${item.raw.id}-${index}`"
          >
            {{ status.name }}
          </VListItem>
        </VList>
      </VMenu>
    </template>

    <!-- EPC -->
    <!-- @vue-expect-error -->
    <template #item.epc="{ item }">
      <VBtn
        class="text-white"
        variant="elevated"
        size="x-small"
        :color="store.getBadgeColorsForExtraColumns(item.raw.epc)"
        readonly
      >
        <p class="font-italic">{{ item.raw?.epc ?? "NULL" }}</p>
      </VBtn>
    </template>

    <!-- Gas Safe -->
    <!-- @vue-expect-error -->
    <template #item.gas_safe="{ item }">
      <VBtn
        class="text-white"
        variant="elevated"
        size="x-small"
        :color="store.getBadgeColorsForExtraColumns(item.raw.gas_safe)"
        readonly
      >
        <p class="font-italic">{{ item.raw?.gas_safe ?? "NULL" }}</p>
      </VBtn>
    </template>

    <!-- Recommend -->
    <!-- @vue-expect-error -->
    <template #item.recommend="{ item }">
      <VBtn
        class="text-white"
        variant="elevated"
        size="x-small"
        :color="store.getBadgeColorsForExtraColumns(item.raw.recommend)"
        readonly
      >
        <p class="font-italic">{{ item.raw?.recommend ?? "NULL" }}</p>
      </VBtn>
    </template>

    <!-- Created At -->
    <!-- @vue-expect-error -->
    <template #item.created_at="{ item }">
      <p class="ma-0">
        {{ time.formatDate(item.raw.created_at, "DD/MM/YYYY") }}
      </p>
    </template>

    <!-- Actions -->
    <!-- @vue-expect-error -->
    <template #item.actions="{ item }">
      <VTooltip location="bottom">
        <template #activator="{ props }">
          <IconBtn
            @click.stop="
              handleEpcDetailsClick(item.raw?.epc_details, item.raw.post_code)
            "
            :color="item.raw?.epc_details && 'success'"
            v-bind="props"
            class="mt-1 mr-1"
            :icon="
              item.raw?.epc_details ? 'mdi-eye-outline' : 'mdi-open-in-new'
            "
          />
        </template>
        <span>View EPC Details</span>
      </VTooltip>

      <VTooltip
        v-if="auth.user.email == 'cfaysal099@gmail.com'"
        location="bottom"
      >
        <template #activator="{ props }">
          <IconBtn @click="store.deleteLead(item.raw.id)" v-bind="props">
            <VProgressCircular
              v-if="store.isLoading && store.selectedId === item.raw.id"
              size="24"
              color="info"
              indeterminate
            />
            <VIcon v-else color="error" icon="tabler-trash" />
          </IconBtn>
        </template>
        <span>Are you sure you want to delete this lead?</span>
      </VTooltip>
      <VTooltip location="bottom">
        <template #activator="{ props }">
          <IconBtn @click.stop="handleAirCall(item.raw)" v-bind="props">
            <VProgressCircular
              v-if="
                airCallLoader &&
                (store.selectedId === item.raw.id ||
                  SelectedNumberForCall ===
                    `+44` + fixNumber(item?.raw?.phone_no ?? ''))
              "
              size="24"
              color="info"
              indeterminate
            />
            <VIcon v-else color="info" icon="mdi-phone-dial-outline" />
          </IconBtn>
        </template>
        <span>Open The Aircall App And Put this Number on Dial Pad</span>
      </VTooltip>
      <VTooltip location="bottom">
        <template #activator="{ props }">
          <IconBtn @click.stop="handleStoreCallStatus(item.raw)" v-bind="props">
            <VIcon color="warning" icon="mdi-phone-clock" />
          </IconBtn>
        </template>
        <span>Save the call status</span>
      </VTooltip>
      <VTooltip location="bottom">
        <template #activator="{ props }">
          <span @click.stop v-bind="props">
            <IconBtn
              @click.stop="store.sendDocsUploadLink(item.raw.id)"
              color="primary"
              class="mt-1 mr-1"
              icon="mdi-upload-outline"
              :disabled="!item.raw?.phone_number_formatted"
            />
          </span>
        </template>
        <span>{{
          item.raw?.phone_number_formatted
            ? "Send Tracking Link"
            : "Lead has invalid phone number."
        }}</span>
      </VTooltip>
    </template>
  </DataTable>

  <!-- 👉 Confirm Dialog -->
  <ConfirmDialog
    v-model:isDialogVisible="isConfirmDialogVisible"
    cancel-title="Action Cancelled"
    confirm-title="Alert!"
    confirm-msg="Sure, Proceeding...."
    :confirmation-question="body"
    cancel-msg="Some Other Customer is waiting for you 😺."
    @confirm="handleSwalCallback"
  />

  <!-- Dialogs -->
  <CommentsDialog
    v-model:is-comments-dialog-visible="isCommentsDialogVisible"
    v-model:is-loading="store.isLoading"
    @on-dialog-close="isCommentsDialogVisible = false"
    @on-comments-update="handleCommentsSubmit"
  />

  <AddCallRecordDialog
    v-model:is-dialog-visible="isDialogVisible"
    @on-dialog-close="isDialogVisible = false"
  />

  <EpcDetailsDialog
    v-model:is-dialog-visible="isEpcDialogVisible"
    :details="epcDetails"
    @on-dialog-close="isEpcDialogVisible = false"
  />
</template>

<style lang="scss" scoped>
.email-color {
  color: "#4FC3F7";
}

:deep(.v-table__wrapper) {
  overflow-y: hidden;
}

:deep(.v-field__append-inner) {
  padding-top: 5px !important;
}
</style>
