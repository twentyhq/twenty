import { type FlatViewFilterGroup } from 'src/engine/metadata-modules/flat-view-filter-group/types/flat-view-filter-group.type';

export const FLAT_VIEW_FILTER_GROUP_EDITABLE_PROPERTIES = [
  'logicalOperator',
  'positionInViewFilterGroup',
  'parentViewFilterGroupId',
] as const satisfies (keyof FlatViewFilterGroup)[];

