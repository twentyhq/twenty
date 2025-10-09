import { type FlatViewFilter } from 'src/engine/metadata-modules/flat-view-filter/types/flat-view-filter.type';

export type FlatViewFilterPropertiesToCompare = Pick<
  FlatViewFilter,
  | 'fieldMetadataId'
  | 'operand'
  | 'value'
  | 'viewFilterGroupId'
  | 'positionInViewFilterGroup'
  | 'subFieldName'
  | 'viewId'
  | 'deletedAt'
>;

