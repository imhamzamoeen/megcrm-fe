<script lang="ts" setup>
import env from "@/constants/env";
import { useLeadsStore } from "@/stores/leads/useLeadsStore";

const { VITE_APP_API_URL: BASE_URL } = env;

const store = useLeadsStore();
const props = defineProps({
  address: {
    type: Object,
    default: () => {},
  },
});

const epcLink = computed(() => {
  if (store.checkIfCountryIsScotland(props.address.address)) {
    return "https://www.scottishepcregister.org.uk/CustomerFacingPortal/EPCPostcodeSearch";
  }

  return `https://find-energy-certificate.service.gov.uk/find-a-certificate/search-by-postcode?postcode=${props.address.post_code}`;
});
</script>

<template>
  <VCol v-if="address?.address && address.post_code" class="d-flex flex-wrap">
    <VTooltip>
      <template #activator="{ props }">
        <VChip
          v-bind="props"
          label
          size="small"
          class="text-capitalize"
          color="info"
        >
          <a :href="epcLink" target="_blank">
            EPC Link ({{ address.post_code.toUpperCase() }})
          </a>
        </VChip>
      </template>
      <span>View EPCs of {{ address.post_code.toUpperCase() }}</span>
    </VTooltip>

    <VTooltip>
      <template #activator="{ props }">
        <VChip
          v-bind="props"
          label
          size="small"
          class="text-capitalize"
          color="info"
        >
          <a href="/boilers" target="_blank"> Boiler Efficiency </a>
        </VChip>
      </template>
      <span>Click here to check boiler efficiency</span>
    </VTooltip>

    <VTooltip>
      <template #activator="{ props }">
        <VChip
          v-bind="props"
          label
          size="small"
          class="text-capitalize"
          color="info"
        >
          <a
            href="https://www.gassaferegister.co.uk/gas-safety/gas-safety-certificates-records/building-regulations-certificate/order-replacement-building-regulations-certificate/"
            target="_blank"
          >
            Gas safe register
          </a>
        </VChip>
      </template>
      <span>Click to check gas safe register</span>
    </VTooltip>

    <VTooltip>
      <template #activator="{ props }">
        <VChip
          v-bind="props"
          label
          size="small"
          class="text-capitalize"
          color="info"
        >
          <a
            :href="`${BASE_URL}/leads-links/council-tax/${address.post_code.toUpperCase()}`"
            target="_blank"
          >
            Council tax link
          </a>
        </VChip>
      </template>
      <span>Click to check council tax</span>
    </VTooltip>
  </VCol>
</template>
