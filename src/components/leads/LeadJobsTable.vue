<script lang="ts" setup>
import useDataTable from "@/composables/useDatatable";
import useTime from "@/composables/useTime";
import env from "@/constants/env";
import router from "@/router";
import { useAuthStore } from "@/stores/auth/useAuthStore";
import { useCallCentersStore } from "@/stores/call-center/useCallCentersStore";
import { useLeadJobsStore } from "@/stores/leads/useLeadJobsStore";
import { useLeadsStore } from "@/stores/leads/useLeadsStore";
import { usePermissionsStore } from "@/stores/permissions/usePermissionsStore";
import { copy, strTruncated } from "@/utils/useHelper";
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

const props = defineProps({
  filters: {
    required: false,
    type: Object as any,
    default: () => {},
  },
});

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
  ...props.filters,
});

const isCommentsDialogVisible = ref(false);
const isDialogVisible = ref(false);

const form = reactive<Comment>({
  leadId: "",
  status: "",
  comments: "",
});

// composables
const epcDetails = ref({});
const isEpcDialogVisible = ref(false);
const store: any = useLeadsStore();
const auth: any = useAuthStore();
const callCenterStore = useCallCentersStore();
const permStore: any = usePermissionsStore();
const leadJobStore: any = useLeadJobsStore();
const time = useTime();
const { onSortChange, onPaginationChange } = useDataTable(
  leadJobStore,
  filters,
  () =>
    leadJobStore.fetchLeads({
      include: ["leadGenerator", "benefits"].join(","),
    })
);

const handleCommentsSubmit = async (comments: String) => {
  form.comments = comments;

  await store.updateStatus(form);
  await leadJobStore.fetchLeads({ include: "leadGenerator" });
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
    :store="leadJobStore"
    :items="leadJobStore.leads"
    :headers="headers"
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

    <!-- Survey Booked By -->
    <!-- @vue-expect-error -->
    <template #item.id="{ item }">
      <VBtn
        class="text-white"
        variant="elevated"
        size="x-small"
        :color="
          store.getColorOfSurveyBookers(store.getNameOfSurveyBookers(item))
        "
        readonly
      >
        {{ store.getNameOfSurveyBookers(item) }}
      </VBtn>
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
                {{ item.raw?.status_details?.name.toUpperCase() }}
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
            v-for="(status, index) in store.leadJobTableStatuses"
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
</style>
