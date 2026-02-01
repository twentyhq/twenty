import { type FlatViewSort } from 'src/engine/metadata-modules/flat-view-sort/types/flat-view-sort.type';

export const FLAT_VIEW_SORT_EDITABLE_PROPERTIES = [
  'direction',
] as const satisfies (keyof FlatViewSort)[];
