<script lang="ts" setup>
import CalendarComponent from "@/pages/calendar/index.vue";
import ApexChartAreaChart from "@/views/charts/apex-chart/ApexChartAreaChart.vue";

const statisticsVertical = [
  {
    title: "Total Orders",
    color: "primary",
    icon: "mdi-cart-plus",
    stats: "155k",
    change: 22,
  },
  {
    title: "Total Profit",
    color: "warning",
    icon: "mdi-wallet-giftcard",
    stats: "$89.34k",
    change: -18,
  },
  {
    title: "Total Impression",
    color: "info",
    icon: "mdi-link",
    stats: "142.8k",
    change: 62,
  },
  {
    title: "Total Sales",
    color: "success",
    icon: "mdi-currency-usd",
    stats: "$13.4k",
    change: 38,
  },
];
</script>

<template>
  <VRow>
    <VCol cols="12" lg="8">
      <VRow>
        <VCol cols="12">
          <CardCongratulations />
        </VCol>

        <VCol cols="12">
          <VRow>
            <VCol
              v-for="statistics in statisticsVertical"
              :key="statistics.title"
              cols="12"
              lg="3"
            >
              <CardStatistics v-bind="statistics" />
            </VCol>
          </VRow>
        </VCol>
      </VRow>
    </VCol>

    <VCol cols="12" lg="4">
      <CardMostSalesInCountries />
    </VCol>

    <VCol cols="12">
      <CalendarComponent />
    </VCol>

    <VCol cols="12">
      <VCard>
        <VCardItem class="d-flex flex-wrap justify-space-between gap-4">
          <VCardTitle>Leads Chart</VCardTitle>
          <VCardSubtitle>Statistics in system</VCardSubtitle>

          <template #append>
            <div class="date-picker-wrapper">
              <AppDateTimePicker
                model-value="2022-06-09"
                prepend-inner-icon="mdi-calendar-blank-outline"
                density="compact"
                placeholder="Select Date"
                :config="{ position: 'auto right' }"
              />
            </div>
          </template>
        </VCardItem>

        <VCardText>
          <ApexChartAreaChart />
        </VCardText>
      </VCard>
      <!-- <CardMonthlyStatistics /> -->
    </VCol>
  </VRow>
</template>
