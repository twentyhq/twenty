import { type FlatViewFilter } from 'src/engine/metadata-modules/flat-view-filter/types/flat-view-filter.type';

export const FLAT_VIEW_FILTER_EDITABLE_PROPERTIES = [
  'fieldMetadataId',
  'operand',
  'value',
  'viewFilterGroupId',
  'positionInViewFilterGroup',
  'subFieldName',
] as const satisfies (keyof FlatViewFilter)[];
