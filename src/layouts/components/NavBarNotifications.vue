<script lang="ts" setup>
import { useAuthStore } from "@/stores/auth/useAuthStore";
import { useNotificationsStore } from "@/stores/notifications/useNotificationsStore";
import type { Notification } from "@layouts/types";

const router = useRouter();
const store: any = useAuthStore();
const notificationsStore: any = useNotificationsStore();
const notifications = computed(() => store.user.notifications);

const removeNotification = (notificationId: number) => {
  notifications.value.forEach((item: any, index: any) => {
    if (notificationId === item.id) notifications.value.splice(index, 1);
  });

  notificationsStore.destroy(notificationId);
};

const markAllAsRead = async () => {
  await notificationsStore.markAllAsRead();
  await store.fetchUser();
};

const handleNotificationClick = async (notification: Notification) => {
  if (notification?.data?.redirect_link) {
    router.push(notification.data.redirect_link);
  }

  await notificationsStore.markSingleAsRead(notification.id);
  await store.fetchUser();
};
</script>

<template>
  <Notifications
    :notifications="notifications"
    @remove="removeNotification"
    @markAllAsRead="markAllAsRead"
    @click:notification="handleNotificationClick"
  />
</template>
