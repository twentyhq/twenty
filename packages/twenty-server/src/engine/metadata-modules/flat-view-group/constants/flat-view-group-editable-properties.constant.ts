import { type FlatViewGroup } from 'src/engine/metadata-modules/flat-view-group/types/flat-view-group.type';

export const FLAT_VIEW_GROUP_EDITABLE_PROPERTIES = [
  'isVisible',
  'fieldValue',
  'position',
] as const satisfies (keyof FlatViewGroup)[];
