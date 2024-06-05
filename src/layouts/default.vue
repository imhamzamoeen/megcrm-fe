<script lang="ts" setup>
import { useAuthStore } from "@/stores/auth/useAuthStore";
import { usePermissionsStore } from "@/stores/permissions/usePermissionsStore";
import { useSkins } from "@core/composable/useSkins";
import { useThemeConfig } from "@core/composable/useThemeConfig";

const auth = useAuthStore();
const store = usePermissionsStore();

onMounted(async () => {
  try {
    await auth.fetchUser();
    await store.getUserPermissions();
  } catch (e) {
    //
  }
});

const DefaultLayoutWithVerticalNav = defineAsyncComponent(
  () => import("./components/DefaultLayoutWithVerticalNav.vue")
);

const { width: windowWidth } = useWindowSize();
const { switchToVerticalNavOnLtOverlayNavBreakpoint } = useThemeConfig();

// ℹ️ This will switch to vertical nav when define breakpoint is reached when in horizontal nav layout
// Remove below composable usage if you are not using horizontal nav layout in your app
switchToVerticalNavOnLtOverlayNavBreakpoint(windowWidth);

const { layoutAttrs, injectSkinClasses } = useSkins();

injectSkinClasses();
</script>

<template>
  <DefaultLayoutWithVerticalNav v-if="auth.isLoggedIn" v-bind="layoutAttrs" />
</template>

<style lang="scss">
// As we are using `layouts` plugin we need its styles to be imported
@use "@layouts/styles/default-layout";
</style>
