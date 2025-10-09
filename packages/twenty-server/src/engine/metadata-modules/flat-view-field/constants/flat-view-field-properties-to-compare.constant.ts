import { FLAT_VIEW_FIELD_EDITABLE_PROPERTIES } from 'src/engine/metadata-modules/flat-view-field/constants/flat-view-field-editable-properties.constant';
import { type FlatViewField } from 'src/engine/metadata-modules/flat-view-field/types/flat-view-field.type';

export const FLAT_VIEW_FIELD_PROPERTIES_TO_COMPARE = [
  ...FLAT_VIEW_FIELD_EDITABLE_PROPERTIES,
  'deletedAt',
] as const satisfies (keyof FlatViewField)[];
