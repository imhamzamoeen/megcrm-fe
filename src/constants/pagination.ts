export const defaultPagination = {
  current_page: 1,
  current: 0,
  per_page: 50,
  total: 0,
  search: '',
  language: 'en',
  sort: {},
  filters: []
}


export const setStoreMeta = ($event: any, storeMeta: any): Boolean => {
  storeMeta.sort = $event.sortBy;
  storeMeta.per_page = $event.itemsPerPage;
  storeMeta.page = $event.current_page;

  return true;
}
