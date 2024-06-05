<script setup lang="ts">
import ScrollToTop from "@core/components/ScrollToTop.vue";
import { useThemeConfig } from "@core/composable/useThemeConfig";
import { hexToRgb } from "@layouts/utils";
import { useTheme } from "vuetify";

const {
  syncInitialLoaderTheme,
  syncVuetifyThemeWithTheme: syncConfigThemeWithVuetifyTheme,
  isAppRtl,
  handleSkinChanges,
} = useThemeConfig();

const { global } = useTheme();

// ℹ️ Sync current theme with initial loader theme
syncInitialLoaderTheme();
syncConfigThemeWithVuetifyTheme();
handleSkinChanges();
</script>

<template>
  <VLocaleProvider :rtl="isAppRtl">
    <!-- ℹ️ This is required to set the background color of active nav link based on currently active global theme's primary -->
    <VApp
      :style="`--v-global-theme-primary: ${hexToRgb(
        global.current.value.colors.primary
      )}`"
    >
      <RouterView />

      <ViewLightBoxImages />
      <ViewLeadDocument />

      <ScrollToTop />
    </VApp>
  </VLocaleProvider>
</template>

<style>
/* .v-input,
td {
  color: #000 !important;
} */

.no-x-padding {
  padding-inline: 0 !important;
}

.no-y-padding {
  padding-block: 0 !important;
}

.v-label {
  font-size: 1rem;
  font-weight: 500;
}

.v-field:has(input[required]) .v-label {
  padding-inline-end: 8px;
}

.v-field:has(input[required]) .v-label::after {
  position: absolute;
  color: red;
  content: "*";
  inset-block-start: 0;
  inset-inline-end: 0;
}

.v-toast {
  z-index: 9999999 !important;
}

.d-flex {
  column-gap: 20px; /* sets only for columns */
  gap: 10px;
  gap: 10px 20px; /* row-gap column gap */
  row-gap: 10px; /* sets only for rows */
}

.v-pagination__item--is-active {
  /* stylelint-disable-next-line liberty/use-logical-spec */
  margin-top: 2px !important;
}

::-webkit-scrollbar {
  block-size: 8px;
  inline-size: 8px;
}

::-webkit-scrollbar-thumb {
  border-radius: 4px; /* Optional: Set the border radius for a rounded look */
  background-color: #c5c5c5; /* Set the color of the scrollbar thumb */
}

::-webkit-scrollbar-track {
  background-color: #f1f1f1; /* Set the color of the scrollbar track */
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease-out;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.blink-animate {
  animation: blinker 2s linear infinite;
}

.custom-radio {
  /* stylelint-disable-next-line liberty/use-logical-spec */
  padding: 10px 20px 3px !important;
}

@keyframes blinker {
  50% {
    opacity: 0;
  }
}
</style>
