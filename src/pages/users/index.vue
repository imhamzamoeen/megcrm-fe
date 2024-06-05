<script lang="ts" setup>
import UsersTable from "@/components/users/UsersTable.vue";

const router = useRouter();
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
                <h6 class="text-h5">Users Table</h6>
              </VCol>
              <VCol
                cols="12"
                lg="6"
                :class="$vuetify.display.lgAndUp ? 'text-right' : 'text-center'"
              >
                <VBtn @click="router.push('/users/create')" color="primary">
                  Create User
                </VBtn>
              </VCol>
            </VRow>
          </VCardTitle>

          <UsersTable />
        </VCard>
      </VCol>
    </VRow>
  </section>
</template>
