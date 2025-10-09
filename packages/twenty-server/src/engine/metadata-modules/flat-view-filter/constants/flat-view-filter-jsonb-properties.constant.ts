import { FlatViewFilter } from 'src/engine/metadata-modules/flat-view-filter/types/flat-view-filter.type';

export const FLAT_VIEW_FILTER_JSONB_PROPERTIES = [
  'value',
] as const satisfies (keyof FlatViewFilter)[];
