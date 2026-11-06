import { FieldMetadataType, PageLayoutFilterType } from 'twenty-shared/types';

export const VALUE_FORMAT_FIELD_TYPE_BY_PAGE_LAYOUT_FILTER_TYPE = {
  [PageLayoutFilterType.DATE]: FieldMetadataType.DATE,
} as const satisfies Record<PageLayoutFilterType, FieldMetadataType>;
