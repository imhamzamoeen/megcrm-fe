<script setup lang="ts">
import { useGenerateImageVariant } from '@/@core/composable/useGenerateImageVariant'
import { useAuthStore } from '@/stores/auth/useAuthStore'
import authV1ForgotPasswordMaskDark from '@images/pages/auth-v1-forgot-password-mask-dark.png'
import authV1ForgotPasswordMaskLight from '@images/pages/auth-v1-forgot-password-mask-light.png'
import { VNodeRenderer } from '@layouts/components/VNodeRenderer'
import { themeConfig } from '@themeConfig'

const auth = useAuthStore()

const form = ref({
  email: '',
})

const authV1ThemeForgotPasswordMask = useGenerateImageVariant(authV1ForgotPasswordMaskLight, authV1ForgotPasswordMaskDark)

const handleSubmit = async () => {
  await auth.forgotPassword(form.value)
}
</script>

<template>
  <div class="auth-wrapper d-flex align-center justify-center pa-4">
    <VCard
      class="auth-card pa-2 pt-7"
      max-width="448"
    >
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
        <h5 class="text-h5 mb-1">
          Forgot Password? 🔒
        </h5>
        <p class="mb-0">
          Enter your email and we'll send you instructions to reset your password
        </p>
      </VCardText>

      <VCardText>
        <VAlert
          v-if="auth.success"
          class="mb-8"
          variant="tonal"
          color="success"
        >
          {{ auth.message }}
        </VAlert>

        <VForm @submit.prevent="handleSubmit">
          <VRow>
            <!-- email -->
            <VCol cols="12">
              <VTextField
                v-model="form.email"
                autofocus
                label="Email"
                type="email"
                placeholder="johndoe@email.com"
                :error-messages="auth?.errors?.email?.[0]"
              />
            </VCol>

            <!-- reset password -->
            <VCol cols="12">
              <VBtn
                block
                type="submit"
                :disabled="auth.isLoading"
                :loading="auth.isLoading"
              >
                Send Reset Link
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
                  icon="mdi-chevron-left"
                  size="30"
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
      :src="authV1ThemeForgotPasswordMask"
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
