<script setup lang="ts">
import { useGenerateImageVariant } from "@/@core/composable/useGenerateImageVariant";
import { useAuthStore } from "@/stores/auth/useAuthStore";
import authV1ResetPasswordMaskDark from "@images/pages/auth-v1-reset-password-mask-dark.png";
import authV1ResetPasswordMaskLight from "@images/pages/auth-v1-reset-password-mask-light.png";
import { VNodeRenderer } from "@layouts/components/VNodeRenderer";
import { themeConfig } from "@themeConfig";

const authV1ResetPasswordMask = useGenerateImageVariant(
  authV1ResetPasswordMaskLight,
  authV1ResetPasswordMaskDark
);

const route = useRoute();
const router = useRouter();

const auth = useAuthStore();

const form = ref<any>({
  token: route.params.id,
  email: route.query.email,
  password: "",
  password_confirmation: "",
});

const isPasswordVisible = ref(false);
const isConfirmPasswordVisible = ref(false);

const handleSubmit = async () => {
  await auth.resetPassword(form.value);

  if (auth.success) {
    router.push("/login");
  }
};
</script>

<template>
  <div class="auth-wrapper d-flex align-center justify-center pa-4">
    <VCard class="auth-card pa-2 pt-7" max-width="448">
      <VCardItem class="justify-center">
        <template #prepend>
          <div class="me-n2">
            <VNodeRenderer :nodes="themeConfig.app.logo" />
          </div>
        </template>

        <VCardTitle class="font-weight-bold text-2xl text-capitalize">
          {{ themeConfig.app.title }}
        </VCardTitle>
      </VCardItem>

      <VCardText class="pt-2">
        <h5 class="text-h5 mb-1">Reset Password 🔒</h5>
        <p class="mb-0">Enter your new password to continue.</p>
      </VCardText>

      <VCardText>
        <VForm @submit.prevent="handleSubmit">
          <VRow>
            <!-- password -->
            <VCol cols="12">
              <VTextField
                v-model="form.password"
                autofocus
                label="New Password"
                placeholder="············"
                :type="isPasswordVisible ? 'text' : 'password'"
                :append-inner-icon="
                  isPasswordVisible ? 'mdi-eye-off-outline' : 'mdi-eye-outline'
                "
                :error-messages="auth?.errors?.password?.[0]"
                @click:append-inner="isPasswordVisible = !isPasswordVisible"
              />
            </VCol>

            <!-- Confirm Password -->
            <VCol cols="12">
              <VTextField
                v-model="form.password_confirmation"
                label="Confirm Password"
                placeholder="············"
                :type="isConfirmPasswordVisible ? 'text' : 'password'"
                :append-inner-icon="
                  isConfirmPasswordVisible
                    ? 'mdi-eye-off-outline'
                    : 'mdi-eye-outline'
                "
                @click:append-inner="
                  isConfirmPasswordVisible = !isConfirmPasswordVisible
                "
              />
            </VCol>

            <!-- reset password -->
            <VCol cols="12">
              <VBtn
                block
                type="submit"
                :loading="auth.isLoading"
                :disabled="auth.isLoading"
              >
                Set New Password
              </VBtn>
            </VCol>

            <!-- back to login -->
            <VCol cols="12">
              <RouterLink
                class="d-flex align-center justify-center"
                :to="{ name: 'login' }"
              >
                <VIcon
                  start
                  size="30"
                  icon="mdi-chevron-left"
                  class="flip-in-rtl"
                />
                <span class="text-base">Back to login</span>
              </RouterLink>
            </VCol>
          </VRow>
        </VForm>
      </VCardText>
    </VCard>
    <VImg
      :src="authV1ResetPasswordMask"
      class="d-none d-md-block auth-footer-mask"
    />
  </div>
</template>

<style lang="scss">
@use "@core/scss/template/pages/page-auth.scss";
</style>

<route lang="yaml">
meta:
  layout: blank
</route>
