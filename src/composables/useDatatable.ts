// useDataTable.js
import { removeEmptyAndNull } from '@/utils/useHelper';
import debounce from 'lodash.debounce';
import { watch } from 'vue';

type PiniaStore<T extends (...args: any) => any> = Omit<
  ReturnType<T>,
  keyof ReturnType<typeof defineStore>
>;

export default function useDataTable(store: PiniaStore<any>, filters: any, fetch: any) {

  const onPaginationChange = async () => await fetch();

  const onSortChange = async ($event: any) => {
    store.meta.sort = $event.sort;

    await fetch();
  };

  const update = debounce(() => fetch(), 500)

  const fetchWithFilters = async (n: any) => {
    store.meta.filters = removeEmptyAndNull(n);
    store.meta.current_page = 1;

    await update();
  }

  onMounted(async () => {
    await fetchWithFilters(filters.value)
  })

  watch(
    filters,
    async (n) => await fetchWithFilters(n),
    { deep: true }
  );

  return {
    update,

    onSortChange,
    onPaginationChange
  }
}
