<script lang="ts" setup>
import useTime from "@/composables/useTime";
import { fieldsToIgnoreInTimeline } from "@/constants/leads";
import { useLeadsStore } from "@/stores/leads/useLeadsStore";
import avatar2 from "@images/avatars/avatar-2.png";

interface LogStatus {
  created_at: string;
}

const props = defineProps({
  statuses: {
    required: false,
    default: () => [],
  },
  logs: {
    required: false,
    default: () => [],
  },
  heading: {
    required: false,
    default: () => "Timeline",
  },
  isWithinCard: {
    required: false,
    default: () => true,
  },
  elevation: {
    required: false,
    default: 3,
  },
});

const store = useLeadsStore();
const time = useTime();
const combinedArray: LogStatus[] = [...props.logs, ...props.statuses];
const sortedArray: any = combinedArray.sort(
  (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
);

const isDeleteLog = (o: any) =>
  !isStatus(o) && o.event.toUpperCase() === "DELETED";
const isUpdateLog = (o: any) =>
  !isStatus(o) && o.event.toUpperCase() === "UPDATED";
const isCreateLog = (o: any) =>
  !isStatus(o) && o.event.toUpperCase() === "CREATED";
const isStatus = (o: any) => !!o?.reason;

const getTimeLineColor = (i: any): string => {
  if (isDeleteLog(i)) return "error";
  if (isUpdateLog(i)) return "info";
  if (isCreateLog(i)) return "success";

  return "primary";
};

const getLogMessage = (i: any) => {
  return `${i?.description} by ${
    i?.causer?.name ?? "System"
  } ( ${i.subject_type.replace("App\\Models\\", "")} )`;
};

const getChanges = (i: any): any => {
  const personsChanged: any = [];
  const fieldsUpdated: any = [];

  if (
    !isStatus(i) &&
    i?.properties?.attributes?.surveyor_id &&
    i?.properties.attributes.surveyor_id !== null
  ) {
    personsChanged.push({
      type: "Surveyor",
      model: store.surveyors.find(
        (surveyor: any) => surveyor.id === i.properties.attributes.surveyor_id
      ),
    });
  }

  if (
    !isStatus(i) &&
    i?.properties?.attributes?.lead_generator_id &&
    i.properties.attributes.lead_generator_id !== null
  ) {
    personsChanged.push({
      type: "Lead Generator",
      model: store.leadGenerators.find(
        (leadGenerator: any) =>
          leadGenerator.id === i.properties.attributes.lead_generator_id
      ),
    });
  }

  if (!isCreateLog(i) && i?.properties?.attributes) {
    for (const [key, value] of Object.entries(i.properties.attributes) as any) {
      if (!fieldsToIgnoreInTimeline.includes(key)) {
        try {
          let myV = JSON.parse(value);
          let str: any = [];

          if (Array.isArray(myV)) {
            myV.forEach((e) => {
              if (e.comment) {
                str.push(e.comment);
              }
            });

            str = `\n${str.join("\n")}`;
          } else {
            str = myV;
          }

          fieldsUpdated.push({
            field: key.toUpperCase().replaceAll("_", " ").replace(" ID", ""),
            old: i?.properties?.old[key] ?? "NULL",
            new: str,
          });
        } catch (e: any) {
          fieldsUpdated.push({
            field: key.toUpperCase().replaceAll("_", " ").replace(" ID", ""),
            old: i?.properties?.old[key] ?? "NULL",
            new: value,
          });
        }
      }
    }
  }

  if (isCreateLog(i) && i.subject_type !== "App\\Models\\Lead") {
    for (const [key, value] of Object.entries(i.properties.attributes) as any) {
      if (!fieldsToIgnoreInTimeline.includes(key) && value && value !== "") {
        const v = key.toUpperCase().replaceAll("_", " ").replace(" ID", "");

        if (!["LEAD", "CREATED BY"].includes(v)) {
          try {
            let myV = JSON.parse(value);
            let str = "";

            if (Array.isArray(myV)) {
              myV.forEach((e: any) => {
                if (e.comment) {
                  str += e.comment;
                }
              });
            } else {
              str = myV;
            }

            fieldsUpdated.push({
              field: v,
              old: "NULL",
              new: str,
            });
          } catch (e: any) {
            fieldsUpdated.push({
              field: v,
              old: "NULL",
              new: value,
            });
          }
        }
      }
    }
  }

  return {
    persons: personsChanged,
    fieldsUpdated: fieldsUpdated,
    isDeleteLog: isDeleteLog(i),
  };
};
</script>

<template>
  <VCard :elevation="elevation">
    <VCardItem>
      <template #prepend>
        <VIcon icon="mdi-format-list-bulleted" class="text-disabled" />
      </template>

      <VCardTitle>{{ props.heading }}</VCardTitle>
    </VCardItem>

    <VDivider />

    <VCardText>
      <VTimeline
        density="compact"
        align="start"
        truncate-line="start"
        :line-inset="12"
        class="v-timeline-density-compact"
      >
        <VTimelineItem
          v-if="sortedArray.length > 0"
          v-for="item in sortedArray"
          :key="item.created_at"
          :dot-color="getTimeLineColor(item)"
          size="x-small"
        >
          <div
            class="d-flex justify-space-between align-center flex-wrap gap-2 mb-1"
          >
            <span class="app-timeline-title mb-3">
              <span v-if="isStatus(item)">
                <VTooltip location="top">
                  <template #activator="{ props }">
                    <span v-bind="props">
                      Status was updated to
                      <VChip
                        color="primary"
                        size="small"
                        class="text-capitalize"
                      >
                        {{ item.name }}
                      </VChip>
                      by <strong>{{ item.user.name }}</strong>
                    </span>
                  </template>
                  <span>{{ time.formatDate(item.created_at) }}</span>
                </VTooltip>
              </span>
              <span v-else>
                <VTooltip location="top">
                  <template #activator="{ props }">
                    <span v-bind="props">An event was logged in system.</span>
                  </template>
                  <span>{{ time.formatDate(item.created_at) }}</span>
                </VTooltip>
              </span>
            </span>
            <span class="app-timeline-meta">
              {{ time.diffForHumans(item.created_at) }}
            </span>
          </div>
          <p v-if="isStatus(item)" class="app-timeline-text mb-2">
            Comments: {{ item.reason }}
          </p>
          <p v-else>
            {{ getLogMessage(item) }}
          </p>

          <div
            v-for="person in getChanges(item).persons"
            class="d-flex align-center mt-3"
          >
            <VAvatar size="38" class="me-2" :image="avatar2" />
            <div class="d-flex flex-column">
              <span class="text-sm text-high-emphasis font-weight-medium mb-0">
                {{ person?.model?.name ?? "" }} ({{ person?.type ?? "" }})
              </span>
              <p class="app-timeline-text mb-0">
                {{ person?.type ?? "NULL" }} was assigned by
                {{ item?.causer?.name }}
              </p>
            </div>
          </div>

          <p v-for="fieldUpdated in getChanges(item).fieldsUpdated">
            <template v-if="fieldUpdated?.field">
              {{ fieldUpdated.field }} was changed
              <span v-if="fieldUpdated.field !== 'PASSWORD'">
                from {{ fieldUpdated.old }} to
                {{ fieldUpdated.new }}
              </span>
            </template>
          </p>
        </VTimelineItem>
        <VTimelineItem v-else>
          <p class="text-center">No records found.</p>
        </VTimelineItem>
      </VTimeline>
    </VCardText>
  </VCard>
</template>
