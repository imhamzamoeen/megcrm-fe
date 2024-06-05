<script lang="ts" setup>
import useTime from "@/composables/useTime";
import { useCallCentersStore } from "@/stores/call-center/useCallCentersStore";
import { EventBus } from "@/utils/useEventBus";
import { requiredValidator } from "@validators";
import { useLeadsStore } from "../../stores/leads/useLeadsStore";

defineProps({
  isDialogVisible: {
    type: Boolean,
    default: () => false,
  },
});

const time = useTime();
const route = useRoute();
const store = useCallCentersStore();
const leadStore = useLeadsStore();
const formRef = ref();
const form = ref({
  call_center_status_id: null,
  called_at: null,
  comments: "",
  is_call_scheduled: false,
  call_scheduled_time: null,
});

const emit = defineEmits(["onDialogClose"]);

const closeDialog = () => {
  setTimeout(() => reset(), 1000);

  emit("onDialogClose");
};

const handleSubmit = async () => {
  console.log(leadStore.selectedLead);
  const validation = await formRef.value.validate();

  if (validation?.valid) {
    await store.store({
      ...form.value,
      lead_id: route?.params?.id ?? leadStore?.selectedLead?.id,
    });
  }
};

const reset = () => {
  form.value.call_center_status_id = null;
  form.value.called_at = null;
  form.value.is_call_scheduled = false;
  form.value.call_scheduled_time = null;
  form.value.comments = "";
};

const isCommentsRequired = computed(() => {
  const record: any = store.callCenterStatuses.find((i: any) =>
    i.name.toLowerCase().includes("cancel")
  );

  return (
    form.value.call_center_status_id !== null &&
    record &&
    form.value.call_center_status_id === record.id
  );
});

const shouldScheduleCall = computed(() => {
  const callStatuses = store.callCenterStatuses.filter((status: any) =>
    status.name.toLowerCase().includes("call")
  );

  return (
    form.value.call_center_status_id !== null &&
    callStatuses.some(
      (status: any) => status.id === form.value.call_center_status_id
    )
  );
});

const hasCheckedSchedule = computed(() => !!form.value.is_call_scheduled);

onMounted(() => EventBus.$on("hide-dialog", () => closeDialog()));
onUnmounted(() => EventBus.$off("hide-dialog"));
</script>

<template>
  <VDialog
    :width="$vuetify.display.smAndDown ? 'auto' : 800"
    :model-value="isDialogVisible"
    @update:model-value="closeDialog"
    persistent
  >
    <!-- Dialog close btn -->
    <DialogCloseBtn @click="closeDialog" />

    <VCard class="pa-sm-8 pa-5">
      <!-- Title -->
      <VCardItem class="text-center">
        <VCardTitle class="text-h4 mb-3"> Add a Call Record </VCardTitle>
      </VCardItem>

      <VForm ref="formRef" @submit.prevent="handleSubmit">
        <VCol cols="12">
          <p class="text-sm font-weight-medium font-italic">
            This call will be timestamped at: {{ time.currentTime() }}
          </p>
        </VCol>

        <VCol cols="12">
          <VAutocomplete
            v-model="form.call_center_status_id"
            :items="store.callCenterStatuses"
            :rules="[requiredValidator]"
            label="Status"
            item-title="name"
            item-value="id"
            clearable
            required
            :return-object="false"
          />
        </VCol>

        <VCol cols="12">
          <VTextarea
            v-model="form.comments"
            :rules="isCommentsRequired ? [requiredValidator] : []"
            label="Comments"
            placeholder="Some comments..."
            auto-grow
            clearable
            counter
            required
          />
        </VCol>

        <VCol v-if="shouldScheduleCall" cols="12">
          <VLabel>Do you want to schedule a call?</VLabel>
          <VSwitch v-model="form.is_call_scheduled" />
        </VCol>

        <VCol v-if="shouldScheduleCall && form.is_call_scheduled" cols="12">
          <transition name="fade" mode="out-in">
            <AppDateTimePicker
              v-model="form.call_scheduled_time"
              :rules="hasCheckedSchedule ? [requiredValidator] : []"
              :config="{
                minDate: 'today',
                altInput: true,
                altFormat: 'F j, Y H:i',
                dateFormat: 'Y-m-d H:i',
                enableTime: true,
              }"
              label="Call Time"
              placeholder="Select date and time"
              required
            />
          </transition>
        </VCol>

        <VCol cols="12">
          <div class="d-flex align-center gap-3 mt-6">
            <VBtn
              type="submit"
              :disabled="store.isLoading"
              :loading="store.isLoading"
            >
              Save
            </VBtn>

            <VBtn color="secondary" variant="tonal" @click="closeDialog">
              Cancel
            </VBtn>
          </div>
        </VCol>
      </VForm>
    </VCard>
  </VDialog>
</template>
