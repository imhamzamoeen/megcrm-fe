<script lang="ts" setup>
import LeadsTable from "@/components/leads/LeadsTable.vue";
import { modules } from "@/constants/modules";
import { usePermissionsStore } from "@/stores/permissions/usePermissionsStore";

const isAddLeadDialogVisible: any = ref(false);
const store = usePermissionsStore();
const router = useRouter();

const handleCreateLead = () => router.push("/leads/create");
</script>
<template>
  <section>
    <VRow>
      <VCol cols="12">
        <VCard class="leads-card">
          <VCardTitle class="pl-4 pr-4 mt-3 mb-2">
            <VRow class="text-layout">
              <VCol
                cols="12"
                lg="6"
                :class="$vuetify.display.lgAndUp ? 'text-left' : 'text-center'"
              >
                <h6 class="text-h5">Leads Table</h6>
              </VCol>
              <VCol
                v-if="store.can([modules.LEADS + '.store'])"
                cols="12"
                lg="6"
                :class="$vuetify.display.lgAndUp ? 'text-right' : 'text-center'"
              >
                <VBtn @click="handleCreateLead" color="primary">
                  Create Lead
                </VBtn>
              </VCol>
            </VRow>
          </VCardTitle>

          <LeadsTable />
        </VCard>
      </VCol>
    </VRow>
  </section>

  <AddEditLeadDialog v-model:is-lead-dialog-visible="isAddLeadDialogVisible" />
</template>
