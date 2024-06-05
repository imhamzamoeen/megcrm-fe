<script lang="ts" setup>
import AddEditTeamDialog from "@/components/team/AddEditTeamDialog.vue";
import TeamTable from "@/components/team/TeamTable.vue";
import { useTeamStore } from "@/stores/team/useTeamStore";

const store = useTeamStore();
const isTeamDialogVisible: any = ref(false);

const openEditTeamModal = (team: any) => {
  isTeamDialogVisible.value = true;
  store.setTeamForSelected(team);
};
</script>
<template>
  <section>
    <VRow>
      <VCol cols="12">
        <VCard class="users-card">
          <VCardTitle class="pl-4 pr-4 mt-3 mb-2">
            <VRow class="text-layout">
              <VCol
                cols="12"
                lg="6"
                :class="$vuetify.display.lgAndUp ? 'text-left' : 'text-center'"
              >
                <h6 class="text-h5">Teams Table</h6>
              </VCol>
              <VCol
                cols="12"
                lg="6"
                :class="$vuetify.display.lgAndUp ? 'text-right' : 'text-center'"
              >
                <VBtn @click="isTeamDialogVisible = true" color="primary">
                  Make Team
                </VBtn>
              </VCol>
            </VRow>
          </VCardTitle>

          <TeamTable @edit-team="openEditTeamModal" />
        </VCard>
      </VCol>
    </VRow>
    <AddEditTeamDialog
      v-model:is-dialog-visible="isTeamDialogVisible"
      :store="store"
    />
  </section>
</template>
