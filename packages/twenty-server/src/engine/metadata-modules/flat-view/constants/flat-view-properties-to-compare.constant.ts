import { FLAT_VIEW_EDITABLE_PROPERTIES } from 'src/engine/metadata-modules/flat-view/constants/flat-view-editable-properties.constant';
import { type FlatView } from 'src/engine/metadata-modules/flat-view/types/flat-view.type';

export const FLAT_VIEW_PROPERTIES_TO_COMPARE = [
  'key',
  'deletedAt',
  ...FLAT_VIEW_EDITABLE_PROPERTIES,
] as const satisfies (keyof FlatView)[];
