<script lang="ts" setup>
import { EventBus } from "@/utils/useEventBus";

const addInstallationType = () => {
  EventBus.$emit("show-installation-dialog");
};
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
                <h6 class="text-h5">Installation Engineer Types Table</h6>
              </VCol>
              <VCol
                cols="12"
                lg="6"
                :class="$vuetify.display.lgAndUp ? 'text-right' : 'text-center'"
              >
                <VBtn @click="addInstallationType" color="primary">
                  Create Installation Engineer Type
                </VBtn>
              </VCol>
            </VRow>
          </VCardTitle>

          <InstallationTypesTable />
        </VCard>
      </VCol>
    </VRow>
  </section>

  <AddInstallationTypeDialog />
</template>
