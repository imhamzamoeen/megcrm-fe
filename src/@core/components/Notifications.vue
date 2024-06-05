<script lang="ts" setup>
import useTime from "@/composables/useTime";
import { avatarText } from "@core/utils/formatters";
import avatar4 from "@images/avatars/avatar-4.png";
import avatar3 from "@images/avatars/lead.png";
import type { Notification } from "@layouts/types";
import { PerfectScrollbar } from "vue3-perfect-scrollbar";

interface Props {
  notifications: any;
  badgeProps?: unknown;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  location?: any;
}
interface Emit {
  (e: "remove", value: number): void;
  (e: "markAllAsRead"): void;
  (e: "click:notification", value: Notification): void;
}

const props: any = withDefaults(defineProps<Props>(), {
  notifications: [],
  location: "bottom end",
  badgeProps: undefined,
});

const emit = defineEmits<Emit>();
const time = useTime();
const isAllMarkRead = computed(() =>
  props.notifications.some((item: any) => item.read_at === null)
);

const markAllReadOrUnread = () => {
  emit("markAllAsRead");
};
</script>

<template>
  <IconBtn id="notification-btn">
    <VBadge
      dot
      v-bind="props.badgeProps"
      :model-value="props.notifications.some((n:any) => !n.read_at)"
      color="error"
      bordered
      offset-x="1"
      offset-y="1"
    >
      <VIcon icon="mdi-bell-outline" />
    </VBadge>

    <VMenu
      activator="parent"
      width="380px"
      :location="props.location"
      offset="14px"
      :close-on-content-click="false"
    >
      <VCard class="d-flex flex-column">
        <!-- 👉 Header -->
        <VCardItem class="notification-section">
          <VCardTitle>
            <span class="text-sm font-weight-regular">Notifications</span>
          </VCardTitle>

          <template #append>
            <IconBtn
              v-show="props.notifications.length"
              @click="markAllReadOrUnread"
            >
              <VIcon
                :icon="
                  isAllMarkRead ? 'mdi-email-outline' : 'mdi-email-open-outline'
                "
              />

              <VTooltip activator="parent" location="start">
                {{ !isAllMarkRead ? "All read" : "Mark all as read" }}
              </VTooltip>
            </IconBtn>
          </template>
        </VCardItem>

        <VDivider />

        <!-- 👉 Notifications list -->
        <PerfectScrollbar
          :options="{ wheelPropagation: false }"
          style="max-block-size: 23.75rem"
        >
          <VList class="py-0">
            <template
              v-for="(notification, index) in props.notifications"
              :key="notification.title"
            >
              <VDivider v-if="index > 0" />
              <VListItem
                link
                lines="one"
                min-height="66px"
                class="list-item-hover-class"
                @click.stop="$emit('click:notification', notification)"
              >
                <!-- Slot: Prepend -->
                <!-- Handles Avatar: Image, Icon, Text -->
                <template #prepend>
                  <VListItemAction start>
                    <VAvatar
                      size="40"
                      :color="
                        notification.color && notification.icon
                          ? notification.color
                          : undefined
                      "
                      :image="
                        notification.module === 'leads' ? avatar3 : avatar4
                      "
                      :icon="notification.icon || undefined"
                      :variant="notification.img ? undefined : 'tonal'"
                    >
                      <span v-if="notification?.data?.avatarText">
                        {{ avatarText(notification.data.avatarTextt) }}
                      </span>
                    </VAvatar>
                  </VListItemAction>
                </template>

                <VListItemTitle>
                  <span class="text-sm text-high-emphasis font-weight-medium">
                    {{ notification?.data?.title ?? "Title" }}
                  </span>
                </VListItemTitle>
                <VListItemSubtitle>
                  <span class="text-xs">
                    {{ notification?.data?.subtitle ?? "Subtitle" }}
                  </span>
                </VListItemSubtitle>
                <span class="text-xs text-disabled">
                  {{ time.diffForHumans(notification.created_at) }}
                </span>

                <!-- Slot: Append -->
                <template #append>
                  <div class="d-flex flex-column align-center gap-4">
                    <VBadge
                      dot
                      :color="!notification.read_at ? 'primary' : '#a8aaae'"
                      :class="`${
                        notification.read_at ? 'visible-in-hover' : ''
                      } ms-1`"
                    />

                    <div style="block-size: 28px; inline-size: 28px">
                      <IconBtn
                        size="x-small"
                        class="visible-in-hover"
                        @click.stop="$emit('remove', notification.id)"
                      >
                        <VIcon size="20" icon="mdi-close" />
                      </IconBtn>
                    </div>
                  </div>
                </template>
              </VListItem>
            </template>

            <VListItem
              v-show="!props.notifications.length"
              class="text-center text-medium-emphasis"
              style="block-size: 56px"
            >
              <VListItemTitle>No Notification Found!</VListItemTitle>
            </VListItem>
          </VList>
        </PerfectScrollbar>

        <VDivider />

        <!-- 👉 Footer -->
        <!-- <VCardText
          v-show="props.notifications.length"
          class="notification-footer"
        >
          <VBtn block> VIEW ALL NOTIFICATIONS </VBtn>
        </VCardText> -->
      </VCard>
    </VMenu>
  </IconBtn>
</template>

<style lang="scss">
.notification-section {
  padding: 14px !important;
}

.notification-footer {
  padding-block: 0.9375rem !important;
}

.list-item-hover-class {
  .visible-in-hover {
    display: none;
  }

  &:hover {
    .visible-in-hover {
      display: block;
    }
  }
}
</style>
