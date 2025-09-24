import { FLAT_FIELD_METADATA_EDITABLE_PROPERTIES } from 'src/engine/metadata-modules/flat-field-metadata/constants/flat-field-metadata-editable-properties.constant';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';

export const FLAT_FIELD_METADATA_PROPERTIES_TO_COMPARE = [
  ...FLAT_FIELD_METADATA_EDITABLE_PROPERTIES,
  'standardOverrides',
] as const satisfies (keyof FlatFieldMetadata)[];
