import { FLAT_VIEW_FILTER_EDITABLE_PROPERTIES } from 'src/engine/metadata-modules/flat-view-filter/constants/flat-view-filter-editable-properties.constant';
import { type FlatViewFilter } from 'src/engine/metadata-modules/flat-view-filter/types/flat-view-filter.type';

export const FLAT_VIEW_FILTER_PROPERTIES_TO_COMPARE = [
  'viewId',
  'deletedAt',
  ...FLAT_VIEW_FILTER_EDITABLE_PROPERTIES,
] as const satisfies (keyof FlatViewFilter)[];
