<script lang="ts" setup>
import useTime from "@/composables/useTime";
import { useToast } from "@/plugins/toastr";
import { useLeadsStore } from "@/stores/leads/useLeadsStore";
import { capitalizeFirstLetter } from "@/utils/useString";

const isDialogVisible = ref(false);
const leadStore: any = useLeadsStore();
const time = useTime();
const $toast = useToast();
const sendingSMS = ref(false);
const panel = ref(0);

const sendSms = async (body: number) => {
  try {
    sendingSMS.value = true;
    await leadStore.sendSms(leadStore.selectedLead.id, { body });
  } catch (e) {
  } finally {
    sendingSMS.value = false;
  }
};

const updateTemplateBody = (template: any) => {
  let body = template.body_copy;

  for (const [key, value] of Object.entries(template.model)) {
    const placeholder = `{${key}}`;

    body = body.replace(new RegExp(placeholder, "g"), value);
  }

  template.body = body;
};

const guessTemplateValue = () => {
  const properties: any = {
    name: leadStore?.selectedLead?.first_name ?? "name",
    email: leadStore?.selectedLead?.lead_generator?.email ?? "email",
    whatsapp: leadStore?.selectedLead?.lead_generator?.phone_no ?? "phone_no",
    phone: leadStore?.selectedLead?.lead_generator?.phone_no ?? "phone_no",
    address: leadStore?.selectedLead?.address ?? "address",
    company_name:
      leadStore?.selectedLead?.lead_generator?.name ?? "company_name",
  };

  leadStore.sms_templates.value = leadStore.sms_templates.map((t: any) => {
    t.model = [];

    for (const [key, value] of Object.entries(properties)) {
      if (t.properties.includes(key)) {
        t.model[key] = value;
      }
    }

    let body = t.body_copy;

    for (const [key, value] of Object.entries(t.model)) {
      const placeholder = `{${key}}`;

      body = body.replace(new RegExp(placeholder, "g"), value);
    }

    t.body = body;

    return t;
  });
};

onMounted(() => guessTemplateValue());
</script>

<template>
  <VCard>
    <VCardItem>
      <template #prepend>
        <VIcon icon="mdi-cellphone-check" class="text-disabled" />
      </template>

      <VCardTitle>
        SMS Alerts Templates ( Sender Name :
        {{ leadStore.selectedLead.lead_generator?.sender_id ?? "NULL" }}
        )
      </VCardTitle>
    </VCardItem>

    <VDivider />
  </VCard>

  <VExpansionPanels class="mt-4" v-model="panel" multiple>
    <VExpansionPanel
      v-for="template in leadStore.sms_templates"
      :key="template.id"
      :title="template.name"
    >
      <VExpansionPanelText>
        <VRow>
          <VCol
            v-for="field in template.properties"
            :key="field"
            cols="12"
            lg="6"
          >
            <VTextField
              v-model="template.model[field]"
              :label="capitalizeFirstLetter(field)"
              clearable
              density="compact"
              @input="updateTemplateBody(template)"
            />
          </VCol>
        </VRow>
        <VRow>
          <VCol>
            <VTextarea
              v-model="template.body"
              label="Body"
              placeholder="Some content..."
              auto-grow
              counter
              readonly
            />
          </VCol>
        </VRow>
        <VRow>
          <VCol>
            <VBtn
              @click="sendSms(template.body)"
              :disabled="sendingSMS"
              :loading="sendingSMS"
            >
              Send SMS
            </VBtn>
          </VCol>
        </VRow>
      </VExpansionPanelText>
    </VExpansionPanel>
  </VExpansionPanels>

  <VCard class="mt-6">
    <VCardItem>
      <template #prepend>
        <VIcon icon="mdi-cellphone-marker" class="text-disabled" />
      </template>

      <template #append>
        <div class="me-n3 mt-n2">
          <VCol cols="12">
            <VTooltip :disabled="leadStore.selectedLead.phone_number_formatted">
              <template #activator="{ props }">
                <div v-bind="props" class="d-inline-block">
                  <VBtn
                    :disabled="!leadStore.selectedLead.phone_number_formatted"
                    @click="isDialogVisible = true"
                    color="primary"
                  >
                    Send Customer an Alert
                  </VBtn>
                </div>
              </template>
              <span>
                This lead has invalid number, please fix it to allow sending
                text messages.
              </span>
            </VTooltip>
          </VCol>
        </div>
      </template>

      <VCardTitle>SMS Alerts History</VCardTitle>
    </VCardItem>

    <VDivider />

    <VCardText>
      <VRow>
        <VCol cols="12">
          <VTable class="mt-4" fixed-header>
            <thead>
              <tr>
                <th class="text-uppercase">Content</th>
                <th class="text-uppercase">Sent At</th>
              </tr>
            </thead>
            <tbody class="text-high-emphasis">
              <tr v-if="leadStore.selectedLead.notifications.length < 1">
                <td
                  class="font-italic font-weight-medium text-center"
                  colspan="6"
                >
                  No records found.
                </td>
              </tr>
              <tr
                v-else
                v-for="(notification, index) in (leadStore.selectedLead.notifications as any)"
              >
                <td class="py-4">
                  <p class="mb-0 font-italic">
                    {{ notification?.data?.content ?? "NULL" }}
                  </p>
                </td>
                <td>
                  <p class="mb-0">
                    {{ time.formatDate(notification?.created_at) }}
                  </p>
                </td>
              </tr>
            </tbody>
          </VTable>
        </VCol>
      </VRow>
    </VCardText>
  </VCard>

  <SendSMSDialog v-model:is-dialog-visible="isDialogVisible" />
</template>
