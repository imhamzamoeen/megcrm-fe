<script lang="ts" setup>
import { useRoute } from "vue-router";

const route = useRoute();

const activeTab = ref(route.params.tab);

// tabs
const tabs = [
  { title: "Account", icon: "mdi-account-outline", tab: "account" },
  { title: "Security", icon: "mdi-lock-open-outline", tab: "security" },
];
</script>

<template>
  <div>
    <VTabs v-model="activeTab" class="v-tabs-pill">
      <VTab
        v-for="item in tabs"
        :key="item.icon"
        :value="item.tab"
        :to="{ name: 'profile-tab', params: { tab: item.tab } }"
      >
        <VIcon size="20" start :icon="item.icon" />
        {{ item.title }}
      </VTab>
    </VTabs>

    <VWindow
      v-model="activeTab"
      class="mt-5 disable-tab-transition"
      :touch="false"
    >
      <!-- Account -->
      <VWindowItem value="account">
        <AccountSettings />
      </VWindowItem>

      <!-- Security -->
      <VWindowItem value="security">
        <AccountSecurity />
      </VWindowItem>
    </VWindow>
  </div>
</template>

<route lang="yaml">
meta:
  navActiveLink: "profile-tab"
</route>
