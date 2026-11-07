import { type FilterableFieldType, PageLayoutFilterType } from '@/types';

export const BINDABLE_FIELD_FILTER_TYPES_BY_PAGE_LAYOUT_FILTER_TYPE: Record<
  PageLayoutFilterType,
  FilterableFieldType[]
> = {
  [PageLayoutFilterType.DATE]: ['DATE', 'DATE_TIME'],
};
