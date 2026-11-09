import { BINDABLE_FIELD_FILTER_TYPES_BY_PAGE_LAYOUT_FILTER_TYPE } from '@/constants/BindableFieldFilterTypesByPageLayoutFilterType';
import {
  type PageLayoutFilterType,
  type PartialFieldMetadataItem,
} from '@/types';
import { getFilterTypeFromFieldType } from '@/utils/filter/utils/getFilterTypeFromFieldType';

export const isFieldBindableToDashboardFilter = ({
  field,
  filterType,
}: {
  field: Pick<PartialFieldMetadataItem, 'name' | 'type'>;
  filterType: PageLayoutFilterType;
}): boolean => {
  // A deletedAt filter makes the query runner include soft-deleted records
  if (field.name === 'deletedAt') {
    return false;
  }

  const fieldFilterType = getFilterTypeFromFieldType(field.type);

  return BINDABLE_FIELD_FILTER_TYPES_BY_PAGE_LAYOUT_FILTER_TYPE[
    filterType
  ].some(
    (bindableFieldFilterType) => bindableFieldFilterType === fieldFilterType,
  );
};
