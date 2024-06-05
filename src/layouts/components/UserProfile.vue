<script setup lang="ts">
import useApiFetch from "@/composables/useApiFetch";
import { useAuthStore } from "@/stores/auth/useAuthStore";
import avatar1 from "@images/avatars/avatar-1.png";
import { PerfectScrollbar } from "vue3-perfect-scrollbar";

const store: any = useAuthStore();

const logOut = async () => {
  await useApiFetch("/logout", { method: "POST" });

  store.logout();
};

const userProfileList: any = [
  { type: "divider" },
  {
    type: "navItem",
    icon: "mdi-account-outline",
    title: "Profile",
    to: { name: "profile" },
  },
  {
    type: "navItem",
    icon: "mdi-cog-outline",
    title: "Settings",
    to: { name: "profile-tab", params: { tab: "account" } },
  },
  { type: "divider" },
  { type: "navItem", icon: "mdi-logout", title: "Logout", onClick: logOut },
];
</script>

<template>
  <VBadge
    dot
    location="bottom right"
    offset-x="3"
    offset-y="3"
    bordered
    color="success"
  >
    <VAvatar class="cursor-pointer" color="primary" variant="tonal">
      <VImg :src="avatar1" />

      <!-- SECTION Menu -->
      <VMenu activator="parent" width="230" location="bottom end" offset="14px">
        <VList>
          <!-- 👉 User Avatar & Name -->
          <VListItem>
            <template #prepend>
              <VListItemAction start>
                <VBadge
                  dot
                  location="bottom right"
                  offset-x="3"
                  offset-y="3"
                  color="success"
                >
                  <VAvatar color="primary" variant="tonal">
                    <VImg :src="avatar1" />
                  </VAvatar>
                </VBadge>
              </VListItemAction>
            </template>

            <VListItemTitle class="font-weight-semibold">
              {{ store.user.name }}
            </VListItemTitle>
            <VListItemSubtitle>{{ store.user.top_role }}</VListItemSubtitle>
          </VListItem>

          <PerfectScrollbar :options="{ wheelPropagation: false }">
            <template v-for="item in userProfileList" :key="item.title">
              <VListItem
                v-if="item.type === 'navItem'"
                :to="item.to"
                @click="item.onClick && item.onClick()"
              >
                <template #prepend>
                  <VIcon class="me-2" :icon="item.icon" size="22" />
                </template>

                <VListItemTitle>{{ item.title }}</VListItemTitle>

                <template v-if="item.badgeProps" #append>
                  <VBadge v-bind="item.badgeProps" />
                </template>
              </VListItem>

              <VDivider v-else class="my-2" />
            </template>
          </PerfectScrollbar>
        </VList>
      </VMenu>
      <!-- !SECTION -->
    </VAvatar>
  </VBadge>
</template>
