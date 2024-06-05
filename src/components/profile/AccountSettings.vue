<script lang="ts" setup>
import { useToast } from "@/plugins/toastr";
import { useAuthStore } from "@/stores/auth/useAuthStore";
import { useUsersStore } from "@/stores/users/useUsersStore";

const auth: any = useAuthStore();
const usersStore: any = useUsersStore();
const $toast: any = useToast();
const isAccountDeactivated = ref(false);

const validateAccountDeactivation = [
  (v: string) => !!v || "Please confirm account deactivation",
];

const handleSubmit = async () => {
  await usersStore.updateProfile(auth.user.id, {
    name: auth.user.name,
    email: auth.user.email,
  });
};
</script>

<template>
  <VRow>
    <VCol cols="12">
      <VCard title="Account Details">
        <VCardText>
          <!-- 👉 Form -->
          <VForm @submit.prevent="handleSubmit" class="mt-6">
            <VRow>
              <VCol md="6" cols="12">
                <VTextField
                  v-model="auth.user.name"
                  placeholder="John Doe"
                  label="Name"
                />
              </VCol>

              <VCol md="6" cols="12">
                <VTextField
                  v-model="auth.user.email"
                  placeholder="johndoe@example.com"
                  label="Email"
                />
              </VCol>

              <VCol cols="12" class="d-flex flex-wrap gap-4">
                <VBtn
                  type="submit"
                  :loading="usersStore.isLoading"
                  :disabled="usersStore.isLoading"
                >
                  Save changes
                </VBtn>
              </VCol>
            </VRow>
          </VForm>
        </VCardText>
      </VCard>
    </VCol>

    <VCol cols="12">
      <!-- 👉 Delete Account -->
      <VCard title="Delete Account">
        <VCardText>
          <!-- 👉 Checkbox and Button  -->
          <div>
            <VCheckbox
              v-model="isAccountDeactivated"
              :rules="validateAccountDeactivation"
              label="I confirm my account deactivation"
            />
          </div>

          <VBtn
            :disabled="!isAccountDeactivated"
            color="error"
            class="mt-3"
            @click="
              () => $toast.error('Sorry, account deactivation not allowed.')
            "
          >
            Deactivate Account
          </VBtn>
        </VCardText>
      </VCard>
    </VCol>
  </VRow>
</template>
