<script lang="ts" setup>
const router = useRouter();
</script>

<template>
  <section>
    <VRow>
      <VCol cols="12">
        <VCard>
          <VCardTitle class="pl-4 pr-4 mt-3 mb-2">
            <VRow class="text-layout">
              <!-- @vue-expect-error -->
              <VCol
                cols="12"
                lg="6"
                :class="$vuetify.display.lgAndUp ? 'text-left' : 'text-center'"
              >
                <h6 class="text-h5">Companies Table</h6>
              </VCol>
              <!-- @vue-expect-error -->
              <VCol
                cols="12"
                lg="6"
                :class="$vuetify.display.lgAndUp ? 'text-right' : 'text-center'"
              >
                <!-- @vue-expect-error-->
                <VBtn
                  @click="() => router.push('/companies/create')"
                  color="primary"
                >
                  Create Company
                </VBtn>
              </VCol>
            </VRow>
          </VCardTitle>

          <CompaniesTable />
        </VCard>
      </VCol>
    </VRow>
  </section>
</template>
