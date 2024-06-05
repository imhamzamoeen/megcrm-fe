<script lang="ts" setup>
import LeadJobsTable from "@/components/leads/LeadJobsTable.vue";

const isAddLeadDialogVisible: any = ref(false);
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
                <h6 class="text-h5">Jobs Table</h6>
              </VCol>
            </VRow>
          </VCardTitle>

          <LeadJobsTable />
        </VCard>
      </VCol>
    </VRow>
  </section>

  <AddEditLeadDialog v-model:is-lead-dialog-visible="isAddLeadDialogVisible" />
</template>
