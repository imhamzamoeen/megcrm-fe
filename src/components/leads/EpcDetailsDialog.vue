<script lang="ts" setup>
const props = defineProps({
  details: {
    reqiured: true,
    type: Object,
  },
  isDialogVisible: {
    type: Boolean,
    default: () => false,
  },
});

const emit = defineEmits(["onDialogClose"]);
const closeDialog = () => emit("onDialogClose");

const keyValues: any = computed(() => {
  const keyValuePairs: any = {};
  for (const key in props.details) {
    if (!Array.isArray(props.details[key])) {
      keyValuePairs[key] = props.details[key];
    }
  }
  return keyValuePairs;
}) as any;

const arrays = computed(() => {
  const arrayValues: any = {};
  for (const key in props.details) {
    if (Array.isArray(props.details[key])) {
      arrayValues[key] = props.details[key];
    }
  }
  return arrayValues;
});

const getTitle = (arr: any) => {
  return Array.isArray(arr) ? arr.length : "";
};

const isArrayOfTypeString = (arr: any) => {
  return arr.every((item: any) => typeof item === "string");
};

const getObjectKeys = (arr: any) => {
  if (arr.length > 0 && typeof arr[0] === "object") {
    return Object.keys(arr[0]);
  } else {
    return [];
  }
};
</script>

<template>
  <VDialog
    :width="$vuetify.display.smAndDown ? 'auto' : 1100"
    :model-value="isDialogVisible"
    @update:model-value="closeDialog"
    persistent
  >
    <!-- Dialog close btn -->
    <DialogCloseBtn @click="closeDialog" />

    <VCard class="pa-sm-8 pa-5">
      <!-- Title -->
      <VCardItem class="text-center">
        <VCardTitle class="text-h4 mb-3">EPC Details </VCardTitle>
      </VCardItem>

      <VCardText>
        <VRow v-for="(v, k) in (keyValues as any)">
          <!-- @vue-skip-->
          <template v-if="k !== 'type_of_assessment'">
            <VCol cols="6">
              <p class="font-weight-medium text-capitalize mb-0">
                <!-- @vue-skip-->
                {{
                  k
                    .toLowerCase()
                    .replaceAll("_", " ")
                    .replaceAll("i d", "id")
                    .replaceAll("steps", "steps ")
                    .replaceAll("step", "step ")
                    .replaceAll("to", " to ")
                    .replaceAll("and", " and ")
                    .replaceAll("s ", "")
                }}
              </p>
            </VCol>
            <VCol cols="67">
              <a
                v-if="v.toLowerCase().includes('https')"
                :href="v"
                target="_blank"
                class="text-uppercase font-italic"
              >
                <VBtn class="mb-2" icon="mdi-open-in-new" size="x-small" />
              </a>
              <p v-else class="text-uppercase font-italic">{{ v }}</p>
            </VCol>
          </template>
        </VRow>

        <VRow>
          <VCol cols="12">
            <VExpansionPanels multiple>
              <VExpansionPanel v-for="(v, k) in arrays" :key="k">
                <VExpansionPanelTitle
                  class="text-h6"
                  style="color: #646464 !important"
                  disable-icon-rotate
                >
                  <!--@vue-skip-->
                  <p class="font-weight-medium text-uppercase mb-0">{{ k }}</p>
                  <template #actions>
                    <VBtn
                      rounded
                      :title="getTitle(v)"
                      color="warning"
                      size="x-small"
                    >
                      <strong>{{ getTitle(v) }}</strong>
                    </VBtn>
                  </template>
                </VExpansionPanelTitle>
                <VExpansionPanelText>
                  <template v-if="isArrayOfTypeString(v)">
                    <VList>
                      <VListItem v-for="(item, index) in v" :key="index">
                        {{ item }}
                      </VListItem>
                    </VList>
                  </template>
                  <template v-else>
                    <VTable fixed-header>
                      <thead>
                        <tr>
                          <th
                            class="text-uppercase font-italic font-weight-bold"
                            v-for="(key, index) in getObjectKeys(v)"
                            :key="index"
                          >
                            {{ key }}
                          </th>
                        </tr>
                      </thead>
                      <tbody class="text-high-emphasis">
                        <tr v-for="(obj, index) in v" :key="index">
                          <td v-for="(value, key) in obj" :key="key">
                            {{ value }}
                          </td>
                        </tr>
                      </tbody>
                    </VTable>
                  </template>
                </VExpansionPanelText>
              </VExpansionPanel>
            </VExpansionPanels>
          </VCol>
        </VRow>
      </VCardText>
    </VCard>
  </VDialog>
</template>

<style lang="scss" scoped>
:deep(.v-card) {
  background: #fafafa;
}

:deep(th) {
  border-radius: 0 !important;
}

:deep(td) {
  border-radius: 0 !important;
}
</style>
